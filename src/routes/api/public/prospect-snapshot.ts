import { createFileRoute } from "@tanstack/react-router";

const TOKEN_PATTERN = /^[0-9a-f]{64}$/i;

export const Route = createFileRoute("/api/public/prospect-snapshot")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token")?.trim() ?? "";
        if (!TOKEN_PATTERN.test(token)) return json({ ok: false, error: "Invalid snapshot link." }, 400);

        const tokenHash = await sha256(token);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("audit_runs")
          .select("audit_id,output_summary,completed_at")
          .eq("engine_key", "prospect_snapshot")
          .eq("status", "success")
          .eq("output_summary->>token_hash", tokenHash)
          .order("completed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const output = isRecord(data?.output_summary) ? data.output_summary : null;
        const snapshot = output?.["snapshot"];
        if (error || !snapshot) {
          return json({ ok: false, error: "Snapshot link is invalid, superseded or no longer available." }, 404);
        }

        return json({ ok: true, snapshot }, 200, {
          "cache-control": "private, no-store, max-age=0",
          "x-robots-tag": "noindex, nofollow",
        });
      },
    },
  },
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function json(body: unknown, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}
