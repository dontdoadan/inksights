import { calculateMissingOperationalMetrics, calculateTransactionMetrics } from "./metrics.ts";
import type { ParsedTransaction } from "./transactions.ts";

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
const row = (sourceRow: number, date: string, client: string, amountPence: number): ParsedTransaction => ({ sourceRow, date, rawClient: client, normalisedClient: client.toLowerCase(), amountPence, currency: "GBP", sourceRowKey: `${sourceRow}`.padStart(64,"0") });

Deno.test("calculates payment, client and reactivation metrics without calling payments sessions", () => {
  const rows = [
    row(1,"2024-01-10","A",10000),
    row(2,"2024-02-10","A",20000),
    row(3,"2024-03-10","B",30000),
    row(4,"2025-04-10","A",40000),
    row(5,"2025-05-10","C",50000),
  ];
  const metrics = calculateTransactionMetrics(rows, {
    periodStart: "2024-01-01", periodEnd: "2025-12-31", reactivationWindowStart: "2025-01-01", partialYears: [2024,2025], identityConfidence: "MEDIUM",
  });
  const value = (key: string) => metrics.find((m) => m.metricKey === key)?.valueNumeric;
  assert(value("recorded_payment_value") === 150000, "expected total recorded payment value");
  assert(value("payment_transaction_count") === 5, "expected payment row count");
  assert(value("median_payment_value") === 30000, "expected median");
  assert(value("conservative_distinct_clients") === 3, "expected three conservative identities");
  assert(value("multiple_payment_clients") === 1, "expected one multiple-payment identity");
  assert(Math.round(value("multiple_payment_client_value_share") ?? 0) === 47, "expected repeat-payment value share");
  assert(value("dormant_historical_clients") === 1, "B should be dormant in the 2025 window");
  assert(metrics.find((m) => m.metricKey === "recorded_payment_value_2025")?.valueText === "PARTIAL_PERIOD", "partial year must be labelled");
  assert(!metrics.some((m) => m.metricKey.includes("session")), "must not invent session metrics");
});

Deno.test("retention and funnel metrics remain not measurable from transactions alone", () => {
  const metrics = calculateMissingOperationalMetrics(["transactions"]);
  const retention = metrics.find((m) => m.metricKey === "retention_rate");
  assert(retention?.measurementStatus === "not_measurable", "retention must remain unmeasured");
  assert(retention?.requiredSource === "booking/client cohort records", "expected cohort requirement");
  for (const key of ["enquiry_to_booking_conversion","no_show_rate","cancellation_rate","artist_utilisation"]) {
    assert(metrics.find((m) => m.metricKey === key)?.measurementStatus === "not_measurable", `${key} must remain unmeasured`);
  }
});

Deno.test("metric builders preserve classification, confidence and formula provenance", () => {
  const metrics = calculateTransactionMetrics([row(1,"2025-01-01","A",10000)], {
    periodStart: "2025-01-01", periodEnd: "2025-12-31", reactivationWindowStart: "2025-01-01", sourceIds: ["source-1"], identityConfidence: "LOW",
  });
  const clients = metrics.find((m) => m.metricKey === "conservative_distinct_clients");
  assert(clients?.evidenceClassification === "CALCULATED", "expected calculated classification");
  assert(clients?.confidence === "LOW", "expected inherited identity confidence");
  assert(clients?.calculationVersion === "transaction-metrics-v1", "expected versioned calculation");
  assert(Array.isArray(clients?.provenance.source_ids), "expected source provenance");
});
