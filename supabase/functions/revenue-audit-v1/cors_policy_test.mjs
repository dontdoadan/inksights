import test from "node:test";
import assert from "node:assert/strict";
import { allowedCorsOrigin, isAllowedOrigin } from "./cors-policy.mjs";

test("allows production and INKSIGHTS Vercel preview origins only", () => {
  const allowed = [
    "https://getinksights.co.uk",
    "https://www.getinksights.co.uk",
    "https://inksight-main-git-feat-inksights-presentable-v1-inksights.vercel.app",
    "https://inksight-main-k0zklw35v-inksights.vercel.app",
  ];

  for (const origin of allowed) {
    assert.equal(isAllowedOrigin(origin), true, origin);
    assert.equal(allowedCorsOrigin(origin), origin, origin);
  }

  const denied = [
    "https://example.vercel.app",
    "https://inksight-main-abc-otherteam.vercel.app",
    "http://inksight-main-abc-inksights.vercel.app",
    "https://inksight-main-abc-inksights.vercel.app.evil.example",
    "https://evil.example",
  ];

  for (const origin of denied) {
    assert.equal(isAllowedOrigin(origin), false, origin);
    assert.equal(allowedCorsOrigin(origin), "https://getinksights.co.uk", origin);
  }
});
