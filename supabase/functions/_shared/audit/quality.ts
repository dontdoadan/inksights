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

  // Missing transaction months are not evidence of missing source coverage: a studio can
  // legitimately have zero payments in a month. Only the dataset boundary years are
  // conservatively marked partial when the observable source range starts after January
  // or ends before December. Interior years remain full-period coverage even when sparse.
  const minDate = rows.length ? dates[0] : null;
  const maxDate = rows.length ? dates[dates.length - 1] : null;
  const partialYears = new Set<number>();
  if (minDate) {
    const firstYear = Number(minDate.slice(0, 4));
    const firstMonth = Number(minDate.slice(5, 7));
    if (firstMonth > 1) partialYears.add(firstYear);
  }
  if (maxDate) {
    const lastYear = Number(maxDate.slice(0, 4));
    const lastMonth = Number(maxDate.slice(5, 7));
    if (lastMonth < 12) partialYears.add(lastYear);
  }
  const partialYearList = [...partialYears].sort();

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
      value: rows.length ? `${minDate}..${maxDate}` : "none",
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
      status: partialYearList.length ? "warning" : "pass",
      value: partialYearList.map(String),
      note: "Dataset boundary years whose observable source range does not cover January through December; zero-payment months inside the source range are not treated as missing data",
    },
  ];

  return {
    checks,
    parseSuccessRate,
    minDate,
    maxDate,
    potentialDuplicateRows: duplicateRows,
    nearZeroRows,
    observedMonthsByYear,
    partialYears: partialYearList,
  };
}
