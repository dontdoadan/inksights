import { auth, defineMcp } from "@lovable.dev/mcp-js";
import runGrowthCalculators from "./tools/run-growth-calculators";
import runCalculationEngineV2 from "./tools/run-calculation-engine-v2";
import listScenarios from "./tools/list-scenarios";
import saveScenario from "./tools/save-scenario";
import bookRevenueAudit from "./tools/book-revenue-audit";

// The OAuth issuer must be the direct Supabase host, not the .lovable.cloud proxy.
// VITE_SUPABASE_PROJECT_ID is inlined at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "inksight-mcp",
  title: "INKSIGHT",
  version: "0.2.0",
  instructions:
    "INKSIGHT tools for tattoo studio partners. Use `run_calculation_engine_v2` for the canonical versioned three-lever commercial model with capacity constraints and evidence quality. `run_growth_calculators` remains available for backwards-compatible legacy scenarios. Use `list_scenarios` / `save_scenario` for the signed-in studio's saved scenarios, and `book_revenue_audit` to submit a Revenue Audit request.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    runCalculationEngineV2,
    runGrowthCalculators,
    listScenarios,
    saveScenario,
    bookRevenueAudit,
  ],
});
