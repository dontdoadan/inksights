import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("INKSIGHTS OS founder endpoint enforces admin access", async () => {
  const source = await readFile(new URL("../src/routes/api/internal/founder-snapshot.ts", import.meta.url), "utf8");
  assert.match(source, /getUser\(token\)/);
  assert.match(source, /platform_admins/);
  assert.match(source, /Founder access required/);
  assert.match(source, /ops_current_founder_brief/);
});

test("INKSIGHTS OS is marked noindex", async () => {
  const source = await readFile(new URL("../src/server.ts", import.meta.url), "utf8");
  assert.match(source, /"\/os"/);
});
