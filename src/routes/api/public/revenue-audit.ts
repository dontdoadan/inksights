import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/revenue-audit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        const allowedOrigins = new Set([
          "https://getinksights.co.uk",
          "https://www.getinksights.co.uk",
        ]);

        if (origin && !allowedOrigins.has(origin)) {
          return json({ ok: false, error: "Origin not allowed." }, 403);
        }

        const contentType = request.headers.get("content-type") || "";
        if (!contentType.toLowerCase().includes("application/json")) {
          return json({ ok: false, error: "Content-Type must be application/json." }, 415);
        }

        const contentLength = Number(request.headers.get("content-length") || 0);
        if (contentLength > 20_000) {
          return json({ ok: false, error: "Request too large." }, 413);
        }

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json({ ok: false, error: "Invalid request." }, 400);
        }

        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
          return json({ ok: false, error: "Invalid request." }, 400);
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin.functions.invoke("revenue-audit-v1", {
            body: payload,
          });

          if (error) {
            console.error("Revenue Audit function invocation failed:", error);
            return json(
              { ok: false, error: "We could not generate the audit right now. Please try again." },
              503,
            );
          }

          if (!data || typeof data !== "object") {
            console.error("Revenue Audit function returned an invalid response.");
            return json(
              { ok: false, error: "We could not generate the audit right now. Please try again." },
              503,
            );
          }

          return json(data, 200);
        } catch (error) {
          console.error(
            "Revenue Audit proxy failed:",
            error instanceof Error ? error.message : String(error),
          );
          return json(
            { ok: false, error: "We could not generate the audit right now. Please try again." },
            503,
          );
        }
      },
    },
  },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
