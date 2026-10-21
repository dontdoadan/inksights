/**
 * Pure, versioned public pricing intake policy. No DB, request or network dependencies.
 * Prices are supplied in GBP and kept as numbers (never arbitrary text).
 */
export const CONSENT_VERSION = "2026-10-tool-v1";
export const DATASET_VERSION = "2026-09-05-initial";
export const PRICE_BANDS = Object.freeze({
  uk: [[80,200],[300,600],[550,1100],[80,180],[50,100]],
  london: [[100,280],[400,800],[750,1500],[120,250],[80,150]],
});
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validatePricingSubmission(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return { ok:false, error:"Invalid input." };
  if (!Object.hasOwn(PRICE_BANDS, data.region)) return { ok:false, error:"Invalid reference market." };
  if (!Array.isArray(data.prices) || data.prices.length !== 5) return { ok:false, error:"Exactly five price fields are required." };
  if (!Number.isInteger(data.leadTimeWeeks) || data.leadTimeWeeks < 1 || data.leadTimeWeeks > 26) return { ok:false, error:"Invalid booking lead time." };
  if (typeof data.submissionKey !== "string" || !UUID_V4.test(data.submissionKey)) return { ok:false, error:"Invalid submission identifier." };
  if (data.consentVersion !== CONSENT_VERSION || data.dataNoticeAccepted !== true) return { ok:false, error:"Data use acknowledgement is required." };
  const validPrice = (v) => v === null || (typeof v === "number" && Number.isFinite(v) && v > 0 && v <= 50000 && Math.abs(Math.round(v * 100) - v * 100) < 1e-7);
  if (!data.prices.every(validPrice) || data.prices.every(v => v === null)) return { ok:false, error:"Enter at least one valid GBP price (max £50,000; two decimal places)." };
  const prices = data.prices.map(v => v === null ? null : Math.round(v * 100) / 100);
  const normalized = { region:data.region, prices, lead_time_weeks:data.leadTimeWeeks };
  const bands = PRICE_BANDS[data.region];
  const positions = prices.map((price,i) => price === null ? null : price < bands[i][0] ? "below" : price > bands[i][1] ? "above" : "within");
  const result = {
    positions,
    below:positions.filter(v => v === "below").length,
    above:positions.filter(v => v === "above").length,
    lead_time_signal:data.leadTimeWeeks >= 6 ? "strong" : data.leadTimeWeeks >= 4 ? "balanced" : "check",
    reference_bands:bands,
    dataset_version:DATASET_VERSION,
  };
  return { ok:true, submissionKey:data.submissionKey, normalized, result };
}

/**
 * An idempotency key may be replayed only with the exact same canonical input.
 * A conflicting replay must not reveal or overwrite a prior visitor's result.
 */
export function isSamePricingSubmission(existing, incoming) {
  if (!existing || !incoming || existing.consent_version !== CONSENT_VERSION) return false;
  const a = existing.normalized_inputs;
  const b = incoming.normalized;
  return Boolean(a && b && a.region === b.region && a.lead_time_weeks === b.lead_time_weeks &&
    Array.isArray(a.prices) && a.prices.length === 5 &&
    a.prices.every((value,i) => value === b.prices[i]));
}
