export type GrowthLever =
  | "customers"
  | "frequency"
  | "average_transaction_value";

export type GrowthScenarioInput = {
  annualLeads?: number;
  leadToCustomerConversionRate?: number;
  customers?: number;
  purchaseFrequency: number;
  averageTransactionValue: number;
  annualCapacityTransactions?: number;
  cancellationRate?: number;
  noShowRate?: number;
  grossMarginRate?: number;
  customerGrowthPct?: number;
  frequencyGrowthPct?: number;
  atvGrowthPct?: number;
};

type ScenarioSnapshot = {
  customers: number;
  transactions: number;
  completedTransactions: number;
  capacityConstrainedTransactions: number;
  purchaseFrequency: number;
  averageTransactionValue: number;
  revenue: number;
  grossProfit: number;
};

export type GrowthScenarioResult = {
  customerSource: "observed" | "modelled_from_leads";
  baseline: ScenarioSnapshot;
  modelled: ScenarioSnapshot;
  leverRevenueUplift: Record<GrowthLever, number>;
  combinedRevenueUplift: number;
  combinedGrossProfitUplift: number;
  primaryLever: GrowthLever | null;
  constraints: string[];
};

const DEFAULT_RATE = 0;

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function assertFiniteNonNegative(name: string, value: number | undefined) {
  if (value === undefined) return;
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a finite non-negative number`);
  }
}

function assertRate(name: string, value: number | undefined, fallback: number) {
  const rate = value ?? fallback;
  if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
    throw new Error(`${name} must be between 0 and 1`);
  }
  return rate;
}

function calculateSnapshot(
  input: GrowthScenarioInput,
  customers: number,
  purchaseFrequency: number,
  averageTransactionValue: number,
): ScenarioSnapshot {
  const cancellationRate = assertRate(
    "cancellationRate",
    input.cancellationRate,
    DEFAULT_RATE,
  );
  const noShowRate = assertRate("noShowRate", input.noShowRate, DEFAULT_RATE);
  const grossMarginRate = assertRate(
    "grossMarginRate",
    input.grossMarginRate,
    1,
  );

  const transactions = customers * purchaseFrequency;
  const completedTransactions =
    transactions * (1 - cancellationRate) * (1 - noShowRate);
  const capacityConstrainedTransactions = Math.min(
    completedTransactions,
    input.annualCapacityTransactions ?? Number.POSITIVE_INFINITY,
  );
  const revenue = roundMoney(
    capacityConstrainedTransactions * averageTransactionValue,
  );

  return {
    customers,
    transactions,
    completedTransactions,
    capacityConstrainedTransactions,
    purchaseFrequency,
    averageTransactionValue,
    revenue,
    grossProfit: roundMoney(revenue * grossMarginRate),
  };
}

function resolveCustomers(input: GrowthScenarioInput) {
  if (input.customers !== undefined) {
    return { customers: input.customers, source: "observed" as const };
  }

  if (
    input.annualLeads === undefined ||
    input.leadToCustomerConversionRate === undefined
  ) {
    throw new Error(
      "Provide customers or annualLeads with leadToCustomerConversionRate",
    );
  }

  return {
    customers: input.annualLeads * input.leadToCustomerConversionRate,
    source: "modelled_from_leads" as const,
  };
}

export function calculateGrowthScenario(
  input: GrowthScenarioInput,
): GrowthScenarioResult {
  assertFiniteNonNegative("annualLeads", input.annualLeads);
  assertFiniteNonNegative("customers", input.customers);
  assertFiniteNonNegative("purchaseFrequency", input.purchaseFrequency);
  assertFiniteNonNegative(
    "averageTransactionValue",
    input.averageTransactionValue,
  );
  assertFiniteNonNegative(
    "annualCapacityTransactions",
    input.annualCapacityTransactions,
  );
  assertFiniteNonNegative("customerGrowthPct", input.customerGrowthPct);
  assertFiniteNonNegative("frequencyGrowthPct", input.frequencyGrowthPct);
  assertFiniteNonNegative("atvGrowthPct", input.atvGrowthPct);
  assertRate(
    "leadToCustomerConversionRate",
    input.leadToCustomerConversionRate,
    0,
  );
  assertRate("cancellationRate", input.cancellationRate, DEFAULT_RATE);
  assertRate("noShowRate", input.noShowRate, DEFAULT_RATE);
  assertRate("grossMarginRate", input.grossMarginRate, 1);

  const { customers, source } = resolveCustomers(input);
  const customerGrowth = input.customerGrowthPct ?? 0;
  const frequencyGrowth = input.frequencyGrowthPct ?? 0;
  const atvGrowth = input.atvGrowthPct ?? 0;

  const baseline = calculateSnapshot(
    input,
    customers,
    input.purchaseFrequency,
    input.averageTransactionValue,
  );

  const modelled = calculateSnapshot(
    input,
    customers * (1 + customerGrowth),
    input.purchaseFrequency * (1 + frequencyGrowth),
    input.averageTransactionValue * (1 + atvGrowth),
  );

  const customersOnly = calculateSnapshot(
    input,
    customers * (1 + customerGrowth),
    input.purchaseFrequency,
    input.averageTransactionValue,
  );
  const frequencyOnly = calculateSnapshot(
    input,
    customers,
    input.purchaseFrequency * (1 + frequencyGrowth),
    input.averageTransactionValue,
  );
  const atvOnly = calculateSnapshot(
    input,
    customers,
    input.purchaseFrequency,
    input.averageTransactionValue * (1 + atvGrowth),
  );

  const leverRevenueUplift: Record<GrowthLever, number> = {
    customers: roundMoney(
      Math.max(0, customersOnly.revenue - baseline.revenue),
    ),
    frequency: roundMoney(
      Math.max(0, frequencyOnly.revenue - baseline.revenue),
    ),
    average_transaction_value: roundMoney(
      Math.max(0, atvOnly.revenue - baseline.revenue),
    ),
  };

  const rankedLevers = (
    Object.entries(leverRevenueUplift) as [GrowthLever, number][]
  ).sort((a, b) => b[1] - a[1]);
  const primaryLever = rankedLevers[0]?.[1] > 0 ? rankedLevers[0][0] : null;

  const constraints: string[] = [];
  if (
    input.annualCapacityTransactions !== undefined &&
    (baseline.completedTransactions > input.annualCapacityTransactions ||
      modelled.completedTransactions > input.annualCapacityTransactions)
  ) {
    constraints.push("capacity");
  }

  return {
    customerSource: source,
    baseline,
    modelled,
    leverRevenueUplift,
    combinedRevenueUplift: roundMoney(
      Math.max(0, modelled.revenue - baseline.revenue),
    ),
    combinedGrossProfitUplift: roundMoney(
      Math.max(0, modelled.grossProfit - baseline.grossProfit),
    ),
    primaryLever,
    constraints,
  };
}
