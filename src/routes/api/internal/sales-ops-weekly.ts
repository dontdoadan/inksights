import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Server-only, administrator-scoped read of Supabase's reconciled KPI view.
 * Never return operational identities, contact details, database credentials,
 * or unreconciled CRM amount forecasts through this endpoint.
 */
export const Route = createFileRoute("/api/internal/sales-ops-weekly")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) {
          return send({ error: "Cross-origin request denied." }, 403);
        }
        const authorization = request.headers.get("authorization") ?? "";
        const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
        if (!token || token.length > 8192) return send({ error: "Authentication required." }, 401);

        // getUser validates the token on Supabase Auth server; never use
        // unverified browser JWT claims or editable user_metadata for admin auth.
        const { data: session, error: sessionError } = await supabaseAdmin.auth.getUser(token);
        const uid = session.user?.id;
        if (sessionError || !uid) return send({ error: "Session invalid." }, 401);

        const { data: admin, error: adminError } = await supabaseAdmin
          .from("platform_admins")
          .select("user_id,role,active")
          .eq("user_id", uid)
          .eq("active", true)
          .maybeSingle();
        if (adminError || !admin || !["owner", "admin"].includes(admin.role)) {
          return send({ error: "Founder or administrator access required." }, 403);
        }

        const { data, error } = await supabaseAdmin
          .from("sales_weekly_scorecard_v1" as "website_events")
          .select("*")
          .order("week_start_uk", { ascending: false })
          .limit(12);
        if (error) {
          // Typically missing migration or schema drift. No raw database error
          // details or partially reconciled financial data escape to the client.
          console.error("sales-ops weekly scorecard unavailable", error.code);
          return send({ error: "Reconciled sales metrics are not ready." }, 503);
        }
        return send({
          metric_version: "sales-os/1.0",
          source: "server_verified_supabase",
          week_basis: "Europe/London; Monday start",
          coverage: "Verified, studio-linked Stripe orders only; excludes provisional/unlinked payments",
          weeks: data ?? [],
        }, 200);
      },
    },
  },
});

function send(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
