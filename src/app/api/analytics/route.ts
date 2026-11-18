import { withStore } from "@/lib/db/withStore";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMe, supabaseAdmin } from "@/lib/auth/server";

const DAY = 86_400_000;
type Outcome = "pass" | "review" | "blocked";
const outcomeOf = (status: unknown, score: number | null): Outcome =>
  status === "rejected" ? "blocked" : status === "needs_review" ? "review" : status === "approved" ? "pass" : score === null ? "review" : score >= 85 ? "pass" : score >= 50 ? "review" : "blocked";

const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const top = (m: Map<string, number>, n: number) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
const bump = (m: Map<string, number>, k: string, by = 1) => m.set(k, (m.get(k) ?? 0) + by);

/**
 * Everything here is computed from the signed-in organisation's own document: checks are the
 * run_analysis audit events (one per check, re-checks included), findings, approval requests/decisions
 * and the claims library. Nothing is seeded or estimated.
 */
async function GET_handler(req: NextRequest) {
  try {
    const me = await getMe();
    if (!me) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });
    const q = req.nextUrl.searchParams;
    const now = Date.now();
    const to = q.get("to") ? Date.parse(q.get("to")!) + DAY - 1 : now;
    const from = q.get("from") ? Date.parse(q.get("from")!) : to - 30 * DAY + 1;
    if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) return NextResponse.json({ success: false, error: "Invalid date range." }, { status: 400 });
    const brandF = q.get("brandId") || "";
    const channelF = q.get("channel") || "";
    const inRange = (iso?: string | null) => { const t = iso ? Date.parse(iso) : NaN; return t >= from && t <= to; };

    // The store document loaded by withStore IS this organisation's data.
    const st = db.getState();
    const brandName = new Map(st.brands.map((b) => [b.id, b.name]));
    const channelOf = (s: { metadata?: Record<string, unknown> }) => String(s.metadata?.channel || "unspecified");
    const subs = new Map(st.submissions.map((s) => [s.id, s]));
    const keep = (id: string) => {
      const s = subs.get(id);
      return !!s && (!brandF || s.brand_id === brandF) && (!channelF || channelOf(s) === channelF);
    };

    // ---- checks over time ----
    const checks = st.audit_events
      .filter((e) => e.action === ("run_analysis" as typeof e.action) && keep(e.entity_id) && inRange(e.created_at))
      .map((e) => {
        const score = typeof e.metadata?.score === "number" ? (e.metadata.score as number) : null;
        const s = subs.get(e.entity_id)!;
        return { at: Date.parse(e.created_at), score, outcome: outcomeOf(e.metadata?.status, score), brand: s.brand_id, channel: channelOf(s) };
      })
      .sort((a, b) => a.at - b.at);
    const weekly = to - from > 45 * DAY;
    const step = weekly ? 7 * DAY : DAY;
    const start = new Date(from); start.setUTCHours(0, 0, 0, 0);
    const buckets: { start: string; checks: number; pass: number; review: number; blocked: number; avgScore: number | null }[] = [];
    for (let t = start.getTime(); t <= to; t += step) {
      const inB = checks.filter((c) => c.at >= t && c.at < t + step);
      const sc = inB.map((c) => c.score).filter((x): x is number => x !== null);
      buckets.push({
        start: new Date(t).toISOString().slice(0, 10), checks: inB.length,
        pass: inB.filter((c) => c.outcome === "pass").length, review: inB.filter((c) => c.outcome === "review").length, blocked: inB.filter((c) => c.outcome === "blocked").length,
        avgScore: sc.length ? Math.round(sc.reduce((a, b) => a + b, 0) / sc.length) : null,
      });
    }
    const scored = checks.map((c) => c.score).filter((x): x is number => x !== null);
    const split = { pass: 0, review: 0, blocked: 0 };
    checks.forEach((c) => split[c.outcome]++);

    // ---- findings: categories, phrases, claims ----
    const findings = st.findings.filter((f) => keep(f.submission_id) && inRange(f.created_at));
    const cats = new Map<string, number>(), phrases = new Map<string, number>();
    const claimUse = new Map<string, number>(), claimFail = new Map<string, number>();
    for (const f of findings) {
      const verified = f.isVerified === true || f.severity === "informational" as typeof f.severity;
      if (!verified) bump(cats, f.category);
      const p = (f.highlighted_snippet || "").trim().toLowerCase().replace(/\s+/g, " ");
      if (!verified && p && p.length <= 80) bump(phrases, p);
      if (f.claimId) { bump(claimUse, f.claimId); if (!verified) bump(claimFail, f.claimId); }
    }
    const claimById = new Map(st.approved_claims.map((c) => [c.id, c]));
    const claimRow = ([id, n]: [string, number]) => ({ id, text: claimById.get(id)?.claim_text ?? id, brand: brandName.get(claimById.get(id)?.brand_id ?? "") ?? null, count: n });

    const expiring = st.approved_claims
      .filter((c) => c.expires_at && (!brandF || c.brand_id === brandF) && c.status !== "archived" as typeof c.status)
      .map((c) => ({ id: c.id, text: c.claim_text, brand: brandName.get(c.brand_id) ?? null, days: Math.ceil((Date.parse(c.expires_at!) - now) / DAY) }))
      .filter((c) => c.days <= 60)
      .sort((a, b) => a.days - b.days);

    // ---- approvals: time to approval, reviewer workload ----
    const decisions = st.approval_decisions.filter((d) => keep(d.submission_id) && inRange(d.decided_at));
    const firstCheck = new Map<string, number>();
    for (const e of st.audit_events) if (e.action === ("run_analysis" as typeof e.action)) {
      const t = Date.parse(e.created_at);
      if (!firstCheck.has(e.entity_id) || t < firstCheck.get(e.entity_id)!) firstCheck.set(e.entity_id, t);
    }
    const toApproval = decisions.filter((d) => d.decision === "approved").map((d) => {
      const s = subs.get(d.submission_id)!;
      const begin = firstCheck.get(d.submission_id) ?? Date.parse(s.created_at);
      return { id: s.id, title: s.title, hours: (Date.parse(d.decided_at) - begin) / 3_600_000 };
    }).filter((x) => x.hours >= 0).sort((a, b) => b.hours - a.hours);

    const reviewers = new Map<string, { approved: number; rejected: number; changes_requested: number; pending: number }>();
    const rv = (id: string) => reviewers.get(id) ?? reviewers.set(id, { approved: 0, rejected: 0, changes_requested: 0, pending: 0 }).get(id)!;
    decisions.forEach((d) => rv(d.decided_by)[d.decision]++);
    st.approval_requests.filter((r) => r.status === "pending" && r.target_reviewer_id && keep(r.submission_id)).forEach((r) => rv(r.target_reviewer_id!).pending++);
    const names = new Map<string, string>();
    try {
      const { data } = await supabaseAdmin().from("profiles").select("id, full_name, email").eq("organization_id", me.organizationId);
      (data ?? []).forEach((p) => names.set(p.id, p.full_name || p.email || "Unknown"));
    } catch { /* names are cosmetic; ids still group correctly */ }

    // ---- per brand / channel ----
    const group = (key: (c: (typeof checks)[number]) => string, label: (k: string) => string) => {
      const m = new Map<string, typeof checks>();
      checks.forEach((c) => (m.get(key(c)) ?? m.set(key(c), []).get(key(c))!).push(c));
      return [...m.entries()].map(([k, cs]) => {
        const sc = cs.map((c) => c.score).filter((x): x is number => x !== null);
        return { key: k, label: label(k), checks: cs.length, avgScore: sc.length ? Math.round(sc.reduce((a, b) => a + b, 0) / sc.length) : null, blocked: cs.filter((c) => c.outcome === "blocked").length, pass: cs.filter((c) => c.outcome === "pass").length };
      }).sort((a, b) => b.checks - a.checks);
    };

    const channels = [...new Set(st.submissions.map(channelOf))].sort();
    return NextResponse.json({
      success: true,
      range: { from: new Date(from).toISOString(), to: new Date(to).toISOString(), bucket: weekly ? "week" : "day" },
      filters: { brands: st.brands.map((b) => ({ id: b.id, name: b.name })), channels },
      totals: {
        checks: checks.length, ads: new Set(st.audit_events.filter((e) => e.action === ("run_analysis" as typeof e.action) && keep(e.entity_id) && inRange(e.created_at)).map((e) => e.entity_id)).size,
        avgScore: scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : null,
        issues: [...cats.values()].reduce((a, b) => a + b, 0), split,
        medianHoursToApproval: median(toApproval.map((x) => x.hours)), approvals: toApproval.length, everChecked: firstCheck.size,
      },
      series: buckets,
      categories: top(cats, 8).map(([category, count]) => ({ category, count })),
      phrases: top(phrases, 10).map(([phrase, count]) => ({ phrase, count })),
      claimsUsed: top(claimUse, 6).map(claimRow),
      claimsFailing: top(claimFail, 6).map(claimRow),
      expiring,
      slowestApprovals: toApproval.slice(0, 6),
      reviewers: [...reviewers.entries()].map(([id, r]) => ({ id, name: names.get(id) ?? "Former or unknown member", ...r, total: r.approved + r.rejected + r.changes_requested })).sort((a, b) => b.total + b.pending - a.total - a.pending),
      byBrand: group((c) => c.brand, (k) => brandName.get(k) ?? "Deleted brand"),
      byChannel: group((c) => c.channel, (k) => k.replace(/_/g, " ")),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Analytics failed" }, { status: 500 });
  }
}

export const GET = withStore(GET_handler, { memo: true });
