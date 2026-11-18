import { NextRequest, NextResponse } from "next/server";
import { withStore } from "@/lib/db/withStore";
import { db } from "@/lib/db";
import { getMe, supabaseAdmin } from "@/lib/auth/server";

type SearchGroup = "Reviews" | "Claims" | "Guidelines" | "Terminology" | "Brands" | "Members";
interface SearchHit { id: string; group: SearchGroup; title: string; subtitle?: string; href: string; score: number }

const MAX = 20;
const str = (x: unknown) => (typeof x === "string" ? x : x == null ? "" : String(x));

/** 100 exact, 80 prefix, 60 word-start, 40 substring in the title; 15 if only the body matches. 0 = no match. */
function score(q: string, title: string, body = ""): number {
  const t = title.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(t)) return 60;
  if (t.includes(q)) return 40;
  return body.toLowerCase().includes(q) ? 15 : 0;
}

const snippet = (s: string, n = 90) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

/** GET /api/search?q= -> { results } across the caller's organisation document plus its members. */
async function GET_handler(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 100);
  if (q.length < 2) return NextResponse.json({ success: true, results: [] });
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });

  try {
    const st = db.getState() as ReturnType<typeof db.getState> & { kb_items?: { id: string; kind: string; data: Record<string, unknown> }[] };
    const hits: SearchHit[] = [];
    const add = (h: Omit<SearchHit, "score">, s: number) => { if (s > 0) hits.push({ ...h, score: s }); };

    for (const s of st.submissions ?? []) {
      add({ id: s.id, group: "Reviews", title: s.title || "Untitled review", subtitle: snippet(s.raw_content ?? ""), href: `/submissions/${s.id}` }, score(q, s.title ?? "", s.raw_content ?? ""));
    }
    for (const c of st.approved_claims ?? []) {
      add({ id: c.id, group: "Claims", title: c.claim_text, subtitle: c.claim_code, href: `/knowledge-base/claims?claim=${encodeURIComponent(c.id)}` }, Math.max(score(q, c.claim_text ?? ""), score(q, c.claim_code ?? "")));
    }
    for (const g of st.brand_guidelines ?? []) {
      add({ id: g.id, group: "Guidelines", title: g.title, subtitle: snippet(g.rule_content ?? ""), href: "/knowledge-base/guidelines" }, score(q, g.title ?? "", `${g.rule_content ?? ""} ${g.description ?? ""}`));
    }
    for (const t of st.brand_terms ?? []) {
      add({ id: t.id, group: "Terminology", title: t.term, subtitle: snippet(t.rationale ?? ""), href: "/knowledge-base/terminology" }, score(q, t.term ?? "", t.rationale ?? ""));
    }
    // Records saved from the library pages live in kb_items rather than the typed tables.
    for (const k of st.kb_items ?? []) {
      const d = k.data ?? {};
      if (k.kind === "guideline") add({ id: k.id, group: "Guidelines", title: str(d.title) || str(d.name) || "Guideline", subtitle: snippet(str(d.rule ?? d.description ?? d.content)), href: "/knowledge-base/guidelines" }, score(q, str(d.title ?? d.name), str(d.rule ?? d.description ?? d.content)));
      else if (k.kind === "term") add({ id: k.id, group: "Terminology", title: str(d.term) || "Term", subtitle: snippet(str(d.rationale ?? d.reason ?? d.replacement)), href: "/knowledge-base/terminology" }, score(q, str(d.term), str(d.rationale ?? d.reason)));
      else if (k.kind === "claim") add({ id: k.id, group: "Claims", title: str(d.text ?? d.claim_text) || "Claim", subtitle: str(d.code ?? d.claim_code), href: "/knowledge-base/claims" }, Math.max(score(q, str(d.text ?? d.claim_text)), score(q, str(d.code ?? d.claim_code))));
    }
    for (const b of st.brands ?? []) {
      add({ id: b.id, group: "Brands", title: b.name, subtitle: b.industry ?? undefined, href: "/brands" }, score(q, b.name ?? "", b.description ?? ""));
    }

    const { data: members } = await supabaseAdmin().from("profiles").select("id, full_name, email, job_title").eq("organization_id", me.organizationId);
    for (const m of members ?? []) {
      const name = str(m.full_name) || str(m.email);
      add({ id: m.id, group: "Members", title: name, subtitle: str(m.job_title) || undefined, href: "/team" }, Math.max(score(q, name), me.role === "admin" ? score(q, str(m.email)) : 0));
    }

    // Dedupe by group+title (built-in vs saved copies), keep best score.
    const best = new Map<string, SearchHit>();
    for (const h of hits) {
      const k = `${h.group}|${h.title.toLowerCase()}`;
      if (!best.has(k) || best.get(k)!.score < h.score) best.set(k, h);
    }
    const results = [...best.values()].sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, MAX);
    return NextResponse.json({ success: true, results });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

export const GET = withStore(GET_handler, { memo: true, name: "search", limit: [0, 1200] });
