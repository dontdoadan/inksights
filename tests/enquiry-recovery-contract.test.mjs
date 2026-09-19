import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const stateSource = await readFile(
  new URL("../src/lib/enquiry-recovery-state.ts", import.meta.url),
  "utf8",
);
const outcomeSource = await readFile(
  new URL("../src/lib/deposit-outcome.server.ts", import.meta.url),
  "utf8",
);
const webhookSource = await readFile(
  new URL("../src/routes/api/public/stripe-webhook.ts", import.meta.url),
  "utf8",
);

test("Enquiry Recovery stop conditions are explicit", () => {
  for (const marker of [
    "message.replied",
    "consultation.booked",
    "deposit.paid",
    "lead.disqualified",
    "intervention.paused",
    "workflow.escalated",
    "terminal_failure",
  ]) {
    assert.match(stateSource, new RegExp(marker.replaceAll(".", "\\.")));
  }
  assert.match(stateSource, /followUpActive/);
});

test("deposit outcome path excludes sandbox money from commercial attribution", () => {
  assert.match(outcomeSource, /commercial_value_excluded/);
  assert.match(outcomeSource, /input\.testMode \? 0/);
  assert.match(outcomeSource, /sandbox_transaction/);
  assert.match(outcomeSource, /outcome\.recorded/);
  assert.match(outcomeSource, /attribution\.calculated/);
});

test("Stripe webhook is the provider-confirmed entry point", () => {
  assert.match(webhookSource, /checkout\.session\.completed/);
  assert.match(webhookSource, /stripe\.webhooks\.constructEvent/);
  assert.match(webhookSource, /deposit\.paid/);
});
