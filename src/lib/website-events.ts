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

function acquisitionProperties(): EventProperties {
  if (typeof window === "undefined") return {};

  const key = "inksights-acquisition-session-v1";
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
    landing_path: window.location.pathname,
    landing_url: window.location.href,
    initial_referrer: document.referrer || null,
    initial_referrer_host: referrerHost,
    search_engine: searchEngine,
    is_organic_search: Boolean(searchEngine) && !params.get("gclid") && !params.get("gbraid") && !params.get("wbraid"),
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
  };

  window.sessionStorage.setItem(key, JSON.stringify(acquisition));
  return acquisition;
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
    page_path: window.location.pathname,
    referrer: document.referrer || null,
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
    trackGooglePageView(window.location.pathname);
  } else {
    trackGoogleEvent(eventName, {
      page_path: window.location.pathname,
      ...enrichedProperties,
    });
  }
}
