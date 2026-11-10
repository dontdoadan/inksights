import { useEffect } from "react";
import { readConsent } from "@/lib/consent";

// This is the EU SalesIQ embed supplied by INKSIGHTS. Keep it in the shared
// site shell, but do not contact Zoho until visitors opt into analytics.
const WIDGET_URL =
  "https://salesiq.zoho.eu/widget?wc=siq96efc8ea8d5d1b2beb14150b8370d722e180c3cd319a7e9b17fe864eb6a494ea";

type SalesIQApi = {
  ready?: () => void;
  tracking?: { on?: () => void; off?: () => void };
  privacy?: { updateCookieConsent?: (categories: string[]) => void };
};
type SalesIQWindow = Window & {
  $zoho?: { salesiq?: SalesIQApi };
};

function syncSalesIQConsent() {
  const consented = Boolean(readConsent()?.analytics);
  const zohoWindow = window as SalesIQWindow;
  const api = zohoWindow.$zoho?.salesiq;
  const scriptExists = Boolean(document.getElementById("zsiqscript"));

  if (!consented) {
    api?.tracking?.off?.();
    api?.privacy?.updateCookieConsent?.([]);
    // A loaded third-party widget cannot reliably be torn down by removing
    // its script tag. Reload to ensure it does not continue running.
    if (scriptExists) window.location.reload();
    return;
  }

  if (scriptExists) {
    api?.tracking?.on?.();
    api?.privacy?.updateCookieConsent?.(["analytics", "performance"]);
    return;
  }

  // Equivalent to Zoho's official window.$zoho bootstrap, performed only
  // after analytics consent instead of injecting the script unconditionally.
  zohoWindow.$zoho = zohoWindow.$zoho || {};
  const salesiq = (zohoWindow.$zoho.salesiq =
    zohoWindow.$zoho.salesiq || { ready: function () {} });
  salesiq.ready = () => {
    if (readConsent()?.analytics) {
      salesiq.tracking?.on?.();
      salesiq.privacy?.updateCookieConsent?.(["analytics", "performance"]);
    } else {
      salesiq.tracking?.off?.();
      salesiq.privacy?.updateCookieConsent?.([]);
    }
  };

  const script = document.createElement("script");
  script.id = "zsiqscript";
  script.src = WIDGET_URL;
  script.defer = true;
  document.head.appendChild(script);
}

export function ZohoSalesIQ() {
  useEffect(() => {
    syncSalesIQConsent();
    window.addEventListener("inksight:consent-changed", syncSalesIQConsent);
    return () => window.removeEventListener("inksight:consent-changed", syncSalesIQConsent);
  }, []);

  return null;
}
