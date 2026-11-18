/**
 * Inkloom AI Brand Governance Engine - Multi-Stage Pipeline
 * 
 * Implements the 6-stage AI brand compliance pipeline:
 * Stage 1: Content segmentation & claims detection
 * Stage 2: Deterministic rule checks (prohibited terms, required phrases, expired claims, out-of-scope)
 * Stage 3: Scoped knowledge retrieval (strictly tenant-isolated to orgId & brandId)
 * Stage 4: LLM contextual analysis via Gemini 2.5 Flash (with deterministic fallback)
 * Stage 5: Findings compilation (severity, confidence, cited evidence links, suggested corrections)
 * Stage 6: Review summary generation (score, status, issues count, suggested revision text)
 * 
 * Never hallucinates sources. Unverified claims are strictly marked unsupported.
 */

import {
  ContentChannel,
  ContentSegment,
  DetectedClaim,
  SegmentationResult,
  SegmentType,
  ClaimType,
  FindingSeverity,
  FindingCategory,
  GovernanceFinding,
  GovernanceReviewSummary,
  ComplianceStatus,
  ClaimEvidenceRecord,
  StageExecutionTimings,
  ComplianceScoreBreakdown,
  BrandProfile,
  ContentGate,
  ContentKind,
} from './types';
import { runDeterministicRuleChecks, DOCUMENT_SIGNALS } from './rules';
import {
  BrandKnowledgeRepository,
  defaultBrandKnowledgeRepository,
  retrieveScopedBrandKnowledge,
} from './retrieval';
import { analyzeWithGemini } from './gemini';
import { buildRepoFromStore } from './storeKnowledge';

// ============================================================================
// Stage 1: Content Segmentation & Claims Detection
// ============================================================================

export function detectChannel(content: string, providedChannel?: ContentChannel): ContentChannel {
  if (providedChannel && providedChannel !== 'general') {
    return providedChannel;
  }

  const lower = content.toLowerCase();

  // Social media detection (hashtags, character count, mentions)
  const hasHashtag = /#[\w-]+/.test(content);
  const hasMention = /@[\w-]+/.test(content);
  if ((hasHashtag || hasMention) && content.length <= 400) {
    return 'social_media';
  }

  // Press release detection
  if (
    lower.includes('for immediate release') ||
    lower.includes('press release') ||
    /^[A-Z\s]{3,20},\s+[A-Z][a-z]+(\s+\d{1,2})?,\s+20\d\d\s+--/m.test(content)
  ) {
    return 'press_release';
  }

  // Email detection
  if (
    lower.includes('subject:') ||
    lower.includes('unsubscribe') ||
    /^(dear|hi|hello)\s+[\w\s]+,/i.test(content.trim())
  ) {
    return 'email';
  }

  // Advertisement
  if (
    lower.includes('limited time offer') ||
    lower.includes('sign up today') ||
    lower.includes('special promotion') ||
    lower.includes('sponsored')
  ) {
    return 'advertisement';
  }

  // Product documentation
  if (
    lower.includes('api reference') ||
    lower.includes('endpoint:') ||
    lower.includes('sdk installation') ||
    lower.includes('curl -x')
  ) {
    return 'product_documentation';
  }

  return providedChannel || 'landing_page';
}

export function segmentContent(
  submissionId: string,
  content: string,
  channelHint?: ContentChannel
): SegmentationResult {
  const channel = detectChannel(content, channelHint);
  const segments: ContentSegment[] = [];
  const detectedClaims: DetectedClaim[] = [];

  const rawBlocks = content.split(/\n\s*\n/);
  let globalCharOffset = 0;
  let segmentIndex = 0;

  for (const block of rawBlocks) {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) {
      globalCharOffset += block.length + 2;
      continue;
    }

    const blockStartIndex = content.indexOf(trimmedBlock, globalCharOffset);
    const blockEndIndex = blockStartIndex + trimmedBlock.length;
    globalCharOffset = blockEndIndex;

    // Classify Segment Type
    let segType: SegmentType = 'paragraph';
    if (/^#{1,6}\s+/.test(trimmedBlock) || (trimmedBlock.length < 80 && !trimmedBlock.endsWith('.'))) {
      segType = 'heading';
    } else if (/^[-*•]\s+|\d+\.\s+/.test(trimmedBlock)) {
      segType = 'bullet_point';
    } else if (trimmedBlock.startsWith('>')) {
      segType = 'callout';
    } else if (/^disclaimer|^terms|^note:/i.test(trimmedBlock)) {
      segType = 'disclaimer';
    }

    const segmentId = `seg_${submissionId}_${segmentIndex++}`;
    const segmentClaims: DetectedClaim[] = [];

    // Scan for claims within this segment
    const claimPatterns: Array<{ regex: RegExp; type: ClaimType }> = [
      {
        regex: /\b(fastest|greatest|most\s+\w+|#1|highest|lowest|first\s+ever|world'?s\s+\w+)\b/gi,
        type: 'superlative',
      },
      {
        regex: /\b(better\s+than|faster\s+than|outperforms|cheaper\s+than|twice\s+as\s+\w+)\b/gi,
        type: 'comparative',
      },
      {
        regex: /\b(\d+(\.\d+)?%\s*(faster|reduction|increase|uptime|sla)?|\d+x|\d+([,\d]+)?\s*(tps|qps|transactions|users|ms|seconds))\b/gi,
        type: 'numeric',
      },
      {
        regex: /\b\d[\d,.]*\s*(?:\+|k|m|million|lakh|crore)?\+?\s*(?:happy\s+)?(?:brands|clients|creators|views|followers|projects|businesses|customers|users|companies|downloads|reviews|students)\b/gi,
        type: 'numeric',
      },
      {
        regex: /\b(guarantee[sd]?|100%\s*uptime|zero\s*downtime|unhackable|risk-free)\b/gi,
        type: 'guarantee',
      },
      {
        regex: /\b(in\s+20\d\d|since\s+20\d\d|as\s+of\s+20\d\d)\b/gi,
        type: 'temporal',
      },
    ];

    let claimSubId = 0;
    for (const { regex, type } of claimPatterns) {
      let match: RegExpExecArray | null;
      while ((match = regex.exec(trimmedBlock)) !== null) {
        const claimText = match[0];
        const claimStart = blockStartIndex + match.index;
        const claimEnd = claimStart + claimText.length;

        const claim: DetectedClaim = {
          id: `${segmentId}_claim_${claimSubId++}`,
          segmentId,
          text: claimText,
          claimType: type,
          startIndex: claimStart,
          endIndex: claimEnd,
          extractedMetrics: type === 'numeric' ? { rawMetric: claimText } : undefined,
        };

        segmentClaims.push(claim);
        detectedClaims.push(claim);
      }
    }

    segments.push({
      id: segmentId,
      index: segmentIndex - 1,
      text: trimmedBlock,
      segmentType: segType,
      startIndex: blockStartIndex,
      endIndex: blockEndIndex,
      isClaimCandidate: segmentClaims.length > 0,
      detectedClaims: segmentClaims,
    });
  }

  const totalWords = content.trim().split(/\s+/).filter(Boolean).length;

  return {
    submissionId,
    channel,
    detectedChannel: channel,
    totalCharacters: content.length,
    totalWords,
    segments,
    detectedClaims,
  };
}

// ============================================================================
// Stage 5: Compile Findings
// ============================================================================

export function compileGovernanceFindings(
  submissionId: string,
  deterministicViolations: ReturnType<typeof runDeterministicRuleChecks>['violations'],
  llmOutput: {
    findings: Array<{
      category: FindingCategory;
      severity: FindingSeverity;
      confidence: import('./types').ConfidenceLevel;
      flaggedText: string;
      explanation: string;
      citedEvidenceIds: string[];
      suggestedCorrection: string;
      isVerified: boolean;
    }>;
  },
  approvedEvidenceRecords: ClaimEvidenceRecord[]
): GovernanceFinding[] {
  const compiled: GovernanceFinding[] = [];
  const evidenceMap = new Map<string, ClaimEvidenceRecord>();
  for (const ev of approvedEvidenceRecords) {
    evidenceMap.set(ev.id, ev);
    evidenceMap.set(ev.sourceName, ev);
  }

  // 1. Ingest Stage 2 Deterministic Rule Violations
  for (const v of deterministicViolations) {
    compiled.push({
      id: `f_rule_${v.id}`,
      submissionId,
      stage: 'stage_2_rules',
      category: v.category,
      severity: v.severity,
      confidence: 'high', // Deterministic rules are high confidence
      flaggedText: v.matchedText || (v.metadata?.requiredPhrase as string) || '',
      startIndex: v.startIndex,
      endIndex: v.endIndex,
      explanation: v.message,
      evidenceRecords: [], // Rule violations have no approved evidence
      citedEvidenceIds: [],
      citedExcerpt: undefined,
      isVerified: false,
      unverified: true,
      suggestedCorrection: v.suggestedReplacement,
      ruleId: v.ruleId,
    });
  }

  // 2. Ingest Stage 4 LLM Findings
  let llmIdx = 0;
  for (const lf of llmOutput.findings) {
    // Check if deterministic already flagged the exact same text and category to avoid redundant duplicates
    const duplicate = compiled.find(
      cf => cf.category === lf.category && cf.flaggedText.toLowerCase() === lf.flaggedText.toLowerCase()
    );

    if (duplicate) {
      // Enrich existing deterministic finding with any suggested correction or details from LLM
      if (!duplicate.suggestedCorrection && lf.suggestedCorrection) {
        duplicate.suggestedCorrection = lf.suggestedCorrection;
      }
      continue;
    }

    // Link cited evidence records (strictly verified records only)
    // Zero-hallucination: an id the model cites that isn't in this brand's retrieved evidence is dropped,
    // never passed through. A "verified" finding left with no real evidence is downgraded to unverified.
    const linkedEvidence: ClaimEvidenceRecord[] = [];
    if (lf.isVerified && lf.citedEvidenceIds && lf.citedEvidenceIds.length > 0) {
      for (const id of lf.citedEvidenceIds) {
        const found = evidenceMap.get(id);
        if (found && !linkedEvidence.includes(found)) linkedEvidence.push(found);
      }
    }
    const citedIds = linkedEvidence.map(e => e.id);
    const verified = lf.isVerified && (linkedEvidence.length > 0 || lf.category === 'readability');

    compiled.push({
      id: `f_llm_${submissionId}_${llmIdx++}`,
      submissionId,
      stage: 'stage_4_llm',
      category: lf.category,
      severity: lf.severity,
      confidence: lf.confidence,
      flaggedText: lf.flaggedText,
      explanation: lf.explanation,
      evidenceRecords: linkedEvidence,
      citedEvidenceIds: citedIds,
      citedExcerpt: linkedEvidence[0]?.excerpt,
      isVerified: verified,
      unverified: !verified,
      suggestedCorrection: lf.suggestedCorrection,
    });
  }

  return compiled;
}

/**
 * Safety net: a Stage 1 claim (numeric, guarantee, superlative, comparative) that neither the rules nor
 * the model commented on, and that no approved claim covers, is still unsupported. Without this an LLM
 * that skims a long document returns few findings and the copy scores ~100.
 */
export function addUncoveredClaims(
  findings: GovernanceFinding[],
  detected: DetectedClaim[],
  approved: Array<{ claimText: string }>,
  submissionId: string
): void {
  const covered = (l: string) =>
    findings.some(f => {
      const t = f.flaggedText?.toLowerCase();
      return !!t && (t.includes(l) || l.includes(t));
    });
  const seen = new Set<string>();
  let i = 0;
  for (const c of detected) {
    if (c.claimType === 'temporal') continue;
    const key = c.text.toLowerCase();
    if (seen.has(key) || covered(key) || approved.some(a => a.claimText.toLowerCase().includes(key))) continue;
    seen.add(key);
    findings.push({
      id: `f_s1_${submissionId}_${i++}`,
      submissionId,
      stage: 'stage_4_llm',
      category: 'unsupported_claim',
      severity: c.claimType === 'guarantee' || c.claimType === 'numeric' ? 'high' : 'medium',
      confidence: 'medium',
      flaggedText: c.text,
      startIndex: c.startIndex,
      endIndex: c.endIndex,
      explanation: `"${c.text}" is a ${c.claimType} claim with no approved record in this brand's claims library.`,
      evidenceRecords: [],
      citedEvidenceIds: [],
      citedExcerpt: undefined,
      isVerified: false,
      unverified: true,
      suggestedCorrection: `Add "${c.text}" to the claims library with evidence, or remove it.`,
    });
  }
}

// ============================================================================
// Stage 6: Generate Review Summary
// ============================================================================

const SEVERITY_WEIGHT: Record<FindingSeverity, number> = { critical: 30, high: 18, medium: 8, low: 3, informational: 0 };

/** Multi-factor score; see ComplianceScoreBreakdown in types.ts for the formula. */
export function computeScoreBreakdown(findings: GovernanceFinding[], modelScore: number): ComplianceScoreBreakdown {
  const disclosures = findings.filter(f => f.category === 'missing_disclosure').length;
  const penalty = findings.filter(f => f.category !== 'missing_disclosure').reduce((n, f) => n + SEVERITY_WEIGHT[f.severity], 0);
  const verifiedClaims = findings.filter(f => f.isVerified && f.category !== 'readability').length;
  const unsupported = findings.filter(f => f.category === 'unsupported_claim' && !f.isVerified).length;
  const claims = verifiedClaims + unsupported;
  const clamp = (x: number) => Math.max(0, Math.min(100, Math.round(x)));
  const factors: ComplianceScoreBreakdown['factors'] = [
    { key: 'severity', label: 'Severity-weighted findings', weight: 0.55, score: clamp(100 - penalty), detail: `${penalty} penalty points (critical 30, high 18, medium 8, low 3)` },
    { key: 'coverage', label: 'Claim evidence coverage', weight: 0.15, score: claims ? clamp((verifiedClaims / claims) * 100) : 100, detail: claims ? `${verifiedClaims} of ${claims} claims verified` : 'No checkable claims detected' },
    { key: 'disclosure', label: 'Required disclosures', weight: 0.15, score: clamp(100 - disclosures * 25), detail: disclosures ? `${disclosures} missing disclosure(s), 25 points each` : 'All required disclosures present' },
    { key: 'model', label: 'Contextual model review', weight: 0.15, score: clamp(modelScore), detail: 'Stage 4 score' },
  ];
  // Hard caps keep the number honest with the status: a weighted average alone let one critical
  // finding (e.g. a pitch deck submitted as a reel) still land at 80+.
  const has = (s: FindingSeverity) => findings.some(f => f.severity === s && !f.isVerified);
  const gateFailed = findings.some(f => f.id === 'gate_off_brand' || f.id === 'gate_wrong_type');
  const cap = gateFailed ? 2 : has('critical') ? 40 : has('high') ? 75 : unsupported >= 3 ? 65 : unsupported > 0 ? 85 : 100;
  const weighted = clamp(factors.reduce((n, f) => n + f.score * f.weight, 0));
  // Off-brand or wrong document type: it isn't this channel's ad at all, so it sits at 1-2, never "partly fine".
  const final = gateFailed ? (weighted >= 50 ? 2 : 1) : Math.min(cap, weighted);
  return { final, factors };
}

export function generateReviewSummary(
  submissionId: string,
  organizationId: string,
  brandId: string,
  channel: ContentChannel,
  findings: GovernanceFinding[],
  llmScore: number,
  llmSummaryAssessment: string,
  suggestedRevisedText: string,
  timings: StageExecutionTimings,
  modelUsed: string
): GovernanceReviewSummary {
  const findingsBySeverity: Record<FindingSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    informational: 0,
  };

  const findingsByCategory: Record<FindingCategory, number> = {
    unsupported_claim: 0,
    time_bound_claim: 0,
    tone_inconsistency: 0,
    prohibited_term: 0,
    missing_disclosure: 0,
    out_of_scope: 0,
    factual_conflict: 0,
    readability: 0,
  };

  let unverifiedClaimsCount = 0;

  for (const f of findings) {
    findingsBySeverity[f.severity] = (findingsBySeverity[f.severity] || 0) + 1;
    findingsByCategory[f.category] = (findingsByCategory[f.category] || 0) + 1;
    if (f.unverified) {
      unverifiedClaimsCount++;
    }
  }

  const scoreBreakdown = computeScoreBreakdown(findings, llmScore);
  const finalComplianceScore = scoreBreakdown.final;

  // Determine overall compliance status
  let status: ComplianceStatus = 'approved';
  if (findingsBySeverity.critical > 0 || finalComplianceScore < 50) {
    status = 'rejected';
  } else if (findingsBySeverity.high > 0 || unverifiedClaimsCount > 0 || finalComplianceScore < 80) {
    status = 'needs_review';
  }

  // Build Executive Summary
  const statusLabels: Record<ComplianceStatus, string> = {
    approved: 'APPROVED - Complies with brand guidelines and verified claims.',
    needs_review: 'NEEDS REVIEW - Contains unverified claims or policy deviations requiring remediation.',
    rejected: 'REJECTED - Contains critical compliance violations, prohibited terms, or expired claims.',
  };

  const executiveSummary = [
    llmSummaryAssessment,
    unverifiedClaimsCount > 0 ? `${unverifiedClaimsCount} claim${unverifiedClaimsCount === 1 ? '' : 's'} without approved proof.` : '',
].filter(Boolean).join(' ');

  return {
    submissionId,
    organizationId,
    brandId,
    channel,
    status,
    complianceScore: finalComplianceScore,
    totalFindingsCount: findings.length,
    unverifiedClaimsCount,
    findingsBySeverity,
    findingsByCategory,
    findings,
    executiveSummary,
    suggestedRevisedContent: suggestedRevisedText,
    suggestedRevision: suggestedRevisedText,
    stageExecutionTimes: timings,
    stages: [
      { stage: 1, name: 'Segmentation & claim detection', ms: timings.stage1SegmentationMs },
      { stage: 2, name: 'Deterministic rule checks', ms: timings.stage2RuleChecksMs },
      { stage: 3, name: 'Tenant-scoped retrieval', ms: timings.stage3RetrievalMs },
      { stage: 4, name: 'Contextual LLM analysis', ms: timings.stage4LlmAnalysisMs },
      { stage: 5, name: 'Findings compilation', ms: timings.stage5FindingsCompilationMs },
      { stage: 6, name: 'Review summary & score', ms: timings.stage6SummaryGenerationMs },
    ],
    scoreBreakdown,
    pipelineCompletedAt: new Date().toISOString(),
    modelUsed,
  };
}

// ============================================================================
// Multi-Stage Pipeline Orchestrator
// ============================================================================

export interface GovernancePipelineOptions {
  apiKey?: string;
  repo?: BrandKnowledgeRepository;
  /** Brand the copy is checked for; looked up from the store when omitted. */
  brand?: BrandProfile;
  /** No real brand selected (public live check): don't judge brand fit, only claims, rules and document type. */
  noBrand?: boolean;
  style?: { language?: 'en' | 'hi'; tone?: 'plain' | 'formal' };
}

/** Validated reader style from a request body (`style: { language, tone }`). */
export function styleFrom(body: unknown): GovernancePipelineOptions['style'] {
  const st = (body as { style?: { language?: unknown; tone?: unknown } } | null)?.style;
  return {
    language: st?.language === 'hi' ? 'hi' : 'en',
    tone: st?.tone === 'formal' ? 'formal' : 'plain',
  };
}

// Legacy brand ids used by the built-in rule seed and the evaluation set.
const LEGACY_BRANDS: Record<string, BrandProfile | string> = {
  brand_apex: '00000000-0000-4000-b000-000000000001',
  brand_zenith: '00000000-0000-4000-b000-000000000002',
  brand_flowscale: { name: 'Flowscale', industry: 'Real-time data streaming and cloud infrastructure SaaS', description: 'Event streaming, uptime, latency and throughput for engineering teams.' },
  brand_nexus: { name: 'Nexus', industry: 'Consumer fintech app', description: 'Savings, payments and investing for consumers.' },
};

async function lookupBrand(brandId: string): Promise<BrandProfile | undefined> {
  const legacy = LEGACY_BRANDS[brandId];
  if (legacy && typeof legacy !== 'string') return legacy;
  try {
    const { db } = await import('../db');
    const b = db.getBrand(typeof legacy === 'string' ? legacy : brandId);
    return b ? { name: b.name, industry: b.industry, description: b.description } : undefined;
  } catch {
    return undefined;
  }
}

// ============================================================================
// Hard gates: content must be about the brand and be the right kind of document for the channel.
// Enforced in code so no model output or weighting can score off-brand or wrong-type content well.
// ============================================================================

const STOP = new Set(
  'about above after again against their there these those which while with within without would could should your yours from have this that than then them they what when where will into over under more most some such only other also just very much many each been being were does doing because before between both during further here once same through until upon whom whose'.split(' ')
);
const words = (t: string) => new Set((t.toLowerCase().match(/[a-z][a-z-]{3,}/g) || []).filter(w => !STOP.has(w)));

/** Deterministic brand relevance: brand named, or real vocabulary overlap with its industry, description and claims. */
export function brandRelevance(content: string, brand: BrandProfile | undefined, claimTexts: string[]): { relevant: boolean; overlap: string[] } {
  if (!brand) return { relevant: true, overlap: [] };
  const lower = content.toLowerCase();
  if (brand.name.toLowerCase().split(/\s+/).filter(w => w.length > 3).some(w => lower.includes(w))) {
    return { relevant: true, overlap: [brand.name] };
  }
  const vocab = words([brand.industry, brand.description, ...claimTexts].filter(Boolean).join(' '));
  const overlap = [...words(content)].filter(w => vocab.has(w));
  return { relevant: overlap.length >= 3, overlap };
}

const CHANNEL_KINDS: Partial<Record<ContentChannel, ContentKind[]>> = {
  social_media: ['social_caption', 'video_script', 'ad_copy'],
  advertisement: ['ad_copy', 'social_caption', 'video_script'],
  email: ['email', 'ad_copy'],
  landing_page: ['landing_page', 'ad_copy'],
  press_release: ['press_release'],
  blog_post: ['blog_post'],
  product_documentation: ['product_docs'],
};
const NEVER_PUBLISHABLE: ContentKind[] = ['pitch_deck', 'proposal', 'company_profile', 'report', 'resume'];

export function enforceGates(
  findings: GovernanceFinding[],
  submissionId: string,
  content: string,
  channel: ContentChannel,
  brand: BrandProfile | undefined,
  claimTexts: string[],
  gate: ContentGate | undefined
): void {
  const add = (id: string, flagged: string, explanation: string, fix: string) => {
    if (findings.some(f => f.id === id)) return;
    findings.unshift({
      id, submissionId, stage: 'stage_2_rules', category: 'out_of_scope', severity: 'critical', confidence: 'high',
      flaggedText: flagged, explanation, evidenceRecords: [], citedEvidenceIds: [], citedExcerpt: undefined,
      isVerified: false, unverified: true, suggestedCorrection: fix, ruleId: id,
    });
  };
  const opening = content.trim().split('\n').find(l => l.trim())?.trim().slice(0, 80) ?? '';
  const det = brandRelevance(content, brand, claimTexts);
  // Short ads often never name the brand or its industry words, so vocabulary alone only decides
  // for document-length content (decks, brochures); for short copy only the model's verdict counts.
  const docSignals = new Set((content.match(DOCUMENT_SIGNALS) || []).map(s => s.toLowerCase())).size;
  const long = content.trim().split(/\s+/).length >= 60 || docSignals >= 2;
  const offBrand = !!brand && (gate ? !gate.isAboutBrand || (long && det.overlap.length === 0) : long && !det.relevant);
  if (offBrand && brand) {
    add(
      'gate_off_brand',
      opening,
      `This isn't about ${brand.name}${brand.industry ? ` (${brand.industry})` : ''}. ${gate?.brandReason || 'Nothing in it refers to the brand, its products or its industry.'} It can't be approved for this brand.`,
      `Check copy written for ${brand.name}, or switch to the workspace this content belongs to.`
    );
  }
  const kind = gate?.contentKind;
  const allowed = CHANNEL_KINDS[channel];
  if (kind && (NEVER_PUBLISHABLE.includes(kind) || (allowed && !gate.fitsChannel && !allowed.includes(kind)))) {
    add(
      'gate_wrong_type',
      opening,
      `This is a ${kind.replace(/_/g, ' ')}, not ${channel.replace(/_/g, ' ')} copy. ${gate.channelReason ?? ''}`.trim(),
      'Write the actual copy that will run on this channel and check that.'
    );
  } else if (!gate && docSignals >= 3) {
    // No AI verdict (rules-only check): three or more deck/brochure sections is enough to call it a document, not an ad.
    add(
      'gate_wrong_type',
      opening,
      'This reads like a pitch deck or company document (sections such as About us, Services, Pricing, Contact), not ad copy.',
      'Write the actual copy that will run on this channel and check that.'
    );
  }
}

/**
 * Executes the complete 6-stage AI Brand Governance Pipeline:
 * 1. Content segmentation & claims detection
 * 2. Deterministic rule checks (prohibited terms, required phrases, expired claims)
 * 3. Knowledge retrieval strictly scoped to orgId & brandId (zero leakage)
 * 4. LLM contextual analysis using Gemini 2.5 Flash (with fallback)
 * 5. Findings compilation with severities, confidence, and cited evidence records
 * 6. Review summary generation (score, status, issues count, suggested revision text)
 */
export async function runGovernancePipeline(
  submissionId: string,
  content: string,
  brandId: string = 'brand_flowscale',
  orgId: string = 'org_inkloom_demo',
  channel: ContentChannel = 'general',
  options?: GovernancePipelineOptions
): Promise<GovernanceReviewSummary> {
  const pipelineStartTime = performance.now();
  // The workspace's own claims, terminology and guidelines; falls back to the built-in seed outside a request.
  const repo = options?.repo || (await buildRepoFromStore(orgId, brandId)) || defaultBrandKnowledgeRepository;

  // --------------------------------------------------------------------------
  // STAGE 1: Content Segmentation & Claims Detection
  // --------------------------------------------------------------------------
  const stage1Start = performance.now();
  const segmentationResult = segmentContent(submissionId, content, channel);
  const resolvedChannel = segmentationResult.channel;
  const stage1SegmentationMs = performance.now() - stage1Start;

  // --------------------------------------------------------------------------
  // STAGE 3: Scoped Knowledge Retrieval (Scoped strictly to orgId and brandId)
  // --------------------------------------------------------------------------
  const stage3Start = performance.now();
  const scopedKnowledge = await retrieveScopedBrandKnowledge(
    {
      organizationId: orgId,
      brandId,
      content,
      channel: resolvedChannel,
      detectedClaims: segmentationResult.detectedClaims,
    },
    repo
  );
  const stage3RetrievalMs = performance.now() - stage3Start;

  // --------------------------------------------------------------------------
  // STAGE 2: Deterministic Rule Checks
  // --------------------------------------------------------------------------
  const stage2Start = performance.now();
  const ruleCheckResult = runDeterministicRuleChecks(content, resolvedChannel, {
    prohibitedTerms: scopedKnowledge.activeProhibitedTerms,
    requiredPhrases: scopedKnowledge.activeRequiredPhrases,
    allClaims: [
      ...scopedKnowledge.matchedApprovedClaims,
      ...scopedKnowledge.matchedExpiredClaims,
    ],
  });
  const stage2RuleChecksMs = performance.now() - stage2Start;

  // --------------------------------------------------------------------------
  // STAGE 4: LLM Contextual Analysis (Gemini 2.5 Flash / Fallback)
  // --------------------------------------------------------------------------
  const stage4Start = performance.now();
  const brandProfile = options?.noBrand ? undefined : options?.brand ?? (await lookupBrand(brandId));
  const geminiInput = {
    submissionId,
    channel: resolvedChannel,
    content,
    brandGuidelines: scopedKnowledge.matchedGuidelines.map(g => ({
      category: g.category,
      summary: g.summary,
      rules: g.rules,
    })),
    approvedClaims: scopedKnowledge.matchedApprovedClaims.map(c => ({
      id: c.id,
      claimText: c.claimText,
      allowedContexts: c.allowedContexts,
      evidence: c.evidenceRecords.map(e => ({
        source: e.sourceName,
        excerpt: e.excerpt,
      })),
    })),
    deterministicViolations: ruleCheckResult.violations,
    brand: brandProfile,
    style: options?.style,
  };

  const { result: geminiResult, modelUsed } = await analyzeWithGemini(
    geminiInput,
    options?.apiKey
  );
  const stage4LlmAnalysisMs = performance.now() - stage4Start;

  // --------------------------------------------------------------------------
  // STAGE 5: Compile Findings
  // --------------------------------------------------------------------------
  const stage5Start = performance.now();
  const findings = compileGovernanceFindings(
    submissionId,
    ruleCheckResult.violations,
    geminiResult,
    scopedKnowledge.relevantEvidence
  );
  addUncoveredClaims(findings, segmentationResult.detectedClaims, scopedKnowledge.matchedApprovedClaims, submissionId);
  enforceGates(
    findings, submissionId, content, resolvedChannel, brandProfile,
    scopedKnowledge.matchedApprovedClaims.map(c => c.claimText), geminiResult.gate
  );
  const stage5FindingsCompilationMs = performance.now() - stage5Start;

  // --------------------------------------------------------------------------
  // STAGE 6: Review Summary Generation
  // --------------------------------------------------------------------------
  const stage6Start = performance.now();
  const r2 = (x: number) => Math.round(x * 100) / 100;
  const timings: StageExecutionTimings = {
    stage1SegmentationMs: r2(stage1SegmentationMs),
    stage2RuleChecksMs: r2(stage2RuleChecksMs),
    stage3RetrievalMs: r2(stage3RetrievalMs),
    stage4LlmAnalysisMs: r2(stage4LlmAnalysisMs),
    stage5FindingsCompilationMs: r2(stage5FindingsCompilationMs),
    stage6SummaryGenerationMs: 0,
    totalMs: 0,
  };

  const summary = generateReviewSummary(
    submissionId,
    orgId,
    brandId,
    resolvedChannel,
    findings,
    geminiResult.complianceScore,
    geminiResult.summaryAssessment,
    geminiResult.suggestedRevisedText,
    timings,
    modelUsed
  );
  // Stage 6 is timed around the summary it produces; patch the measured value into both views.
  timings.stage6SummaryGenerationMs = summary.stages[5].ms = r2(performance.now() - stage6Start);
  timings.totalMs = r2(performance.now() - pipelineStartTime);

  return summary;
}
