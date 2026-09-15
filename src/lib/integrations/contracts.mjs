const MAX_RETRY_MINUTES = 60;

export function isOfferCheckoutReady({
  approvalState,
  lifecycleState,
  mappingStatus,
  externalPriceId,
}) {
  return (
    approvalState === "approved" &&
    lifecycleState === "active" &&
    mappingStatus === "verified" &&
    typeof externalPriceId === "string" &&
    externalPriceId.startsWith("price_")
  );
}

export function providerEventKey(provider, environment, externalEventId) {
  for (const [label, value] of Object.entries({ provider, environment, externalEventId })) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new TypeError(`${label} must be a non-empty string`);
    }
  }

  return `${provider.trim().toLowerCase()}:${environment.trim().toLowerCase()}:${externalEventId.trim()}`;
}

export function normaliseDomain(input) {
  if (typeof input !== "string" || input.trim() === "") return null;

  const trimmed = input.trim();
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(candidate).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function nextRetryAt(attemptNumber, from = new Date()) {
  const attempt = Number.isFinite(attemptNumber) ? Math.max(1, Math.floor(attemptNumber)) : 1;
  const delayMinutes = Math.min(MAX_RETRY_MINUTES, 2 ** (attempt - 1));
  return new Date(from.getTime() + delayMinutes * 60_000);
}
