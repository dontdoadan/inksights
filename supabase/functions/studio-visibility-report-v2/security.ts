const IPV4_MAPPED_PREFIX = "::ffff:";

function parseIPv4(value: string): number[] | null {
  const parts = value.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d+$/.test(part))) return null;
  const octets = parts.map(Number);
  return octets.every((octet) => octet >= 0 && octet <= 255) ? octets : null;
}

function isPrivateIPv4(value: string): boolean {
  const octets = parseIPv4(value);
  if (!octets) return false;
  const [a, b] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function normaliseIPv6(value: string): string {
  return value.replace(/^\[/, "").replace(/\]$/, "").toLowerCase();
}

function isPrivateIPv6(value: string): boolean {
  const host = normaliseIPv6(value);
  if (!host.includes(":")) return false;

  if (host.startsWith(IPV4_MAPPED_PREFIX)) {
    const mapped = host.slice(IPV4_MAPPED_PREFIX.length);
    return isPrivateIPv4(mapped);
  }

  const first = host.split(":")[0] || "0";
  const firstWord = Number.parseInt(first, 16);
  if (!Number.isFinite(firstWord)) return true;

  return (
    host === "::" ||
    host === "::1" ||
    (firstWord & 0xfe00) === 0xfc00 ||
    (firstWord & 0xffc0) === 0xfe80 ||
    (firstWord & 0xff00) === 0xff00
  );
}

export function isBlockedAddress(value: string): boolean {
  return isPrivateIPv4(value) || isPrivateIPv6(value);
}

export function validatePublicUrl(value: unknown): URL {
  const raw = String(value ?? "").trim().replace(/\s+/g, " ").slice(0, 500);
  const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  const hostname = normaliseIPv6(url.hostname);

  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Please enter a public website URL.");
  if (url.username || url.password) throw new Error("Please enter a public website URL.");
  if (url.port && !["80", "443"].includes(url.port)) throw new Error("Please enter a public website URL.");
  if (!hostname || hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new Error("Please enter a public website URL.");
  }
  if (isBlockedAddress(hostname)) throw new Error("Please enter a public website URL.");

  return url;
}

export async function assertPublicNetworkTarget(url: URL): Promise<void> {
  const hostname = normaliseIPv6(url.hostname);
  if (isBlockedAddress(hostname)) throw new Error("Please enter a public website URL.");

  if (hostname.includes(":")) return;
  if (/^\d+(?:\.\d+){3}$/.test(hostname)) return;

  const records: string[] = [];
  for (const type of ["A", "AAAA"] as const) {
    try {
      records.push(...await Deno.resolveDns(hostname, type));
    } catch {
      // Continue so that a hostname with only one address family can still resolve.
    }
  }

  if (!records.length || records.some(isBlockedAddress)) {
    throw new Error("Please enter a public website URL.");
  }
}
