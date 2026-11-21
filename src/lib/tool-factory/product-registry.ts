export type ToolProductStatus = "planned" | "beta" | "active" | "retired";

export interface ToolProductDefinition {
  key: string;
  name: string;
  description: string;
  version: string;
  status: ToolProductStatus;
  capabilities: readonly string[];
  requiresHumanApproval: readonly string[];
}

/**
 * Product registry is deliberately code-owned in the first release.
 * Entitlements and workspace activation will be resolved server-side
 * from verified billing state in a later platform workstream.
 */
export const TOOL_PRODUCTS = {
  revenueRecovery: {
    key: "revenue_recovery",
    name: "Studio Revenue Recovery",
    description:
      "Find evidence-backed revenue recovery opportunities in studio booking and client data.",
    version: "0.1.0",
    status: "beta",
    capabilities: [
      "csv_import",
      "deterministic_analysis",
      "opportunity_prioritisation",
      "ai_action_drafts",
      "outcome_tracking",
    ],
    requiresHumanApproval: [
      "external_communication",
      "booking_change",
      "payment_action",
      "customer_record_change",
    ],
  },
} as const satisfies Record<string, ToolProductDefinition>;

export function getToolProduct(
  productKey: string,
): ToolProductDefinition | undefined {
  return Object.values(TOOL_PRODUCTS).find(
    (product) => product.key === productKey,
  );
}
