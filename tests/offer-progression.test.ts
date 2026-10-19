import { recommendNextCommercialStep } from "../src/lib/offer-progression.ts";

Deno.test("qualifying self-assessed local visibility gap routes to scoped fix", () => {
  const route = recommendNextCommercialStep({
    source: "visibility-scorecard",
    weakestArea: "local-discovery",
    visibilityScore: "40",
    primaryOpportunity: "Unconverted enquiries",
  });
  if (route.offerSlug !== "72-hour-visibility-fix") throw new Error("Expected conditional fix route");
  if (!route.evidenceNote.toLowerCase().includes("self-reported")) throw new Error("Missing evidence disclaimer");
});

Deno.test("financial model alone cannot imply a visibility fix", () => {
  const route = recommendNextCommercialStep({
    source: "direct",
    primaryOpportunity: "Unconverted enquiries",
  });
  if (route.offerSlug !== "studio-intelligence-audit") throw new Error("Financial estimate must route to diagnostic");
});

Deno.test("healthy visibility self-assessment routes to audit", () => {
  const route = recommendNextCommercialStep({
    source: "visibility-scorecard",
    weakestArea: "website",
    visibilityScore: "100",
  });
  if (route.offerSlug !== "studio-intelligence-audit") throw new Error("Strong score should not trigger Fix");
});

Deno.test("retention gap does not trigger unrelated visibility fix", () => {
  const route = recommendNextCommercialStep({
    source: "visibility-scorecard",
    weakestArea: "retention",
    visibilityScore: "20",
  });
  if (route.offerSlug !== "studio-intelligence-audit") throw new Error("Wrong constraint routed to Fix");
});

Deno.test("missing or invalid score cannot trigger paid visibility correction", () => {
  for (const score of [undefined, "not-a-number", ""]) {
    const route = recommendNextCommercialStep({
      source: "visibility-scorecard",
      weakestArea: "local-discovery",
      visibilityScore: score,
    });
    if (route.offerSlug !== "studio-intelligence-audit") throw new Error("Unverified score routed to Fix");
  }
});
