import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CookieConsent } from "@/components/cookie-consent";
import { readConsent, trackMetaPageView } from "@/lib/consent";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-deep px-4 text-ice">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">404</p>
        <h1 className="mt-4 font-display text-5xl font-black">Page not found</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          The page may have moved. Use the resource library or return to the INKSIGHT homepage.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink-deep">
            Go home
          </Link>
          <a
            href="/resources"
            className="rounded-full border border-border px-5 py-3 text-sm font-bold text-ice hover:border-mint hover:text-mint"
          >
            Browse resources
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-deep px-4 text-ice">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-black">This page did not load</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Try the page again or return to the homepage.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink-deep"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-border px-5 py-3 text-sm font-bold text-ice"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "INKSIGHT — Growth Systems for UK Tattoo Studios" },
      {
        name: "description",
        content:
          "INKSIGHT helps UK tattoo studios improve local visibility, enquiry conversion, booking protection, retention and post-session revenue.",
      },
      { property: "og:title", content: "INKSIGHT — Growth Systems for UK Tattoo Studios" },
      {
        property: "og:description",
        content:
          "Diagnose and improve the commercial systems behind tattoo studio visibility, bookings, retention and revenue.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://getinksight.co.uk/og/inksight-growth-systems.png" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: "https://getinksight.co.uk/og/inksight-growth-systems.png",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Hind:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <CookieConsent />
        <Toaster position="top-center" richColors />
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    import("@/integrations/supabase/client").then(({ supabase }) => {
      if (cancelled) return;
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      });
      (
        window as unknown as { __inksightAuthSub?: { unsubscribe: () => void } }
      ).__inksightAuthSub?.unsubscribe();
      (window as unknown as { __inksightAuthSub?: { unsubscribe: () => void } }).__inksightAuthSub =
        sub.subscription;
    });
    return () => {
      cancelled = true;
    };
  }, [queryClient, router]);

  useEffect(() => {
    if (typeof window === "undefined" || !readConsent()?.marketing) return;
    trackMetaPageView(pathname);
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
