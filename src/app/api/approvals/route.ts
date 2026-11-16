import { withStore } from "@/lib/db/withStore";
import { NextRequest, NextResponse, after } from "next/server";
import { db } from "@/lib/db";
import { denyFor, getActor, type AppRole } from "./rbac";
import { getMe, supabaseAdmin } from "@/lib/auth/server";
import { emailUsers } from "@/lib/notify/email";
import { fireWebhooks } from "@/lib/notify/webhooks";
import { orgMembers, REVIEW_ROLES } from "./members";
import type { ApprovalDecision, ApprovalStatus } from "@/lib/db/types";

type ApprovalRow = ReturnType<typeof db.listApprovals>[number] & {
  latest_decision?: (ApprovalDecision & { decided_by_name?: string | null }) | null;
};

async function GET_handler(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orgId = searchParams.get("orgId") || "org_uideas_digital";
    const status = searchParams.get("status") || undefined;

    const approvals: ApprovalRow[] = db.listApprovals(orgId, status as ApprovalStatus | undefined);
    // Attach the signer's display name from their profile.
    const ids = [...new Set(approvals.map((a) => a.latest_decision?.decided_by).filter(Boolean))] as string[];
    if (ids.length) {
      try {
        const { data } = await supabaseAdmin().from("profiles").select("id, full_name").in("id", ids);
        const names = new Map((data ?? []).map((p: { id: string; full_name: string | null }) => [p.id, p.full_name]));
        for (const a of approvals) {
          const d = a.latest_decision;
          if (d) d.decided_by_name = names.get(d.decided_by) ?? null;
        }
      } catch {
        // Names are cosmetic; the list still renders with a generic signer label.
      }
    }
    return NextResponse.json({ success: true, approvals });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

const DECISIONS = ["approved", "rejected", "changes_requested", "override"] as const;
type Decision = (typeof DECISIONS)[number];

// Matrix lives in ./rbac. Role comes from the stored user profile, not the request body.
function denyReason(role: AppRole | undefined, decision: Decision, reviewerId: string, authorId?: string, notes?: string, override = false) {
  const perm = decision === "override" || override ? "override_decision" : decision === "rejected" ? "reject" : "decide";
  const d = denyFor(role, perm);
  if (d) return d;
  if (authorId && authorId === reviewerId) return "You can't decide on your own submission.";
  if ((decision !== "approved") && (!notes || notes.trim().length < 5))
    return "Add a short reason (5+ characters) for this decision.";
  return null;
}

async function POST_handler(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      submissionId,
      decision,
      notes,
      reviewerRole: roleField,
      role,
      organizationId = "org_uideas_digital",
    } = body as {
      submissionId?: string;
      decision?: Decision;
      notes?: string;
      reviewerRole?: string;
      role?: string;
      organizationId?: string;
    };

    // Server-side identity: the signed-in user and their stored profile role. Body claims are ignored.
    const actor = await getActor();
    if (!actor) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });
    const reviewerId = actor.id;
    const reviewerRole: AppRole = actor.role;
    const reviewerName = actor.name;
    const claimedRole = roleField ?? role;
    if (!submissionId || !decision || !DECISIONS.includes(decision)) {
      return NextResponse.json(
        { success: false, error: "submissionId and a valid decision are required" },
        { status: 400 }
      );
    }

    const submission = db.getSubmission(submissionId);
    if (!submission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    const orgId = submission.organisation_id || organizationId;
    const isOverride = decision === "override" || body.override === true;
    const denied = denyReason(reviewerRole, decision, reviewerId, submission.authorId, notes, isOverride);
    if (denied) {
      db.recordAuditEvent({
        organizationId: orgId,
        brandId: submission.brandId,
        userId: reviewerId,
        action: "decision_blocked",
        entityType: "submission",
        entityId: submissionId,
        metadata: { attempted: decision, reviewerName, reviewerRole, reason: denied, claimedRole },
      });
      return NextResponse.json({ success: false, error: denied }, { status: 403 });
    }

    const effective = decision === "override" ? "approved" : decision;
    // recordApprovalDecision updates status and writes its own audit event.
    const recordedDecision = db.recordApprovalDecision({
      submissionId,
      organizationId: orgId,
      reviewerId,
      reviewerName,
      decision: effective,
      notes: notes || `Submission ${effective} by ${reviewerName}`,
      decidedAt: new Date().toISOString(),
    });

    db.recordAuditEvent({
      organizationId: orgId,
      brandId: submission.brandId,
      userId: reviewerId,
      action: isOverride ? "override_recorded" : "decision_signed",
      entityType: "submission",
      entityId: submissionId,
      metadata: { decision, notes, reviewerName, reviewerRole },
    });

    db.createNotification({
      organizationId: orgId,
      userId: submission.authorId,
      type: "approval_decision",
      title: `${decision === "override" ? "Override" : effective.replace("_", " ")}: ${submission.title}`,
      message: notes || `Your submission "${submission.title}" was reviewed by ${reviewerName}.`,
      linkUrl: `/submissions/${submissionId}`,
      isRead: false,
    });

    const verb = effective === "approved" ? "approved" : effective === "rejected" ? "rejected" : "sent back for changes";
    // Tenancy key for emails/webhooks is the caller's profiles.organization_id, not the document's legacy org id.
    const tenant = (await getMe())?.organizationId ?? "";
    after(async () => {
      await Promise.all([
        emailUsers(tenant, [submission.authorId], {
          subject: `${submission.title} was ${verb}`,
          heading: `Your ad was ${verb}`,
          body: `${reviewerName} ${verb} "${submission.title}".${notes ? `\n\n"${notes}"` : ""}`,
          link: `/submissions/${submissionId}`,
          cta: effective === "approved" ? "View the ad" : "See what to change",
        }),
        effective === "approved" || effective === "rejected"
          ? fireWebhooks(tenant, effective, { title: submission.title, submissionId, actor: reviewerName, note: notes })
          : Promise.resolve(),
      ]);
    });

    return NextResponse.json({
      success: true,
      decision: recordedDecision,
      submission: db.getSubmission(submissionId),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

/** Assign a reviewer and/or due date. Assignee must be in the caller's org with a reviewing role. */
async function PATCH_handler(req: NextRequest) {
  try {
    const me = await getMe();
    if (!me) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });
    if (!REVIEW_ROLES.includes(me.role)) return NextResponse.json({ success: false, error: "Only reviewers, brand managers and admins can assign reviews." }, { status: 403 });
    const body = (await req.json().catch(() => ({}))) as { submissionId?: unknown; assigneeId?: unknown; dueDate?: unknown };
    if (typeof body.submissionId !== "string") return NextResponse.json({ success: false, error: "submissionId is required" }, { status: 400 });
    const assigneeId = typeof body.assigneeId === "string" && body.assigneeId ? body.assigneeId : null;
    let dueDate: string | null = null;
    if (typeof body.dueDate === "string" && body.dueDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate) || isNaN(Date.parse(body.dueDate))) return NextResponse.json({ success: false, error: "Use a date like 2026-12-01." }, { status: 400 });
      dueDate = body.dueDate;
    }
    const submission = db.getSubmission(body.submissionId);
    if (!submission) return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });

    let assigneeName = "";
    if (assigneeId) {
      const m = (await orgMembers(me.organizationId)).find((x) => x.id === assigneeId);
      if (!m) return NextResponse.json({ success: false, error: "That person is not in your workspace." }, { status: 400 });
      if (!REVIEW_ROLES.includes(m.role)) return NextResponse.json({ success: false, error: "Only reviewers, brand managers and admins can be assigned." }, { status: 400 });
      if (m.id === submission.authorId) return NextResponse.json({ success: false, error: "The author can't review their own ad." }, { status: 400 });
      assigneeName = m.name;
    }
    const prev = (submission.approval_requests ?? []).find((r: { status: string }) => r.status === "pending")?.target_reviewer_id ?? null;
    const request = db.assignApproval(body.submissionId, { assigneeId, dueDate, by: me.id });
    db.recordAuditEvent({
      organizationId: me.organizationId, brandId: submission.brandId, userId: me.id, action: "review_assigned",
      entityType: "submission", entityId: submission.id, metadata: { assigneeId, assigneeName, dueDate },
    });
    if (assigneeId && assigneeId !== prev && assigneeId !== me.id) {
      const due = dueDate ? ` Due ${dueDate}.` : "";
      db.createNotification({
        organizationId: me.organizationId, userId: assigneeId, type: "review_assigned",
        title: `Review assigned: ${submission.title}`, message: `${me.name} asked you to review this ad.${due}`,
        linkUrl: `/approvals?mine=1`,
      });
      after(() => emailUsers(me.organizationId, [assigneeId], {
        subject: `Review assigned: ${submission.title}`, heading: "You have an ad to review",
        body: `${me.name} asked you to review "${submission.title}".${due}`, link: "/approvals?mine=1", cta: "Open the queue",
      }));
    }
    return NextResponse.json({ success: true, request });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

export const GET = withStore(GET_handler);
export const PATCH = withStore(PATCH_handler);
export const POST = withStore(POST_handler);
