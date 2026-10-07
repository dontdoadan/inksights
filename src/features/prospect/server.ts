import { z } from "zod";
import { getPublicOffer } from "@/lib/offer-data";
import {
  buildAcquisitionSnapshot,
  deriveProspectFindings,
  scoreProspect,
  type Confidence,
  type DerivedProspectFinding,
  type ProspectEvidence,
  type ProspectIdentity,
} from "./model";

type AdminClient = (typeof import("@/integrations/supabase/client.server"))["supabaseAdmin"];

type StudioRecord = {
  id: string;
  studio_name: string;
  website_url: string | null;
  trading_address: string | null;
  postcode: string | null;
  town: string | null;
  region: string | null;
  normalized_name: string | null;
  normalized_postcode: string | null;
  canonical_status: string;
  identity_confidence: number;
};

const scanSchema = z.object({
  studio_name: z.string().trim().max(160).optional().default(""),
  website: z.string().trim().max(500).optional().default(""),
  address: z.string().trim().max(300).optional().default(""),
  postcode: z.string().trim().max(24).optional().default(""),
  town: z.string().trim().max(120).optional().default(""),
  gbp_url: z.string().trim().max(1000).optional().default(""),
  contact_name: z.string().trim().max(120).optional().default(""),
  contact_email: z.string().trim().email().max(254).optional().or(z.literal("")).default(""),
  force_new: z.boolean().optional().default(false),
}).refine((value) => Boolean(value.studio_name || value.website || value.address || value.postcode || value.gbp_url), {
  message: "Provide at least one strong studio identifier.",
});

const snapshotSchema = z.object({ audit_id: z.string().uuid() });
const crmSchema = z.object({
  audit_id: z.string().uuid(),
  contact_name: z.string().trim().min(2).max(120),
  contact_email: z.string().trim().email().max(254),
  phone: z.string().trim().max(80).optional().default(""),
});

const EXCLUDED_DISCOVERY_DOMAINS = [
  "google.com",
  "maps.app.goo.gl",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "pinterest.com",
  "linkedin.com",
  "yell.com",
  "trustpilot.com",
  "tripadvisor.",
  "fresha.com",
  "booksy.com",
  "192.com",
];

function clean(value: unknown, max = 500) {
  const printable = Array.from(String(value ?? ""))
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("");
  return printable.trim().replace(/\s+/g, " ").slice(0, max);
}

export function normalizeName(value: string) {
  return clean(value, 180).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizePostcode(value: string) {
  return clean(value, 24).toUpperCase().replace(/\s+/g, "");
}

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.length <= 3 ? word.toUpperCase() : word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function domainOf(value: string | null | undefined) {
  try {
    return new URL(value ?? "").hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

function validatePublicHttpUrl(value: string) {
  if (!value) return "";
  const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("Only public HTTP(S) URLs are supported.");
  const hostname = url.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    /^(?:127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(hostname)
  ) throw new Error("Private network URLs are not supported.");
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unwrapDuckDuckGoUrl(rawHref: string): string | null {
  const href = rawHref.replace(/&amp;/gi, "&").trim();
  try {
    const candidate = new URL(href, "https://html.duckduckgo.com");
    if (candidate.hostname.endsWith("duckduckgo.com") && candidate.pathname.startsWith("/l/")) {
      const uddg = candidate.searchParams.get("uddg");
      if (uddg) {
        const target = new URL(decodeURIComponent(uddg));
        return ["http:", "https:"].includes(target.protocol) ? target.toString() : null;
      }
    }
    return ["http:", "https:"].includes(candidate.protocol) ? candidate.toString() : null;
  } catch {
    return null;
  }
}

type WebSearchResult = { position: number; url: string; domain: string; title: string };

async function duckDuckGo(query: string, max = 10): Promise<WebSearchResult[]> {
  const params = new URLSearchParams({ q: query, kl: "uk-en" });
  const response = await fetch(`https://html.duckduckgo.com/html/?${params}`, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "accept-language": "en-GB,en;q=0.9",
      "user-agent": "Mozilla/5.0 (compatible; INKSIGHTS-Prospect-Intelligence/1.0; +https://getinksights.co.uk)",
    },
    signal: AbortSignal.timeout(12_000),
  });
  const html = await response.text();
  if (!response.ok) throw new Error(`prospect_search_http_${response.status}`);
  const results: WebSearchResult[] = [];
  const anchor = /<a[^>]*class=["'][^"']*result__a[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = anchor.exec(html)) && results.length < max) {
    const url = unwrapDuckDuckGoUrl(match[1]);
    if (!url) continue;
    const domain = domainOf(url);
    if (!domain || domain.endsWith("duckduckgo.com")) continue;
    results.push({ position: results.length + 1, url, domain, title: decodeHtml(match[2]) });
  }
  if (!results.length) throw new Error("prospect_search_no_results");
  return results;
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function inferNameFromWebsite(website: string) {
  const domain = domainOf(website);
  try {
    const results = await duckDuckGo(`site:${domain}`, 5);
    const sameDomain = results.find((result) => result.domain === domain);
    if (sameDomain?.title) {
      const segment = sameDomain.title.split(/\s(?:\||–|—|-)\s/)[0]?.trim();
      if (segment && segment.length >= 2 && segment.length <= 120) return segment;
    }
  } catch {
    // Domain fallback below is explicit low-confidence inference.
  }
  return titleCase(domain.split(".")[0] || "Tattoo Studio");
}

function relevantNameTokens(name: string) {
  return normalizeName(name)
    .split(" ")
    .filter((token) => token.length >= 4 && !["tattoo", "studio", "tattoos"].includes(token));
}

async function discoverWebsite(name: string, address: string, town: string, postcode: string) {
  if (!name) return null;
  const location = [address, town, postcode].filter(Boolean).join(" ");
  const query = [`"${name}"`, location ? `"${location}"` : "", "tattoo"].filter(Boolean).join(" ");
  const results = await duckDuckGo(query, 10);
  const tokens = relevantNameTokens(name);
  const candidate = results.find((result) => {
    if (EXCLUDED_DISCOVERY_DOMAINS.some((excluded) => result.domain === excluded || result.domain.endsWith(`.${excluded}`) || result.domain.includes(excluded))) return false;
    const haystack = normalizeName(`${result.domain} ${result.title}`);
    return tokens.length ? tokens.some((token) => haystack.includes(token)) : /tattoo/.test(haystack);
  });
  return candidate?.url ? validatePublicHttpUrl(candidate.url) : null;
}

async function resolveGoogleBusinessName(rawUrl: string) {
  if (!rawUrl) return "";
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return "";
  }
  const host = url.hostname.toLowerCase();
  if (!(host === "maps.app.goo.gl" || host === "goo.gl" || host.endsWith("google.com"))) return "";
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (compatible; INKSIGHTS-Prospect-Intelligence/1.0)" },
      signal: AbortSignal.timeout(8_000),
    });
    const finalUrl = new URL(response.url);
    await response.body?.cancel();
    const placeMatch = finalUrl.pathname.match(/\/maps\/place\/([^/]+)/i);
    if (placeMatch?.[1]) return decodeURIComponent(placeMatch[1].replace(/\+/g, " ")).trim();
    return clean(finalUrl.searchParams.get("q") || finalUrl.searchParams.get("query") || "", 160);
  } catch {
    return "";
  }
}

async function resolveProspectInput(raw: z.infer<typeof scanSchema>) {
  let name = clean(raw.studio_name, 160);
  let website = raw.website ? validatePublicHttpUrl(raw.website) : "";
  let identityConfidence = name && website ? 0.98 : website ? 0.72 : 0.65;
  let matchMethod: ProspectIdentity["matchMethod"] = name && website ? "exact_website" : "manual_review";
  let discovery = "operator_supplied";

  if (!name && raw.gbp_url) {
    name = await resolveGoogleBusinessName(raw.gbp_url);
    if (name) {
      identityConfidence = Math.max(identityConfidence, 0.72);
      discovery = "google_business_url_resolution";
    }
  }

  if (!website && name) {
    website = await discoverWebsite(name, raw.address, raw.town, raw.postcode) || "";
    if (website) {
      identityConfidence = Math.max(identityConfidence, 0.8);
      matchMethod = "exact_website";
      discovery = "public_web_discovery";
    }
  }

  if (website && !name) {
    name = await inferNameFromWebsite(website);
    identityConfidence = Math.min(identityConfidence, 0.72);
    matchMethod = "manual_review";
    discovery = "website_name_inference";
  }

  if (!website) {
    throw new Error("A public studio website could not be resolved confidently. Add the website URL before running the automated scan.");
  }
  if (!name) throw new Error("A studio name could not be resolved confidently.");

  return {
    name,
    website,
    address: clean(raw.address, 300) || null,
    postcode: clean(raw.postcode, 24) || null,
    town: clean(raw.town, 120) || null,
    gbpUrl: clean(raw.gbp_url, 1000) || null,
    contactName: clean(raw.contact_name, 120) || null,
    contactEmail: clean(raw.contact_email, 254).toLowerCase() || null,
    identityConfidence,
    matchMethod,
    discovery,
  };
}

async function findCanonicalStudio(db: AdminClient, resolved: Awaited<ReturnType<typeof resolveProspectInput>>) {
  const domain = domainOf(resolved.website);
  const { data: websiteRows, error: websiteError } = await db
    .from("visibility_studios")
    .select("id,studio_name,website_url,trading_address,postcode,town,region,normalized_name,normalized_postcode,canonical_status,identity_confidence")
    .not("website_url", "is", null)
    .limit(5000);
  if (websiteError) throw new Error(`studio_lookup:${websiteError.message}`);
  const byWebsite = (websiteRows ?? []).find((row: StudioRecord) => domainOf(row.website_url) === domain);
  if (byWebsite) return { studio: byWebsite as StudioRecord, method: "exact_website" as const, confidence: 0.99 };

  const normalizedName = normalizeName(resolved.name);
  const normalizedPostcode = normalizePostcode(resolved.postcode || "");
  if (normalizedName && normalizedPostcode) {
    const { data, error } = await db
      .from("visibility_studios")
      .select("id,studio_name,website_url,trading_address,postcode,town,region,normalized_name,normalized_postcode,canonical_status,identity_confidence")
      .eq("normalized_name", normalizedName)
      .eq("normalized_postcode", normalizedPostcode)
      .limit(2);
    if (error) throw new Error(`studio_postcode_lookup:${error.message}`);
    if ((data ?? []).length === 1) return { studio: data[0] as StudioRecord, method: "exact_postcode_name" as const, confidence: 0.96 };
    if ((data ?? []).length > 1) throw new Error("Multiple canonical studios matched the supplied name/postcode. Manual identity review is required.");
  }
  return null;
}

async function ensureStudio(
  db: AdminClient,
  resolved: Awaited<ReturnType<typeof resolveProspectInput>>,
  canonical: Awaited<ReturnType<typeof findCanonicalStudio>>,
) {
  const now = new Date().toISOString();
  let studio: StudioRecord;
  let method = resolved.matchMethod;
  let confidence = resolved.identityConfidence;

  if (canonical) {
    studio = canonical.studio;
    method = canonical.method;
    confidence = Math.max(confidence, canonical.confidence);
  } else {
    const canonicalStatus = confidence >= 0.8 ? "observed" : "candidate";
    const { data, error } = await db
      .from("visibility_studios")
      .insert({
        studio_name: resolved.name,
        website_url: resolved.website,
        trading_address: resolved.address,
        postcode: resolved.postcode,
        town: resolved.town,
        region: "UK",
        artist_count: null,
        average_booking_value_pence: null,
        monthly_search_to_booking_rate: null,
        status: "collecting",
        canonical_status: canonicalStatus,
        normalized_name: normalizeName(resolved.name),
        normalized_postcode: normalizePostcode(resolved.postcode || "") || null,
        identity_confidence: confidence,
        first_observed_at: now,
        last_observed_at: now,
      })
      .select("id,studio_name,website_url,trading_address,postcode,town,region,normalized_name,normalized_postcode,canonical_status,identity_confidence")
      .single();
    if (error) {
      if (String(error.code) === "23502" && /artist_count/i.test(String(error.message))) {
        throw new Error("Prospect Intelligence database migration is required before unknown artist counts can be stored truthfully.");
      }
      throw new Error(`studio_create:${error.message}`);
    }
    studio = data as StudioRecord;
  }

  const { data: goldenStudio, error: goldenLookupError } = await db
    .from("studios")
    .select("id,name,website_url,primary_location")
    .eq("id", studio.id)
    .maybeSingle();
  if (goldenLookupError) throw new Error(`golden_studio_lookup:${goldenLookupError.message}`);
  if (!goldenStudio) {
    const slugBase = normalizeName(studio.studio_name).replace(/\s+/g, "-").slice(0, 48) || "studio";
    const { error } = await db.from("studios").insert({
      id: studio.id,
      name: studio.studio_name,
      slug: `prospect-${slugBase}-${studio.id.slice(0, 8)}`,
      website_url: studio.website_url,
      primary_location: [studio.town, studio.postcode].filter(Boolean).join(" ") || studio.trading_address,
      internal_validation: false,
    });
    if (error) throw new Error(`golden_studio_create:${error.message}`);
  }

  return { studio, method, confidence };
}

async function ensureCandidate(
  db: AdminClient,
  resolved: Awaited<ReturnType<typeof resolveProspectInput>>,
  studio: StudioRecord,
  method: ProspectIdentity["matchMethod"],
  confidence: number,
) {
  const { data: sourceRows, error: sourceError } = await db
    .from("studio_sources")
    .select("id,source_key")
    .in("source_key", ["inksights_prospect_research", "studio_website"]);
  if (sourceError) throw new Error(`source_registry:${sourceError.message}`);
  const source = (sourceRows ?? []).find((row: { source_key: string }) => row.source_key === "inksights_prospect_research")
    ?? (sourceRows ?? []).find((row: { source_key: string }) => row.source_key === "studio_website");
  if (!source) throw new Error("No approved studio research source is available.");

  const domain = domainOf(resolved.website);
  const sourceRecordKey = `prospect:${domain}`;
  const accepted = confidence >= 0.8 && method !== "manual_review";
  const candidatePayload = {
    discovery_method: resolved.discovery,
    gbp_url: resolved.gbpUrl,
    input_scope: "public_business_information",
    source_registry_fallback: source.source_key !== "inksights_prospect_research",
    identity_confidence: confidence,
  };

  const { data: candidate, error } = await db
    .from("studio_candidates")
    .upsert({
      source_id: source.id,
      source_record_key: sourceRecordKey,
      source_url: resolved.website,
      observed_at: new Date().toISOString(),
      name: resolved.name,
      normalized_name: normalizeName(resolved.name),
      address: resolved.address,
      postcode: resolved.postcode,
      normalized_postcode: normalizePostcode(resolved.postcode || "") || null,
      town: resolved.town,
      website_url: resolved.website,
      payload: candidatePayload,
      identity_status: accepted ? "matched" : "possible_match",
      matched_studio_id: studio.id,
      match_confidence: confidence,
      reviewed_at: accepted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "source_id,source_record_key" })
    .select("id,identity_status,matched_studio_id")
    .single();
  if (error) throw new Error(`candidate_upsert:${error.message}`);

  const observations = [
    ["identity", "studio_name", resolved.name],
    ["website", "website_url", resolved.website],
    resolved.address ? ["location", "address", resolved.address] : null,
    resolved.postcode ? ["location", "postcode", resolved.postcode] : null,
    resolved.gbpUrl ? ["other", "google_business_profile_url", resolved.gbpUrl] : null,
  ].filter(Boolean) as Array<[string, string, string]>;

  if (observations.length) {
    const { error: observationError } = await db.from("studio_source_observations").insert(
      observations.map(([observation_type, field_name, value]) => ({
        studio_id: studio.id,
        candidate_id: candidate.id,
        source_id: source.id,
        observed_at: new Date().toISOString(),
        observation_type,
        field_name,
        observed_value: { value },
        source_url: field_name === "website_url" ? resolved.website : resolved.gbpUrl || resolved.website,
        source_record_key: sourceRecordKey,
        confidence,
        raw_payload: {
          discovery_method: resolved.discovery,
          classification: field_name === "website_url" ? "OBSERVED" : "HYPOTHESIS",
        },
      })),
    );
    if (observationError) throw new Error(`candidate_observation:${observationError.message}`);
  }

  const { data: priorMatch, error: matchLookupError } = await db
    .from("studio_identity_matches")
    .select("id")
    .eq("candidate_id", candidate.id)
    .eq("studio_id", studio.id)
    .in("status", ["proposed", "accepted"])
    .limit(1)
    .maybeSingle();
  if (matchLookupError) throw new Error(`identity_match_lookup:${matchLookupError.message}`);
  if (!priorMatch) {
    const { error: matchError } = await db.from("studio_identity_matches").insert({
      candidate_id: candidate.id,
      studio_id: studio.id,
      match_method: method,
      match_score: confidence,
      evidence: { website: resolved.website, postcode: resolved.postcode, discovery_method: resolved.discovery },
      status: accepted ? "accepted" : "proposed",
      reviewed_at: accepted ? new Date().toISOString() : null,
    });
    if (matchError) throw new Error(`identity_match_insert:${matchError.message}`);
  }

  return candidate;
}

function buildProspectQueries(identity: ProspectIdentity) {
  const location = clean(identity.location || identity.postcode || identity.address || "", 120);
  return [...new Set([
    identity.name,
    location ? `tattoo studio ${location}` : "tattoo studio",
    location ? `tattoo artist ${location}` : "tattoo artist",
    location ? `black and grey tattoo ${location}` : "black and grey tattoo",
    location ? `realism tattoo ${location}` : "realism tattoo",
    location ? `custom tattoo ${location}` : "custom tattoo",
  ].map((value) => clean(value, 180)).filter(Boolean))].slice(0, 6);
}

async function runProspectSearchFallback(db: AdminClient, auditId: string, identity: ProspectIdentity) {
  const queries = buildProspectQueries(identity);
  const observedAt = new Date().toISOString();
  const studioDomain = domainOf(identity.websiteUrl);
  const observations: Array<{ query: string; position: number | null; url: string | null; results: WebSearchResult[] }> = [];
  const competitorCounts = new Map<string, { count: number; best: number }>();
  const failures: Array<{ query: string; error: string }> = [];

  for (const query of queries) {
    try {
      const results = await duckDuckGo(query, 10);
      const own = results.find((result) => result.domain === studioDomain) ?? null;
      observations.push({ query, position: own?.position ?? null, url: own?.url ?? null, results });
      for (const result of results) {
        if (!result.domain || result.domain === studioDomain) continue;
        const row = competitorCounts.get(result.domain) ?? { count: 0, best: 999 };
        row.count += 1;
        row.best = Math.min(row.best, result.position);
        competitorCounts.set(result.domain, row);
      }
    } catch (error) {
      failures.push({ query, error: error instanceof Error ? error.message : "search_failed" });
    }
  }
  if (!observations.length) return { status: "blocked", observations: 0, failures };

  const sourceHash = await sha256(JSON.stringify({ provider: "duckduckgo_html", queries, observedAt: observedAt.slice(0, 13) }));
  const { data: source, error: sourceError } = await db.from("audit_sources").insert({
    audit_id: auditId,
    source_type: "search_observation",
    source_name: "duckduckgo_html_fallback",
    source_uri: "https://html.duckduckgo.com/",
    source_hash: sourceHash,
    observed_at: observedAt,
    metadata: {
      provider: "duckduckgo_html",
      database: "duckduckgo_web_gb",
      query_count: observations.length,
      requested_query_count: queries.length,
      scope: "provider_specific_web_observation",
      demand_quantified: false,
    },
  }).select("id").single();
  if (sourceError) throw new Error(`fallback_source:${sourceError.message}`);

  const evidenceRows: Array<Record<string, unknown>> = observations.map((observation) => ({
    audit_id: auditId,
    source_id: source.id,
    evidence_type: "search_observation",
    title: `Search observation: ${observation.query}`,
    summary: observation.position == null
      ? "The studio was not observed in the retained DuckDuckGo web result set for this query."
      : `The studio was observed at provider position ${observation.position} in the retained DuckDuckGo web result set.`,
    classification: "OBSERVED",
    confidence: "HIGH",
    provenance: {
      query: observation.query,
      source_provider: "duckduckgo_html",
      database: "duckduckgo_web_gb",
      observed_position: observation.position,
      url: observation.url,
      domain: studioDomain,
      ranking_scope: "DuckDuckGo provider-specific web observation; not a Google ranking",
      demand_measured: false,
    },
    observed_at: observedAt,
  }));

  const competitors = [...competitorCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[1].best - b[1].best)
    .slice(0, 10);
  for (const [domain, stats] of competitors) {
    evidenceRows.push({
      audit_id: auditId,
      source_id: source.id,
      evidence_type: "competitor_observation",
      title: `Observed competing result domain: ${domain}`,
      summary: `${domain} appeared in ${stats.count} of ${observations.length} retained DuckDuckGo query samples; best observed provider position ${stats.best}.`,
      classification: "OBSERVED",
      confidence: "MEDIUM",
      provenance: {
        source_provider: "duckduckgo_html",
        database: "duckduckgo_web_gb",
        domain,
        query_overlap: stats.count,
        best_observed_position: stats.best,
        entity_status: "unverified_competing_domain",
      },
      observed_at: observedAt,
    });
  }
  const { error: evidenceError } = await db.from("audit_evidence").insert(evidenceRows);
  if (evidenceError) throw new Error(`fallback_evidence:${evidenceError.message}`);

  const { error: runError } = await db.from("audit_runs").insert({
    audit_id: auditId,
    engine_key: "prospect_search_fallback",
    status: failures.length ? "partial" : "success",
    completed_at: new Date().toISOString(),
    input_hash: await sha256(JSON.stringify({ queries, provider: "duckduckgo_html" })),
    input_summary: { provider: "duckduckgo_html", queries: queries.length },
    output_summary: {
      provider: "duckduckgo_html",
      observed_queries: observations.length,
      competing_domains: competitors.length,
      demand_quantified: false,
      failures,
    },
  });
  if (runError) throw new Error(`fallback_run:${runError.message}`);
  return { status: failures.length ? "partial" : "success", observations: observations.length, failures };
}

async function loadEvidence(db: AdminClient, auditId: string): Promise<ProspectEvidence[]> {
  const { data, error } = await db
    .from("audit_evidence")
    .select("id,evidence_type,title,summary,classification,confidence,provenance,observed_at")
    .eq("audit_id", auditId)
    .order("created_at");
  if (error) throw new Error(`evidence_load:${error.message}`);
  return (data ?? []) as ProspectEvidence[];
}

function opportunityScore(impact: number, confidence: Confidence) {
  const confidenceScore = confidence === "HIGH" ? 90 : confidence === "MEDIUM" ? 70 : 45;
  return Math.round(impact * 0.35 + confidenceScore * 0.25 + 70 * 0.15 + 70 * 0.15 + 80 * 0.10);
}

async function persistProspectIntelligence(
  db: AdminClient,
  auditId: string,
  identity: ProspectIdentity,
  evidence: ProspectEvidence[],
) {
  const findings = deriveProspectFindings(evidence);
  const score = scoreProspect(identity, evidence, findings);

  const { error: metricError } = await db.from("audit_metrics").insert({
    audit_id: auditId,
    metric_key: "prospect_acquisition_score",
    value_numeric: score.value,
    unit: "index_0_100",
    evidence_classification: "CALCULATED",
    confidence: score.confidence,
    measurement_status: "measured",
    calculation_version: score.version,
    provenance: {
      score_version: score.version,
      factors: score.factors,
      weights: score.weights,
      priority: score.priority,
      qualification_reason: score.qualificationReason,
      boundary: "Internal acquisition-priority index; not a revenue forecast or industry benchmark.",
    },
  });
  if (metricError) throw new Error(`prospect_score_insert:${metricError.message}`);

  const insertedFindings: Array<{ id: string; finding: DerivedProspectFinding }> = [];
  for (const finding of findings) {
    const { data, error } = await db.from("audit_findings").insert({
      audit_id: auditId,
      finding_key: finding.key,
      title: finding.title,
      statement: finding.statement,
      category: finding.category,
      classification: finding.classification,
      confidence: finding.confidence,
      materiality: finding.materiality,
      status: "validated",
    }).select("id").single();
    if (error) throw new Error(`prospect_finding:${error.message}`);
    insertedFindings.push({ id: data.id, finding });
    if (finding.evidenceIds.length) {
      const { error: linkError } = await db.from("audit_finding_evidence").insert(
        finding.evidenceIds.map((evidence_id) => ({ finding_id: data.id, evidence_id })),
      );
      if (linkError) throw new Error(`prospect_finding_link:${linkError.message}`);
    }
  }

  const actionable = findings.filter((finding) => finding.key !== "prospect_insufficient_material_public_finding");
  if (actionable.length) {
    const diagnosisStatement = "The bounded public evidence indicates one or more addressable acquisition-surface constraints. This is a prospecting diagnosis only; internal studio economics remain unknown until first-party evidence is supplied.";
    const { data: diagnosis, error: diagnosisError } = await db.from("audit_diagnoses").insert({
      audit_id: auditId,
      title: "Public acquisition surface contains evidence-backed constraints",
      statement: diagnosisStatement,
      constraint_type: "prospect_public_acquisition",
      confidence: score.confidence,
      rank: 1,
      resolution_state: "supported",
      constraint_family: "demand_visibility",
    }).select("id").single();
    if (diagnosisError) throw new Error(`prospect_diagnosis:${diagnosisError.message}`);

    const impact = score.factors.addressable_opportunity;
    const overall = opportunityScore(impact, score.confidence);
    const { data: opportunity, error: opportunityError } = await db.from("audit_opportunities").insert({
      audit_id: auditId,
      diagnosis_id: diagnosis.id,
      title: "Validate and resolve the strongest public acquisition constraint",
      mechanism: "Use the full Studio Intelligence Audit to confirm the public evidence, add first-party commercial context, and prioritise the smallest intervention justified by the combined evidence.",
      impact_score: impact,
      confidence_score: score.confidence === "HIGH" ? 90 : score.confidence === "MEDIUM" ? 70 : 45,
      ease_score: 70,
      speed_score: 70,
      cost_score: 20,
      overall_score: overall,
      impact_low: null,
      impact_high: null,
      impact_unit: null,
      evidence_classification: "OBSERVED",
      confidence: score.confidence,
      assumptions: {
        score_version: "prospect-opportunity-v1",
        items: [
          "No revenue value is assigned from public evidence alone.",
          "Observed search positions are provider-scoped and do not quantify monthly demand.",
          "A paid audit may confirm, reject or reprioritise the preliminary finding.",
        ],
      },
      value_classification: "modelled_opportunity",
    }).select("id").single();
    if (opportunityError) throw new Error(`prospect_opportunity:${opportunityError.message}`);

    const { error: recommendationError } = await db.from("audit_recommendations").insert({
      audit_id: auditId,
      opportunity_id: opportunity.id,
      title: "Offer the Studio Intelligence Audit around the evidenced constraint",
      rationale: "The prospecting scan has enough public evidence to justify a specific conversation, but not enough first-party evidence to claim revenue leakage or prescribe a full implementation.",
      action: "Lead outreach with the strongest observed finding and its source. Offer the £395 Studio Intelligence Audit as the route to validate the diagnosis, add internal commercial evidence and produce the prioritised 90-day plan.",
      owner_role: "inksights_acquisition",
      target_metric_key: "prospect_acquisition_score",
      priority: 1,
      sequence: 1,
      phase: "0-30",
    });
    if (recommendationError) throw new Error(`prospect_recommendation:${recommendationError.message}`);
  }

  const { error: scoreRunError } = await db.from("audit_runs").insert({
    audit_id: auditId,
    engine_key: "prospect_scoring",
    status: "success",
    completed_at: new Date().toISOString(),
    input_hash: await sha256(JSON.stringify({ evidence: evidence.map((item) => item.id), version: score.version })),
    input_summary: { evidence_records: evidence.length, findings: findings.length },
    output_summary: { score, finding_keys: findings.map((finding) => finding.key) },
  });
  if (scoreRunError) throw new Error(`prospect_score_run:${scoreRunError.message}`);

  return { findings, score };
}

async function ensureAudit(
  db: AdminClient,
  userId: string,
  studioId: string,
  candidateId: string,
  identity: ProspectIdentity,
  forceNew: boolean,
) {
  if (!forceNew) {
    const { data: latest, error } = await db
      .from("audits")
      .select("id,status,created_at,context")
      .eq("studio_id", studioId)
      .eq("audit_type", "prospect_intelligence")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`prospect_audit_lookup:${error.message}`);
    if (latest && latest.status !== "failed") {
      const age = Date.now() - new Date(latest.created_at).getTime();
      if (age >= 0 && age < 24 * 60 * 60 * 1000) return { audit: latest, reused: true };
    }
  }

  const { data, error } = await db.from("audits").insert({
    studio_id: studioId,
    audit_type: "prospect_intelligence",
    audit_version: "prospect-intelligence/1.0",
    mode: "A",
    status: "collecting",
    context: {
      workflow: "prospect_intelligence",
      candidate_id: candidateId,
      prospect_identity: identity,
      evidence_scope: "public_business_information",
      acquisition_score_version: "prospect-score-v1",
    },
    qa_status: "pending",
    report_status: "draft",
    created_by: userId,
    started_at: new Date().toISOString(),
  }).select("id,status,created_at,context").single();
  if (error) throw new Error(`prospect_audit_create:${error.message}`);
  return { audit: data, reused: false };
}

async function loadExistingProspectResult(db: AdminClient, auditId: string) {
  const [{ data: audit }, { data: metric }, { data: findings }] = await Promise.all([
    db.from("audits").select("id,studio_id,status,qa_status,report_status,context,created_at").eq("id", auditId).single(),
    db.from("audit_metrics").select("value_numeric,confidence,provenance").eq("audit_id", auditId).eq("metric_key", "prospect_acquisition_score").maybeSingle(),
    db.from("audit_findings").select("id,finding_key,title,statement,category,classification,confidence,materiality").eq("audit_id", auditId).like("finding_key", "prospect_%").order("created_at"),
  ]);
  return { audit, metric, findings: findings ?? [] };
}

async function scanProspect(db: AdminClient, userId: string, raw: unknown) {
  const parsed = scanSchema.parse(raw);
  const resolved = await resolveProspectInput(parsed);
  const canonical = await findCanonicalStudio(db, resolved);
  const ensured = await ensureStudio(db, resolved, canonical);
  const candidate = await ensureCandidate(db, resolved, ensured.studio, ensured.method, ensured.confidence);
  const identity: ProspectIdentity = {
    studioId: ensured.studio.id,
    candidateId: candidate.id,
    name: ensured.studio.studio_name,
    websiteUrl: ensured.studio.website_url || resolved.website,
    location: [ensured.studio.town, ensured.studio.postcode].filter(Boolean).join(" ") || ensured.studio.trading_address,
    postcode: ensured.studio.postcode,
    address: ensured.studio.trading_address,
    gbpUrl: resolved.gbpUrl,
    identityConfidence: ensured.confidence,
    matchMethod: ensured.method,
    contactName: resolved.contactName,
    contactEmail: resolved.contactEmail,
  };

  const { audit, reused } = await ensureAudit(db, userId, ensured.studio.id, candidate.id, identity, parsed.force_new);
  if (reused) return { ok: true, reused: true, ...(await loadExistingProspectResult(db, audit.id)) };

  const golden = await db.functions.invoke("golden-audit-run", { body: { audit_id: audit.id } });
  if (golden.error) {
    throw new Error(`golden_audit_run:${golden.error.message}`);
  }
  const goldenResult = golden.data as { status?: string; coverageWarnings?: string[] };
  if (goldenResult?.status === "failed") {
    throw new Error(`golden_audit_failed:${JSON.stringify(goldenResult).slice(0, 400)}`);
  }

  let evidence = await loadEvidence(db, audit.id);
  if (!evidence.some((item) => item.evidence_type === "search_observation")) {
    await runProspectSearchFallback(db, audit.id, identity);
    evidence = await loadEvidence(db, audit.id);
  }

  const intelligence = await persistProspectIntelligence(db, audit.id, identity, evidence);
  const nextContext = {
    ...(audit.context ?? {}),
    prospect_identity: identity,
    prospect_score: intelligence.score,
    evidence_records: evidence.length,
    prospect_finding_keys: intelligence.findings.map((finding) => finding.key),
  };
  const { error: contextError } = await db.from("audits").update({ context: nextContext }).eq("id", audit.id);
  if (contextError) throw new Error(`prospect_context_update:${contextError.message}`);

  return {
    ok: true,
    reused: false,
    auditId: audit.id,
    studioId: identity.studioId,
    candidateId: identity.candidateId,
    identity,
    score: intelligence.score,
    findings: intelligence.findings,
    goldenStatus: goldenResult?.status ?? "unknown",
    coverageWarnings: goldenResult?.coverageWarnings ?? [],
  };
}

async function publishSnapshot(db: AdminClient, raw: unknown) {
  const parsed = snapshotSchema.parse(raw);
  const { data: audit, error: auditError } = await db
    .from("audits")
    .select("id,studio_id,audit_type,context,status")
    .eq("id", parsed.audit_id)
    .eq("audit_type", "prospect_intelligence")
    .single();
  if (auditError) throw new Error("Prospect audit not found.");
  const identity = (audit.context?.prospect_identity ?? null) as ProspectIdentity | null;
  if (!identity) throw new Error("Prospect identity is unavailable.");

  const evidence = await loadEvidence(db, audit.id);
  const findings = deriveProspectFindings(evidence);
  const score = scoreProspect(identity, evidence, findings);
  const actionable = findings.filter((finding) => finding.key !== "prospect_insufficient_material_public_finding");
  if (identity.identityConfidence < 0.75) throw new Error("Identity confidence is too low for an external acquisition snapshot. Review the studio identity first.");
  if (score.priority === "HOLD" || !actionable.length) throw new Error("The evidence is not strong enough for outbound. Keep this prospect on hold rather than manufacture a problem.");

  const offer = getPublicOffer("studio-intelligence-audit");
  if (!offer) throw new Error("Canonical Studio Intelligence Audit offer configuration is unavailable.");
  const snapshot = buildAcquisitionSnapshot(identity, score, findings, evidence, { price: offer.price });
  const token = randomToken();
  const tokenHash = await sha256(token);
  const snapshotHash = await sha256(JSON.stringify(snapshot));

  await db
    .from("audit_runs")
    .update({ status: "blocked", error_code: "snapshot_superseded", error_message: "Superseded by a newer acquisition snapshot." })
    .eq("audit_id", audit.id)
    .eq("engine_key", "prospect_snapshot")
    .eq("status", "success");

  const { error } = await db.from("audit_runs").insert({
    audit_id: audit.id,
    engine_key: "prospect_snapshot",
    status: "success",
    completed_at: new Date().toISOString(),
    input_hash: snapshotHash,
    input_summary: {
      snapshot_schema: snapshot.schema,
      evidence_records: evidence.length,
      finding_count: snapshot.findings.length,
    },
    output_summary: {
      token_hash: tokenHash,
      snapshot_hash: snapshotHash,
      snapshot,
      published_at: new Date().toISOString(),
    },
  });
  if (error) throw new Error(`snapshot_store:${error.message}`);

  return {
    ok: true,
    auditId: audit.id,
    snapshot,
    snapshotPath: `/prospect/${token}`,
  };
}

async function handoffToCrm(db: AdminClient, raw: unknown) {
  const parsed = crmSchema.parse(raw);
  const { data: audit, error } = await db
    .from("audits")
    .select("id,studio_id,audit_type,context")
    .eq("id", parsed.audit_id)
    .eq("audit_type", "prospect_intelligence")
    .single();
  if (error) throw new Error("Prospect audit not found.");

  const score = audit.context?.prospect_score as { priority?: string } | undefined;
  if (!score || score.priority === "HOLD") throw new Error("This prospect is not qualified for CRM handoff.");

  const context = {
    ...(audit.context ?? {}),
    prospect_contact: {
      name: parsed.contact_name,
      email: parsed.contact_email.toLowerCase(),
      phone: parsed.phone || null,
      recorded_at: new Date().toISOString(),
    },
  };
  const { error: updateError } = await db.from("audits").update({ context }).eq("id", audit.id);
  if (updateError) throw new Error(`prospect_contact_store:${updateError.message}`);

  const result = await db.functions.invoke("hubspot-sync-v1", {
    body: { source_type: "prospect_audit", source_id: audit.id },
  });
  if (result.error) throw new Error(`prospect_hubspot_sync:${result.error.message}`);
  return { ok: true, auditId: audit.id, hubspot: result.data };
}

export async function requirePlatformAdmin(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new Response("Authentication required", { status: 401 });
  const token = match[1].trim();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as AdminClient;
  const { data, error } = await db.auth.getUser(token);
  if (error || !data?.user) throw new Response("Authentication required", { status: 401 });
  const { data: admin, error: adminError } = await db
    .from("platform_admins")
    .select("user_id,role,active")
    .eq("user_id", data.user.id)
    .eq("active", true)
    .in("role", ["owner", "admin"])
    .maybeSingle();
  if (adminError || !admin) throw new Response("Founder/admin access required", { status: 403 });
  return { db, user: data.user, admin };
}

export async function handleProspectInternalRequest(request: Request) {
  const { db, user } = await requirePlatformAdmin(request);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON payload." }, 400);
  }
  const action = clean(body.action, 80);
  try {
    if (action === "scan") return json(await scanProspect(db, user.id, body), 200);
    if (action === "publish_snapshot") return json(await publishSnapshot(db, body), 200);
    if (action === "crm_handoff") return json(await handoffToCrm(db, body), 200);
    return json({ ok: false, error: "Unsupported Prospect Intelligence action." }, 400);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ ok: false, error: error.issues[0]?.message || "Invalid input.", issues: error.issues }, 400);
    }
    const message = error instanceof Error ? error.message : "Prospect Intelligence failed.";
    console.error("Prospect Intelligence", { action, message });
    const status = /not found/i.test(message) ? 404
      : /not qualified|not strong enough|too low|could not be resolved|migration is required/i.test(message) ? 422
        : 500;
    return json({ ok: false, error: message }, status);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, no-store, max-age=0",
      "x-content-type-options": "nosniff",
    },
  });
}
