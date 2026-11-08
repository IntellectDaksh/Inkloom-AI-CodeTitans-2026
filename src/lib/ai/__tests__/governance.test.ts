/**
 * Inkloom AI Brand Governance Engine - Comprehensive Test Suite
 */

import {
  runGovernancePipeline,
  segmentContent,
  checkProhibitedTerms,
  checkRequiredPhrases,
  checkExpiredOrDeprecatedClaims,
  checkOutOfScopeContext,
  retrieveScopedBrandKnowledge,
  BrandKnowledgeRepository,
  runDeterministicFallbackAnalysis,
  analyzeWithGemini,
} from '../index';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`✅ PASS: ${message}`);
}

async function runAllTests() {
  console.log('\n========================================');
  console.log('STARTING INKLOOM AI BRAND GOVERNANCE TESTS');
  console.log('========================================\n');

  const orgId = 'org_inkloom_demo';
  const brandId = 'brand_flowscale';

  // --------------------------------------------------------------------------
  // TEST 1: Stage 1 - Content Segmentation & Claims Detection
  // --------------------------------------------------------------------------
  console.log('--- Test Suite 1: Content Segmentation & Claims Detection ---');
  const sampleCopy = `
# Next-Gen Enterprise Streaming

Flowscale delivers 50,000 transactions per second with sub-millisecond p99 latency.
We guarantee 100% uptime with our revolutionary architecture.

* Saves up to 35% on infrastructure costs.
* Certified by independent auditors.
`;

  const segmentation = segmentContent('sub_001', sampleCopy, 'landing_page');
  assert(segmentation.segments.length >= 3, `Identified ${segmentation.segments.length} segments`);
  assert(segmentation.channel === 'landing_page', `Channel resolved to ${segmentation.channel}`);
  assert(segmentation.detectedClaims.length >= 2, `Detected ${segmentation.detectedClaims.length} claim candidates`);
  const hasNumericClaim = segmentation.detectedClaims.some(c => c.claimType === 'numeric');
  const hasGuarantee = segmentation.detectedClaims.some(c => c.claimType === 'guarantee');
  assert(hasNumericClaim, 'Identified numeric metrics claim');
  assert(hasGuarantee, 'Identified guarantee claim candidate');

  // --------------------------------------------------------------------------
  // TEST 2: Stage 2 - Deterministic Rule Checks
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 2: Deterministic Rule Checks ---');

  // 2a. Prohibited Terms
  const badContent = 'Our bulletproof architecture provides unhackable security and 100% uptime with secret sauce.';
  const ptViolations = checkProhibitedTerms(badContent, [
    {
      id: 'pt_1',
      organizationId: orgId,
      brandId,
      term: 'bulletproof',
      severity: 'high',
      reason: 'No system is bulletproof.',
      category: 'prohibited_term',
    },
    {
      id: 'pt_2',
      organizationId: orgId,
      brandId,
      term: 'unhackable',
      severity: 'critical',
      reason: 'Legally prohibited claim.',
      category: 'prohibited_term',
    },
    {
      id: 'pt_3',
      organizationId: orgId,
      brandId,
      term: '100% uptime',
      severity: 'critical',
      reason: 'SLA is 99.99%',
      category: 'prohibited_term',
    },
  ]);
  assert(ptViolations.length === 3, `Detected all 3 prohibited terms (found ${ptViolations.length})`);
  assert(ptViolations.some(v => v.severity === 'critical'), 'Flagged critical severity for absolute claims');

  // 2b. Channel Required Phrases
  const adCopyWithoutDisclosure = 'Special limited-time launch offer for enterprise streaming clusters.';
  const rpViolations = checkRequiredPhrases(adCopyWithoutDisclosure, 'advertisement', [
    {
      id: 'rp_ad',
      organizationId: orgId,
      brandId,
      phrase: 'Terms and conditions apply',
      channels: ['advertisement'],
      placement: 'footer',
      reason: 'FTC mandatory disclaimer',
      severity: 'high',
    },
  ]);
  assert(rpViolations.length === 1, 'Detected missing required disclaimer for advertisement channel');
  assert(rpViolations[0].category === 'missing_disclosure', 'Correct category missing_disclosure');

  // 2c. Expired or Deprecated Claims
  const expiredCopy = 'Flowscale was Voted #1 Cloud Event Platform in 2023 with unlimited free data egress forever on all tiers!';
  const expiredViolations = checkExpiredOrDeprecatedClaims(expiredCopy, [
    {
      id: 'claim_exp',
      organizationId: orgId,
      brandId,
      claimText: 'Voted #1 Cloud Event Platform in 2023.',
      status: 'expired',
      allowedContexts: [],
      validFrom: '2023-01-01',
      validUntil: '2024-01-01',
      evidenceRecords: [],
    },
    {
      id: 'claim_dep',
      organizationId: orgId,
      brandId,
      claimText: 'Unlimited free data egress forever on all tiers.',
      status: 'deprecated',
      allowedContexts: [],
      validFrom: '2022-01-01',
      validUntil: '2024-06-01',
      deprecationReason: 'Switched to tiered egress model.',
      evidenceRecords: [],
    },
  ]);
  assert(expiredViolations.length === 2, `Detected ${expiredViolations.length} expired/deprecated claims`);
  assert(expiredViolations.some(v => v.ruleType === 'expired_claim'), 'Identified expired_claim ruleType');
  assert(expiredViolations.some(v => v.ruleType === 'deprecated_claim'), 'Identified deprecated_claim ruleType');

  // 2d. Out of Scope Claim Context
  const outOfScopeCopy = 'All users globally on the free tier can now enjoy 50,000 transactions per second!';
  const outOfScopeViolations = checkOutOfScopeContext(outOfScopeCopy, 'landing_page', [
    {
      id: 'claim_scope_1',
      organizationId: orgId,
      brandId,
      claimText: '50,000 transactions per second',
      status: 'active',
      allowedChannels: ['landing_page'],
      allowedContexts: ['enterprise', 'fintech'],
      validFrom: '2025-01-01',
      evidenceRecords: [],
    },
  ]);
  assert(outOfScopeViolations.length >= 1, 'Detected out-of-scope context violation (free tier vs enterprise restriction)');
  assert(outOfScopeViolations[0].category === 'out_of_scope', 'Correct category out_of_scope');

  // --------------------------------------------------------------------------
  // TEST 3: Stage 3 - Scoped Multi-Tenant Retrieval & Zero Leakage
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 3: Scoped Multi-Tenant Retrieval ---');
  const repo = new BrandKnowledgeRepository();

  const retrieved = await retrieveScopedBrandKnowledge(
    {
      organizationId: orgId,
      brandId,
      content: 'We achieve high throughput and certified compliance with SOC 2.',
    },
    repo
  );

  assert(retrieved.tenantIsolationVerified === true, 'Tenant isolation verified flag set to true');
  assert(retrieved.matchedApprovedClaims.length > 0, `Retrieved ${retrieved.matchedApprovedClaims.length} active approved claims`);
  assert(retrieved.relevantEvidence.length > 0, `Retrieved ${retrieved.relevantEvidence.length} verified evidence records`);

  // Verify ZERO cross-tenant leakage: Competitor Nexus claims must NOT exist
  const hasCompetitorClaims = retrieved.matchedApprovedClaims.some(c => c.brandId === 'brand_nexus' || c.organizationId === 'org_competitor_sandbox');
  assert(!hasCompetitorClaims, 'Zero cross-tenant leakage verified: No competitor claims present');

  const hasCompetitorTerms = retrieved.activeProhibitedTerms.some(t => t.brandId === 'brand_nexus');
  assert(!hasCompetitorTerms, 'Zero cross-tenant leakage verified: No competitor terms present');

  // Check evidence structure
  const sampleEvidence = retrieved.relevantEvidence[0];
  assert(!!sampleEvidence.sourceName, `Evidence includes sourceName: ${sampleEvidence.sourceName}`);
  assert(!!sampleEvidence.excerpt, `Evidence includes excerpt: ${sampleEvidence.excerpt}`);
  assert(sampleEvidence.confidenceScore >= 0.8, `Evidence includes high confidenceScore: ${sampleEvidence.confidenceScore}`);

  // --------------------------------------------------------------------------
  // TEST 4: Stage 4 - Deterministic Fallback Analyzer & Gemini Call
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 4: Gemini Analysis & Deterministic Fallback ---');

  const unverifiedText = `
Flowscale is the miraculous world's fastest streaming engine, delivering 999,999% ROI in 24 hours.
We provide 50,000 transactions per second with sub-millisecond p99 latency for enterprise clusters.
`;

  const fallbackOutput = runDeterministicFallbackAnalysis({
    submissionId: 'sub_test_fallback',
    channel: 'landing_page',
    content: unverifiedText,
    brandGuidelines: [],
    approvedClaims: [
      {
        id: 'claim_flowscale_001',
        claimText: 'Processes 50,000 transactions per second with sub-millisecond p99 latency.',
        allowedContexts: ['enterprise'],
        evidence: [{ source: 'TechMetrics Labs', excerpt: '52,400 TPS verified.' }],
      },
    ],
    deterministicViolations: [],
  });

  assert(typeof fallbackOutput.complianceScore === 'number', `Fallback computed compliance score: ${fallbackOutput.complianceScore}`);
  assert(fallbackOutput.findings.length > 0, `Fallback generated ${fallbackOutput.findings.length} findings`);

  const unverifiedFindings = fallbackOutput.findings.filter(f => !f.isVerified);
  assert(unverifiedFindings.length >= 1, `Properly flagged unverified claims: ${unverifiedFindings.map(f => f.flaggedText).join(', ')}`);
  assert(unverifiedFindings.every(f => f.citedEvidenceIds.length === 0), 'No hallucinated evidence citations on unverified claims');

  // Test live Gemini call (or automatic fallback if network/auth fails)
  console.log('Testing analyzeWithGemini...');
  const geminiResult = await analyzeWithGemini({
    submissionId: 'sub_gemini_test',
    channel: 'landing_page',
    content: 'Flowscale provides sub-millisecond latency for enterprise clusters.',
    brandGuidelines: [],
    approvedClaims: [
      {
        id: 'claim_1',
        claimText: 'Processes 50,000 transactions per second with sub-millisecond p99 latency.',
        allowedContexts: ['enterprise'],
        evidence: [{ source: 'TechMetrics Report', excerpt: '0.84ms latency' }],
      },
    ],
    deterministicViolations: [],
  });

  assert(geminiResult.result.complianceScore >= 0 && geminiResult.result.complianceScore <= 100, `Result score valid: ${geminiResult.result.complianceScore}`);
  assert(!!geminiResult.modelUsed, `Model used: ${geminiResult.modelUsed}`);

  // --------------------------------------------------------------------------
  // TEST 5: Full 6-Stage Governance Pipeline End-to-End
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 5: Full 6-Stage Governance Pipeline End-to-End ---');

  const submissionContent = `
# Unstoppable Event Streaming

Experience the revolutionary magic of Flowscale.
Our bulletproof engine guarantees 100% uptime with zero downtime forever!
In 2023 we were Voted #1 Cloud Event Platform in 2023 with unlimited free data egress forever on all tiers.
Flowscale processes 50,000 transactions per second with sub-millisecond p99 latency for enterprise fintech workloads.
Reduces cloud infrastructure spend by up to 35% for enterprise hybrid cloud customers.
`;

  const reviewSummary = await runGovernancePipeline(
    'sub_e2e_001',
    submissionContent,
    brandId,
    orgId,
    'landing_page'
  );

  console.log('\nPipeline Execution Summary:');
  console.log(`- Submission ID: ${reviewSummary.submissionId}`);
  console.log(`- Status: ${reviewSummary.status}`);
  console.log(`- Compliance Score: ${reviewSummary.complianceScore}/100`);
  console.log(`- Total Findings: ${reviewSummary.totalFindingsCount}`);
  console.log(`- Critical: ${reviewSummary.findingsBySeverity.critical}`);
  console.log(`- High: ${reviewSummary.findingsBySeverity.high}`);
  console.log(`- Medium: ${reviewSummary.findingsBySeverity.medium}`);
  console.log(`- Model: ${reviewSummary.modelUsed}`);
  console.log(`- Total Execution Time: ${reviewSummary.stageExecutionTimes.totalMs}ms`);

  assert(reviewSummary.submissionId === 'sub_e2e_001', 'Submission ID preserved');
  assert(reviewSummary.organizationId === orgId, 'Organization ID verified');
  assert(reviewSummary.brandId === brandId, 'Brand ID verified');
  assert(reviewSummary.totalFindingsCount > 0, 'Found expected compliance issues');
  assert(reviewSummary.status === 'rejected', 'Critical issues correctly resulted in "rejected" status');
  assert(reviewSummary.findingsBySeverity.critical > 0, 'Counted critical violations (unhackable/100% uptime/expired)');
  assert(reviewSummary.suggestedRevisedContent.length > 0, 'Generated suggested revised content');
  assert(reviewSummary.stageExecutionTimes.totalMs > 0, 'Execution timings recorded for all stages');

  // Verify compliant content passes
  console.log('\nTesting fully compliant submission...');
  const compliantContent = `
# Enterprise Event Streaming Platform

Flowscale processes 50,000 transactions per second with sub-millisecond p99 latency for enterprise fintech deployments.
Reduces cloud infrastructure spend by up to 35% for enterprise hybrid cloud customers.
SOC 2 Type II certified and ISO 27001 compliant enterprise security.
`;

  const compliantSummary = await runGovernancePipeline(
    'sub_compliant_002',
    compliantContent,
    brandId,
    orgId,
    'landing_page'
  );

  console.log(`- Compliant Score: ${compliantSummary.complianceScore}/100`);
  console.log(`- Compliant Status: ${compliantSummary.status}`);
  assert(compliantSummary.complianceScore >= 80, `Compliant content scored high (${compliantSummary.complianceScore})`);
  assert(compliantSummary.findingsBySeverity.critical === 0, 'Zero critical findings on compliant content');

  console.log('\n========================================');
  console.log(`ALL TESTS PASSED! (${passedTests}/${totalTests} assertions)`);
  console.log('========================================\n');
}

runAllTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
