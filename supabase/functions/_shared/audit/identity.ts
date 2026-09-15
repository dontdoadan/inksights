export function normaliseClientLabel(raw: string): string {
  return raw
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("en-GB")
    .replace(/[’'`]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type IdentityCandidate = {
  rawLabel: string;
  normalisedLabel: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  matchStatus: "normalised" | "review_required";
};

export function buildIdentityCandidate(rawLabel: string): IdentityCandidate {
  const normalisedLabel = normaliseClientLabel(rawLabel);
  return {
    rawLabel,
    normalisedLabel,
    confidence: normalisedLabel ? "MEDIUM" : "LOW",
    matchStatus: normalisedLabel ? "normalised" : "review_required",
  };
}
