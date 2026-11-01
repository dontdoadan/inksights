export type InksightConsent = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
};

type GoogleTagFunction = (...args: unknown[]) => void;

type MetaWindow = Window & {
  fbq?: MetaPixelFunction;
  _fbq?: MetaPixelFunction;
};

type GoogleWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: GoogleTagFunction;
  __inksightsGoogleAnalyticsLoaded?: boolean;
  __inksightsGoogleAnalyticsLoading?: boolean;
};

export const CONSENT_STORAGE_KEY = "inksight-consent-v1";
const META_PIXEL_ID = "1358457972311385";
export const GOOGLE_TAG_ID = "G-03QJZLEPW0";
export const GOOGLE_ANALYTICS_MEASUREMENT_ID = "G-V7SQ9SPYMH";

export function readConsent(): InksightConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) || "null") as InksightConsent | null;
    if (!parsed || parsed.essential !== true) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(value: Omit<InksightConsent, "essential" | "updatedAt">): InksightConsent {
  const previous = readConsent();
  const consent: InksightConsent = {
    essential: true,
    analytics: Boolean(value.analytics),
    marketing: Boolean(value.marketing),
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("inksight:consent-changed", { detail: consent }));

  if (consent.analytics) {
    loadGoogleAnalytics();
    if (!previous?.analytics) trackGooglePageView(window.location.pathname);
  } else {
    updateGoogleConsent(consent);
  }

  if (consent.marketing) trackMetaPageView(window.location.pathname);
  return consent;
}

function ensureGoogleTag() {
  if (typeof window === "undefined") return null;
  const global = window as GoogleWindow;

  if (!global.dataLayer) global.dataLayer = [];
  if (!global.gtag) {
    global.gtag = (...args: unknown[]) => {
      global.dataLayer?.push(args);
    };
    global.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }

  return global;
}

export function updateGoogleConsent(consent = readConsent()) {
  if (typeof window === "undefined") return;
  const global = window as GoogleWindow;
  if (!global.gtag) return;

  global.gtag("consent", "update", {
    analytics_storage: consent?.analytics ? "granted" : "denied",
    ad_storage: consent?.marketing ? "granted" : "denied",
    ad_user_data: consent?.marketing ? "granted" : "denied",
    ad_personalization: consent?.marketing ? "granted" : "denied",
  });
}

export function loadGoogleAnalytics() {
  if (typeof window === "undefined" || !readConsent()?.analytics) return;
  const global = ensureGoogleTag();
  if (!global) return;

  updateGoogleConsent();

  if (global.__inksightsGoogleAnalyticsLoaded || global.__inksightsGoogleAnalyticsLoading) return;

  // Queue configuration before the external library arrives. This preserves
  // GA4 event ordering while avoiding a third-party network request for visitors
  // who have not opted into analytics.
  global.gtag?.("js", new Date());
  global.gtag?.("config", GOOGLE_TAG_ID, { send_page_view: false });
  global.__inksightsGoogleAnalyticsLoading = true;

  const existing = document.querySelector<HTMLScriptElement>(
    `script[data-inksights-google-tag="${GOOGLE_TAG_ID}"]`,
  );

  if (existing) {
    global.__inksightsGoogleAnalyticsLoaded = true;
    global.__inksightsGoogleAnalyticsLoading = false;
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_TAG_ID)}`;
  script.dataset.inksightsGoogleTag = GOOGLE_TAG_ID;
  script.addEventListener("load", () => {
    global.__inksightsGoogleAnalyticsLoaded = true;
    global.__inksightsGoogleAnalyticsLoading = false;
    updateGoogleConsent();
  }, { once: true });
  script.addEventListener("error", () => {
    global.__inksightsGoogleAnalyticsLoading = false;
  }, { once: true });
  document.head.appendChild(script);
}

function safePagePath(path: string) {
  const pathname = path.split("?")[0].split("#")[0] || "/";
  const protectedPrefixes = ["report", "reports", "invite", "invitations", "prospect", "founding-studio"];
  if (protectedPrefixes.some((prefix) => pathname === `/${prefix}` || pathname.startsWith(`/${prefix}/`))) {
    return "/private-flow";
  }
  return pathname.split("/").map((part) =>
    part.length > 48 || /^[0-9a-f-]{32,}$/i.test(part) ? ":id" : part,
  ).join("/");
}

export function trackGooglePageView(path: string) {
  if (typeof window === "undefined" || !readConsent()?.analytics) return;
  loadGoogleAnalytics();
  const safePath = safePagePath(path);
  (window as GoogleWindow).gtag?.("event", "page_view", {
    page_title: document.title,
    page_location: new URL(safePath, window.location.origin).href,
    page_path: safePath,
  });
}

export function trackGoogleEvent(
  eventName: string,
  properties: Record<string, string | number | boolean | null | undefined> = {},
) {
  if (typeof window === "undefined" || !readConsent()?.analytics) return;
  loadGoogleAnalytics();

  const cleanProperties = Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );

  (window as GoogleWindow).gtag?.("event", eventName, cleanProperties);
}

export function loadMetaPixel() {
  if (typeof window === "undefined" || !readConsent()?.marketing) return;
  const global = window as MetaWindow;
  if (global.fbq) return;

  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  }) as MetaPixelFunction;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  global.fbq = fbq;
  global._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_GB/fbevents.js";
  document.head.appendChild(script);
  fbq("init", META_PIXEL_ID);
}

export function trackMetaPageView(path: string) {
  if (!readConsent()?.marketing) return;
  loadMetaPixel();
  (window as MetaWindow).fbq?.("track", "PageView", { path });
}
