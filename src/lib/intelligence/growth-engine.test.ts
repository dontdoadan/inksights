import assert from "node:assert/strict";
import test from "node:test";

import { calculateGrowthScenario } from "./growth-engine";

test("baseline revenue follows Customers × Frequency × ATV when unconstrained", () => {
  const result = calculateGrowthScenario({
    customers: 100,
    purchaseFrequency: 2,
    averageTransactionValue: 500,
  });

  assert.equal(result.baseline.customers, 100);
  assert.equal(result.baseline.transactions, 200);
  assert.equal(result.baseline.revenue, 100_000);
  assert.equal(result.baseline.grossProfit, 100_000);
});

test("derives customers from leads and conversion when customers are not supplied", () => {
  const result = calculateGrowthScenario({
    annualLeads: 500,
    leadToCustomerConversionRate: 0.2,
    purchaseFrequency: 2,
    averageTransactionValue: 500,
  });

  assert.equal(result.baseline.customers, 100);
  assert.equal(result.customerSource, "modelled_from_leads");
});

test("isolated customer growth reports only the customer lever uplift", () => {
  const result = calculateGrowthScenario({
    customers: 100,
    purchaseFrequency: 2,
    averageTransactionValue: 500,
    customerGrowthPct: 0.1,
  });

  assert.equal(result.leverRevenueUplift.customers, 10_000);
  assert.equal(result.leverRevenueUplift.frequency, 0);
  assert.equal(result.leverRevenueUplift.averageTransactionValue, 0);
  assert.equal(result.primaryLever, "customers");
});

test("combined growth compounds across frequency and ATV", () => {
  const result = calculateGrowthScenario({
    customers: 100,
    purchaseFrequency: 2,
    averageTransactionValue: 500,
    frequencyGrowthPct: 0.2,
    atvGrowthPct: 0.1,
  });

  assert.equal(result.baseline.revenue, 100_000);
  assert.equal(result.modelled.revenue, 132_000);
  assert.equal(result.combinedRevenueUplift, 32_000);
  assert.equal(result.leverRevenueUplift.frequency, 20_000);
  assert.equal(result.leverRevenueUplift.averageTransactionValue, 10_000);
});

test("capacity suppresses customer and frequency upside while preserving ATV upside", () => {
  const result = calculateGrowthScenario({
    customers: 100,
    purchaseFrequency: 2,
    averageTransactionValue: 500,
    annualCapacityTransactions: 180,
    customerGrowthPct: 0.2,
    frequencyGrowthPct: 0.2,
    atvGrowthPct: 0.1,
  });

  assert.equal(result.baseline.capacityConstrainedTransactions, 180);
  assert.equal(result.baseline.revenue, 90_000);
  assert.equal(result.leverRevenueUplift.customers, 0);
  assert.equal(result.leverRevenueUplift.frequency, 0);
  assert.equal(result.leverRevenueUplift.averageTransactionValue, 9_000);
  assert.equal(result.primaryLever, "average_transaction_value");
  assert.ok(result.constraints.includes("capacity"));
});

test("cancellations and no-shows reduce completed transactions before revenue", () => {
  const result = calculateGrowthScenario({
    customers: 100,
    purchaseFrequency: 2,
    averageTransactionValue: 500,
    cancellationRate: 0.1,
    noShowRate: 0.05,
  });

  assert.equal(result.baseline.completedTransactions, 171);
  assert.equal(result.baseline.revenue, 85_500);
});

test("gross margin is applied to realised revenue", () => {
  const result = calculateGrowthScenario({
    customers: 100,
    purchaseFrequency: 2,
    averageTransactionValue: 500,
    grossMarginRate: 0.6,
  });

  assert.equal(result.baseline.grossProfit, 60_000);
});

test("rejects invalid rates and missing customer acquisition inputs", () => {
  assert.throws(
    () => calculateGrowthScenario({ customers: 100, purchaseFrequency: 2, averageTransactionValue: 500, cancellationRate: 1.1 }),
    /cancellationRate/,
  );
  assert.throws(
    () => calculateGrowthScenario({ purchaseFrequency: 2, averageTransactionValue: 500 }),
    /customers or annualLeads/,
  );
});
