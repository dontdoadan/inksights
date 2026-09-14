import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { calculateGrowthScenario } from "@/lib/intelligence/growth-engine";

export default defineTool({
  name: "run_growth_calculators",
  title: "Run INKSIGHTS growth scenario",
  description:
    "Model the three canonical growth levers — customers, purchase frequency and average transaction value — with conversion, capacity, cancellation, no-show and margin constraints.",
  inputSchema: {
    customers: z.number().min(0).optional(),
    annual_leads: z.number().min(0).optional(),
    lead_to_customer_conversion_rate: z.number().min(0).max(1).optional(),
    purchase_frequency: z.number().min(0),
    average_transaction_value_gbp: z.number().min(0),
    annual_capacity_transactions: z.number().min(0).optional(),
    cancellation_rate: z.number().min(0).max(1).default(0),
    no_show_rate: z.number().min(0).max(1).default(0),
    gross_margin_rate: z.number().min(0).max(1).default(1),
    customer_growth_pct: z.number().min(0).default(0),
    frequency_growth_pct: z.number().min(0).default(0),
    atv_growth_pct: z.number().min(0).default(0),
  },
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  handler: async (input) => {
    const result = calculateGrowthScenario({
      customers: input.customers,
      annualLeads: input.annual_leads,
      leadToCustomerConversionRate: input.lead_to_customer_conversion_rate,
      purchaseFrequency: input.purchase_frequency,
      averageTransactionValue: input.average_transaction_value_gbp,
      annualCapacityTransactions: input.annual_capacity_transactions,
      cancellationRate: input.cancellation_rate,
      noShowRate: input.no_show_rate,
      grossMarginRate: input.gross_margin_rate,
      customerGrowthPct: input.customer_growth_pct,
      frequencyGrowthPct: input.frequency_growth_pct,
      atvGrowthPct: input.atv_growth_pct,
    });

    return {
      content: [
        {
          type: "text",
          text: `Modelled annual revenue uplift: £${Math.round(
            result.combinedRevenueUplift,
          ).toLocaleString("en-GB")}`,
        },
      ],
      structuredContent: result,
    };
  },
});
