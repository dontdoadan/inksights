/**
 * Public analytics must never transmit private route identifiers, invitation
 * tokens, Stripe session IDs, query strings or URL fragments.
 */
export function safeAnalyticsPath(pathname: string): string {
  const path = pathname.split("?")[0].split("#")[0];
  if (/^\/(?:founding-studio|invite|invitations|prospect|report|reports)(?:\/|$)/i.test(path)) {
    return "/private-flow";
  }
  return path.split("/").map((part) =>
    /^[0-9a-f]{32,}$/i.test(part) || /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(part) || part.length > 48
      ? ":id"
      : part,
  ).join("/");
}
