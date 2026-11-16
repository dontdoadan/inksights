// Short-lived proof that a public-tool result belongs to this browser tab.
// This contains only random opaque submission identifiers, no studio financial data.
const STORAGE_PREFIX = "inksights:pending-studio-claim:v1:";
const TTL_MS = 90 * 60 * 1000;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED = new Set(["pricing_benchmark", "visibility_scorecard"]);

function storageFor(toolKey) {
  if (!ALLOWED.has(toolKey) || typeof window === "undefined") return null;
  try { return window.sessionStorage; } catch { return null; }
}

export function storePendingStudioReceipt(toolKey, submissionId, submissionKey) {
  const storage = storageFor(toolKey);
  if (!storage || !UUID_V4.test(submissionId) || !UUID_V4.test(submissionKey)) return false;
  try {
    storage.setItem(STORAGE_PREFIX + toolKey, JSON.stringify({
      submissionId, submissionKey, expiresAt: Date.now() + TTL_MS,
    }));
    return true;
  } catch { return false; }
}

export function readPendingStudioReceipt(toolKey) {
  const storage = storageFor(toolKey);
  if (!storage) return null;
  try {
    const receipt = JSON.parse(storage.getItem(STORAGE_PREFIX + toolKey) || "null");
    if (!receipt || !UUID_V4.test(receipt.submissionId) ||
      !UUID_V4.test(receipt.submissionKey) ||
      !Number.isFinite(receipt.expiresAt) || Date.now() >= receipt.expiresAt) {
      storage.removeItem(STORAGE_PREFIX + toolKey);
      return null;
    }
    return { submissionId: receipt.submissionId, submissionKey: receipt.submissionKey };
  } catch {
    storage.removeItem(STORAGE_PREFIX + toolKey);
    return null;
  }
}

export function clearPendingStudioReceipt(toolKey) {
  const storage = storageFor(toolKey);
  if (storage) {
    try { storage.removeItem(STORAGE_PREFIX + toolKey); } catch { /* blocked tab storage */ }
  }
}
