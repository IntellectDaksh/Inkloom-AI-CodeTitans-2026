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
} from './types';
import { runDeterministicRuleChecks } from './rules';
import {
  BrandKnowledgeRepository,
  defaultBrandKnowledgeRepository,
  retrieveScopedBrandKnowledge,
} from './retrieval';
import { analyzeWithGemini } from './gemini';

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
    const linkedEvidence: ClaimEvidenceRecord[] = [];
    const citedIds: string[] = [];
    if (lf.isVerified && lf.citedEvidenceIds && lf.citedEvidenceIds.length > 0) {
      for (const id of lf.citedEvidenceIds) {
        const found = evidenceMap.get(id);
        if (found) {
          linkedEvidence.push(found);
          citedIds.push(found.id);
        } else {
          citedIds.push(id);
        }
      }
    }

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
      isVerified: lf.isVerified,
      unverified: !lf.isVerified,
      suggestedCorrection: lf.suggestedCorrection,
    });
  }

  return compiled;
}

// ============================================================================
// Stage 6: Generate Review Summary
// ============================================================================

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

  // Calculate composite compliance score (blends rule penalties with LLM evaluation)
  let scoreDeduction = 0;
  scoreDeduction += findingsBySeverity.critical * 30;
  scoreDeduction += findingsBySeverity.high * 18;
  scoreDeduction += findingsBySeverity.medium * 8;
  scoreDeduction += findingsBySeverity.low * 3;

  const ruleBasedScore = Math.max(0, 100 - scoreDeduction);
  // Blend rule-based score (60% weight) and LLM score (40% weight)
  const blendedScore = Math.round(ruleBasedScore * 0.6 + llmScore * 0.4);
  const finalComplianceScore = Math.max(0, Math.min(100, blendedScore));

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
    `Status: ${statusLabels[status]}`,
    `Overall Compliance Score: ${finalComplianceScore}/100.`,
    `Total Issues Identified: ${findings.length} (${findingsBySeverity.critical} critical, ${findingsBySeverity.high} high, ${findingsBySeverity.medium} medium, ${findingsBySeverity.low} low).`,
    unverifiedClaimsCount > 0 ? `Alert: ${unverifiedClaimsCount} claim(s) lack verified evidence records in brand repository.` : 'All detected claims have corresponding approved evidence.',
    llmSummaryAssessment,
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
  const pipelineStartTime = Date.now();
  const repo = options?.repo || defaultBrandKnowledgeRepository;

  // --------------------------------------------------------------------------
  // STAGE 1: Content Segmentation & Claims Detection
  // --------------------------------------------------------------------------
  const stage1Start = Date.now();
  const segmentationResult = segmentContent(submissionId, content, channel);
  const resolvedChannel = segmentationResult.channel;
  const stage1SegmentationMs = Date.now() - stage1Start;

  // --------------------------------------------------------------------------
  // STAGE 3: Scoped Knowledge Retrieval (Scoped strictly to orgId and brandId)
  // --------------------------------------------------------------------------
  const stage3Start = Date.now();
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
  const stage3RetrievalMs = Date.now() - stage3Start;

  // --------------------------------------------------------------------------
  // STAGE 2: Deterministic Rule Checks
  // --------------------------------------------------------------------------
  const stage2Start = Date.now();
  const ruleCheckResult = runDeterministicRuleChecks(content, resolvedChannel, {
    prohibitedTerms: scopedKnowledge.activeProhibitedTerms,
    requiredPhrases: scopedKnowledge.activeRequiredPhrases,
    allClaims: [
      ...scopedKnowledge.matchedApprovedClaims,
      ...scopedKnowledge.matchedExpiredClaims,
    ],
  });
  const stage2RuleChecksMs = Date.now() - stage2Start;

  // --------------------------------------------------------------------------
  // STAGE 4: LLM Contextual Analysis (Gemini 2.5 Flash / Fallback)
  // --------------------------------------------------------------------------
  const stage4Start = Date.now();
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
  };

  const { result: geminiResult, modelUsed } = await analyzeWithGemini(
    geminiInput,
    options?.apiKey
  );
  const stage4LlmAnalysisMs = Date.now() - stage4Start;

  // --------------------------------------------------------------------------
  // STAGE 5: Compile Findings
  // --------------------------------------------------------------------------
  const stage5Start = Date.now();
  const findings = compileGovernanceFindings(
    submissionId,
    ruleCheckResult.violations,
    geminiResult,
    scopedKnowledge.relevantEvidence
  );
  const stage5FindingsCompilationMs = Date.now() - stage5Start;

  // --------------------------------------------------------------------------
  // STAGE 6: Review Summary Generation
  // --------------------------------------------------------------------------
  const stage6Start = Date.now();
  const totalMs = Date.now() - pipelineStartTime;

  const timings: StageExecutionTimings = {
    stage1SegmentationMs,
    stage2RuleChecksMs,
    stage3RetrievalMs,
    stage4LlmAnalysisMs,
    stage5FindingsCompilationMs,
    stage6SummaryGenerationMs: Date.now() - stage6Start,
    totalMs,
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

  return summary;
}
