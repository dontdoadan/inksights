const EXACT_ORIGINS = new Set([
  "https://getinksights.co.uk",
  "https://www.getinksights.co.uk",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
]);

const VERCEL_PREVIEW_HOST = /^inksight-main(?:-[a-z0-9-]+)?-inksights\.vercel\.app$/i;

function isInksightsVercelPreview(origin) {
  try {
    const url = new URL(origin);
    return url.protocol === "https:" && url.port === "" && VERCEL_PREVIEW_HOST.test(url.hostname);
  } catch {
    return false;
  }
}

export function isAllowedOrigin(origin) {
  return origin == null || origin === "" || EXACT_ORIGINS.has(origin) || isInksightsVercelPreview(origin);
}

export function allowedCorsOrigin(origin) {
  return origin && isAllowedOrigin(origin) ? origin : "https://getinksights.co.uk";
}
