import { withStore } from "@/lib/db/withStore";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditHash } from "@/lib/db/store";
import type { AuditEvent } from "@/lib/db/types";
import { getMe, supabaseAdmin } from "@/lib/auth/server";

interface Row {
  id: string; organization_id: string; brand_id: string | null; user_id: string | null; entity_type: string; entity_id: string;
  action: string; metadata: Record<string, unknown> | null; hash: string | null; prev_hash: string | null; created_at: string;
}

const ENTITY_HREF: Record<string, (id: string) => string> = {
  submission: (id) => `/submissions/${id}`,
  claim: () => `/knowledge-base/claims`,
  member: () => `/team`,
};
const PAGE_MAX = 200;
const COLS = "id, organization_id, brand_id, user_id, entity_type, entity_id, action, metadata, hash, prev_hash, created_at";

/** Every audit_log row of one org, oldest first, paged past PostgREST's 1000-row cap. */
async function allRows(orgId: string): Promise<Row[]> {
  const out: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabaseAdmin().from("audit_log").select(COLS).eq("organization_id", orgId).order("created_at").order("id").range(from, from + 999);
    if (error) throw new Error(error.message);
    out.push(...((data ?? []) as Row[]));
    if (!data || data.length < 1000) return out;
  }
}

const sameJson = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a as object), kb = Object.keys(b as object);
  return ka.length === kb.length && ka.every((k) => sameJson((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
};

/**
 * Recomputes the chain over audit_log rows by following prev_hash links from the first sealed row.
 * jsonb reorders object keys and timestamptz reformats dates, so a row is hashed with the key order and
 * timestamp string of its twin in the org document when the two are semantically equal; otherwise the
 * row as stored. Rows without a hash (team events written straight to audit_log) are counted as unsealed.
 */
function verifyRows(rows: Row[], doc: Map<string, AuditEvent>) {
  const sealed = rows.filter((r) => r.hash);
  const unsealed = rows.length - sealed.length;
  const byPrev = new Map<string, Row>();
  let head: Row | null = null;
  for (const r of sealed) {
    if (!r.prev_hash) { if (!head) head = r; continue; }
    byPrev.set(r.prev_hash, r);
  }
  const broken = (r: Row, reason: string, checked: number) => ({ intact: false, checked, unsealed, brokenAt: { id: r.id, action: r.action, created_at: r.created_at, reason } });
  let checked = 0, prev: string | null = null;
  const visited = new Set<string>();
  for (let r = head; r && !visited.has(r.id); r = byPrev.get(prev!) ?? null) {
    visited.add(r.id);
    const twin = doc.get(r.id);
    const asEvent = { id: r.id, entity_id: r.entity_id, action: r.action, user_id: r.user_id ?? undefined, created_at: new Date(r.created_at).toISOString(), metadata: r.metadata ?? {} } as unknown as AuditEvent;
    const e = twin && twin.entity_id === r.entity_id && twin.action === r.action && Date.parse(twin.created_at) === Date.parse(r.created_at) && sameJson(twin.metadata ?? {}, r.metadata ?? {})
      ? { ...asEvent, user_id: twin.user_id, created_at: twin.created_at, metadata: twin.metadata }
      : asEvent;
    if (auditHash(e, prev) !== r.hash) return broken(r, "Event body was changed after it was sealed", checked);
    prev = r.hash;
    checked++;
  }
  if (checked < sealed.length) {
    const orphan = sealed.find((r) => !visited.has(r.id))!;
    return broken(orphan, "prev_hash does not link to the previous sealed event", checked);
  }
  return { intact: true, checked, unsealed };
}

function csv(rows: (string | null)[][]): string {
  return rows.map((r) => r.map((c) => {
    const s = c ?? "";
    // Leading =,+,-,@ would run as a formula in Excel.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  }).join(",")).join("\r\n");
}

/**
 * GET /api/audit — the caller's org audit_log (append-only table), newest first.
 * Filters: user, action, entity, from, to (ISO dates). page (1-based), pageSize. ?verify=1 recomputes the chain. ?format=csv exports the filtered set.
 */
async function GET_handler(req: NextRequest) {
  try {
    const me = await getMe();
    if (!me) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });
    const sp = req.nextUrl.searchParams;
    const rows = await allRows(me.organizationId);

    if (sp.get("verify") === "1") {
      const doc = new Map(db.getState().audit_events.map((e) => [e.id, e]));
      return NextResponse.json({ success: true, verification: verifyRows(rows, doc), verifiedAt: new Date().toISOString() });
    }

    const { data: profiles } = await supabaseAdmin().from("profiles").select("id, full_name, email, role").eq("organization_id", me.organizationId);
    const users = new Map((profiles ?? []).map((p) => [p.id as string, p]));
    const user = sp.get("user"), action = sp.get("action"), entity = sp.get("entity");
    const from = sp.get("from") ? Date.parse(sp.get("from")!) : NaN;
    // A bare date for "to" means the whole of that day.
    const toRaw = sp.get("to");
    const to = toRaw ? Date.parse(toRaw) + (/^\d{4}-\d{2}-\d{2}$/.test(toRaw) ? 86_400_000 - 1 : 0) : NaN;
    const list = rows.filter((r) => {
      const t = Date.parse(r.created_at);
      return (!user || r.user_id === user) && (!action || r.action === action) && (!entity || r.entity_type === entity)
        && (isNaN(from) || t >= from) && (isNaN(to) || t <= to);
    }).reverse();

    const shape = (e: Row) => {
      const u = e.user_id ? users.get(e.user_id) : undefined;
      const m = (e.metadata ?? {}) as Record<string, string | undefined>;
      const subId = e.entity_type === "submission" ? e.entity_id : m.submissionId || m.submission_id;
      return {
        id: e.id,
        action: e.action,
        userId: e.user_id,
        actor: u?.full_name || u?.email || m.reviewerName || m.actorName || (e.user_id ? "Former member" : "System"),
        role: (u?.role as string) || m.reviewerRole || m.role || null,
        entityType: e.entity_type,
        entityId: e.entity_id,
        href: subId ? `/submissions/${subId}` : ENTITY_HREF[e.entity_type]?.(e.entity_id) ?? null,
        reason: m.reason || m.notes || m.dismissalReason || m.overrideMemo || null,
        time: new Date(e.created_at).toISOString(),
        hash: e.hash,
        prevHash: e.prev_hash,
      };
    };

    if (sp.get("format") === "csv") {
      const body = csv([["time", "actor", "user_id", "role", "action", "entity_type", "entity_id", "reason", "hash", "prev_hash"],
        ...list.map(shape).map((e) => [e.time, e.actor, e.userId, e.role, e.action, e.entityType, e.entityId, e.reason, e.hash, e.prevHash])]);
      return new NextResponse("﻿" + body, {
        headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" },
      });
    }

    const pageSize = Math.min(PAGE_MAX, Math.max(1, Number(sp.get("pageSize")) || 50));
    const page = Math.max(1, Number(sp.get("page")) || 1);
    const seenUsers = [...new Set(rows.map((r) => r.user_id).filter(Boolean) as string[])];
    return NextResponse.json({
      success: true,
      total: list.length,
      page,
      pageSize,
      events: list.slice((page - 1) * pageSize, page * pageSize).map(shape),
      facets: {
        users: seenUsers.map((id) => ({ id, name: users.get(id)?.full_name || users.get(id)?.email || "Former member" })).sort((a, b) => a.name.localeCompare(b.name)),
        actions: [...new Set(rows.map((r) => r.action))].sort(),
        entities: [...new Set(rows.map((r) => r.entity_type))].sort(),
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

export const GET = withStore(GET_handler);
