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
        const db = supabaseAdmin as any;
        const { data, error } = await db
          .from("audit_runs")
          .select("audit_id,output_summary,completed_at")
          .eq("engine_key", "prospect_snapshot")
          .eq("status", "success")
          .eq("output_summary->>token_hash", tokenHash)
          .order("completed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !data?.output_summary?.snapshot) {
          return json({ ok: false, error: "Snapshot link is invalid, superseded or no longer available." }, 404);
        }

        return json({ ok: true, snapshot: data.output_summary.snapshot }, 200, {
          "cache-control": "private, no-store, max-age=0",
          "x-robots-tag": "noindex, nofollow",
        });
      },
    },
  },
});

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
