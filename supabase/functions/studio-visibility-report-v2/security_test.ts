import { isBlockedAddress, validatePublicUrl } from "./security.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("visibility crawler rejects private or special-use network destinations", () => {
  for (const destination of [
    "http://127.0.0.1",
    "http://10.0.0.1",
    "http://169.254.169.254/latest/meta-data",
    "http://[::1]",
    "http://[fd00::1]",
    "http://[fe80::1]",
  ]) {
    let rejected = false;
    try {
      validatePublicUrl(destination);
    } catch {
      rejected = true;
    }
    assert(rejected, `Expected ${destination} to be rejected before it can be fetched.`);
  }

  assert(isBlockedAddress("100.64.0.1"), "Carrier-grade NAT addresses must be rejected.");
  assert(isBlockedAddress("198.18.0.1"), "Benchmark network addresses must be rejected.");
});

Deno.test(
  "visibility crawler accepts a normal public website while rejecting risky URL forms",
  () => {
    assert(
      validatePublicUrl("example.com").toString() === "https://example.com/",
      "A bare public hostname should normalise to HTTPS.",
    );
    assert(
      validatePublicUrl("https://example.com:443/").toString() === "https://example.com/",
      "The standard HTTPS port should remain valid.",
    );

    for (const destination of [
      "https://username:password@example.com",
      "https://example.com:8080",
      "ftp://example.com",
    ]) {
      let rejected = false;
      try {
        validatePublicUrl(destination);
      } catch {
        rejected = true;
      }
      assert(rejected, `Expected risky URL form ${destination} to be rejected.`);
    }
  },
);
