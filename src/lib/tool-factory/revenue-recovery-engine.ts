export type ValueClassification =
  | "observed"
  | "calculated"
  | "modelled"
  | "hypothesis"
  | "unknown";

export type RevenueOpportunityType =
  | "unconverted_enquiry"
  | "inactive_project"
  | "lapsed_client"
  | "outstanding_balance"
  | "unfilled_capacity";

export type MarketingPermissionState =
  | "unknown"
  | "permitted"
  | "not_permitted"
  | "suppressed";

export interface SourceReference {
  sourceSystem: string;
  sourceRecordId: string;
}

export interface RecoveryClient extends SourceReference {
  id: string;
  lastCompletedBookingAt?: string | null;
  completedSessions?: number | null;
  futureBookingAt?: string | null;
  marketingPermissionState: MarketingPermissionState;
}

export interface RecoveryEnquiry extends SourceReference {
  id: string;
  clientId?: string | null;
  createdAt: string;
  status: "new" | "replied" | "quoted" | "booked" | "declined" | "closed" | "unknown";
  quotedValueMinor?: number | null;
  hasContactRoute: boolean;
}

export interface RecoveryProject extends SourceReference {
  id: string;
  clientId?: string | null;
  status: "active" | "paused" | "completed" | "cancelled" | "unknown";
  agreedValueMinor?: number | null;
  paidValueMinor?: number | null;
  sessionsPlanned?: number | null;
  sessionsCompleted?: number | null;
  lastActivityAt?: string | null;
  nextSessionAt?: string | null;
  hasContactRoute: boolean;
}

export interface RecoveryBalance extends SourceReference {
  id: string;
  clientId?: string | null;
  projectId?: string | null;
  bookingId?: string | null;
  amountDueMinor: number;
  amountPaidMinor: number;
  status: "open" | "paid" | "refunded" | "disputed" | "unknown";
  hasContactRoute: boolean;
}

export interface RecoveryCapacityPeriod extends SourceReference {
  id: string;
  periodStart: string;
  periodEnd: string;
  availableHours: number;
  bookedHours: number;
  realisedHourlyValueMinor?: number | null;
}

export interface RevenueRecoveryInput {
  clients?: RecoveryClient[];
  enquiries?: RecoveryEnquiry[];
  projects?: RecoveryProject[];
  balances?: RecoveryBalance[];
  capacityPeriods?: RecoveryCapacityPeriod[];
}

export interface RevenueRecoveryConfig {
  enquiryAgeDays: number;
  inactiveProjectDays: number;
  lapsedClientDays: number;
  capacityFillFactors: readonly [number, number, number];
  priorityValueCapMinor: number;
}

export interface RevenueOpportunity {
  key: string;
  type: RevenueOpportunityType;
  sourceGroupKey: string;
  source: SourceReference;
  clientId?: string;
  title: string;
  explanation: string;
  recommendedAction: string;
  valueLowMinor: number | null;
  valueBaseMinor: number | null;
  valueHighMinor: number | null;
  valueClassification: ValueClassification;
  confidence: number;
  priority: number;
  evidence: string[];
  detectedAt: string;
  actionability: "actionable" | "review_required" | "not_actionable";
  marketingPermissionState?: MarketingPermissionState;
}

export interface RevenueRecoveryAnalysis {
  ruleVersion: string;
  analysedAt: string;
  opportunities: RevenueOpportunity[];
  totals: {
    opportunityCount: number;
    evidenceBackedBaseMinor: number;
    modelledBaseMinor: number;
    highRangeMinor: number;
  };
}

export const DEFAULT_REVENUE_RECOVERY_CONFIG: RevenueRecoveryConfig = {
  enquiryAgeDays: 7,
  inactiveProjectDays: 45,
  lapsedClientDays: 180,
  capacityFillFactors: [0.2, 0.35, 0.5],
  priorityValueCapMinor: 1_000_000,
};

const RULE_VERSION = "revenue-recovery-rules-0.1.0";
const DAY_MS = 86_400_000;

function validDate(value?: string | null): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function daysBetween(earlier: number, later: number): number {
  return Math.max(0, Math.floor((later - earlier) / DAY_MS));
}

function safeMinor(value?: number | null): number | null {
  if (value == null || !Number.isFinite(value) || value < 0) return null;
  return Math.round(value);
}

function sourceKey(source: SourceReference): string {
  return `${source.sourceSystem}:${source.sourceRecordId}`;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function priorityScore(args: {
  valueBaseMinor: number | null;
  confidence: number;
  ageDays: number;
  thresholdDays: number;
  actionable: boolean;
  effort: number;
  capMinor: number;
}): number {
  const amountScore =
    args.valueBaseMinor == null
      ? 0
      : Math.min(1, args.valueBaseMinor / Math.max(1, args.capMinor));
  const urgencyScore = clamp01(args.ageDays / Math.max(1, args.thresholdDays * 2));
  const actionabilityScore = args.actionable ? 1 : 0.25;
  const effortScore = 1 - clamp01(args.effort);
  const score =
    amountScore * 30 +
    urgencyScore * 20 +
    actionabilityScore * 20 +
    clamp01(args.confidence) * 20 +
    effortScore * 10;
  return Math.round(score);
}

function makeOpportunity(
  opportunity: Omit<RevenueOpportunity, "priority">,
  priority: Omit<Parameters<typeof priorityScore>[0], "valueBaseMinor" | "confidence" | "actionable">,
): RevenueOpportunity {
  return {
    ...opportunity,
    priority: priorityScore({
      ...priority,
      valueBaseMinor: opportunity.valueBaseMinor,
      confidence: opportunity.confidence,
      actionable: opportunity.actionability === "actionable",
    }),
  };
}

function nonOverlappingBaseTotal(opportunities: RevenueOpportunity[]): number {
  const groups = new Map<string, number>();
  for (const opportunity of opportunities) {
    if (opportunity.valueBaseMinor == null) continue;
    groups.set(
      opportunity.sourceGroupKey,
      Math.max(groups.get(opportunity.sourceGroupKey) ?? 0, opportunity.valueBaseMinor),
    );
  }
  return [...groups.values()].reduce((total, value) => total + value, 0);
}

/**
 * Deterministic analysis engine.
 *
 * Monetary values are integer GBP pence. This function never sends messages,
 * changes bookings, charges customers or mutates source records.
 */
export function analyseRevenueRecovery(
  input: RevenueRecoveryInput,
  options: {
    asOf?: string;
    config?: Partial<RevenueRecoveryConfig>;
  } = {},
): RevenueRecoveryAnalysis {
  const config = { ...DEFAULT_REVENUE_RECOVERY_CONFIG, ...options.config };
  const asOf = options.asOf ?? new Date().toISOString();
  const now = validDate(asOf);
  if (now == null) throw new Error("asOf must be a valid ISO date.");

  const opportunities: RevenueOpportunity[] = [];
  const clients = input.clients ?? [];

  for (const enquiry of input.enquiries ?? []) {
    const created = validDate(enquiry.createdAt);
    if (created == null || !["new", "replied", "quoted"].includes(enquiry.status)) continue;
    const ageDays = daysBetween(created, now);
    if (ageDays < config.enquiryAgeDays) continue;

    const quoted = safeMinor(enquiry.quotedValueMinor);
    const opportunityKey = `enquiry:${sourceKey(enquiry)}`;
    const client = clients.find((candidate) => candidate.id === enquiry.clientId);
    const permission = client?.marketingPermissionState ?? "unknown";
    const actionability =
      enquiry.hasContactRoute && permission === "permitted"
        ? "actionable"
        : enquiry.hasContactRoute
          ? "review_required"
          : "not_actionable";
    const confidence = quoted != null ? 0.9 : 0.65;

    opportunities.push(
      makeOpportunity(
        {
          key: opportunityKey,
          type: "unconverted_enquiry",
          sourceGroupKey: `enquiry:${enquiry.id}`,
          source: { sourceSystem: enquiry.sourceSystem, sourceRecordId: enquiry.sourceRecordId },
          clientId: enquiry.clientId ?? undefined,
          title: "Unconverted enquiry needs review",
          explanation: `This enquiry is still marked ${enquiry.status} after ${ageDays} days and has not been marked as booked or closed.`,
          recommendedAction: "Review the enquiry history and decide whether a service follow-up is appropriate.",
          valueLowMinor: quoted,
          valueBaseMinor: quoted,
          valueHighMinor: quoted,
          valueClassification: quoted == null ? "unknown" : "observed",
          confidence,
          evidence: [
            `Enquiry status: ${enquiry.status}`,
            `Enquiry age: ${ageDays} days`,
            ...(quoted == null ? ["No quoted value supplied; no financial amount assigned."] : ["Quoted value supplied by source record."]),
          ],
          detectedAt: asOf,
          actionability,
          marketingPermissionState: permission,
        },
        {
          ageDays,
          thresholdDays: config.enquiryAgeDays,
          effort: 0.25,
          capMinor: config.priorityValueCapMinor,
        },
      ),
    );
  }

  for (const project of input.projects ?? []) {
    if (!["active", "paused"].includes(project.status) || project.nextSessionAt) continue;
    const lastActivity = validDate(project.lastActivityAt);
    if (lastActivity == null) continue;
    const ageDays = daysBetween(lastActivity, now);
    if (ageDays < config.inactiveProjectDays) continue;

    const planned = project.sessionsPlanned;
    const completed = project.sessionsCompleted;
    if (planned == null || completed == null || planned <= completed) continue;

    const agreed = safeMinor(project.agreedValueMinor);
    const paid = safeMinor(project.paidValueMinor);
    const remaining = agreed != null && paid != null ? Math.max(0, agreed - paid) : null;
    const client = clients.find((candidate) => candidate.id === project.clientId);
    const permission = client?.marketingPermissionState ?? "unknown";

    opportunities.push(
      makeOpportunity(
        {
          key: `project:${sourceKey(project)}`,
          type: "inactive_project",
          sourceGroupKey: `project:${project.id}`,
          source: { sourceSystem: project.sourceSystem, sourceRecordId: project.sourceRecordId },
          clientId: project.clientId ?? undefined,
          title: "Multi-session project has gone inactive",
          explanation: `The project has ${planned - completed} planned session(s) remaining and no next session recorded. Last activity was ${ageDays} days ago.`,
          recommendedAction: "Review project status and remaining scope, then contact the client through an appropriate permitted channel.",
          valueLowMinor: remaining,
          valueBaseMinor: remaining,
          valueHighMinor: remaining,
          valueClassification: remaining == null ? "unknown" : "calculated",
          confidence: remaining == null ? 0.7 : 0.95,
          evidence: [
            `Project status: ${project.status}`,
            `Sessions remaining: ${planned - completed}`,
            `Days since last activity: ${ageDays}`,
            ...(remaining == null ? ["Agreed value or paid amount missing; financial value unknown."] : ["Remaining value = agreed value minus paid value."]),
          ],
          detectedAt: asOf,
          actionability: project.hasContactRoute ? (permission === "permitted" ? "actionable" : "review_required") : "not_actionable",
          marketingPermissionState: permission,
        },
        {
          ageDays,
          thresholdDays: config.inactiveProjectDays,
          effort: 0.4,
          capMinor: config.priorityValueCapMinor,
        },
      ),
    );
  }

  for (const client of clients) {
    const lastBooking = validDate(client.lastCompletedBookingAt);
    if (lastBooking == null || (client.completedSessions ?? 0) < 1 || client.futureBookingAt) continue;
    const ageDays = daysBetween(lastBooking, now);
    if (ageDays < config.lapsedClientDays) continue;

    opportunities.push(
      makeOpportunity(
        {
          key: `client:${sourceKey(client)}`,
          type: "lapsed_client",
          sourceGroupKey: `client:${client.id}`,
          source: { sourceSystem: client.sourceSystem, sourceRecordId: client.sourceRecordId },
          clientId: client.id,
          title: "Previously active client has not rebooked",
          explanation: `The client has ${client.completedSessions} completed session(s), no future booking recorded and no completed booking for ${ageDays} days.`,
          recommendedAction: "Review the client relationship and only prepare an appropriate follow-up if the studio has a valid contact basis.",
          valueLowMinor: null,
          valueBaseMinor: null,
          valueHighMinor: null,
          valueClassification: "unknown",
          confidence: 0.8,
          evidence: [
            `Completed sessions: ${client.completedSessions}`,
            `Days since last completed booking: ${ageDays}`,
            "No future booking recorded in the supplied data.",
            "No revenue value assigned without a supported booking estimate.",
          ],
          detectedAt: asOf,
          actionability:
            client.marketingPermissionState === "permitted"
              ? "actionable"
              : client.marketingPermissionState === "unknown"
                ? "review_required"
                : "not_actionable",
          marketingPermissionState: client.marketingPermissionState,
        },
        {
          ageDays,
          thresholdDays: config.lapsedClientDays,
          effort: 0.5,
          capMinor: config.priorityValueCapMinor,
        },
      ),
    );
  }

  for (const balance of input.balances ?? []) {
    if (balance.status !== "open") continue;
    const due = safeMinor(balance.amountDueMinor);
    const paid = safeMinor(balance.amountPaidMinor);
    if (due == null || paid == null || due <= paid) continue;
    const outstanding = due - paid;
    const group = balance.projectId
      ? `project:${balance.projectId}`
      : balance.bookingId
        ? `booking:${balance.bookingId}`
        : `balance:${balance.id}`;
    const client = clients.find((candidate) => candidate.id === balance.clientId);
    const permission = client?.marketingPermissionState ?? "unknown";

    opportunities.push(
      makeOpportunity(
        {
          key: `balance:${sourceKey(balance)}`,
          type: "outstanding_balance",
          sourceGroupKey: group,
          source: { sourceSystem: balance.sourceSystem, sourceRecordId: balance.sourceRecordId },
          clientId: balance.clientId ?? undefined,
          title: "Outstanding deposit or balance",
          explanation: `The imported record shows ${outstanding} minor currency units outstanding. Confirm the ledger and payment status before acting.`,
          recommendedAction: "Reconcile the payment record against the studio's payment system before preparing any customer communication.",
          valueLowMinor: outstanding,
          valueBaseMinor: outstanding,
          valueHighMinor: outstanding,
          valueClassification: "calculated",
          confidence: 0.9,
          evidence: [
            `Amount due (minor units): ${due}`,
            `Amount paid (minor units): ${paid}`,
            `Outstanding (minor units): ${outstanding}`,
          ],
          detectedAt: asOf,
          actionability: balance.hasContactRoute ? "review_required" : "not_actionable",
          marketingPermissionState: permission,
        },
        {
          ageDays: 0,
          thresholdDays: 1,
          effort: 0.2,
          capMinor: config.priorityValueCapMinor,
        },
      ),
    );
  }

  for (const period of input.capacityPeriods ?? []) {
    const start = validDate(period.periodStart);
    const end = validDate(period.periodEnd);
    if (start == null || end == null || start < now || end < start) continue;
    const available = Math.max(0, period.availableHours - period.bookedHours);
    const hourlyValue = safeMinor(period.realisedHourlyValueMinor);
    if (available <= 0 || hourlyValue == null) continue;

    const potential = available * hourlyValue;
    const [lowFactor, baseFactor, highFactor] = config.capacityFillFactors;
    const low = Math.round(potential * lowFactor);
    const base = Math.round(potential * baseFactor);
    const high = Math.round(potential * highFactor);

    opportunities.push(
      makeOpportunity(
        {
          key: `capacity:${sourceKey(period)}`,
          type: "unfilled_capacity",
          sourceGroupKey: `capacity:${period.id}`,
          source: { sourceSystem: period.sourceSystem, sourceRecordId: period.sourceRecordId },
          title: "Unfilled future appointment capacity",
          explanation: `${available} unbooked hour(s) are recorded between ${period.periodStart} and ${period.periodEnd}.`,
          recommendedAction: "Review the diary and decide whether the available capacity is genuinely sellable before promoting it.",
          valueLowMinor: low,
          valueBaseMinor: base,
          valueHighMinor: high,
          valueClassification: "modelled",
          confidence: 0.55,
          evidence: [
            `Available hours: ${period.availableHours}`,
            `Booked hours: ${period.bookedHours}`,
            `Unbooked hours: ${available}`,
            `Realised hourly value (minor units): ${hourlyValue}`,
            `Modelled fill factors: ${lowFactor}/${baseFactor}/${highFactor}`,
          ],
          detectedAt: asOf,
          actionability: "review_required",
        },
        {
          ageDays: 0,
          thresholdDays: 1,
          effort: 0.35,
          capMinor: config.priorityValueCapMinor,
        },
      ),
    );
  }

  opportunities.sort(
    (a, b) => b.priority - a.priority || (b.valueBaseMinor ?? 0) - (a.valueBaseMinor ?? 0),
  );

  const modelled = opportunities.filter((item) => item.valueClassification === "modelled");
  const evidenceBacked = opportunities.filter(
    (item) => item.valueClassification === "observed" || item.valueClassification === "calculated",
  );
  const modelledBase = nonOverlappingBaseTotal(modelled);
  const evidenceBase = nonOverlappingBaseTotal(evidenceBacked);

  return {
    ruleVersion: RULE_VERSION,
    analysedAt: asOf,
    opportunities,
    totals: {
      opportunityCount: opportunities.length,
      evidenceBackedBaseMinor: evidenceBase,
      modelledBaseMinor: modelledBase,
      highRangeMinor: nonOverlappingBaseTotal(
        opportunities.map((item) => ({ ...item, valueBaseMinor: item.valueHighMinor })),
      ),
    },
  };
}
