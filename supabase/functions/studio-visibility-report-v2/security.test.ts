import { assertEquals, assertRejects } from "jsr:@std/assert@1";
import { assertPublicNetworkTarget, isBlockedAddress, validatePublicUrl } from "./security.ts";

test("blocks private and link-local IPv4 and IPv6 addresses", () => {
  for (const address of [
    "0.0.0.0",
    "10.0.0.1",
    "127.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "192.168.1.1",
    "::",
    "::1",
    "::ffff:127.0.0.1",
    "fc00::1",
    "fe80::1",
  ]) {
    assertEquals(isBlockedAddress(address), true, address);
  }
});

test("allows public IP literals and standard web ports", () => {
  assertEquals(isBlockedAddress("8.8.8.8"), false);
  assertEquals(isBlockedAddress("2001:4860:4860::8888"), false);
  assertEquals(validatePublicUrl("https://example.com").hostname, "example.com");
  assertEquals(validatePublicUrl("https://example.com:443").port, "");
});

test("rejects credentials, non-web protocols and non-standard ports", () => {
  for (const value of [
    "ftp://example.com",
    "https://user:pass@example.com",
    "https://example.com:5432",
    "http://127.0.0.1",
    "http://[::1]",
  ]) {
    assertRejects(() => Promise.resolve(validatePublicUrl(value)));
  }
});

test("rejects hostnames that resolve to private addresses", async () => {
  const original = Deno.resolveDns;
  Deno.resolveDns = (async (_hostname: string, type: "A" | "AAAA") =>
    type === "A" ? ["127.0.0.1"] : []) as typeof Deno.resolveDns;
  try {
    await assertRejects(() => assertPublicNetworkTarget(new URL("https://rebind.example")));
  } finally {
    Deno.resolveDns = original;
  }
});
