import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { calculateRevenueScenario } from "@/lib/revenue-scenario";

const inputSchema = z.object({
  submissionKey: z.string().uuid(),
  studioName: z.string().trim().min(2).max(150),
  studioWebsite: z.string().trim().max(240).optional().default(""),
  area: z.string().trim().max(100).optional().default(""),
  consent: z.literal(true),
  honeypot: z.string().max(100).optional().default(""),
  averageBookingValue: z.number().min(50).max(10000),
  extraBookingsPerWeek: z.number().int().min(0).max(100),
  availableExtraSlotsPerWeek: z.number().int().min(0).max(100),
  tradingWeeks: z.number().int().min(1).max(52),
  contributionMarginPct: z.number().min(0).max(100),
}).strict();

type Admin = {
  rpc: (name: string, args: Record<string, unknown>) => PromiseLike<{ data: boolean | null; error: { code?: string } | null }>;
  from: (table: string) => {
    insert: (value: Record<string, unknown>) => PromiseLike<{ error: { code?: string } | null }>;
    select: (cols: string) => { eq: (key: string, value: string) => { maybeSingle: () => PromiseLike<{ data: { result_snapshot?: unknown } | null; error: unknown }> } };
  };
};

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" },
});

export const Route = createFileRoute("/api/public/revenue-scenario")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // This is a public calculator. Only the minimal, non-sensitive input snapshot is stored.
        const origin = request.headers.get("origin");
        if (!origin || origin !== new URL(request.url).origin) return json({ error: "Invalid request origin." }, 403);
        const raw = await request.text();
        if (raw.length > 8192) return json({ error: "Request too large." }, 413);
        let value: unknown;
        try { value = JSON.parse(raw); } catch { return json({ error: "Invalid input." }, 400); }
        const parsed = inputSchema.safeParse(value);
        if (!parsed.success) return json({ error: "Check the required studio details and scenario figures." }, 400);
        const v = parsed.data;
        if (v.honeypot) return json({ ok: true }, 200);
        if (v.studioWebsite && (!/^https?:\/\//i.test(v.studioWebsite) || !URL.canParse(v.studioWebsite))) {
          return json({ error: "Use a valid full website URL or leave it empty." }, 400);
        }

        try {
          const { createHash } = await import("node:crypto");
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const db = supabaseAdmin as unknown as Admin;
          const ip = (request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
          const windowStart = new Date(Math.floor(Date.now() / 600000) * 600000).toISOString();
          const fingerprint = createHash("sha256").update(
            `revenue-scenario-v1:${ip}:${process.env["RATE_LIMIT_SALT"] || "inksights-scenario-v1"}`,
          ).digest("hex");
          const gate = await db.rpc("consume_public_endpoint_rate_limit", {
            p_endpoint: "revenue-scenario-v1",
            p_key_hash: fingerprint,
            p_window_started_at: windowStart,
            p_max_requests: 5,
          });
          if (gate.error || gate.data == null) return json({ error: "Submission service unavailable." }, 503);
          if (!gate.data) return json({ error: "Too many submissions. Please try again later." }, 429);

          const inputs = {
            averageBookingValue: v.averageBookingValue,
            extraBookingsPerWeek: v.extraBookingsPerWeek,
            tradingWeeks: v.tradingWeeks,
            availableExtraSlotsPerWeek: v.availableExtraSlotsPerWeek,
            contributionMarginPct: v.contributionMarginPct,
          };
          const result = calculateRevenueScenario(inputs);
          const normalized_inputs = {
            average_booking_value_gbp: inputs.averageBookingValue,
            extra_bookings_per_week: inputs.extraBookingsPerWeek,
            available_extra_slots_per_week: inputs.availableExtraSlotsPerWeek,
            trading_weeks: inputs.tradingWeeks,
            contribution_margin_pct: inputs.contributionMarginPct,
            inputs_are_unverified: true,
          };
          const { error } = await db.from("public_tool_submissions").insert({
            tool_key: "revenue_opportunity_scenario",
            tool_version: "1.0.0",
            studio_name: v.studioName,
            studio_website: v.studioWebsite || null,
            area: v.area || null,
            studio_id: null, // Never link a self-report to a canonical studio without verification.
            normalized_inputs,
            result_snapshot: result,
            submission_key: v.submissionKey,
            quality_status: "unverified_self_report",
            source_type: "public_self_report",
            consent_version: "scenario-save-2026-10-21-v1",
          });
          if (error?.code === "23505") {
            const saved = await db.from("public_tool_submissions")
              .select("result_snapshot").eq("submission_key", v.submissionKey).maybeSingle();
            if (!saved.error && saved.data) return json({ ok: true, submissionKey: v.submissionKey, result: saved.data.result_snapshot });
            return json({ error: "Duplicate submission could not be recovered." }, 409);
          }
          if (error) {
            console.error("Scenario save failed", error.code || "unknown");
            return json({ error: "Unable to save the scenario. No results have been released." }, 503);
          }
          return json({ ok: true, submissionKey: v.submissionKey, result });
        } catch (error) {
          console.error("Scenario service unavailable", error instanceof Error ? error.message : "unknown");
          return json({ error: "Scenario service temporarily unavailable." }, 503);
        }
      },
    },
  },
});
