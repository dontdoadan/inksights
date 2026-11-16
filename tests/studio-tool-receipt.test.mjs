import test from "node:test";
import assert from "node:assert/strict";
import { readPendingStudioReceipt, storePendingStudioReceipt, clearPendingStudioReceipt } from "../src/lib/studio-tool-receipt.mjs";

const id = "6f8755aa-7b98-4d2d-9a9e-6319a44c5472";
const key = "130ca855-64c6-4353-8cf7-a8825f2ce985";

function fakeTab() {
  const values = new Map();
  return {
    getItem(k) { return values.get(k) ?? null; },
    setItem(k, v) { values.set(k, v); },
    removeItem(k) { values.delete(k); },
    values,
  };
}
test("short-lived receipts survive sign-in navigation in the same tab", () => {
  const prior = globalThis.window;
  globalThis.window = { sessionStorage: fakeTab() };
  try {
    assert.equal(storePendingStudioReceipt("pricing_benchmark", id, key), true);
    assert.deepEqual(readPendingStudioReceipt("pricing_benchmark"), { submissionId:id,submissionKey:key });
    assert.equal(readPendingStudioReceipt("visibility_scorecard"), null);
    clearPendingStudioReceipt("pricing_benchmark");
    assert.equal(readPendingStudioReceipt("pricing_benchmark"), null);
  } finally { globalThis.window = prior; }
});
test("only supported tools and valid random UUIDv4 receipts can be stored", () => {
  const prior = globalThis.window;
  globalThis.window = { sessionStorage: fakeTab() };
  try {
    assert.equal(storePendingStudioReceipt("revenue_audit", id, key), false);
    assert.equal(storePendingStudioReceipt("pricing_benchmark", "bad", key), false);
    assert.equal(storePendingStudioReceipt("pricing_benchmark", id, "bad"), false);
    assert.equal(readPendingStudioReceipt("pricing_benchmark"), null);
  } finally { globalThis.window = prior; }
});
test("expired and corrupted receipts are rejected and deleted", () => {
  const prior = globalThis.window;
  globalThis.window = { sessionStorage: fakeTab() };
  try {
    const name = "inksights:pending-studio-claim:v1:visibility_scorecard";
    globalThis.window.sessionStorage.setItem(name, JSON.stringify({
      submissionId:id,submissionKey:key,expiresAt: Date.now()-1,
    }));
    assert.equal(readPendingStudioReceipt("visibility_scorecard"),null);
    assert.equal(globalThis.window.sessionStorage.getItem(name),null);
    globalThis.window.sessionStorage.setItem(name,"not-json");
    assert.equal(readPendingStudioReceipt("visibility_scorecard"),null);
  } finally { globalThis.window = prior; }
});
test("no global window means no storage use during SSR", () => {
  const prior = globalThis.window;
  delete globalThis.window;
  try {
    assert.equal(readPendingStudioReceipt("pricing_benchmark"),null);
    assert.equal(storePendingStudioReceipt("pricing_benchmark",id,key),false);
  } finally { globalThis.window = prior; }
});
