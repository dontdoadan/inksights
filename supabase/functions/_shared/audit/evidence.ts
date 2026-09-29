import type { Confidence, EvidenceClassification } from "./metrics.ts";

export type AuditEvidenceInput = {
  evidenceType: string;
  title: string;
  summary: string;
  classification: EvidenceClassification;
  confidence: Confidence;
  provenance: Record<string, unknown>;
  observedAt: string;
};

export type WebsiteObservation = {
  sourceReference: string;
  observedAt: string;
  httpStatus: number;
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  robotsMeta: string | null;
  noindex: boolean;
  hasJsonLd: boolean;
  ctaTypes: string[];
  placeholderPortfolio: boolean;
  analyticsSignals: string[];
};

export function mapWebsiteEvidence(x: WebsiteObservation): AuditEvidenceInput[] {
  const base = { source_reference: x.sourceReference, http_status: x.httpStatus };
  return [
    { evidenceType:"website_indexability", title:"Website indexability", summary:x.noindex?"The observed page instructs compliant search engines not to index it.":"No noindex directive was observed on the inspected page.", classification:"OBSERVED", confidence:"HIGH", provenance:{...base,robots_meta:x.robotsMeta,noindex:x.noindex}, observedAt:x.observedAt },
    { evidenceType:"website_metadata", title:"Website metadata", summary:`Title ${x.title?"observed":"not observed"}; meta description ${x.metaDescription?"observed":"not observed"}; canonical ${x.canonical?"observed":"not observed"}.`, classification:"OBSERVED", confidence:"HIGH", provenance:{...base,title:x.title,meta_description:x.metaDescription,canonical:x.canonical}, observedAt:x.observedAt },
    { evidenceType:"website_enquiry_path", title:"Enquiry path signals", summary:x.ctaTypes.length?`Observed CTA types: ${x.ctaTypes.join(", ")}.`:"No supported enquiry CTA type was observed on the inspected page.", classification:"OBSERVED", confidence:"MEDIUM", provenance:{...base,cta_types:x.ctaTypes}, observedAt:x.observedAt },
    { evidenceType:"website_proof", title:"Portfolio/proof signals", summary:x.placeholderPortfolio?"Placeholder portfolio language was observed on the inspected page.":"No configured placeholder portfolio signal was observed on the inspected page.", classification:"OBSERVED", confidence:"MEDIUM", provenance:{...base,placeholder_portfolio:x.placeholderPortfolio}, observedAt:x.observedAt },
    { evidenceType:"website_instrumentation", title:"Structured data and analytics signals", summary:`JSON-LD ${x.hasJsonLd?"observed":"not observed"}; analytics signals: ${x.analyticsSignals.length?x.analyticsSignals.join(", "):"none observed"}.`, classification:"OBSERVED", confidence:"MEDIUM", provenance:{...base,json_ld:x.hasJsonLd,analytics_signals:x.analyticsSignals}, observedAt:x.observedAt },
  ];
}

export function mapSearchObservation(x: {
  query: string; provider: string; database?: string | null; position?: number | null; url?: string | null; domain?: string | null; observedAt: string;
}): AuditEvidenceInput {
  return {
    evidenceType:"search_observation",
    title:`Search observation: ${x.query}`,
    summary:x.position==null?`The studio was not observed in the retained ${x.provider} result set for this query.`:`The studio was observed at provider position ${x.position} for this query.`,
    classification:"OBSERVED",
    confidence:"HIGH",
    provenance:{ query:x.query, source_provider:x.provider, database:x.database??null, observed_position:x.position??null, url:x.url??null, domain:x.domain??null, ranking_scope:"provider-scoped observation; not relabelled as Google unless provider/database supports that claim" },
    observedAt:x.observedAt,
  };
}
