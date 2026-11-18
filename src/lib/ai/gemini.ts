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
import { isSuppressedMatch } from './rules';

export const GEMINI_25_FLASH_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export const GEMINI_FALLBACK_LIVE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent';

// Fastest model that works for this key goes first; a model that just failed (404, quota, timeout)
// is skipped for 10 minutes so every request doesn't pay for the same failed round trip again.
const MODELS = [
  { id: 'gemini-3.5-flash-lite', url: GEMINI_FALLBACK_LIVE_URL },
  { id: 'gemini-2.5-flash', url: GEMINI_25_FLASH_URL },
];
const benchedUntil = new Map<string, number>();
const RETRYABLE = new Set([0, 404, 429, 500, 503, 504]);

/** Calls Gemini models in order of preference; returns the first OK response and which model gave it. */
export async function callGemini(
  apiKey: string,
  body: unknown,
  timeoutMs: number
): Promise<{ ok: boolean; status: number; text: string; model: string }> {
  const now = Date.now();
  const order = [...MODELS].sort((a, b) => Number((benchedUntil.get(a.id) ?? 0) > now) - Number((benchedUntil.get(b.id) ?? 0) > now));
  let last = { ok: false, status: 0, text: '', model: 'none' };
  for (const m of order) {
    const r = await callGeminiEndpoint(m.url, apiKey, body, timeoutMs);
    if (r.ok) return { ...r, model: m.id };
    last = { ...r, model: m.id };
    if (!RETRYABLE.has(r.status)) break; // 400/403: the request itself is bad, another model won't help
    benchedUntil.set(m.id, Date.now() + 10 * 60_000);
  }
  return last;
}

export const SYSTEM_INSTRUCTION = `You are the AdSnitch Brand Governance Auditor.
Your mission is to perform strict, rigorous, and impartial enterprise brand compliance reviews.
CRITICAL RULES:
0. You are a strict reviewer, not a cheerleader. Never soften a verdict. If the content does not belong, say so plainly.
1. GATE FIRST (fill "gate" before anything else):
   a. contentKind: classify what the document really is from its content. A deck with slides like "About us / Services / Clients / Pricing / Contact" is a pitch_deck or company_profile, whatever channel the user picked.
   b. isAboutBrand: the copy must market the brand in BRAND PROFILE (its products, services or industry). Copy about another company, another industry, or an agency pitching itself is NOT about the brand: isAboutBrand=false.
   c. fitsChannel: is this publishable as-is on the TARGET CHANNEL? A pitch deck, proposal, report, CV or company profile is never ad copy, a social post, an email or a landing page.
   If isAboutBrand=false or fitsChannel=false, add an "out_of_scope" finding with severity "critical" that states the problem in one blunt sentence. Do not try to rescue the content.
2. NEVER hallucinate citations or claim evidence. Only ids from the approved claims list may be cited.
3. Unsupported claims are unverified (category "unsupported_claim", isVerified false, citedEvidenceIds []).
4. Extract EVERY checkable claim: counts ("50+ brands", "1M views"), results, client or partner names, testimonials, awards, rankings, "best/leading/top", guarantees, timelines, prices, comparisons. Each one not in the approved claims list is an unsupported_claim (high if numeric/result/guarantee, medium otherwise).
5. Flag tone problems (hype, buzzwords, sensationalism, insensitivity) and readability issues.
6. complianceScore is advisory only; the server computes the real score. Use: 95-100 only if gate passes, every claim is approved and nothing else is wrong; any unsupported claim <= 80; three or more <= 60; gate fails <= 15.
7. Ignore watermarks, page numbers, repeated headers/footers and template boilerplate.
8. Suggested corrections must be compliant, specific and short. The rewrite must not add new claims.
9. Be consistent: the same content with the same brand and channel must get the same verdict.
10. Output valid JSON matching the exact schema requested.`;

// ============================================================================
// Gemini JSON Schema
// ============================================================================

export const GEMINI_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    gate: {
      type: 'OBJECT',
      description: 'Decide these BEFORE any findings.',
      properties: {
        contentKind: {
          type: 'STRING',
          enum: ['ad_copy', 'social_caption', 'video_script', 'email', 'landing_page', 'press_release', 'blog_post', 'product_docs', 'pitch_deck', 'proposal', 'company_profile', 'report', 'resume', 'other'],
          description: 'What this document actually is, judged from its content, not from the channel the user picked.',
        },
        isAboutBrand: { type: 'BOOLEAN', description: 'True only if the content markets THIS brand or its products/services (see BRAND PROFILE). Content about a different company or industry is false.' },
        brandReason: { type: 'STRING', description: 'One sentence: whose product/service the content is actually about.' },
        fitsChannel: { type: 'BOOLEAN', description: 'True only if this is publishable copy for the TARGET CHANNEL as-is.' },
        channelReason: { type: 'STRING', description: 'One sentence explaining fitsChannel.' },
      },
      required: ['contentKind', 'isAboutBrand', 'brandReason', 'fitsChannel', 'channelReason'],
    },
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
  required: ['gate', 'complianceScore', 'summaryAssessment', 'findings', 'suggestedRevisedText'],
};

// ============================================================================
// Deterministic Fallback Analyzer (Runs when API key is missing or network fails)
// ============================================================================

/** "50k" / "50,000" / "50 000" -> "50000" so number formatting doesn't defeat the approved-claim match. */
function normalizeNumbers(s: string): string {
  return s
    .replace(/(\d+(?:\.\d+)?)\s*k\b/g, (_, n) => String(Math.round(parseFloat(n) * 1000)))
    .replace(/(\d)[,\s](?=\d{3}\b)/g, '$1');
}

export function runDeterministicFallbackAnalysis(input: GeminiAnalysisInput): GeminiStructuredOutput {
  const { content, approvedClaims, deterministicViolations } = input;
  const findings: GeminiFindingPayload[] = [];

  // 1. Detect unverified claims (metrics, multipliers, superlatives not in approved repository)
  const potentialClaimRegexes: Array<{ pattern: RegExp; type: string }> = [
    { pattern: /\b\d+(\.\d+)?%\s*(faster|cheaper|reduction|increase|uptime|growth|roi|sla)\b/gi, type: 'metric' },
    { pattern: /\b\d+x\s*(faster|more|throughput|reduction)\b/gi, type: 'multiplier' },
    { pattern: /\b\d+([,\d]+)?\s*(million\s+|billion\s+|thousand\s+|[km]\s+)?(tps|transactions|qps|users|customers)\b/gi, type: 'volume' },
    // Disease / drug-like efficacy (FTC health-claim substantiation; FDA treats these as drug claims).
    { pattern: /\b(cures?|reverses?|heals?|eliminates?|melts?)\s+(?:your\s+)?[a-z]+(?:\s+(damage|disease|fat|pain|inflammation|aging|ageing))?\b/gi, type: 'medical' },
    // Time-boxed efficacy promises ("results in a week").
    { pattern: /\b(?:\w+\s+)?results\s+in\s+(?:a|one|two|three|\d+)\s+(?:days?|weeks?)\b/gi, type: 'efficacy_timeline' },
    // Specific money / rate outcomes need a verified calculation (CNET AI finance errors).
    { pattern: /\b(earn|save|make|get\s+back)\s+\$\d[\d,]*(\.\d+)?/gi, type: 'financial_outcome' },
    { pattern: /\b\d+(\.\d+)?%\s*(apy|apr|interest|annual\s+return)\b/gi, type: 'financial_rate' },
    // Social-proof counts ("50+ brands", "1M views", "10k followers") are claims too and need a record.
    { pattern: /\b\d[\d,.]*\s*(?:\+|k|m|million|lakh|crore)?\+?\s*(?:happy\s+)?(brands|clients|creators|views|followers|projects|businesses|customers|users|companies|downloads|sales|reviews|students)\b/gi, type: 'social_proof' },
    { pattern: /\b(best[- ]in[- ]\w+|the\s+best|leading|top[- ]rated|number\s+one|award[- ]winning|trusted\s+by)\b/gi, type: 'superlative_soft' },
    { pattern: /\b(guarantee[sd]?|100%\s*risk-free|money-back|instant\s+results)\b/gi, type: 'guarantee' },
    { pattern: /\b(world'?s\s+fastest|industry-leading|unmatched|best-in-class|#1\s+platform)\b/gi, type: 'superlative' },
    { pattern: /\b(zero\s*downtime|unhackable|bulletproof|flawless)\b/gi, type: 'absolute' },
  ];

  // A span Stage 2 already flagged (or a negated / proper-noun use) is not re-raised under a second category.
  const ruleSpans = deterministicViolations
    .filter(v => v.ruleType === 'prohibited_term' && typeof v.startIndex === 'number' && typeof v.endIndex === 'number')
    .map(v => [v.startIndex as number, v.endIndex as number]);
  const skip = (s: number, e: number) =>
    ruleSpans.some(([a, b]) => s < b && a < e) || isSuppressedMatch(content, s, e);

  for (const { pattern } of potentialClaimRegexes) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const matchedPhrase = match[0];
      if (skip(match.index, match.index + matchedPhrase.length)) continue;
      const lowerPhrase = matchedPhrase.toLowerCase();

      // Check if this matches any approved claim
      const normPhrase = normalizeNumbers(lowerPhrase);
      const matchedApproved = approvedClaims.find(ac => {
        return ac.claimText.toLowerCase().includes(lowerPhrase) ||
          normalizeNumbers(ac.claimText.toLowerCase()).includes(normPhrase) ||
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
          citedEvidenceIds: evidenceIds, // never a placeholder id: empty means "approved claim, no record linked"
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
      if (skip(match.index, match.index + match[0].length)) continue;
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

  // 2b. Insensitive context: tragedy / violence language in promo copy (Adidas "you survived the Boston Marathon").
  const insensitive = /\b(you\s+survived|survived\s+the|killer\s+(deal|price|offer)s?|bomb(ed)?\s+(deal|sale)|deadly\s+(deal|offer)s?|to\s+die\s+for)\b/gi;
  let ins: RegExpExecArray | null;
  while ((ins = insensitive.exec(content)) !== null) {
    if (skip(ins.index, ins.index + ins[0].length)) continue;
    findings.push({
      category: 'tone_inconsistency',
      severity: 'high',
      confidence: 'medium',
      flaggedText: ins[0],
      explanation: `"${ins[0]}" evokes injury, death or violence. Next to a real event it can read as mocking victims (see Adidas' 2017 Boston Marathon "You survived" email).`,
      citedEvidenceIds: [],
      suggestedCorrection: 'Use neutral, celebratory wording, e.g. "You did it" / "You finished".',
      isVerified: false,
    });
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

  // No numbers here: the server computes the real score, and a second number in the text contradicts it.
  const summaryAssessment = score >= 85
    ? 'Mostly in line with brand rules; check the minor notes below.'
    : score >= 60
    ? 'Needs changes: some claims lack approved proof or the tone drifts from brand rules.'
    : 'Not publishable as written: it breaks hard rules or makes claims with no approved proof.';

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

// Long docs: keep the prompt bounded; channel-fit rules have already seen the full text.
const MAX_LLM_CHARS = 24000;
const LLM_TIMEOUT_MS = 25000;

const CHANNEL_HINT: Partial<Record<string, string>> = {
  social_media: 'an Instagram / TikTok / LinkedIn post caption or short-form reel script, a few lines to ~2,200 characters',
  advertisement: 'paid ad copy: headline, short body, call to action',
  email: 'a marketing email: subject line and body',
  landing_page: 'website landing page copy',
  press_release: 'a press release',
  blog_post: 'a blog article',
  product_documentation: 'product documentation',
};

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
=== BRAND PROFILE (the copy must be about this brand) ===
${input.brand ? `Name: ${input.brand.name}
Industry: ${input.brand.industry || 'not set'}
About: ${input.brand.description || 'not set'}` : 'Not provided'}

Perform an enterprise brand compliance audit. TARGET CHANNEL: ${input.channel}${CHANNEL_HINT[input.channel] ? ` (${CHANNEL_HINT[input.channel]})` : ''}.

=== SUBMISSION CONTENT ===
${input.content.length > MAX_LLM_CHARS ? input.content.slice(0, MAX_LLM_CHARS) + '\n[...truncated]' : input.content}

=== BRAND GUIDELINES ===
${JSON.stringify(input.brandGuidelines, null, 2)}

=== ACTIVE APPROVED CLAIMS (ONLY CITABLE EVIDENCE) ===
${JSON.stringify(input.approvedClaims, null, 2)}

=== STAGE 2 DETERMINISTIC RULE VIOLATIONS ALREADY DETECTED ===
${JSON.stringify(input.deterministicViolations, null, 2)}

WRITING STYLE for "explanation", "suggestedCorrection" and "summaryAssessment": ${input.style?.language === 'hi' ? 'write in Hindi (Devanagari)' : 'write in English'}, ${input.style?.tone === 'formal' ? 'formal compliance-memo tone' : 'plain, short, direct sentences'}. Keep "flaggedText" verbatim from the content. Style never changes what you flag or how severe it is.

Audit the content thoroughly:
0. Fill the gate first (rule 1): what is this document, is it about the brand, does it fit the channel.
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
      temperature: 0,
      topP: 0.1,
      seed: 7,
      responseMimeType: 'application/json',
      responseSchema: GEMINI_RESPONSE_SCHEMA,
    },
  };

  const resp = await callGemini(apiKey, requestBody, LLM_TIMEOUT_MS);
  const activeModelUsed = resp.model;

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
