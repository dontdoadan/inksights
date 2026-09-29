import { buildIdentityCandidate, normaliseClientLabel } from "./identity.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("normalises casing, whitespace and punctuation conservatively", () => {
  assert(normaliseClientLabel("  Aimee-Mae   ROWLES ") === "aimee-mae rowles", "expected safe normalisation");
  assert(normaliseClientLabel("O’Connor") === "oconnor", "expected apostrophe normalisation");
});

Deno.test("does not fuzzy-merge distinct labels", () => {
  const short = normaliseClientLabel("A Smith");
  const full = normaliseClientLabel("Andrew Smith");
  assert(short !== full, "ambiguous names must remain separate");
});

Deno.test("blank labels require review", () => {
  const candidate = buildIdentityCandidate("   ");
  assert(candidate.matchStatus === "review_required", "blank labels should require review");
  assert(candidate.confidence === "LOW", "blank labels should be low confidence");
});
