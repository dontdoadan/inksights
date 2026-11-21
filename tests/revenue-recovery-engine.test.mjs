import test from "node:test";
import assert from "node:assert/strict";
import { analyseRevenueRecovery } from "../src/lib/tool-factory/revenue-recovery-engine.ts";

const asOf = "2026-11-21T12:00:00.000Z";

test("detects aged unconverted enquiries and preserves quoted value as observed", () => {
  const result = analyseRevenueRecovery(
    {
      clients: [{
        id: "client-1",
        sourceSystem: "csv",
        sourceRecordId: "client-1",
        marketingPermissionState: "permitted",
      }],
      enquiries: [{
        id: "enquiry-1",
        sourceSystem: "csv",
        sourceRecordId: "enquiry-1",
        clientId: "client-1",
        createdAt: "2026-11-01T10:00:00.000Z",
        status: "quoted",
        quotedValueMinor: 45000,
        hasContactRoute: true,
      }],
    },
    { asOf },
  );

  assert.equal(result.opportunities.length, 1);
  assert.equal(result.opportunities[0].type, "unconverted_enquiry");
  assert.equal(result.opportunities[0].valueBaseMinor, 45000);
  assert.equal(result.opportunities[0].valueClassification, "observed");
  assert.equal(result.opportunities[0].actionability, "actionable");
});

test("suppressed clients are never marked actionable for recovery outreach", () => {
  const result = analyseRevenueRecovery(
    {
      clients: [{
        id: "client-2",
        sourceSystem: "csv",
        sourceRecordId: "client-2",
        marketingPermissionState: "suppressed",
      }],
      enquiries: [{
        id: "enquiry-2",
        sourceSystem: "csv",
        sourceRecordId: "enquiry-2",
        clientId: "client-2",
        createdAt: "2026-11-01T10:00:00.000Z",
        status: "new",
        quotedValueMinor: 25000,
        hasContactRoute: true,
      }],
    },
    { asOf },
  );

  assert.equal(result.opportunities[0].actionability, "not_actionable");
});

test("inactive project and linked balance do not double-count base opportunity value", () => {
  const result = analyseRevenueRecovery(
    {
      clients: [{
        id: "client-3",
        sourceSystem: "csv",
        sourceRecordId: "client-3",
        marketingPermissionState: "unknown",
      }],
      projects: [{
        id: "project-3",
        sourceSystem: "csv",
        sourceRecordId: "project-3",
        clientId: "client-3",
        status: "active",
        agreedValueMinor: 100000,
        paidValueMinor: 50000,
        sessionsPlanned: 6,
        sessionsCompleted: 3,
        lastActivityAt: "2026-09-01T10:00:00.000Z",
        hasContactRoute: true,
      }],
      balances: [{
        id: "balance-3",
        sourceSystem: "csv",
        sourceRecordId: "balance-3",
        clientId: "client-3",
        projectId: "project-3",
        amountDueMinor: 30000,
        amountPaidMinor: 10000,
        status: "open",
        hasContactRoute: true,
      }],
    },
    { asOf },
  );

  assert.equal(result.opportunities.length, 2);
  assert.equal(result.totals.evidenceBackedBaseMinor, 50000);
});

test("capacity opportunity is modelled and uses configured fill-factor range", () => {
  const result = analyseRevenueRecovery(
    {
      capacityPeriods: [{
        id: "capacity-1",
        sourceSystem: "csv",
        sourceRecordId: "capacity-1",
        periodStart: "2026-12-01T00:00:00.000Z",
        periodEnd: "2026-12-07T23:59:59.000Z",
        availableHours: 20,
        bookedHours: 8,
        realisedHourlyValueMinor: 7000,
      }],
    },
    { asOf },
  );

  const opportunity = result.opportunities[0];
  assert.equal(opportunity.type, "unfilled_capacity");
  assert.equal(opportunity.valueClassification, "modelled");
  assert.equal(opportunity.valueLowMinor, 16800);
  assert.equal(opportunity.valueBaseMinor, 29400);
  assert.equal(opportunity.valueHighMinor, 42000);
});

test("lapsed client finding has no invented monetary value", () => {
  const result = analyseRevenueRecovery(
    {
      clients: [{
        id: "client-5",
        sourceSystem: "csv",
        sourceRecordId: "client-5",
        lastCompletedBookingAt: "2026-01-01T10:00:00.000Z",
        completedSessions: 4,
        marketingPermissionState: "unknown",
      }],
    },
    { asOf },
  );

  assert.equal(result.opportunities[0].type, "lapsed_client");
  assert.equal(result.opportunities[0].valueBaseMinor, null);
  assert.equal(result.opportunities[0].valueClassification, "unknown");
  assert.equal(result.opportunities[0].actionability, "review_required");
});
