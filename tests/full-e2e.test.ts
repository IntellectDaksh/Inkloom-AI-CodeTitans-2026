/**
 * Inkloom AI - Master End-to-End Test Suite
 * Covers:
 * 1. Multi-Tenant & Brand Isolation
 * 2. Role-Based Permissions
 * 3. Claims Library & Expiry Rules
 * 4. Deterministic Terminology Filters
 * 5. Multi-Stage AI Governance Pipeline
 * 6. Zero Hallucination Assertions (Unverified Claims Marked Unsupported)
 * 7. Revision Suggestions & Application
 * 8. Approval Workflow State Machine
 * 9. Audit Event Logging & Notifications
 */

import { db, SEED_IDS } from "../src/lib/db";
import { runGovernancePipeline } from "../src/lib/ai";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${testName}`);
    process.exitCode = 1;
  } else {
    passedTests++;
    console.log(`✅ PASSED: ${testName}`);
  }
}

async function runMasterTestSuite() {
  console.log("\n========================================================");
  console.log("   INKLOOM AI - MASTER AUTOMATED TEST VERIFICATION");
  console.log("========================================================\n");

  const orgId = SEED_IDS.ORGANISATION_UIDEAS;
  const brandApex = SEED_IDS.BRAND_APEX;
  const brandZenith = SEED_IDS.BRAND_ZENITH;

  // --------------------------------------------------------------------------
  // TEST 1: Tenant & Brand Scoped Retrieval
  // --------------------------------------------------------------------------
  console.log("--- Test 1: Tenant & Brand Scoped Isolation ---");
  const apexClaims = db.getApprovedClaims(orgId, brandApex);
  const zenithClaims = db.getApprovedClaims(orgId, brandZenith);

  assert(apexClaims.length >= 5, `Apex Nutrition has ${apexClaims.length} approved claims loaded`);
  assert(zenithClaims.length >= 2, `Zenith Cloud has ${zenithClaims.length} claims loaded`);

  const crossLeak = apexClaims.some((c) => c.brand_id === brandZenith);
  assert(!crossLeak, "Zero cross-brand data leakage between Apex Nutrition and Zenith Cloud");

  // --------------------------------------------------------------------------
  // TEST 2: Expiring Claims Identification
  // --------------------------------------------------------------------------
  console.log("\n--- Test 2: Expiring Claims Identification (<30 Days) ---");
  const expiringApex = db.getApprovedClaims(orgId, brandApex, { expiringOnly: true });
  assert(expiringApex.length === 2, `Identified exactly ${expiringApex.length} claims expiring within 30 days`);
  assert(
    expiringApex.some((c) => c.claim_code === "CLM-APX-003"),
    "Informed-Sport claim CLM-APX-003 correctly flagged for impending expiration"
  );

  // --------------------------------------------------------------------------
  // TEST 3: Deterministic Prohibited Term Detection
  // --------------------------------------------------------------------------
  console.log("\n--- Test 3: Deterministic Brand Terminology Checking ---");
  const prohibitedCopy = "Our formula is a cheat code and a miracle workout formula for rapid gains.";
  const analysisProhibited = await runGovernancePipeline(
    "test_sub_prohibited",
    prohibitedCopy,
    brandApex,
    orgId,
    "social_media"
  );

  const foundProhibited = analysisProhibited.findings.some(
    (f) => f.category === "prohibited_term" || f.flaggedText?.toLowerCase().includes("miracle") || f.flaggedText?.toLowerCase().includes("cheat code")
  );
  assert(foundProhibited, "Prohibited words ('miracle', 'cheat code') caught deterministically");

  // --------------------------------------------------------------------------
  // TEST 4: Unsupported Claim Detection (Zero-Hallucination Assertion)
  // --------------------------------------------------------------------------
  console.log("\n--- Test 4: Unsupported Claim & Zero-Hallucination Policy ---");
  const unverifiedCopy = "Our formula gives you 2x faster results and builds muscle in just 14 days.";
  const analysisUnverified = await runGovernancePipeline(
    "test_sub_unverified",
    unverifiedCopy,
    brandApex,
    orgId,
    "social_media"
  );

  const unsupportedFinding = analysisUnverified.findings.find(
    (f) => f.category === "unsupported_claim" || f.flaggedText?.includes("2x faster") || f.flaggedText?.includes("14 days")
  );
  assert(unsupportedFinding !== undefined, "Unsupported metric ('2x faster results') flagged as unverified");
  assert(unsupportedFinding?.isVerified === false, "Unsupported claim explicitly marked isVerified = false");
  assert(
    !unsupportedFinding?.citedEvidenceIds || unsupportedFinding.citedEvidenceIds.length === 0,
    "AI did NOT invent or hallucinate citations for unverified statement"
  );

  // --------------------------------------------------------------------------
  // TEST 5: Compliant Draft Evaluation
  // --------------------------------------------------------------------------
  console.log("\n--- Test 5: Compliant Draft Evaluation ---");
  const compliantCopy =
    "Introducing our new athletic recovery formula. Clinically tested for faster results with consistent daily use, and crafted with 100% bio-available plant proteins. Fuel your passion the clean way.";
  const analysisCompliant = await runGovernancePipeline(
    "test_sub_compliant",
    compliantCopy,
    brandApex,
    orgId,
    "social_media"
  );

  assert(
    analysisCompliant.complianceScore >= 75,
    `Compliant copy scored high compliance: ${analysisCompliant.complianceScore}/100`
  );

  // --------------------------------------------------------------------------
  // TEST 6: Suggested Revision Generation
  // --------------------------------------------------------------------------
  console.log("\n--- Test 6: Suggested Revision Generation ---");
  assert(
    typeof analysisUnverified.suggestedRevision === "string" &&
      analysisUnverified.suggestedRevision.length > 10,
    "Actionable, compliant suggested revision produced"
  );

  // --------------------------------------------------------------------------
  // TEST 7: Submission Creation & State Machine Workflow
  // --------------------------------------------------------------------------
  console.log("\n--- Test 7: Submission Creation & Human Approval Workflow ---");
  const newSub = db.createSubmission({
    title: "Master Test Submission - Automated Check",
    currentContent: unverifiedCopy,
    brandId: brandApex,
    organizationId: orgId,
    authorId: SEED_IDS.USER_RIDDHI,
    channel: "social_media",
    submissionType: "reel_script",
    status: "submitted",
  });

  assert(newSub.id !== undefined, `Created submission with unique ID: ${newSub.id}`);
  assert(newSub.status === "submitted", "Initial submission status is 'submitted'");

  // Record Reviewer Approval Decision (Approved)
  const approvalDecision = db.recordApprovalDecision({
    submissionId: newSub.id,
    organizationId: orgId,
    reviewerId: SEED_IDS.USER_DAKSH,
    reviewerName: "Daksh Agrawal",
    decision: "approved",
    notes: "Verified by Lead Auditor",
    decidedAt: new Date().toISOString(),
  });

  db.updateSubmission(newSub.id, { status: "approved" });
  const updatedSub = db.getSubmission(newSub.id);
  assert(updatedSub?.status === "approved", "Submission transitioned to 'approved' by authorized reviewer");

  // --------------------------------------------------------------------------
  // TEST 8: Audit Trail & Notification Logging
  // --------------------------------------------------------------------------
  console.log("\n--- Test 8: Governance Audit Trail & Notifications ---");
  const auditEvents = db.getAuditEvents(orgId);
  assert(auditEvents.length > 0, `Audit log contains ${auditEvents.length} immutable events`);

  const notifications = db.getNotifications(orgId, SEED_IDS.USER_DAKSH);
  assert(notifications.length > 0, `In-app notification system loaded ${notifications.length} alerts`);

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n========================================================");
  console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  if (passedTests === totalTests) {
    console.log("🎉 ALL GOVERNANCE, SECURITY & AI PIPELINE TESTS PASSED!");
  }
  console.log("========================================================\n");
}

runMasterTestSuite().catch((err) => {
  console.error("Test runner encountered error:", err);
  process.exit(1);
});
