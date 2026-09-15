export const SUPPORTED_SOURCE_TYPES = new Set(["transaction_ledger"]);

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const segment = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = segment + "=".repeat((4 - (segment.length % 4)) % 4);
    const json = decodeURIComponent(
      Array.from(atob(padded), (char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""),
    );
    const value = JSON.parse(json);
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
}

function configuredServiceSecrets(): string[] {
  const values = [
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    Deno.env.get("SUPABASE_SECRET_KEY"),
  ].filter((value): value is string => Boolean(value));
  return [...new Set(values)];
}

export function isServiceRoleAuthorization(value: string | null): boolean {
  if (!value) return false;
  const match = value.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const token = match[1].trim();
  if (configuredServiceSecrets().includes(token)) return true;
  return decodeJwtPayload(token)?.role === "service_role";
}

export function validateUuid(value: unknown, field: string): string {
  const text = String(value ?? "").trim().toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(text)) {
    throw new Error(`invalid_${field}`);
  }
  return text;
}

export function validateSourceType(value: unknown): string {
  const type = String(value ?? "").trim();
  if (!SUPPORTED_SOURCE_TYPES.has(type)) throw new Error("unsupported_source_type");
  return type;
}

export function validateStoragePath(path: unknown, studioId: string, auditId: string): string {
  const value = String(path ?? "").trim();
  const prefix = `studio/${studioId}/audit/${auditId}/`;
  if (!value.startsWith(prefix) || value === prefix || value.includes("..") || /^https?:\/\//i.test(value)) {
    throw new Error("invalid_storage_path");
  }
  return value;
}
