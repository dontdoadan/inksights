import { isServiceRoleAuthorization, validateSourceType, validateStoragePath, validateUuid } from "./security.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function jwt(payload: Record<string, unknown>) {
  const enc = (value: unknown) => btoa(JSON.stringify(value)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${enc({ alg: "none", typ: "JWT" })}.${enc(payload)}.`;
}

Deno.test("ingest requires service role authorization", () => {
  assert(!isServiceRoleAuthorization(null), "anonymous request must fail");
  assert(!isServiceRoleAuthorization(`Bearer ${jwt({ role: "authenticated" })}`), "authenticated browser must fail");
  assert(isServiceRoleAuthorization(`Bearer ${jwt({ role: "service_role" })}`), "service role should pass");
});

Deno.test("ingest accepts only the supported source type", () => {
  assert(validateSourceType("transaction_ledger") === "transaction_ledger", "expected transaction ledger");
  let rejected = false;
  try { validateSourceType("remote_url"); } catch { rejected = true; }
  assert(rejected, "unsupported source type must fail");
});

Deno.test("ingest storage path must remain inside the studio audit prefix", () => {
  const studio = "11111111-1111-4111-8111-111111111111";
  const audit = "22222222-2222-4222-8222-222222222222";
  const expected = `studio/${studio}/audit/${audit}/ledger.txt`;
  assert(validateStoragePath(expected, studio, audit) === expected, "expected valid private path");
  for (const bad of [
    `studio/${studio}/audit/33333333-3333-4333-8333-333333333333/ledger.txt`,
    `studio/${studio}/audit/${audit}/../other.txt`,
    "https://example.com/ledger.txt",
  ]) {
    let rejected = false;
    try { validateStoragePath(bad, studio, audit); } catch { rejected = true; }
    assert(rejected, `expected ${bad} to be rejected`);
  }
});

Deno.test("ingest validates UUID identifiers", () => {
  assert(validateUuid("11111111-1111-4111-8111-111111111111", "audit_id").length === 36, "valid UUID expected");
  let rejected = false;
  try { validateUuid("not-an-id", "audit_id"); } catch { rejected = true; }
  assert(rejected, "invalid UUID must fail");
});
