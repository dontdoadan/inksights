import { auth, defineMcp } from "@lovable.dev/mcp-js";
import runGrowthCalculators from "./tools/run-growth-calculators";
import listScenarios from "./tools/list-scenarios";
import saveScenario from "./tools/save-scenario";
import bookRevenueAudit from "./tools/book-revenue-audit";

// The OAuth issuer must be the direct Supabase host, not the .lovable.cloud proxy.
// VITE_SUPABASE_PROJECT_ID is inlined at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "inksight-mcp",
  title: "INKSIGHT",
  version: "0.1.0",
  instructions:
    "INKSIGHT tools for tattoo studio partners. Use `run_growth_calculators` to model extra studio revenue from aftercare uplift, `list_scenarios` / `save_scenario` to manage the signed-in studio's saved growth-model scenarios, and `book_revenue_audit` to submit a Revenue Audit request.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [runGrowthCalculators, listScenarios, saveScenario, bookRevenueAudit],
});
