const ALLOWED_ORIGINS = new Set([
  "https://getinksights.co.uk",
  "https://www.getinksights.co.uk",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
]);

export function clean(value, max = 500) {
  return String(value ?? "").trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max);
}

export function isAllowedOrigin(origin) {
  return origin == null || origin === "" || ALLOWED_ORIGINS.has(origin);
}

export function allowedCorsOrigin(origin) {
  return origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://getinksights.co.uk";
}

export function validateContactPayload(body) {
  if (clean(body?.company_url, 200)) return { ok: true, honeypot: true };
  const name = clean(body?.name, 120);
  const email = clean(body?.email, 254).toLowerCase();
  const studio_name = clean(body?.studio_name, 180) || null;
  const location = clean(body?.location, 180) || null;
  const phone = clean(body?.phone, 80) || null;
  const website = clean(body?.website, 500) || null;
  const topic = clean(body?.topic, 80);
  const message = clean(body?.message, 3000);
  const consent = body?.consent === true;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !validEmail || !topic || message.length < 10 || !consent) {
    return { ok: false, error: "Name, valid email, topic, message and consent are required." };
  }
  return { ok: true, value: { name, email, studio_name, location, phone, website, topic, message, consent } };
}
