/* eslint-disable @typescript-eslint/no-explicit-any -- service-role projection spans founder-only views not exposed to browser-generated types */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/internal/founder-snapshot")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const authHeader = request.headers.get("authorization") ?? "";
        if (!authHeader.startsWith("Bearer ")) {
          return json({ error: "Authentication required." }, 401);
        }

        const token = authHeader.slice("Bearer ".length).trim();
        if (!token || token.split(".").length !== 3) {
          return json({ error: "Invalid authentication token." }, 401);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const db = supabaseAdmin as any;

        const { data: auth, error: authError } = await supabaseAdmin.auth.getUser(token);
        const user = auth?.user;
        if (authError || !user) {
          return json({ error: "Authentication failed." }, 401);
        }

        const { data: admin, error: adminError } = await db
          .from("platform_admins")
          .select("role, active")
          .eq("user_id", user.id)
          .eq("active", true)
          .maybeSingle();

        if (adminError) {
          console.error("Founder admin lookup failed", adminError);
          return json({ error: "Admin access check failed." }, 500);
        }

        if (!admin) {
          return json({ error: "Founder access required." }, 403);
        }

        const [
          briefResult,
          canonicalStudiosResult,
          visibilityStudiosResult,
          auditCountResult,
          paidOrdersResult,
          latestAuditsResult,
        ] = await Promise.all([
          db.from("ops_current_founder_brief").select("*").limit(1).maybeSingle(),
          db.from("studios").select("id", { count: "exact", head: true }),
          db.from("visibility_studios").select("id", { count: "exact", head: true }),
          db.from("audits").select("id", { count: "exact", head: true }),
          db.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
          db
            .from("audits")
            .select("id, studio_id, status, qa_status, report_status, created_at")
            .order("created_at", { ascending: false })
            .limit(6),
        ]);

        const errors = [
          briefResult.error,
          canonicalStudiosResult.error,
          visibilityStudiosResult.error,
          auditCountResult.error,
          paidOrdersResult.error,
          latestAuditsResult.error,
        ].filter(Boolean);

        if (errors.length) {
          console.error("Founder snapshot query failed", errors);
          return json({ error: "Founder operating data is temporarily unavailable." }, 500);
        }

        const latestAudits = latestAuditsResult.data ?? [];
        const studioIds = [...new Set(latestAudits.map((row: any) => row.studio_id).filter(Boolean))];
        const studioNames = new Map<string, string>();

        if (studioIds.length) {
          const { data: studios, error: studioError } = await db
            .from("studios")
            .select("id, name")
            .in("id", studioIds);

          if (studioError) {
            console.error("Founder audit studio lookup failed", studioError);
          } else {
            for (const studio of studios ?? []) {
              studioNames.set(studio.id, studio.name ?? studio.id);
            }
          }
        }

        return json(
          {
            generated_at: new Date().toISOString(),
            admin_role: admin.role,
            brief: briefResult.data ?? null,
            counts: {
              studios: canonicalStudiosResult.count ?? 0,
              visibility_studios: visibilityStudiosResult.count ?? 0,
              audits: auditCountResult.count ?? 0,
              paid_orders: paidOrdersResult.count ?? 0,
            },
            latest_audits: latestAudits.map((row: any) => ({
              ...row,
              studio_name: studioNames.get(row.studio_id) ?? row.studio_id,
            })),
          },
          200,
          {
            "cache-control": "private, no-store, max-age=0",
            "x-content-type-options": "nosniff",
          },
        );
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
