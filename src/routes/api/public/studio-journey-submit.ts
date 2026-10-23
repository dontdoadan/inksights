import { createFileRoute } from "@tanstack/react-router";

const MAX_BYTES = 12_000;
const UPSTREAM_TIMEOUT_MS = 12_000;
const ACTIONS = new Set(["start","profile","submit","claim","mine","revoke"]);

// No service-role secret is used or returned by this route. Supabase Edge Function
// owns validation and SQL writes. This proxy is same-origin even on protected previews.
export const Route = createFileRoute("/api/public/studio-journey-submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) {
          return json(403, { error: "Cross-origin submissions are not permitted." });
        }
        if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
          return json(415, { error: "JSON required." });
        }
        if (Number(request.headers.get("content-length") || 0) > MAX_BYTES) {
          return json(413, { error: "Request too large." });
        }
        const raw = await request.text();
        if (new TextEncoder().encode(raw).byteLength > MAX_BYTES) {
          return json(413, { error: "Request too large." });
        }
        let action: unknown;
        try {
          const body: unknown = JSON.parse(raw);
          if (!body || typeof body !== "object" || Array.isArray(body)) {
            return json(400, { error: "Invalid request body." });
          }
          action = (body as Record<string, unknown>).action;
        } catch {
          return json(400, { error: "Invalid JSON." });
        }
        if (!ACTIONS.has(String(action))) return json(422, { error: "Invalid action." });

        const url = process.env["SUPABASE_URL"];
        const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !publishableKey) {
          console.error("Studio journey proxy is missing its public Supabase configuration.");
          return json(503, { error: "Assessment is temporarily unavailable." });
        }
        const auth = request.headers.get("authorization");
        const authorizationHeaders: Record<string,string> = {};
        // Never forward a server secret: permit only end-user Bearer JWTs on claim/mine.
        if ((action === "claim" || action === "mine") && auth && /^Bearer [A-Za-z0-9._-]{50,4096}$/.test(auth)) {
          authorizationHeaders["authorization"] = auth;
        }
        try {
          const upstream = await fetch(url.replace(/\/$/, "") + "/functions/v1/public-studio-journey", {
            method: "POST",
            headers: {
              "apikey": publishableKey,
              "content-type": "application/json",
              ...authorizationHeaders,
            },
            body: raw,
            signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
          });
          const upstreamText = await upstream.text();
          let response: unknown;
          try { response = JSON.parse(upstreamText); } catch {
            throw new Error("Invalid response from assessment service.");
          }
          if (!response || typeof response !== "object" || Array.isArray(response)) {
            throw new Error("Unexpected assessment response.");
          }
          const content = response as Record<string, unknown>;
          if (!upstream.ok) {
            return json(upstream.status >= 400 && upstream.status < 500 ? upstream.status : 503, {
              error: typeof content.error === "string" ? content.error : "Assessment request failed.",
            });
          }
          // No result may be displayed on submit without a server-acknowledged record.
          if (action === "submit" && (typeof content.submissionId !== "string" || !content.result || content.source !== "DURABLY_SAVED")) {
            throw new Error("The submission was not confirmed as saved.");
          }
          if (action === "start" && typeof content.sessionToken !== "string") {
            throw new Error("The session was not confirmed as created.");
          }
          return json(200, response);
        } catch (error) {
          console.error("studio journey proxy", error instanceof Error ? error.name : "error");
          return json(503, { error: "The assessment could not be saved. Please retry." });
        }
      },
    },
  },
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    },
  });
}
