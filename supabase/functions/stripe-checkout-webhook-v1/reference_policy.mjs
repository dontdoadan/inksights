/**
 * Never trust a Payment Link's client_reference_id alone as proof that a
 * paid customer is the original Growth Check submitter.
 */
export function isGrowthCheckId(value) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function verifiedGrowthCheckReference(reference, checkoutEmail, submittedEmail) {
  if (!isGrowthCheckId(reference)) return null;
  if (typeof checkoutEmail !== "string" || typeof submittedEmail !== "string") return null;
  const paidEmail = checkoutEmail.trim().toLowerCase();
  const originalEmail = submittedEmail.trim().toLowerCase();
  return paidEmail && originalEmail && paidEmail === originalEmail ? reference : null;
}
