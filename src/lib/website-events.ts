import { readConsent } from "./consent";

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

export function trackWebsiteEvent(
  eventName: WebsiteEventName,
  properties: Record<string, string | number | boolean | null | undefined> = {},
) {
  if (typeof window === "undefined" || !readConsent()?.analytics) return;
  const body = JSON.stringify({
    event_name: eventName,
    page_path: window.location.pathname,
    referrer: document.referrer || null,
    session_id: sessionId(),
    properties,
  });

  void fetch(EVENT_URL, {
    method: "POST",
    mode: "cors",
    keepalive: true,
    headers: { "content-type": "text/plain;charset=UTF-8" },
    body,
  }).catch(() => undefined);
}
