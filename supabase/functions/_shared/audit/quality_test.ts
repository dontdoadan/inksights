import { assessTransactionQuality } from "./quality.ts";
import type { ParsedTransaction } from "./transactions.ts";

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

const row = (sourceRow: number, date: string, client: string, amountPence: number, key: string): ParsedTransaction => ({
  sourceRow, date, rawClient: client, normalisedClient: client.toLowerCase(), amountPence, currency: "GBP", sourceRowKey: key,
});

Deno.test("quality assessment flags duplicate candidates, near-zero values and dataset boundary years", () => {
  const rows = [
    row(1,"2025-08-01","A",10000,"a"), row(2,"2025-08-01","A",10000,"b"), row(3,"2026-03-01","B",1,"c"),
  ];
  const quality = assessTransactionQuality(rows, []);
  assert(quality.parseSuccessRate === 1, "expected complete parse rate");
  assert(quality.potentialDuplicateRows === 2, "expected two duplicate candidates");
  assert(quality.nearZeroRows === 1, "expected one near-zero payment");
  assert(quality.partialYears.includes(2025) && quality.partialYears.includes(2026), "expected boundary-year flags");
});

Deno.test("sparse interior years are not mislabeled as partial coverage", () => {
  const rows = [
    row(1,"2020-08-01","A",10000,"a"),
    row(2,"2024-02-01","B",10000,"b"),
    row(3,"2024-11-01","C",10000,"c"),
    row(4,"2025-03-01","D",10000,"d"),
    row(5,"2026-05-01","E",10000,"e"),
  ];
  const quality = assessTransactionQuality(rows, []);
  assert(quality.partialYears.length === 2, "only source-boundary years should be partial");
  assert(quality.partialYears[0] === 2020 && quality.partialYears[1] === 2026, "expected 2020 and 2026 only");
  assert(quality.observedMonthsByYear["2024"] === 2, "sparse activity remains observable as activity, not missing coverage");
});

Deno.test("quality assessment includes rejected rows in parse success rate", () => {
  const quality = assessTransactionQuality([row(1,"2025-01-01","A",10000,"a")], [{ sourceRow: 2, raw: "bad", reason: "invalid" }]);
  assert(quality.parseSuccessRate === 0.5, "expected 50% parse rate");
  assert(quality.checks.find((c) => c.key === "parse_success_rate")?.status === "fail", "low parse success must fail quality");
});
