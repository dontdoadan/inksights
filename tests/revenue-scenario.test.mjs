import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateRevenueScenario } from "../src/lib/revenue-scenario.ts";

test("one extra £400 booking for 46 weeks models £18,400 gross uplift", () => {
  const result = calculateRevenueScenario({
    averageBookingValue: 400,
    extraBookingsPerWeek: 1,
    availableExtraSlotsPerWeek: 1,
    tradingWeeks: 46,
    contributionMarginPct: 70,
  });
  assert.equal(result.grossCapacityAdjustedGbp, 18400);
  assert.equal(result.additionalBookingsPerYear, 46);
  assert.equal(result.estimatedContributionGbp, 12880);
  assert.equal(result.classification, "modelled");
});

test("capacity caps the opportunity rather than implying impossible sales", () => {
  const result = calculateRevenueScenario({
    averageBookingValue: 400,
    extraBookingsPerWeek: 5,
    availableExtraSlotsPerWeek: 2,
    tradingWeeks: 46,
    contributionMarginPct: 50,
  });
  assert.equal(result.grossUnconstrainedGbp, 92000);
  assert.equal(result.grossCapacityAdjustedGbp, 36800);
  assert.equal(result.capacityLimited, true);
});

test("rejects negative or unreasonably large inputs", () => {
  assert.throws(() => calculateRevenueScenario({
    averageBookingValue: -1,
    extraBookingsPerWeek: 1,
    availableExtraSlotsPerWeek: 1,
    tradingWeeks: 46,
    contributionMarginPct: 70,
  }));
  assert.throws(() => calculateRevenueScenario({
    averageBookingValue: 400,
    extraBookingsPerWeek: 101,
    availableExtraSlotsPerWeek: 1,
    tradingWeeks: 46,
    contributionMarginPct: 70,
  }));
});
