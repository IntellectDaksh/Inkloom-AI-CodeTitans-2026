/**
 * AdSnitch Brand Governance Engine - Gemini LLM Integration (Stage 4)
 * 
 * Invokes Gemini 2.5 Flash via REST endpoint with strict JSON schema enforcement:
 * https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=GEMINI_API_KEY
 * 
 * System instructions enforce zero hallucinations: unverified claims MUST be flagged
 * as unsupported without fabricated evidence citations.
 * 
 * Includes an active model rollover (e.g. if gemini-2.5-flash returns 404 on newer API accounts)
 * and a complete deterministic fallback analyzer when GEMINI_API_KEY is not set or network fails,
 * ensuring workflows, CI tests, and demo pipelines never crash.
 */

import {
  FindingCategory,
  FindingSeverity,
  ConfidenceLevel,
  GeminiAnalysisInput,
  GeminiStructuredOutput,
  GeminiFindingPayload,
} from './types';

export const GEMINI_25_FLASH_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export const GEMINI_FALLBACK_LIVE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent';

export const SYSTEM_INSTRUCTION = `You are the AdSnitch Brand Governance Auditor.
Your mission is to perform strict, rigorous, and impartial enterprise brand compliance reviews.
CRITICAL RULES:
1. NEVER hallucinate citations or claim evidence.
2. Unsupported claims must be flagged as unverified (category: "unsupported_claim", isVerified: false, citedEvidenceIds: []).
3. Evaluate content strictly against the provided brand guidelines and approved claims repository.
4. If a statement makes a factual, numeric, comparative, or superlative claim that is NOT present in the approved claims list, flag it as unsupported.
5. Identify tone inconsistencies (hyperbole, buzzwords, sensationalism) and readability issues.
6. Provide actionable, compliant suggested revisions.
7. Output valid JSON matching the exact schema requested.`;

// ============================================================================
// Gemini JSON Schema
// ============================================================================

export const GEMINI_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    complianceScore: {
      type: 'NUMBER',
      description: 'Overall compliance score from 0 to 100.',
    },
    summaryAssessment: {
      type: 'STRING',
      description: 'Concise executive assessment of brand compliance.',
    },
    findings: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          category: {
            type: 'STRING',
            enum: [
              'unsupported_claim',
              'time_bound_claim',
              'tone_inconsistency',
              'prohibited_term',
              'missing_disclosure',
              'out_of_scope',
              'factual_conflict',
              'readability',
            ],
          },
          severity: {
            type: 'STRING',
            enum: ['critical', 'high', 'medium', 'low', 'informational'],
          },
          confidence: {
            type: 'STRING',
            enum: ['high', 'medium', 'low'],
          },
          flaggedText: {
            type: 'STRING',
            description: 'Exact snippet of text that violates policy or is unverified.',
          },
          explanation: {
            type: 'STRING',
            description: 'Clear rationale explaining the violation or lack of verification.',
          },
          citedEvidenceIds: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'IDs of evidence records that substantiate the claim, or empty if unverified.',
          },
          suggestedCorrection: {
            type: 'STRING',
            description: 'Compliant replacement wording.',
          },
          isVerified: {
            type: 'BOOLEAN',
            description: 'True if substantiated by approved claims evidence, false otherwise.',
          },
        },
        required: [
          'category',
          'severity',
          'confidence',
          'flaggedText',
          'explanation',
          'citedEvidenceIds',
          'suggestedCorrection',
          'isVerified',
        ],
      },
    },
    suggestedRevisedText: {
      type: 'STRING',
      description: 'Full text rewrite with all violations remediated and claims properly qualified.',
    },
  },
  required: ['complianceScore', 'summaryAssessment', 'findings', 'suggestedRevisedText'],
};

// ============================================================================
// Deterministic Fallback Analyzer (Runs when API key is missing or network fails)
// ============================================================================

export function runDeterministicFallbackAnalysis(input: GeminiAnalysisInput): GeminiStructuredOutput {
  const { content, approvedClaims, deterministicViolations } = input;
  const findings: GeminiFindingPayload[] = [];

  // 1. Detect unverified claims (metrics, multipliers, superlatives not in approved repository)
  const potentialClaimRegexes: Array<{ pattern: RegExp; type: string }> = [
    { pattern: /\b\d+(\.\d+)?%\s*(faster|cheaper|reduction|increase|uptime|growth|roi|sla)\b/gi, type: 'metric' },
    { pattern: /\b\d+x\s*(faster|more|throughput|reduction)\b/gi, type: 'multiplier' },
    { pattern: /\b\d+([,\d]+)?\s*(tps|transactions|qps|users|customers)\b/gi, type: 'volume' },
    { pattern: /\b(guarantee[sd]?|100%\s*risk-free|money-back|instant\s+results)\b/gi, type: 'guarantee' },
    { pattern: /\b(world'?s\s+fastest|industry-leading|unmatched|best-in-class|#1\s+platform)\b/gi, type: 'superlative' },
    { pattern: /\b(zero\s*downtime|unhackable|bulletproof|flawless)\b/gi, type: 'absolute' },
  ];

  for (const { pattern } of potentialClaimRegexes) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const matchedPhrase = match[0];
      const lowerPhrase = matchedPhrase.toLowerCase();

      // Check if this matches any approved claim
      const matchedApproved = approvedClaims.find(ac => {
        return ac.claimText.toLowerCase().includes(lowerPhrase) ||
          lowerPhrase.includes(ac.claimText.toLowerCase().slice(0, 15));
      });

      if (matchedApproved) {
        // Claim is verified in approved list
        const evidenceIds = matchedApproved.evidence.map(e => e.source);
        findings.push({
          category: 'factual_conflict',
          severity: 'informational',
          confidence: 'high',
          flaggedText: matchedPhrase,
          explanation: `Verified claim matching approved record "${matchedApproved.claimText}".`,
          citedEvidenceIds: evidenceIds.length > 0 ? evidenceIds : ['approved_repo_ref'],
          suggestedCorrection: matchedPhrase,
          isVerified: true,
        });
      } else {
        // Flag unverified claim
        findings.push({
          category: 'unsupported_claim',
          severity: 'high',
          confidence: 'high',
          flaggedText: matchedPhrase,
          explanation: `Claim "${matchedPhrase}" has no supporting verification record in the approved claims repository.`,
          citedEvidenceIds: [],
          suggestedCorrection: `Remove "${matchedPhrase}" or substantiate with independent third-party audit data.`,
          isVerified: false,
        });
      }
    }
  }

  // 2. Detect Tone Inconsistencies (hyperbole / sensationalism)
  const hyperboleTerms = [
    'revolutionary',
    'game-changer',
    'game changing',
    'miracle',
    'miraculous',
    'magic',
    'insane results',
    'disrupting everything',
    'secret sauce',
    'mind-blowing',
  ];

  for (const term of hyperboleTerms) {
    const termRegex = new RegExp(`\\b${term}\\b`, 'gi');
    let match: RegExpExecArray | null;
    while ((match = termRegex.exec(content)) !== null) {
      findings.push({
        category: 'tone_inconsistency',
        severity: 'medium',
        confidence: 'high',
        flaggedText: match[0],
        explanation: `Sensationalist term "${match[0]}" violates brand guidelines for authoritative, engineering-led voice.`,
        citedEvidenceIds: [],
        suggestedCorrection: 'Use objective, factual terminology.',
        isVerified: false,
      });
    }
  }

  // 3. Readability & Sentence Length Checks
  const sentences = content.split(/(?<=[.!?\n])\s+/).filter(s => s.trim().length > 0);
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/);
    if (words.length > 40) {
      findings.push({
        category: 'readability',
        severity: 'low',
        confidence: 'medium',
        flaggedText: sentence.slice(0, 60) + '...',
        explanation: `Sentence contains ${words.length} words. Long sentences decrease readability and message comprehension.`,
        citedEvidenceIds: [],
        suggestedCorrection: 'Split into concise, focused sentences.',
        isVerified: true,
      });
    }
  }

  // Deduplicate findings by category + flaggedText
  const uniqueFindings: GeminiFindingPayload[] = [];
  const seenKeys = new Set<string>();
  for (const f of findings) {
    const key = `${f.category}_${f.flaggedText.toLowerCase()}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueFindings.push(f);
    }
  }

  // Calculate Compliance Score (only violations and unverified claims reduce score)
  let score = 100;
  for (const v of deterministicViolations) {
    if (v.severity === 'critical') score -= 25;
    else if (v.severity === 'high') score -= 15;
    else if (v.severity === 'medium') score -= 8;
    else if (v.severity === 'low') score -= 3;
  }
  for (const f of uniqueFindings) {
    if (!f.isVerified) {
      if (f.severity === 'critical') score -= 20;
      else if (f.severity === 'high') score -= 12;
      else if (f.severity === 'medium') score -= 6;
      else if (f.severity === 'low') score -= 2;
    }
  }
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Build suggested revised text
  let revised = content;
  for (const f of uniqueFindings) {
    if (!f.isVerified && f.category === 'tone_inconsistency') {
      revised = revised.replace(new RegExp(f.flaggedText, 'gi'), '[remediated]');
    }
  }
  for (const v of deterministicViolations) {
    if (v.matchedText && v.suggestedReplacement) {
      revised = revised.replace(new RegExp(v.matchedText, 'gi'), v.suggestedReplacement);
    }
    if (v.ruleType === 'missing_required_phrase' && v.metadata?.requiredPhrase) {
      revised += `\n\n${v.metadata.requiredPhrase}.`;
    }
  }

  const summaryAssessment = score >= 85
    ? `Content demonstrates strong brand alignment with a compliance score of ${score}/100. Minor adjustments recommended.`
    : score >= 60
    ? `Content requires compliance remediation (Score: ${score}/100). Found unverified claims and tone deviations.`
    : `Content failed compliance audit (Score: ${score}/100). Critical claims violations and prohibited terminology present.`;

  return {
    complianceScore: score,
    summaryAssessment,
    findings: uniqueFindings,
    suggestedRevisedText: revised.trim(),
  };
}

// ============================================================================
// Helper: Send Prompt to Gemini REST Endpoint
// ============================================================================

export async function callGeminiEndpoint(
  endpointUrl: string,
  apiKey: string,
  requestBody: unknown,
  timeoutMs = 15000
): Promise<{ ok: boolean; status: number; text: string }> {
  const url = `${endpointUrl}?key=${encodeURIComponent(apiKey)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const text = await response.text();
    return { ok: response.ok, status: response.status, text };
  } catch (e) {
    clearTimeout(timeoutId);
    return { ok: false, status: 0, text: String(e) };
  }
}

// ============================================================================
// Gemini LLM Integration
// ============================================================================

export async function analyzeWithGemini(
  input: GeminiAnalysisInput,
  apiKeyOverride?: string
): Promise<{ result: GeminiStructuredOutput; modelUsed: string }> {
  const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      result: runDeterministicFallbackAnalysis(input),
      modelUsed: 'adsnitch-deterministic-fallback-engine (no GEMINI_API_KEY)',
    };
  }

  const promptUserMessage = `
Perform an enterprise brand compliance audit on the following ${input.channel} submission.

=== SUBMISSION CONTENT ===
${input.content}

=== BRAND GUIDELINES ===
${JSON.stringify(input.brandGuidelines, null, 2)}

=== ACTIVE APPROVED CLAIMS (ONLY CITABLE EVIDENCE) ===
${JSON.stringify(input.approvedClaims, null, 2)}

=== STAGE 2 DETERMINISTIC RULE VIOLATIONS ALREADY DETECTED ===
${JSON.stringify(input.deterministicViolations, null, 2)}

Audit the content thoroughly:
1. Verify every factual, numeric, or comparative claim against the approved claims list.
2. Flag any unverified claim (isVerified: false, citedEvidenceIds: [], category: "unsupported_claim").
3. Flag tone inconsistencies, hyperbole, or out-of-scope messaging.
4. Output strict JSON matching the responseSchema.
`;

  const requestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: promptUserMessage }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: GEMINI_RESPONSE_SCHEMA,
    },
  };

  // Try 1: Primary requested endpoint - Gemini 2.5 Flash
  let resp = await callGeminiEndpoint(GEMINI_25_FLASH_URL, apiKey, requestBody);
  let activeModelUsed = 'gemini-2.5-flash';

  // Try 2: If Gemini 2.5 Flash is 404 (model deprecated for new accounts) or 503, try active live fallback endpoint
  if (!resp.ok && (resp.status === 404 || resp.status === 503)) {
    console.info(`Gemini 2.5 Flash endpoint returned ${resp.status}; trying live model rollover (${GEMINI_FALLBACK_LIVE_URL})...`);
    resp = await callGeminiEndpoint(GEMINI_FALLBACK_LIVE_URL, apiKey, requestBody);
    activeModelUsed = 'gemini-3.5-flash-lite';
  }

  if (!resp.ok) {
    console.warn(`Gemini live endpoints failed (${resp.status}). Activating deterministic fallback engine.`);
    return {
      result: runDeterministicFallbackAnalysis(input),
      modelUsed: `adsnitch-deterministic-fallback-engine (api_status_${resp.status})`,
    };
  }

  try {
    const data = JSON.parse(resp.text);
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      console.warn('Gemini API response did not contain candidates content. Falling back.');
      return {
        result: runDeterministicFallbackAnalysis(input),
        modelUsed: 'adsnitch-deterministic-fallback-engine (empty_llm_response)',
      };
    }

    let parsed: GeminiStructuredOutput;
    try {
      parsed = JSON.parse(candidateText);
    } catch {
      const cleaned = candidateText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      parsed = JSON.parse(cleaned);
    }

    // Enforce strict no-hallucination constraint on unverified findings
    if (parsed.findings && Array.isArray(parsed.findings)) {
      parsed.findings = parsed.findings.map(f => {
        if (!f.isVerified) {
          return {
            ...f,
            citedEvidenceIds: [],
          };
        }
        return f;
      });
    }

    return {
      result: parsed,
      modelUsed: activeModelUsed,
    };
  } catch (err) {
    console.warn('Failed to parse Gemini response JSON. Falling back to deterministic analysis.', err);
    return {
      result: runDeterministicFallbackAnalysis(input),
      modelUsed: 'adsnitch-deterministic-fallback-engine (json_parse_error)',
    };
  }
}
