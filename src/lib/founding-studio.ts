export function createFoundingInviteToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function foundingInviteUrl(token: string) {
  const origin = typeof window === "undefined" ? "https://getinksights.co.uk" : window.location.origin;
  return `${origin}/offers/studio-intelligence-audit?invite=${encodeURIComponent(token)}`;
}

export function formatMinorGbp(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value / 100);
}
