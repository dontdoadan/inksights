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

type MetaWindow = Window & {
  fbq?: MetaPixelFunction;
  _fbq?: MetaPixelFunction;
};

const STORAGE_KEY = "inksight-consent-v1";
const META_PIXEL_ID = "1358457972311385";

export function readConsent(): InksightConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) || "null",
    ) as InksightConsent | null;
    if (!parsed || parsed.essential !== true) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(
  value: Omit<InksightConsent, "essential" | "updatedAt">,
): InksightConsent {
  const consent: InksightConsent = {
    essential: true,
    analytics: Boolean(value.analytics),
    marketing: Boolean(value.marketing),
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("inksight:consent-changed", { detail: consent }));
  if (consent.marketing) trackMetaPageView(window.location.pathname);
  return consent;
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
