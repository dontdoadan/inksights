import { auth, defineMcp } from "@lovable.dev/mcp-js";
import runGrowthCalculators from "./tools/run-growth-calculators";
import listScenarios from "./tools/list-scenarios";
import saveScenario from "./tools/save-scenario";
import bookRevenueAudit from "./tools/book-revenue-audit";
import searchKnowledge from "./tools/knowledge-search";
import checkExistingCapability from "./tools/capability-check";
import getInksightsContext from "./tools/get-inksights-context";
import captureKnowledgeCandidate from "./tools/capture-knowledge";

// The OAuth issuer must be the direct Supabase host, not the .lovable.cloud proxy.
// VITE_SUPABASE_PROJECT_ID is inlined at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "inksights-mcp",
  title: "INKSIGHTS",
  version: "0.2.0",
  instructions:
    "INKSIGHTS tools for studio partners and authorised internal operators. Founder/admin sessions should call get_inksights_context before substantial INKSIGHTS work and check_existing_capability before proposing new systems, features, workflows, integrations or automations. search_knowledge retrieves governed context without manual Project file uploads. capture_knowledge_candidate records learning only as PROPOSED/supporting knowledge; it never makes a chat statement canonical.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    runGrowthCalculators,
    listScenarios,
    saveScenario,
    bookRevenueAudit,
    searchKnowledge,
    checkExistingCapability,
    getInksightsContext,
    captureKnowledgeCandidate,
  ],
});
