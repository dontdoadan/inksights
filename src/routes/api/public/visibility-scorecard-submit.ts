import { createFileRoute } from "@tanstack/react-router";

const MAX_BODY_BYTES = 12_000;

// Same-origin proxy allows protected Vercel previews to use the existing
// Supabase submission function without whitelisting each preview domain.
// No secret or service-role credential is included in this route's response.
export const Route = createFileRoute("/api/public/visibility-scorecard-submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) {
          return json({ error: "Cross-origin submissions are not accepted." }, 403);
        }
        if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
          return json({ error: "JSON is required." }, 415);
        }
        if (Number(request.headers.get("content-length") ?? "0") > MAX_BODY_BYTES) {
          return json({ error: "Submission is too large." }, 413);
        }

        const raw = await request.text();
        if (raw.length > MAX_BODY_BYTES) return json({ error: "Submission is too large." }, 413);
        let input: Record<string, unknown>;
        try {
          const parsed: unknown = JSON.parse(raw);
          if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
            return json({ error: "Invalid input." }, 422);
          }
          input = parsed as Record<string, unknown>;
        } catch {
          return json({ error: "Invalid JSON." }, 400);
        }

        if (input.dataNoticeAccepted !== true || input.consentVersion !== "2026-10-tool-v1") {
          return json({ error: "Data use acknowledgement is required." }, 422);
        }

        const baseUrl = process.env["SUPABASE_URL"];
        const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!baseUrl || !publishableKey) {
          console.error("Visibility scorecard submission proxy: Supabase public configuration is missing.");
          return json({ error: "This service is temporarily unavailable." }, 503);
        }

        try {
          const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/functions/v1/public-visibility-scorecard-submit`, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "apikey": publishableKey,
            },
            body: JSON.stringify(input),
            signal: AbortSignal.timeout(12_000),
          });
          const responseText = await upstream.text();
          let response: { error?: string; result?: unknown; submissionId?: unknown };
          try {
            response = JSON.parse(responseText) as typeof response;
          } catch {
            throw new Error("The upstream service returned invalid JSON.");
          }

          if (!upstream.ok) {
            const status = upstream.status >= 400 && upstream.status < 500 ? upstream.status : 503;
            return json({ error: typeof response.error === "string" ? response.error : "Unable to save submission. Please retry." }, status);
          }
          if (typeof response.submissionId !== "string" || !response.result) {
            throw new Error("The upstream service did not confirm a saved result.");
          }
          return json({ submissionId: response.submissionId, result: response.result }, 200);
        } catch (error) {
          console.error("Visibility scorecard submission proxy failed", error instanceof Error ? error.name : "unknown");
          return json({ error: "Unable to save submission. Please retry." }, 503);
        }
      },
    },
  },
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
