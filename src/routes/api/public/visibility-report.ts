import { createFileRoute } from "@tanstack/react-router";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PublicVisibilityReportRpc = {
  rpc: (
    fn: "publish_visibility_report",
    args: {
      p_report_id: string;
      p_public_token: string;
    },
  ) => PromiseLike<{
    data: unknown;
    error: { code?: string } | null;
  }>;
};

export const Route = createFileRoute("/api/public/visibility-report")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const reportId = url.searchParams.get("reportId")?.trim() ?? "";
        const token = url.searchParams.get("token")?.trim() ?? "";

        if (!UUID_PATTERN.test(reportId) || token.length < 16 || token.length > 256) {
          return json({ error: "Invalid report link." }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const visibilityReportRpc = supabaseAdmin as unknown as PublicVisibilityReportRpc;
        const { data, error } = await visibilityReportRpc.rpc("publish_visibility_report", {
          p_report_id: reportId,
          p_public_token: token,
        });

        if (error || !data) {
          console.warn("Public visibility report lookup rejected", {
            reportId,
            code: error?.code,
          });
          return json({ error: "Report link is invalid or has expired." }, 404);
        }

        return json(data, 200, {
          "cache-control": "private, no-store, max-age=0",
          "x-content-type-options": "nosniff",
        });
      },
    },
  },
});

function json(body: unknown, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}
