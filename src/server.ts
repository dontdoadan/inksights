import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const CANONICAL_ORIGIN = "https://getinksights.co.uk";
const CANONICAL_HOST = "getinksights.co.uk";
const PUBLIC_SITEMAP_PATHS = [
  "/",
  "/solutions",
  "/tattoo-studio-growth",
  "/tattoo-studio-seo",
  "/tattoo-studio-revenue",
  "/tattoo-studio-booking",
  "/offers",
  "/offers/72-hour-visibility-fix",
  "/offers/visibility-watch",
  "/offers/revenue-audit",
  "/offers/booking-retention-engine",
  "/offers/founding-studio-pilot",
  "/studio-growth-check",
  "/studio-visibility-report",
  "/resources",
  "/tattoo-studio-visibility-scorecard",
  "/tattoo-studio-software",
  "/tools/tattoo-pain-chart-reality-check",
  "/guides/full-sleeve-cost-uk",
  "/guides/grey-line-healing-week-by-week",
  "/growth-model",
  "/case-studies",
  "/about",
  "/support",
  "/contact",
] as const;
const NOINDEX_PATH_PREFIXES = [
  "/auth",
  "/dashboard",
  "/mcp",
  "/.mcp",
  "/.lovable",
  "/.well-known",
] as const;

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function canonicalPath(pathname: string): string {
  if (pathname === "/index.html") return "/";
  if (pathname.endsWith(".html")) {
    const withoutExtension = pathname.slice(0, -5);
    return withoutExtension || "/";
  }
  return pathname;
}

// Preview/local hosts keep their own origin so the app is reachable before the
// canonical domain is live; only the path is normalised for them.
function isNonCanonicalPreviewHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".lovable.app") ||
    hostname.endsWith(".lovable.dev") ||
    hostname.endsWith(".lovableproject.com") ||
    hostname.endsWith(".vercel.app")
  );
}

function canonicalRequestUrl(request: Request): URL {
  const url = new URL(request.url);
  if (!isNonCanonicalPreviewHost(url.hostname)) {
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
  }
  url.pathname = canonicalPath(url.pathname);
  url.hash = "";
  return url;
}

function shouldRedirectToCanonical(requestUrl: URL, canonicalUrl: URL): boolean {
  return (
    requestUrl.protocol !== canonicalUrl.protocol ||
    requestUrl.hostname !== canonicalUrl.hostname ||
    requestUrl.port !== canonicalUrl.port ||
    requestUrl.pathname !== canonicalUrl.pathname
  );
}

function robotsResponse(): Response {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /auth",
    "Disallow: /dashboard",
    "Disallow: /mcp",
    "Disallow: /.mcp/",
    "Disallow: /.lovable/",
    "Disallow: /.well-known/",
    `Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "cache-control": "public, max-age=3600",
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

function sitemapResponse(): Response {
  const urls = PUBLIC_SITEMAP_PATHS.map(
    (path) => `  <url><loc>${CANONICAL_ORIGIN}${path}</loc></url>`,
  ).join("\n");
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "cache-control": "public, max-age=3600",
      "content-type": "application/xml; charset=utf-8",
    },
  });
}

function isNoindexPath(pathname: string): boolean {
  return NOINDEX_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function withSeoHeaders(response: Response, canonicalUrl: URL): Response {
  const headers = new Headers(response.headers);
  const contentType = headers.get("content-type") ?? "";

  if (contentType.includes("text/html")) {
    const canonical = new URL(canonicalUrl);
    canonical.search = "";
    headers.set("link", `<${canonical.toString()}>; rel="canonical"`);
    headers.set(
      "x-robots-tag",
      isNoindexPath(canonical.pathname) ? "noindex, nofollow" : "index, follow",
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const requestUrl = new URL(request.url);
    const canonicalUrl = canonicalRequestUrl(request);

    if (shouldRedirectToCanonical(requestUrl, canonicalUrl)) {
      return Response.redirect(canonicalUrl, 301);
    }

    if (canonicalUrl.pathname === "/robots.txt") return robotsResponse();
    if (canonicalUrl.pathname === "/sitemap.xml") return sitemapResponse();

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return withSeoHeaders(normalized, canonicalUrl);
    } catch (error) {
      console.error(error);
      return withSeoHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
        canonicalUrl,
      );
    }
  },
};
