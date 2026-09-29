import { detectPotentialDuplicates, parseTransactionLedger } from "./transactions.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("parses GBP payment rows without inventing session semantics", async () => {
  const result = await parseTransactionLedger("29/03/2025\tAimee-Mae Rowles\t£50.00\tClients");
  assert(result.rows.length === 1, "expected one parsed row");
  assert(result.rows[0].amountPence === 5000, "expected 5000 pence");
  assert(result.rows[0].date === "2025-03-29", "expected ISO date");
  assert(result.rows[0].currency === "GBP", "expected GBP");
  assert(!("session" in result.rows[0]), "transaction parser must not create session semantics");
  assert(result.rows[0].sourceRowKey.length === 64, "expected SHA-256 row key");
});

Deno.test("preserves tiny valid payments and comma-formatted amounts", async () => {
  const result = await parseTransactionLedger([
    "01/04/2026\tSteven Moss\t£0.01\tClients",
    "02/04/2026\tAnother Client\t£1,250.50\tClients",
  ].join("\n"));
  assert(result.rows[0].amountPence === 1, "expected one penny");
  assert(result.rows[1].amountPence === 125050, "expected comma-formatted value");
  assert(result.totalPence === 125051, "expected reconciled total");
});

Deno.test("rejects malformed dates, missing names and invalid amounts", async () => {
  const result = await parseTransactionLedger([
    "31/02/2025\tClient One\t£50.00\tClients",
    "01/03/2025\t\t£50.00\tClients",
    "02/03/2025\tClient Two\tnot-money\tClients",
  ].join("\n"));
  assert(result.rows.length === 0, "invalid rows should not parse");
  assert(result.rejected.length === 3, "expected three rejected rows");
});

Deno.test("flags exact same-day same-client same-value rows without deleting them", async () => {
  const result = await parseTransactionLedger([
    "01/03/2025\tClient One\t£100.00\tClients",
    "01/03/2025\tCLIENT ONE\t£100.00\tClients",
  ].join("\n"));
  const flagged = detectPotentialDuplicates(result.rows);
  assert(result.rows.length === 2, "both source rows must be retained");
  assert(flagged.size === 2, "both duplicate candidates must be flagged");
});
