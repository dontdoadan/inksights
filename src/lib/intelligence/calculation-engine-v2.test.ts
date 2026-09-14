import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateFreshnessScore,
  runCalculationEngineV2,
} from "./calculation-engine-v2.ts";

function band(low: number, base: number, high: number) {
  return { low, base, high };
}

test("calculates an exact three-lever baseline identity", () => {
  const result = runCalculationEngineV2({
    baseline: {
      revenuePence: 7_500_000,
      uniqueCustomers: 100,
      transactions: 150,
    },
    scenario: {
      customers: band(0, 0, 0),
      averageTransactionValue: band(0, 0, 0),
      purchaseFrequency: band(0, 0, 0),
    },
  });

  assert.equal(result.baseline.purchaseFrequency, 1.5);
  assert.equal(result.baseline.averageTransactionValuePence, 50_000);
  assert.equal(result.baseline.modelledRevenuePence, 7_500_000);
  assert.equal(result.baseline.reconciliationVariancePence, 0);
});

test("compounds 10% improvements across all three revenue levers to 33.1%", () => {
  const result = runCalculationEngineV2({
    baseline: {
      revenuePence: 5_000_000,
      uniqueCustomers: 100,
      transactions: 100,
    },
    scenario: {
      customers: band(0.1, 0.1, 0.1),
      averageTransactionValue: band(0.1, 0.1, 0.1),
      purchaseFrequency: band(0.1, 0.1, 0.1),
    },
  });

  assert.equal(result.opportunity.unconstrainedRevenuePence.base, 1_655_000);
  assert.equal(result.opportunity.unconstrainedRevenueGrowthRate.base, 0.331);
  assert.equal(result.opportunity.constrainedRevenuePence.base, 1_655_000);
});

test("capacity constrains transaction growth but does not suppress ATV uplift", () => {
  const result = runCalculationEngineV2({
    baseline: {
      revenuePence: 5_000_000,
      uniqueCustomers: 100,
      transactions: 100,
      capacityUnits: 110,
      bookedCapacityUnits: 100,
      capacityUnitsPerTransaction: 1,
    },
    scenario: {
      customers: band(0.1, 0.1, 0.1),
      averageTransactionValue: band(0.1, 0.1, 0.1),
      purchaseFrequency: band(0.1, 0.1, 0.1),
    },
  });

  assert.equal(result.constraints.capacityHeadroomUnits, 10);
  assert.equal(result.opportunity.requestedIncrementalTransactions.base, 21);
  assert.equal(result.opportunity.constrainedIncrementalTransactions.base, 10);
  assert.equal(result.opportunity.constrainedRevenuePence.base, 1_050_000);
  assert.ok(result.opportunity.capacityScaleFactor.base < 0.48);
});

test("keeps evidence quality separate from economic opportunity value", () => {
  const baseInput = {
    baseline: { revenuePence: 5_000_000, uniqueCustomers: 100, transactions: 100 },
    scenario: {
      customers: band(0, 0.1, 0.2),
      averageTransactionValue: band(0, 0, 0),
      purchaseFrequency: band(0, 0, 0),
    },
  };
  const high = runCalculationEngineV2({
    ...baseInput,
    evidence: [{ sourceReliability: 1, completeness: 1, confidence: 1, sampleAdequacy: 1, freshnessScore: 1 }],
  });
  const low = runCalculationEngineV2({
    ...baseInput,
    evidence: [{ sourceReliability: 0.4, completeness: 0.4, confidence: 0.4, sampleAdequacy: 0.4, freshnessScore: 0.4 }],
  });

  assert.equal(high.opportunity.constrainedRevenuePence.base, low.opportunity.constrainedRevenuePence.base);
  assert.equal(high.evidenceQualityScore, 100);
  assert.equal(low.evidenceQualityScore, 40);
});

test("freshness score halves at the configured evidence half-life", () => {
  const score = calculateFreshnessScore(30, 30);
  assert.ok(Math.abs(score - 0.5) < 1e-12);
});

test("returns contribution opportunity only when gross margin evidence is supplied", () => {
  const result = runCalculationEngineV2({
    baseline: {
      revenuePence: 5_000_000,
      uniqueCustomers: 100,
      transactions: 100,
      grossMarginRate: 0.6,
    },
    scenario: {
      customers: band(0, 0.1, 0.1),
      averageTransactionValue: band(0, 0, 0),
      purchaseFrequency: band(0, 0, 0),
    },
  });

  assert.equal(result.opportunity.constrainedRevenuePence.base, 500_000);
  assert.equal(result.opportunity.constrainedContributionPence?.base, 300_000);
});

test("rejects non-monotonic scenario bands", () => {
  assert.throws(() => runCalculationEngineV2({
    baseline: { revenuePence: 5_000_000, uniqueCustomers: 100, transactions: 100 },
    scenario: {
      customers: band(0.2, 0.1, 0.3),
      averageTransactionValue: band(0, 0, 0),
      purchaseFrequency: band(0, 0, 0),
    },
  }), /low <= base <= high/);
});
