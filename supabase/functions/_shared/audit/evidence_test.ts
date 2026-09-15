import { mapSearchObservation, mapWebsiteEvidence } from "./evidence.ts";

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

Deno.test("website observations remain factual and source-linked", () => {
  const observedAt = "2026-09-15T18:00:00.000Z";
  const evidence = mapWebsiteEvidence({
    sourceReference:"https://example.com/", observedAt, httpStatus:200, title:"Example", metaDescription:null, canonical:"https://example.com/", robotsMeta:"noindex, nofollow", noindex:true, hasJsonLd:false, ctaTypes:["mailto"], placeholderPortfolio:true, analyticsSignals:[],
  });
  const indexability = evidence.find((e) => e.evidenceType === "website_indexability");
  assert(indexability?.classification === "OBSERVED", "expected observed classification");
  assert(indexability?.confidence === "HIGH", "expected high-confidence direct observation");
  assert(indexability?.summary.includes("not to index"), "expected noindex wording");
  assert(evidence.find((e) => e.evidenceType === "website_enquiry_path")?.summary.includes("mailto"), "expected CTA evidence");
  assert(evidence.find((e) => e.evidenceType === "website_proof")?.summary.includes("Placeholder"), "expected placeholder evidence");
});

Deno.test("provider search positions are never silently relabelled as Google rankings", () => {
  const evidence = mapSearchObservation({ query:"black and grey tattoo croydon", provider:"brave", database:"brave_web", position:4, url:"https://example.com", domain:"example.com", observedAt:"2026-09-15T18:00:00.000Z" });
  assert(evidence.classification === "OBSERVED", "expected observed evidence");
  assert(String(evidence.provenance.ranking_scope).includes("provider-scoped"), "expected provider scope warning");
  assert(!evidence.summary.toLowerCase().includes("google"), "Brave observation must not claim Google rank");
});
