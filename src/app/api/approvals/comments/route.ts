import { withStore } from "@/lib/db/withStore";
import { NextRequest, NextResponse, after } from "next/server";
import { db } from "@/lib/db";
import { getMe } from "@/lib/auth/server";
import { emailUsers } from "@/lib/notify/email";
import { orgMembers } from "../members";

/** Add a comment to a submission's approval thread. `mentions` are user ids; only org members are kept. */
async function POST_handler(req: NextRequest) {
  try {
    const me = await getMe();
    if (!me) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });
    const body = (await req.json().catch(() => ({}))) as { submissionId?: unknown; text?: unknown; mentions?: unknown };
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (typeof body.submissionId !== "string") return NextResponse.json({ success: false, error: "submissionId is required" }, { status: 400 });
    if (text.length < 1 || text.length > 2000) return NextResponse.json({ success: false, error: "Write a comment between 1 and 2000 characters." }, { status: 400 });
    const submission = db.getSubmission(body.submissionId);
    if (!submission) return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });

    const asked = Array.isArray(body.mentions) ? body.mentions.filter((x): x is string => typeof x === "string").slice(0, 20) : [];
    const members = asked.length ? await orgMembers(me.organizationId) : [];
    const mentions = [...new Set(asked)].filter((id) => id !== me.id && members.some((m) => m.id === id));

    const comment = db.addApprovalComment(submission.id, { author_id: me.id, author_name: me.name, text, mentions });
    const snippet = text.length > 140 ? text.slice(0, 137) + "..." : text;
    for (const uid of mentions) {
      db.createNotification({
        organizationId: me.organizationId, userId: uid, type: "review_assigned",
        title: `${me.name} mentioned you on ${submission.title}`, message: snippet, linkUrl: `/approvals`,
      });
    }
    if (mentions.length) {
      after(() => emailUsers(me.organizationId, mentions, {
        subject: `${me.name} mentioned you on ${submission.title}`, heading: `${me.name} mentioned you`,
        body: `On "${submission.title}":\n\n"${snippet}"`, link: `/approvals`, cta: "Reply",
      }));
    }
    return NextResponse.json({ success: true, comment });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

export const POST = withStore(POST_handler, { limit: [0, 300], name: "approval-comments" });
