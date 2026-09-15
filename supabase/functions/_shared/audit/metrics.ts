import type { ParsedTransaction } from "./transactions.ts";

export type EvidenceClassification = "VERIFIED" | "OBSERVED" | "CALCULATED" | "MODELLED" | "HYPOTHESIS";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";
export type MeasurementStatus = "measured" | "estimated" | "not_measurable" | "not_applicable";

export type AuditMetricInput = {
  metricKey: string;
  valueNumeric?: number;
  valueText?: string;
  unit?: string;
  periodStart?: string;
  periodEnd?: string;
  evidenceClassification: EvidenceClassification;
  confidence: Confidence;
  measurementStatus: MeasurementStatus;
  notMeasurableReason?: string;
  requiredSource?: string;
  calculationVersion: string;
  provenance: Record<string, unknown>;
};

export type TransactionMetricPeriod = {
  periodStart: string;
  periodEnd: string;
  reactivationWindowStart: string;
  partialYears?: number[];
  sourceIds?: string[];
  identityConfidence?: Confidence;
};

const VERSION = "transaction-metrics-v1";

function metric(base: Omit<AuditMetricInput, "calculationVersion">): AuditMetricInput {
  return { ...base, calculationVersion: VERSION };
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function calculateTransactionMetrics(
  rows: ParsedTransaction[],
  period: TransactionMetricPeriod,
): AuditMetricInput[] {
  const inPeriod = rows.filter((r) => r.date >= period.periodStart && r.date <= period.periodEnd);
  const confidence = period.identityConfidence ?? "MEDIUM";
  const provenance = {
    source_ids: period.sourceIds ?? [],
    grain: "payment_transaction",
    identity_resolution: "conservative_normalised_label",
  };

  const clientRows = new Map<string, ParsedTransaction[]>();
  for (const row of inPeriod) {
    const list = clientRows.get(row.normalisedClient) ?? [];
    list.push(row);
    clientRows.set(row.normalisedClient, list);
  }
  const repeatClients = new Set(
    [...clientRows.entries()].filter(([, clientTransactions]) => clientTransactions.length >= 2).map(([client]) => client),
  );
  const totalPence = inPeriod.reduce((sum, r) => sum + r.amountPence, 0);
  const repeatValuePence = inPeriod
    .filter((r) => repeatClients.has(r.normalisedClient))
    .reduce((sum, r) => sum + r.amountPence, 0);

  const beforeWindowClients = new Set(
    rows.filter((r) => r.date < period.reactivationWindowStart).map((r) => r.normalisedClient),
  );
  const activeWindowClients = new Set(
    rows.filter((r) => r.date >= period.reactivationWindowStart && r.date <= period.periodEnd).map((r) => r.normalisedClient),
  );
  const dormantClients = [...beforeWindowClients].filter((client) => !activeWindowClients.has(client));

  const metrics: AuditMetricInput[] = [
    metric({ metricKey: "recorded_payment_value", valueNumeric: totalPence, unit: "GBP_pence", periodStart: period.periodStart, periodEnd: period.periodEnd, evidenceClassification: "CALCULATED", confidence: "HIGH", measurementStatus: "measured", provenance: { ...provenance, formula: "sum(amount_pence)" } }),
    metric({ metricKey: "payment_transaction_count", valueNumeric: inPeriod.length, unit: "transactions", periodStart: period.periodStart, periodEnd: period.periodEnd, evidenceClassification: "CALCULATED", confidence: "HIGH", measurementStatus: "measured", provenance: { ...provenance, formula: "count(payment transactions)" } }),
    metric({ metricKey: "median_payment_value", valueNumeric: median(inPeriod.map((r) => r.amountPence)), unit: "GBP_pence", periodStart: period.periodStart, periodEnd: period.periodEnd, evidenceClassification: "CALCULATED", confidence: "HIGH", measurementStatus: "measured", provenance: { ...provenance, formula: "median(amount_pence)" } }),
    metric({ metricKey: "conservative_distinct_clients", valueNumeric: clientRows.size, unit: "clients", periodStart: period.periodStart, periodEnd: period.periodEnd, evidenceClassification: "CALCULATED", confidence, measurementStatus: "measured", provenance: { ...provenance, formula: "count(distinct normalised_client_label)" } }),
    metric({ metricKey: "multiple_payment_clients", valueNumeric: repeatClients.size, unit: "clients", periodStart: period.periodStart, periodEnd: period.periodEnd, evidenceClassification: "CALCULATED", confidence, measurementStatus: "measured", provenance: { ...provenance, formula: "clients with >=2 payment rows; not retention" } }),
    metric({ metricKey: "multiple_payment_client_value_share", valueNumeric: totalPence === 0 ? 0 : (repeatValuePence / totalPence) * 100, unit: "percent", periodStart: period.periodStart, periodEnd: period.periodEnd, evidenceClassification: "CALCULATED", confidence, measurementStatus: "measured", provenance: { ...provenance, formula: "value from identities with >=2 payment rows / all recorded payment value" } }),
    metric({ metricKey: "dormant_historical_clients", valueNumeric: dormantClients.length, unit: "clients", periodStart: period.reactivationWindowStart, periodEnd: period.periodEnd, evidenceClassification: "CALCULATED", confidence, measurementStatus: "measured", provenance: { ...provenance, formula: "historical identities before reactivation window minus identities active in window" } }),
  ];

  const byYear = new Map<number, ParsedTransaction[]>();
  for (const row of rows) {
    const year = Number(row.date.slice(0, 4));
    const list = byYear.get(year) ?? [];
    list.push(row);
    byYear.set(year, list);
  }
  const partial = new Set(period.partialYears ?? []);
  for (const [year, yearRows] of [...byYear.entries()].sort(([a], [b]) => a - b)) {
    const yearTotal = yearRows.reduce((sum, row) => sum + row.amountPence, 0);
    const coverage = partial.has(year) ? "PARTIAL_PERIOD" : "FULL_YEAR";
    metrics.push(metric({ metricKey: `recorded_payment_value_${year}`, valueNumeric: yearTotal, valueText: coverage, unit: "GBP_pence", periodStart: `${year}-01-01`, periodEnd: `${year}-12-31`, evidenceClassification: "CALCULATED", confidence: "HIGH", measurementStatus: "measured", provenance: { ...provenance, formula: "sum(amount_pence) by calendar year", coverage } }));
    metrics.push(metric({ metricKey: `payment_transaction_count_${year}`, valueNumeric: yearRows.length, valueText: coverage, unit: "transactions", periodStart: `${year}-01-01`, periodEnd: `${year}-12-31`, evidenceClassification: "CALCULATED", confidence: "HIGH", measurementStatus: "measured", provenance: { ...provenance, formula: "count(payment transactions) by calendar year", coverage } }));
  }

  return metrics;
}

export function calculateMissingOperationalMetrics(availableSources: string[]): AuditMetricInput[] {
  const sourceSet = new Set(availableSources);
  const missing = (metricKey: string, reason: string, requiredSource: string) => metric({
    metricKey,
    evidenceClassification: "CALCULATED",
    confidence: "LOW",
    measurementStatus: "not_measurable",
    notMeasurableReason: reason,
    requiredSource,
    provenance: { available_sources: [...sourceSet], formula: "not calculated" },
  });

  const result: AuditMetricInput[] = [];
  if (!sourceSet.has("enquiries") || !sourceSet.has("bookings")) result.push(missing("enquiry_to_booking_conversion", "No matched enquiry and booking dataset is available.", "enquiry and booking records"));
  if (!sourceSet.has("booking_cohorts")) result.push(missing("retention_rate", "Payment frequency cannot establish cohort retention.", "booking/client cohort records"));
  if (!sourceSet.has("attendance")) {
    result.push(missing("no_show_rate", "No attendance/no-show dataset is available.", "attendance records"));
    result.push(missing("cancellation_rate", "No cancellation dataset is available.", "booking cancellation records"));
  }
  if (!sourceSet.has("artist_capacity")) result.push(missing("artist_utilisation", "No reliable available-vs-booked artist capacity dataset is available.", "artist availability and booked-hours records"));
  return result;
}
