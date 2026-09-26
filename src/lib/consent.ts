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
};

export const CONSENT_CONSENT_STORAGE_KEY = "inksight-consent-v1";
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
  global.__inksightsGoogleAnalyticsLoaded = true;
}

export function trackGooglePageView(path: string) {
  if (typeof window === "undefined" || !readConsent()?.analytics) return;
  loadGoogleAnalytics();
  (window as GoogleWindow).gtag?.("event", "page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: path,
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
