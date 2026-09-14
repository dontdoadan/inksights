import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { runCalculationEngineV2 } from "../../intelligence/calculation-engine-v2";

const bandSchema = z.object({
  low: z.number().min(0),
  base: z.number().min(0),
  high: z.number().min(0),
}).refine((value) => value.low <= value.base && value.base <= value.high, {
  message: "Scenario bands must satisfy low <= base <= high",
});

const qualityRate = z.number().min(0).max(1);
const evidenceSchema = z.object({
  source_reliability: qualityRate,
  completeness: qualityRate,
  confidence: qualityRate,
  sample_adequacy: qualityRate.optional(),
  freshness_score: qualityRate.optional(),
  age_days: z.number().min(0).optional(),
  freshness_half_life_days: z.number().positive().optional(),
}).refine(
  (value) => value.freshness_score !== undefined
    || (value.age_days !== undefined && value.freshness_half_life_days !== undefined),
  { message: "Evidence requires freshness_score or both age_days and freshness_half_life_days" },
);

export default defineTool({
  name: "run_calculation_engine_v2",
  title: "Run Calculation Engine V2",
  description:
    "Run the canonical INKSIGHTS V2 three-lever economic model. Returns low/base/high unconstrained and capacity-constrained revenue opportunity, optional contribution opportunity, evidence quality and explicit constraint warnings.",
  inputSchema: {
    revenue_pence: z.number().int().positive().describe("Observed revenue for the measurement period, in pence."),
    unique_customers: z.number().positive().describe("Observed unique customers in the same period."),
    transactions: z.number().positive().describe("Observed completed transactions in the same period."),
    contribution_margin_rate: qualityRate.optional().describe("Observed or evidence-backed contribution margin rate after incremental variable/direct costs, as a 0-1 decimal."),
    capacity_units: z.number().min(0).optional().describe("Available capacity in an explicit business unit such as hours or sessions."),
    booked_capacity_units: z.number().min(0).optional().describe("Currently booked capacity in the same unit as capacity_units."),
    capacity_units_per_transaction: z.number().positive().optional().describe("Explicit conversion from the capacity unit to one incremental transaction."),
    customer_uplift: bandSchema,
    atv_uplift: bandSchema,
    frequency_uplift: bandSchema,
    evidence: z.array(evidenceSchema).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input) => {
    const result = runCalculationEngineV2({
      baseline: {
        revenuePence: input.revenue_pence,
        uniqueCustomers: input.unique_customers,
        transactions: input.transactions,
        contributionMarginRate: input.contribution_margin_rate,
        capacityUnits: input.capacity_units,
        bookedCapacityUnits: input.booked_capacity_units,
        capacityUnitsPerTransaction: input.capacity_units_per_transaction,
      },
      scenario: {
        customers: input.customer_uplift,
        averageTransactionValue: input.atv_uplift,
        purchaseFrequency: input.frequency_uplift,
      },
      evidence: input.evidence?.map((item) => ({
        sourceReliability: item.source_reliability,
        completeness: item.completeness,
        confidence: item.confidence,
        sampleAdequacy: item.sample_adequacy,
        freshnessScore: item.freshness_score,
        ageDays: item.age_days,
        freshnessHalfLifeDays: item.freshness_half_life_days,
      })),
    });

    const basePounds = result.opportunity.constrainedRevenuePence.base / 100;
    const confidenceText = result.evidenceQualityScore === null
      ? "evidence quality not scored"
      : `evidence quality ${result.evidenceQualityScore}/100`;

    return {
      content: [{
        type: "text",
        text: `V2 base constrained revenue opportunity: £${basePounds.toLocaleString("en-GB", { maximumFractionDigits: 0 })}; ${confidenceText}.`,
      }],
      structuredContent: result,
    };
  },
});
