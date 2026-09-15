import type { ParsedLedger, ParsedTransaction } from "./transactions.ts";
import { detectPotentialDuplicates } from "./transactions.ts";

export type QualityCheck = {
  key: string;
  status: "pass" | "warning" | "fail";
  value: number | string | string[];
  note: string;
};

export type QualityResult = {
  checks: QualityCheck[];
  parseSuccessRate: number;
  minDate: string | null;
  maxDate: string | null;
  potentialDuplicateRows: number;
  nearZeroRows: number;
  observedMonthsByYear: Record<string, number>;
  partialYears: number[];
};

export function assessTransactionQuality(
  rows: ParsedTransaction[],
  rejected: ParsedLedger["rejected"],
): QualityResult {
  const total = rows.length + rejected.length;
  const parseSuccessRate = total === 0 ? 0 : rows.length / total;
  const dates = rows.map((row) => row.date).sort();
  const duplicateRows = detectPotentialDuplicates(rows).size;
  const nearZeroRows = rows.filter((row) => Math.abs(row.amountPence) <= 100).length;

  const monthSets = new Map<number, Set<string>>();
  for (const row of rows) {
    const year = Number(row.date.slice(0, 4));
    const month = row.date.slice(0, 7);
    const set = monthSets.get(year) ?? new Set<string>();
    set.add(month);
    monthSets.set(year, set);
  }
  const observedMonthsByYear = Object.fromEntries(
    [...monthSets.entries()].map(([year, months]) => [String(year), months.size]),
  );
  const partialYears = [...monthSets.entries()]
    .filter(([, months]) => months.size < 12)
    .map(([year]) => year)
    .sort();

  const checks: QualityCheck[] = [
    {
      key: "parse_success_rate",
      status: parseSuccessRate >= 0.98 ? "pass" : parseSuccessRate >= 0.9 ? "warning" : "fail",
      value: Number((parseSuccessRate * 100).toFixed(2)),
      note: `${rows.length} parsed / ${total} non-blank source rows`,
    },
    {
      key: "date_range",
      status: rows.length ? "pass" : "fail",
      value: rows.length ? `${dates[0]}..${dates[dates.length - 1]}` : "none",
      note: "Observed transaction date range",
    },
    {
      key: "potential_duplicate_rows",
      status: duplicateRows ? "warning" : "pass",
      value: duplicateRows,
      note: "Flagged only; never silently removed",
    },
    {
      key: "near_zero_rows",
      status: nearZeroRows ? "warning" : "pass",
      value: nearZeroRows,
      note: "Payments at or below £1 require interpretation but remain valid source records",
    },
    {
      key: "partial_years",
      status: partialYears.length ? "warning" : "pass",
      value: partialYears.map(String),
      note: "Years with fewer than 12 observed transaction months; trend comparisons must label them partial",
    },
  ];

  return {
    checks,
    parseSuccessRate,
    minDate: rows.length ? dates[0] : null,
    maxDate: rows.length ? dates[dates.length - 1] : null,
    potentialDuplicateRows: duplicateRows,
    nearZeroRows,
    observedMonthsByYear,
    partialYears,
  };
}
