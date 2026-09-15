import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const serverSource = await readFile(new URL("../src/server.ts", import.meta.url), "utf8");

test("legacy consumer tattoo URLs are redirected before TanStack routing", () => {
  for (const path of [
    "/guides/full-sleeve-cost-uk",
    "/guides/grey-line-healing-week-by-week",
    "/tools/tattoo-pain-chart-reality-check",
  ]) {
    assert.match(serverSource, new RegExp(path.replaceAll("/", "\\/")));
  }
  assert.match(serverSource, /LEGACY_REDIRECTS/);
  assert.match(serverSource, /Response\.redirect\([^,]+, 301\)/);
});

test("server does not maintain duplicate robots or sitemap bodies", () => {
  assert.doesNotMatch(serverSource, /PUBLIC_SITEMAP_PATHS/);
  assert.doesNotMatch(serverSource, /function sitemapResponse/);
  assert.doesNotMatch(serverSource, /function robotsResponse/);
  assert.doesNotMatch(serverSource, /canonicalUrl\.pathname === "\/sitemap\.xml"/);
  assert.doesNotMatch(serverSource, /canonicalUrl\.pathname === "\/robots\.txt"/);
});
