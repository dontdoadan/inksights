import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const CANONICAL_HOST = "getinksights.co.uk";
const LEGACY_REDIRECTS = new Map<string, string>([
  ["/guides/full-sleeve-cost-uk", "/resources"],
  ["/guides/grey-line-healing-week-by-week", "/resources"],
  ["/tools/tattoo-pain-chart-reality-check", "/resources"],
]);
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
    hostname.endsWith(".vercel.app") ||
    hostname.endsWith(".lovable.app") ||
    hostname.endsWith(".lovable.dev") ||
    hostname.endsWith(".lovableproject.com")
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

    const legacyRedirectPath = LEGACY_REDIRECTS.get(canonicalUrl.pathname);
    if (legacyRedirectPath) {
      const redirectUrl = new URL(legacyRedirectPath, canonicalUrl);
      return Response.redirect(redirectUrl, 301);
    }

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
