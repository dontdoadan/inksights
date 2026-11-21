/** Revenue opportunity scenario v1: modelled, never a measured loss or forecast. */
export type RevenueScenarioInputs = {
  averageBookingValue: number;
  extraBookingsPerWeek: number;
  tradingWeeks: number;
  availableExtraSlotsPerWeek: number;
  contributionMarginPct: number;
};

export type RevenueScenarioResult = {
  grossUnconstrainedGbp: number;
  grossCapacityAdjustedGbp: number;
  estimatedContributionGbp: number;
  additionalBookingsPerYear: number;
  capacityLimited: boolean;
  classification: "modelled";
  disclaimer: string;
};

const pounds = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function calculateRevenueScenario(v: RevenueScenarioInputs): RevenueScenarioResult {
  if (!Number.isFinite(v.averageBookingValue) || v.averageBookingValue < 50 || v.averageBookingValue > 10000 ||
      !Number.isInteger(v.extraBookingsPerWeek) || v.extraBookingsPerWeek < 0 || v.extraBookingsPerWeek > 100 ||
      !Number.isInteger(v.tradingWeeks) || v.tradingWeeks < 1 || v.tradingWeeks > 52 ||
      !Number.isInteger(v.availableExtraSlotsPerWeek) || v.availableExtraSlotsPerWeek < 0 || v.availableExtraSlotsPerWeek > 100 ||
      !Number.isFinite(v.contributionMarginPct) || v.contributionMarginPct < 0 || v.contributionMarginPct > 100) {
    throw new Error("Please enter figures within the supported ranges.");
  }
  const bookingsPerWeek = Math.min(v.extraBookingsPerWeek, v.availableExtraSlotsPerWeek);
  const grossCapacityAdjustedGbp = pounds(bookingsPerWeek * v.averageBookingValue * v.tradingWeeks);
  return {
    grossUnconstrainedGbp: pounds(v.extraBookingsPerWeek * v.averageBookingValue * v.tradingWeeks),
    grossCapacityAdjustedGbp,
    estimatedContributionGbp: pounds(grossCapacityAdjustedGbp * (v.contributionMarginPct / 100)),
    additionalBookingsPerYear: bookingsPerWeek * v.tradingWeeks,
    capacityLimited: bookingsPerWeek < v.extraBookingsPerWeek,
    classification: "modelled",
    disclaimer: "Illustrative incremental revenue and contribution scenario, not a measured loss, forecast or guaranteed result. Verify enquiries, conversion, capacity, booking value and costs with the studio.",
  };
}
