import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const ORIGIN_RE = /^(getinksights\.co\.uk|www\.getinksights\.co\.uk|inksight-main(?:-[a-z0-9-]+)?\.vercel\.app|localhost)$/i;
function allowed(origin: string | null) {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    return ORIGIN_RE.test(u.hostname) &&
      (u.protocol === "https:" || (u.protocol === "http:" && u.hostname === "localhost"));
  } catch { return false; }
}
function cors(origin: string | null) {
  return {
    "Content-Type": "application/json", "Cache-Control": "no-store, private", "Vary": "Origin",
    "Access-Control-Allow-Origin": allowed(origin) ? origin! : "https://getinksights.co.uk",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "apikey, authorization, content-type, x-client-info",
  };
}
function reply(origin: string | null, code: number, data: unknown) {
  return new Response(JSON.stringify(data), { status: code, headers: cors(origin) });
}
function serviceKey(): string {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    const keys = JSON.parse(raw) as Record<string, string>;
    const key = keys.default ?? Object.values(keys)[0];
    if (key) return key;
  }
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!legacy) throw new Error("Service credentials unavailable");
  return legacy;
}
async function db(path: string, init: RequestInit = {}) {
  const key = serviceKey();
  const response = await fetch(Deno.env.get("SUPABASE_URL") + "/rest/v1/" + path, {
    ...init,
    headers: {
      apikey: key, ...(key.startsWith("sb_secret_") ? {} : { Authorization: "Bearer " + key }),
      "Content-Type": "application/json", ...(init.headers || {}),
    },
  });
  const raw = await response.text();
  if (!response.ok) throw new Error("Database response " + response.status);
  return raw ? JSON.parse(raw) : null;
}
async function reviewer(req: Request): Promise<{ id: string } | null> {
  const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return null;
  const r = await fetch(Deno.env.get("SUPABASE_URL") + "/auth/v1/user", {
    headers: { apikey: serviceKey(), Authorization: "Bearer " + token },
  });
  if (!r.ok) return null;
  const u = await r.json();
  if (!UUID.test(u?.id || "")) return null;
  const admins = await db("platform_admins?select=role,active&user_id=eq." +
    encodeURIComponent(u.id) + "&active=eq.true&limit=1");
  if (!Array.isArray(admins) || !admins[0] || !["owner", "admin"].includes(admins[0].role)) return null;
  return { id: u.id };
}
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return reply(origin, 405, { ok: false, error: "Method not allowed" });
  if (!allowed(origin)) return reply(origin, 403, { ok: false, error: "Origin not permitted" });
  if (Number(req.headers.get("content-length") || "0") > 12000)
    return reply(origin, 413, { ok: false, error: "Request too large" });
  try {
    const user = await reviewer(req);
    if (!user) return reply(origin, 403, { ok: false, error: "Administrator access required" });
    const body = await req.json() as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";
    if (action === "summary") {
      const [cases, sources] = await Promise.all([
        db("studio_reconciliation_cases?select=review_status,signal_strength,visibility_rule,quality_flags&limit=1000"),
        db("studio_sources?select=source_key,source_name,source_type,permitted_for_commercial_use&active=eq.true"),
      ]);
      const records = Array.isArray(cases) ? cases : [];
      const tally = { unreviewed: 0, needs_evidence: 0, approved: 0, rejected: 0 };
      for (const item of records) {
        if (Object.prototype.hasOwnProperty.call(tally, item.review_status)) {
          tally[item.review_status as keyof typeof tally]++;
        }
      }
      return reply(origin, 200, {
        ok: true,
        stats: {
          queued: records.length, ...tally,
          with_suggestion: records.filter(x => x.visibility_rule !== "no_supported_match").length,
          registry_only: records.filter(x => (x.quality_flags || []).includes("registry_is_not_trading_premises")).length,
          rule_version: "studio-reconcile-v1",
        },
        source_registry: sources,
      });
    }
    if (action === "list") {
      const statuses = ["unreviewed", "needs_evidence", "approved", "rejected", "all"];
      const status = statuses.includes(String(body.status)) ? String(body.status) : "unreviewed";
      const offset = typeof body.offset === "number" && Number.isSafeInteger(body.offset) ? body.offset : 0;
      if (offset < 0 || offset > 100000) return reply(origin, 400, { ok: false, error: "Invalid offset" });
      const clause = status !== "all" ? "&review_status=eq." + status : "";
      const rows = await db(
        "studio_reconciliation_cases?select=candidate_id,review_status,visibility_rule,audit_rule,signal_strength," +
        "quality_flags,alternative_visibility_matches,suggested_visibility_id,suggested_audit_id,refreshed_at," +
        "studio_candidates!inner(name,postcode,town,website_url,companies_house_number,source_url,source_id,observed_at)" +
        clause + "&order=signal_strength.desc,candidate_id.asc&limit=50&offset=" + offset
      );
      return reply(origin, 200, {
        ok: true, cases: rows, next_offset: Array.isArray(rows) && rows.length === 50 ? offset + 50 : null,
      });
    }
    if (action === "refresh") {
      const result = await db("rpc/studio_reconciliation_refresh", {
        method: "POST", body: JSON.stringify({ p_reviewer_id: user.id }),
      });
      return reply(origin, 200, { ok: true, result });
    }
    if (action === "review") {
      const candidate = typeof body.candidate_id === "string" ? body.candidate_id : "";
      const decision = typeof body.decision === "string" ? body.decision : "";
      const reason = typeof body.reason === "string" ? body.reason.trim() : "";
      const evidence = typeof body.evidence_url === "string" ? body.evidence_url.trim() : "";
      const visibility = typeof body.visibility_studio_id === "string" ? body.visibility_studio_id : "";
      const audit = typeof body.audit_studio_id === "string" ? body.audit_studio_id : "";
      if (!UUID.test(candidate) ||
          !["approve_visibility_match", "reject_suggestion", "needs_evidence", "reopen"].includes(decision) ||
          reason.length < 40 || reason.length > 2000 ||
          (visibility && !UUID.test(visibility)) || (audit && !UUID.test(audit))) {
        return reply(origin, 400, { ok: false, error: "Invalid decision, identifiers or review note" });
      }
      if (decision === "approve_visibility_match" &&
          (!UUID.test(visibility) || !/^https:\/\/\S+$/.test(evidence))) {
        return reply(origin, 400, { ok: false, error: "Approval needs a target and independent HTTPS evidence" });
      }
      const result = await db("rpc/studio_reconciliation_record_review", {
        method: "POST", body: JSON.stringify({
          p_reviewer_id: user.id, p_candidate_id: candidate, p_action: decision,
          p_visibility_id: visibility || null, p_audit_id: audit || null,
          p_reason: reason, p_evidence_url: evidence || null,
        }),
      });
      return reply(origin, 200, { ok: true, result });
    }
    return reply(origin, 400, { ok: false, error: "Unsupported action" });
  } catch (error) {
    console.error("Studio reconciliation API failed",
      error instanceof Error ? error.message : String(error));
    return reply(origin, 500, { ok: false, error: "Reconciliation request could not be completed" });
  }
});
