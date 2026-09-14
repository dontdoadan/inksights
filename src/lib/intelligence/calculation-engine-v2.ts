export const CALCULATION_ENGINE_VERSION = "calculation-engine-v2.0.0" as const;

type Band = { low: number; base: number; high: number };
type BandKey = keyof Band;

export type EvidenceQualityInput = {
  sourceReliability?: number;
  completeness?: number;
  confidence?: number;
  sampleAdequacy?: number;
  freshnessScore?: number;
  ageDays?: number;
  freshnessHalfLifeDays?: number;
};

export type CalculationEngineV2Input = {
  baseline: {
    revenuePence: number;
    uniqueCustomers: number;
    transactions: number;
    grossMarginRate?: number;
    capacityUnits?: number;
    bookedCapacityUnits?: number;
    capacityUnitsPerTransaction?: number;
  };
  scenario: {
    customers: Band;
    averageTransactionValue: Band;
    purchaseFrequency: Band;
  };
  evidence?: EvidenceQualityInput[];
};

const BAND_KEYS: BandKey[] = ["low", "base", "high"];

function roundMoney(value: number) {
  return Math.round(value);
}

function roundRate(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function requireFinitePositive(value: number, name: string) {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} must be > 0`);
}

function requireRate(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error(`${name} must be between 0 and 1`);
}

function validateBand(value: Band, name: string) {
  for (const key of BAND_KEYS) {
    if (!Number.isFinite(value[key]) || value[key] < 0) {
      throw new Error(`${name}.${key} must be a non-negative finite rate`);
    }
  }
  if (!(value.low <= value.base && value.base <= value.high)) {
    throw new Error(`${name} must satisfy low <= base <= high`);
  }
}

function harmonicMean(values: number[]) {
  if (values.length === 0) return null;
  if (values.some((value) => value === 0)) return 0;
  return values.length / values.reduce((sum, value) => sum + 1 / value, 0);
}

export function calculateFreshnessScore(ageDays: number, halfLifeDays: number) {
  if (!Number.isFinite(ageDays) || ageDays < 0) throw new Error("ageDays must be >= 0");
  requireFinitePositive(halfLifeDays, "halfLifeDays");
  return 2 ** (-ageDays / halfLifeDays);
}

export function calculateEvidenceQuality(evidence: EvidenceQualityInput[] = []) {
  if (evidence.length === 0) return null;

  const itemScores = evidence.map((item, index) => {
    const freshness = item.freshnessScore ?? (
      item.ageDays !== undefined && item.freshnessHalfLifeDays !== undefined
        ? calculateFreshnessScore(item.ageDays, item.freshnessHalfLifeDays)
        : undefined
    );
    const components = [
      item.sourceReliability,
      item.completeness,
      item.confidence,
      item.sampleAdequacy,
      freshness,
    ].filter((value): value is number => value !== undefined);

    if (components.length === 0) throw new Error(`evidence[${index}] has no quality components`);
    components.forEach((value, componentIndex) => {
      requireRate(value, `evidence[${index}].component[${componentIndex}]`);
    });
    return harmonicMean(components) ?? 0;
  });

  const aggregate = harmonicMean(itemScores);
  return aggregate === null ? null : Math.round(aggregate * 1000) / 10;
}

function calculateBand<T>(fn: (key: BandKey) => T): { low: T; base: T; high: T } {
  return { low: fn("low"), base: fn("base"), high: fn("high") };
}

export function runCalculationEngineV2(input: CalculationEngineV2Input) {
  const { baseline, scenario } = input;
  requireFinitePositive(baseline.revenuePence, "baseline.revenuePence");
  requireFinitePositive(baseline.uniqueCustomers, "baseline.uniqueCustomers");
  requireFinitePositive(baseline.transactions, "baseline.transactions");
  if (baseline.grossMarginRate !== undefined) {
    requireRate(baseline.grossMarginRate, "baseline.grossMarginRate");
  }
  validateBand(scenario.customers, "scenario.customers");
  validateBand(scenario.averageTransactionValue, "scenario.averageTransactionValue");
  validateBand(scenario.purchaseFrequency, "scenario.purchaseFrequency");

  const purchaseFrequency = baseline.transactions / baseline.uniqueCustomers;
  const averageTransactionValuePence = baseline.revenuePence / baseline.transactions;
  const modelledRevenuePence = roundMoney(
    baseline.uniqueCustomers * purchaseFrequency * averageTransactionValuePence,
  );
  const reconciliationVariancePence = modelledRevenuePence - baseline.revenuePence;
  const reconciliationVarianceRate = roundRate(reconciliationVariancePence / baseline.revenuePence);

  const hasCapacityInputs = baseline.capacityUnits !== undefined || baseline.bookedCapacityUnits !== undefined;
  const capacityMeasured = baseline.capacityUnits !== undefined
    && baseline.bookedCapacityUnits !== undefined
    && baseline.capacityUnitsPerTransaction !== undefined;
  const warnings: string[] = [];

  let capacityHeadroomUnits: number | null = null;
  let capacityHeadroomTransactions: number | null = null;
  let capacityUtilisationRate: number | null = null;

  if (capacityMeasured) {
    if (!Number.isFinite(baseline.capacityUnits) || baseline.capacityUnits! < 0) {
      throw new Error("baseline.capacityUnits must be >= 0");
    }
    if (!Number.isFinite(baseline.bookedCapacityUnits) || baseline.bookedCapacityUnits! < 0) {
      throw new Error("baseline.bookedCapacityUnits must be >= 0");
    }
    requireFinitePositive(baseline.capacityUnitsPerTransaction!, "baseline.capacityUnitsPerTransaction");
    capacityHeadroomUnits = Math.max(0, baseline.capacityUnits! - baseline.bookedCapacityUnits!);
    capacityHeadroomTransactions = capacityHeadroomUnits / baseline.capacityUnitsPerTransaction!;
    capacityUtilisationRate = baseline.capacityUnits! > 0
      ? roundRate(baseline.bookedCapacityUnits! / baseline.capacityUnits!)
      : null;
    if (baseline.bookedCapacityUnits! > baseline.capacityUnits!) {
      warnings.push("booked_capacity_exceeds_available_capacity");
    }
  } else if (hasCapacityInputs) {
    warnings.push("capacity_not_applied_missing_units_per_transaction_or_pair");
  } else {
    warnings.push("capacity_unmeasured");
  }

  const requestedIncrementalTransactions = calculateBand((key) => {
    const projectedTransactions = baseline.transactions
      * (1 + scenario.customers[key])
      * (1 + scenario.purchaseFrequency[key]);
    return roundRate(projectedTransactions - baseline.transactions);
  });

  const constrainedIncrementalTransactions = calculateBand((key) => {
    const requested = requestedIncrementalTransactions[key];
    if (capacityHeadroomTransactions === null) return requested;
    return roundRate(Math.min(requested, capacityHeadroomTransactions));
  });

  const capacityScaleFactor = calculateBand((key) => {
    const requested = requestedIncrementalTransactions[key];
    if (requested <= 0) return 1;
    return roundRate(constrainedIncrementalTransactions[key] / requested);
  });

  const unconstrainedRevenuePence = calculateBand((key) => {
    const projectedTransactions = baseline.transactions + requestedIncrementalTransactions[key];
    const projectedAtv = averageTransactionValuePence * (1 + scenario.averageTransactionValue[key]);
    return roundMoney(projectedTransactions * projectedAtv - baseline.revenuePence);
  });

  const constrainedRevenuePence = calculateBand((key) => {
    const projectedTransactions = baseline.transactions + constrainedIncrementalTransactions[key];
    const projectedAtv = averageTransactionValuePence * (1 + scenario.averageTransactionValue[key]);
    return roundMoney(projectedTransactions * projectedAtv - baseline.revenuePence);
  });

  const unconstrainedRevenueGrowthRate = calculateBand((key) =>
    roundRate(unconstrainedRevenuePence[key] / baseline.revenuePence),
  );
  const constrainedRevenueGrowthRate = calculateBand((key) =>
    roundRate(constrainedRevenuePence[key] / baseline.revenuePence),
  );

  const isolatedLeverRevenuePence = {
    customers: calculateBand((key) => roundMoney(baseline.revenuePence * scenario.customers[key])),
    averageTransactionValue: calculateBand((key) => roundMoney(baseline.revenuePence * scenario.averageTransactionValue[key])),
    purchaseFrequency: calculateBand((key) => roundMoney(baseline.revenuePence * scenario.purchaseFrequency[key])),
  };

  const constrainedContributionPence = baseline.grossMarginRate === undefined
    ? null
    : calculateBand((key) => roundMoney(constrainedRevenuePence[key] * baseline.grossMarginRate!));

  if (Math.abs(reconciliationVarianceRate) > 0.02) {
    warnings.push("revenue_identity_variance_above_2_percent");
  }
  if (BAND_KEYS.some((key) => capacityScaleFactor[key] < 1)) {
    warnings.push("capacity_constrains_growth_scenario");
  }

  return {
    engineVersion: CALCULATION_ENGINE_VERSION,
    baseline: {
      observedRevenuePence: baseline.revenuePence,
      uniqueCustomers: baseline.uniqueCustomers,
      transactions: baseline.transactions,
      purchaseFrequency: roundRate(purchaseFrequency),
      averageTransactionValuePence: roundMoney(averageTransactionValuePence),
      modelledRevenuePence,
      reconciliationVariancePence,
      reconciliationVarianceRate,
      grossMarginRate: baseline.grossMarginRate ?? null,
    },
    constraints: {
      capacityMeasured,
      capacityUnits: baseline.capacityUnits ?? null,
      bookedCapacityUnits: baseline.bookedCapacityUnits ?? null,
      capacityUnitsPerTransaction: baseline.capacityUnitsPerTransaction ?? null,
      capacityHeadroomUnits,
      capacityHeadroomTransactions: capacityHeadroomTransactions === null
        ? null
        : roundRate(capacityHeadroomTransactions),
      capacityUtilisationRate,
    },
    scenario,
    evidenceQualityScore: calculateEvidenceQuality(input.evidence),
    opportunity: {
      isolatedLeverRevenuePence,
      requestedIncrementalTransactions,
      constrainedIncrementalTransactions,
      capacityScaleFactor,
      unconstrainedRevenuePence,
      constrainedRevenuePence,
      unconstrainedRevenueGrowthRate,
      constrainedRevenueGrowthRate,
      constrainedContributionPence,
    },
    warnings,
  };
}
