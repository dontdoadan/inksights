import { createClient } from "npm:@supabase/supabase-js@2.110.1";

/**
 * Authenticated claim of an anonymous INKSIGHTS public-tool result.
 * Caller proves possession of BOTH random IDs and active studio membership.
 * Does not elevate a self-report to verified commercial evidence.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
  "access-control-allow-methods": "POST, OPTIONS",
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};
function reply(status: number, result: unknown) {
  return new Response(JSON.stringify(result), { status, headers: HEADERS });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: HEADERS });
  if (request.method !== "POST") return reply(405, { error: "Method not allowed." });
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return reply(415, { error: "JSON required." });
  }
  const authorization = request.headers.get("authorization") ?? "";
  if (!/^Bearer\s+\S+$/i.test(authorization)) return reply(401, { error: "Sign in required." });

  let payload: unknown;
  try {
    if (Number(request.headers.get("content-length") ?? "0") > 2000) return reply(413, { error: "Request too large." });
    const raw = await request.text();
    if (raw.length > 2000) return reply(413, { error: "Request too large." });
    payload = JSON.parse(raw);
  } catch {
    return reply(400, { error: "Invalid JSON." });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return reply(422, { error: "Invalid request." });
  const record = payload as Record<string, unknown>;
  if (!UUID.test(String(record.studioId ?? "")) ||
      !UUID.test(String(record.submissionId ?? "")) ||
      !UUID.test(String(record.submissionKey ?? ""))) {
    return reply(422, { error: "Invalid submission reference." });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return reply(503, { error: "Studio linking unavailable." });

  try {
    const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    // This verifies the bearer token server-side; a browser-supplied user ID is ignored.
    const token = authorization.replace(/^Bearer\s+/i, "");
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (userError || !user) return reply(401, { error: "Session invalid or expired." });

    const { data, error } = await admin.rpc("claim_public_tool_submission_v1", {
      p_studio_id: record.studioId,
      p_user_id: user.id,
      p_submission_id: record.submissionId,
      p_submission_key: record.submissionKey,
    });
    if (error) {
      // Deliberately do not reveal another studio's linked result or submission metadata.
      console.warn("Studio tool claim rejected", error.code ?? "unknown");
      return reply(403, { error: "Unable to associate the submission. Check your studio access and submission receipt." });
    }
    return reply(200, { ok: true, claim: data });
  } catch (error) {
    console.error("Studio tool claim failed", error instanceof Error ? error.name : "unknown");
    return reply(503, { error: "Studio linking is temporarily unavailable." });
  }
});
