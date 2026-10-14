import { readConsent, trackGoogleEvent, trackGooglePageView } from "./consent";

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

// Analytics records only route patterns and bounded marketing tags: never full URLs or access tokens.
function safeAnalyticsPath(pathname: string): string {
  if (/^\/(?:founding-studio|invite|invitations|prospect|report|reports)(?:\/|$)/i.test(pathname)) {
    return "/private-flow";
  }
  return pathname.split("/").map((part) =>
    /^[0-9a-f]{32,}$/i.test(part) || /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(part) || part.length > 48
      ? ":id"
      : part,
  ).join("/");
}

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
  const acquisition: EventProperties = {
    landing_path: safeAnalyticsPath(window.location.pathname),
    initial_referrer_host: referrerHost,
    search_engine: searchEngine,
    is_organic_search: Boolean(searchEngine) && !params.get("gclid") && !params.get("gbraid") && !params.get("wbraid"),
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
