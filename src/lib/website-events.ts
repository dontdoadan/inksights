import { readConsent, trackGoogleEvent, trackGooglePageView } from "./consent";
import { safeAnalyticsPath } from "./analytics-path";

export type WebsiteEventName =
  | "page_view"
  | "cta_clicked"
  | "diagnostic_started"
  | "diagnostic_completed"
  | "contact_started"
  | "contact_submitted"
  | "checkout_started"
  | "payment_completed"
  | "form_error"
  | "checkout_error";

type EventProperty = string | number | boolean | null | undefined;
type EventProperties = Record<string, EventProperty>;

const EVENT_URL = "https://ukaxsqwnkoqbbsufpzga.supabase.co/functions/v1/public-web-event";

function sessionId() {
  if (typeof window === "undefined") return null;
  const key = "inksights-analytics-session-v1";
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const value = crypto.randomUUID();
  window.sessionStorage.setItem(key, value);
  return value;
}

function classifySearchReferrer(hostname: string | null) {
  if (!hostname) return null;
  const host = hostname.toLowerCase();
  if (host === "google.com" || host.endsWith(".google.com")) return "google";
  if (host === "bing.com" || host.endsWith(".bing.com")) return "bing";
  if (host === "duckduckgo.com" || host.endsWith(".duckduckgo.com")) return "duckduckgo";
  if (host === "search.yahoo.com" || host.endsWith(".search.yahoo.com")) return "yahoo";
  if (host === "ecosia.org" || host.endsWith(".ecosia.org")) return "ecosia";
  return null;
}

// Only independently observed assistant referrer hosts count as AI referrals.
// A UTM such as ?utm_source=chatgpt.com alone is not proof that an assistant sent a visitor.
function classifyAssistantReferrer(hostname: string | null) {
  if (!hostname) return null;
  const host = hostname.toLowerCase();
  if (host === "chatgpt.com" || host === "www.chatgpt.com" || host === "chat.openai.com") return "chatgpt";
  if (host === "www.perplexity.ai" || host === "perplexity.ai") return "perplexity";
  if (host === "gemini.google.com") return "gemini";
  if (host === "claude.ai" || host === "www.claude.ai") return "claude";
  if (host === "copilot.microsoft.com") return "copilot";
  if (host === "poe.com") return "poe";
  if (host === "you.com" || host === "www.you.com") return "you";
  return null;
}

function classifyAcquisitionChannel(
  hostname: string | null,
  searchEngine: string | null,
  aiAssistant: string | null,
  params: URLSearchParams,
) {
  const medium = (params.get("utm_medium") || "").toLowerCase();
  const hasAdClickId = ["gclid", "gbraid", "wbraid", "msclkid"].some((key) => params.has(key));
  const paidMedium = /^(cpc|ppc|paid|paid_search|paid_social|display|retargeting)$/.test(medium);
  if (hasAdClickId || paidMedium) return "paid";
  if (aiAssistant) return "ai_assistant_referral";
  if (searchEngine) return "organic_search";
  const host = hostname?.toLowerCase() || "";
  if (!host || host === "getinksights.co.uk" || host === "www.getinksights.co.uk" || host.endsWith(".vercel.app") || host === "localhost") return "direct_unknown";
  return "external_referral";
}

// Shared route redaction prevents private identifiers from reaching Supabase or GA4.
function safeMarketingTag(value: string | null): string | null {
  if (!value || value.length > 100 || !/^[a-z0-9 ._-]+$/i.test(value)) return null;
  return value;
}

function acquisitionProperties(): EventProperties {
  if (typeof window === "undefined") return {};

  const key = "inksights-acquisition-session-v2";
  const existing = window.sessionStorage.getItem(key);
  if (existing) {
    try {
      return JSON.parse(existing) as EventProperties;
    } catch {
      window.sessionStorage.removeItem(key);
    }
  }

  const params = new URLSearchParams(window.location.search);
  let referrerHost: string | null = null;
  try {
    referrerHost = document.referrer ? new URL(document.referrer).hostname : null;
  } catch {
    referrerHost = null;
  }

  const searchEngine = classifySearchReferrer(referrerHost);
  const aiAssistant = classifyAssistantReferrer(referrerHost);
  const channel = classifyAcquisitionChannel(referrerHost, searchEngine, aiAssistant, params);
  const acquisition: EventProperties = {
    landing_path: safeAnalyticsPath(window.location.pathname),
    initial_referrer_host: referrerHost,
    search_engine: searchEngine,
    ai_assistant_referrer: aiAssistant,
    acquisition_channel: channel,
    is_organic_search: channel === "organic_search",
    utm_source: safeMarketingTag(params.get("utm_source")),
    utm_medium: safeMarketingTag(params.get("utm_medium")),
    utm_campaign: safeMarketingTag(params.get("utm_campaign")),
    utm_content: safeMarketingTag(params.get("utm_content")),
    utm_term: safeMarketingTag(params.get("utm_term")),
  };

  window.sessionStorage.setItem(key, JSON.stringify(acquisition));
  return acquisition;
}

function referrerHostForAnalytics(): string | null {
  try {
    return document.referrer ? new URL(document.referrer).hostname : null;
  } catch {
    return null;
  }
}

export function trackWebsiteEvent(
  eventName: WebsiteEventName,
  properties: EventProperties = {},
) {
  if (typeof window === "undefined" || !readConsent()?.analytics) return;

  const acquisition = acquisitionProperties();
  const enrichedProperties = {
    ...acquisition,
    ...properties,
  };

  const body = JSON.stringify({
    event_name: eventName,
    page_path: safeAnalyticsPath(window.location.pathname),
    referrer: referrerHostForAnalytics(),
    session_id: sessionId(),
    properties: enrichedProperties,
  });

  void fetch(EVENT_URL, {
    method: "POST",
    mode: "cors",
    keepalive: true,
    headers: { "content-type": "text/plain;charset=UTF-8" },
    body,
  }).catch(() => undefined);

  if (eventName === "page_view") {
    trackGooglePageView(safeAnalyticsPath(window.location.pathname));
  } else {
    trackGoogleEvent(eventName, {
      page_path: safeAnalyticsPath(window.location.pathname),
      ...enrichedProperties,
    });
  }
}
