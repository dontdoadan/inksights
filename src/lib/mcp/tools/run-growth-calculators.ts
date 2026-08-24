import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Pure calculators — same math as the Growth Model page.
// Formulas mirror src/routes/growth-model.tsx (studio and investor views).

export default defineTool({
  name: "run_growth_calculators",
  title: "Run growth-model calculators",
  description:
    "Compute INKSIGHT growth-model outputs from studio inputs. Returns annual sessions, extra retail revenue, ATV uplift, rebooking uplift, and the total extra annual studio revenue.",
  inputSchema: {
    studios: z.number().int().min(1).max(10000).default(1).describe("Number of studios."),
    artists_per_studio: z.number().int().min(1).max(200).default(4).describe("Artists per studio."),
    clients_per_artist_per_day: z.number().min(0).max(20).default(2),
    working_days_per_week: z.number().min(1).max(7).default(5),
    average_session_value_gbp: z.number().min(0).default(180).describe("Current average tattoo session value in GBP."),
    session_value_uplift_gbp: z.number().min(0).default(20).describe("Extra £ per session at the aftercare handoff."),
    current_retail_conversion_pct: z.number().min(0).max(100).default(5),
    target_retail_conversion_pct: z.number().min(0).max(100).default(35),
    retail_gp_per_unit_gbp: z.number().min(0).default(12).describe("Gross profit per aftercare unit sold."),
    current_rebooking_rate_pct: z.number().min(0).max(100).default(20),
    improved_rebooking_rate_pct: z.number().min(0).max(100).default(35),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input) => {
    const weeksPerYear = 52;
    const sessions =
      input.studios *
      input.artists_per_studio *
      input.clients_per_artist_per_day *
      input.working_days_per_week *
      weeksPerYear;

    const atvUpliftYr = sessions * input.session_value_uplift_gbp;
    const retailConvDelta =
      Math.max(0, input.target_retail_conversion_pct - input.current_retail_conversion_pct) / 100;
    const retailYr = sessions * retailConvDelta * input.retail_gp_per_unit_gbp;
    const rebookDelta =
      Math.max(0, input.improved_rebooking_rate_pct - input.current_rebooking_rate_pct) / 100;
    const rebookingYr = sessions * rebookDelta * input.average_session_value_gbp;

    const totalYr = atvUpliftYr + retailYr + rebookingYr;

    const results = {
      annual_sessions: Math.round(sessions),
      atv_uplift_per_year_gbp: Math.round(atvUpliftYr),
      retail_revenue_per_year_gbp: Math.round(retailYr),
      rebooking_revenue_per_year_gbp: Math.round(rebookingYr),
      total_extra_annual_revenue_gbp: Math.round(totalYr),
      extra_revenue_per_artist_per_month_gbp: Math.round(
        totalYr / (input.studios * input.artists_per_studio) / 12,
      ),
    };

    return {
      content: [
        { type: "text", text: `Modelled extra annual studio revenue: £${results.total_extra_annual_revenue_gbp.toLocaleString("en-GB")}` },
      ],
      structuredContent: results,
    };
  },
});
