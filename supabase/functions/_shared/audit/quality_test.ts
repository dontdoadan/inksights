import { assessTransactionQuality } from "./quality.ts";
import type { ParsedTransaction } from "./transactions.ts";

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

const row = (sourceRow: number, date: string, client: string, amountPence: number, key: string): ParsedTransaction => ({
  sourceRow, date, rawClient: client, normalisedClient: client.toLowerCase(), amountPence, currency: "GBP", sourceRowKey: key,
});

Deno.test("quality assessment flags duplicate candidates, near-zero values and partial years", () => {
  const rows = [
    row(1,"2025-01-01","A",10000,"a"), row(2,"2025-01-01","A",10000,"b"), row(3,"2026-03-01","B",1,"c"),
  ];
  const quality = assessTransactionQuality(rows, []);
  assert(quality.parseSuccessRate === 1, "expected complete parse rate");
  assert(quality.potentialDuplicateRows === 2, "expected two duplicate candidates");
  assert(quality.nearZeroRows === 1, "expected one near-zero payment");
  assert(quality.partialYears.includes(2025) && quality.partialYears.includes(2026), "expected partial-year flags");
});

Deno.test("quality assessment includes rejected rows in parse success rate", () => {
  const quality = assessTransactionQuality([row(1,"2025-01-01","A",10000,"a")], [{ sourceRow: 2, raw: "bad", reason: "invalid" }]);
  assert(quality.parseSuccessRate === 0.5, "expected 50% parse rate");
  assert(quality.checks.find((c) => c.key === "parse_success_rate")?.status === "fail", "low parse success must fail quality");
});
