import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, useRouterState, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CookieConsent } from "@/components/cookie-consent";
import { supabase } from "@/integrations/supabase/client";
import { CONSENT_STORAGE_KEY, GOOGLE_TAG_ID, readConsent, trackMetaPageView } from "@/lib/consent";
import { trackWebsiteEvent } from "@/lib/website-events";
import { SiteEffects } from "@/components/interactive-home";

function NotFoundComponent() { return <div className="flex min-h-screen items-center justify-center bg-ink-deep px-4 text-ice"><div className="max-w-md text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">404</p><h1 className="mt-4 font-display text-5xl font-black">Page not found</h1><p className="mt-4 text-sm leading-relaxed text-muted-foreground">The page may have moved. Use the resource library or return to the INKSIGHTS homepage.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link to="/" className="rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink-deep">Go home</Link><a href="/resources" className="rounded-full border border-border px-5 py-3 text-sm font-bold text-ice hover:border-mint hover:text-mint">Browse resources</a></div></div></div>; }
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) { console.error(error); const router = useRouter(); useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]); return <div className="flex min-h-screen items-center justify-center bg-ink-deep px-4 text-ice"><div className="max-w-md text-center"><h1 className="font-display text-3xl font-black">This page did not load</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Try the page again or return to the homepage.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={() => { router.invalidate(); reset(); }} className="rounded-full bg-mint px-5 py-3 font-bold text-ink-deep">Try again</button><a href="/" className="rounded-full border border-border px-5 py-3 font-bold text-ice">Go home</a></div></div></div>; }
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({ head: () => ({ meta: [
  { charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" },
  { title: "INKSIGHTS | Tattoo Studio Growth & Intelligence" },
  { name: "description", content: "INKSIGHTS helps UK tattoo studios find and fix the commercial constraints affecting visibility, enquiries, bookings, capacity and revenue." },
  { property: "og:title", content: "INKSIGHTS | Tattoo Studio Growth & Intelligence" },
  { property: "og:description", content: "Growth intelligence and diagnostics built specifically for UK tattoo studio owners." },
  { property: "og:type", content: "website" },
  { property: "og:image", content: "https://getinksights.co.uk/brand/wordmark.webp" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:image", content: "https://getinksights.co.uk/brand/wordmark.webp" },
], links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }, { rel: "apple-touch-icon", href: "/apple-touch-icon.png" }, { rel: "stylesheet", href: appCss }, { rel: "preload", as: "font", type: "font/woff2", href: "/fonts/poppins-400.woff2", crossOrigin: "anonymous" }, { rel: "preload", as: "font", type: "font/woff2", href: "/fonts/poppins-700.woff2", crossOrigin: "anonymous" }] }), shellComponent: RootShell, component: RootComponent, notFoundComponent: NotFoundComponent, errorComponent: ErrorComponent });
function RootShell({ children }: { children: ReactNode }) {
  const googleConsentBootstrap = `
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });
    try {
      var savedConsent = JSON.parse(window.localStorage.getItem('${CONSENT_STORAGE_KEY}') || 'null');
      if (savedConsent && savedConsent.essential === true) {
        window.gtag('consent', 'update', {
          analytics_storage: savedConsent.analytics ? 'granted' : 'denied',
          ad_storage: savedConsent.marketing ? 'granted' : 'denied',
          ad_user_data: savedConsent.marketing ? 'granted' : 'denied',
          ad_personalization: savedConsent.marketing ? 'granted' : 'denied'
        });
      }
    } catch (error) {}
  `;

  const googleTagInit = `
    window.gtag('js', new Date());
    window.gtag('config', '${GOOGLE_TAG_ID}', { send_page_view: false });
  `;

  return (
    <html lang="en-GB">
      <head>
        <script dangerouslySetInnerHTML={{ __html: googleConsentBootstrap }} />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`} data-inksights-google-tag={GOOGLE_TAG_ID} />
        <script dangerouslySetInnerHTML={{ __html: googleTagInit }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <SiteEffects />
        <CookieConsent />
        <Toaster position="top-center" richColors />
        <Scripts />
      </body>
    </html>
  );
}
function RootComponent() { const { queryClient } = Route.useRouteContext(); const router = useRouter(); const pathname = useRouterState({ select: (state) => state.location.pathname }); useEffect(() => { if (typeof window === "undefined") return; const { data: sub } = supabase.auth.onAuthStateChange((event) => { if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return; router.invalidate(); if (event !== "SIGNED_OUT") queryClient.invalidateQueries(); }); const globalWindow = window as unknown as { __inksightsAuthSub?: { unsubscribe: () => void } }; globalWindow.__inksightsAuthSub?.unsubscribe(); globalWindow.__inksightsAuthSub = sub.subscription; return () => { sub.subscription.unsubscribe(); if (globalWindow.__inksightsAuthSub === sub.subscription) delete globalWindow.__inksightsAuthSub; }; }, [queryClient, router]); useEffect(() => {
    if (typeof window === "undefined") return;
    if (readConsent()?.marketing) trackMetaPageView(pathname);
    trackWebsiteEvent("page_view");
  }, [pathname]); return <QueryClientProvider client={queryClient}><Outlet /></QueryClientProvider>; }
