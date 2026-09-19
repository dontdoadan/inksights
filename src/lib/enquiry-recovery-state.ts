export type EnquiryRecoveryState =
  | "RECEIVED"
  | "VALIDATED"
  | "IDENTIFIED"
  | "CLASSIFIED"
  | "ACKNOWLEDGED"
  | "FOLLOW_UP_ACTIVE"
  | "RESPONDED"
  | "CONSULTATION_BOOKED"
  | "CONSULTATION_COMPLETED"
  | "DEPOSIT_REQUESTED"
  | "DEPOSIT_PAID"
  | "BOOKED"
  | "CONVERTED"
  | "CLOSED_LOST"
  | "PAUSED"
  | "ESCALATED"
  | "FAILED";

export type RecoveryEvent = {
  event_type: string;
  payload?: Record<string, unknown> | null;
};

export type RecoverySnapshot = {
  state: EnquiryRecoveryState;
  followUpActive: boolean;
  followUpStopReason: string | null;
  retryCount: number;
  failureCount: number;
  terminal: boolean;
  hasReply: boolean;
  hasConsultation: boolean;
  hasPaidDeposit: boolean;
};

const PROGRESS: EnquiryRecoveryState[] = [
  "RECEIVED",
  "VALIDATED",
  "IDENTIFIED",
  "CLASSIFIED",
  "ACKNOWLEDGED",
  "FOLLOW_UP_ACTIVE",
  "RESPONDED",
  "CONSULTATION_BOOKED",
  "CONSULTATION_COMPLETED",
  "DEPOSIT_REQUESTED",
  "DEPOSIT_PAID",
  "BOOKED",
  "CONVERTED",
];

const rank = new Map(PROGRESS.map((state, index) => [state, index]));

function payloadString(event: RecoveryEvent, key: string) {
  const value = event.payload?.[key];
  return typeof value === "string" ? value : null;
}

function payloadBoolean(event: RecoveryEvent, key: string) {
  return event.payload?.[key] === true;
}

export function deriveEnquiryRecoverySnapshot(events: RecoveryEvent[]): RecoverySnapshot {
  let state: EnquiryRecoveryState = "RECEIVED";
  let progressIndex = 0;
  let followUpStarted = false;
  let followUpStopReason: string | null = null;
  let retryCount = 0;
  let failureCount = 0;
  let terminal = false;
  let exceptionState: EnquiryRecoveryState | null = null;

  const advance = (next: EnquiryRecoveryState) => {
    const nextRank = rank.get(next);
    if (nextRank !== undefined && nextRank > progressIndex) {
      progressIndex = nextRank;
      state = next;
    }
  };

  for (const event of events) {
    switch (event.event_type) {
      case "lead.created":
        advance("RECEIVED");
        break;
      case "lead.updated": {
        const transition = payloadString(event, "transition");
        if (transition === "validated") advance("VALIDATED");
        if (transition === "identified") advance("IDENTIFIED");
        break;
      }
      case "lead.qualified":
        advance("CLASSIFIED");
        break;
      case "message.sent": {
        const kind = payloadString(event, "message_kind");
        if (kind === "acknowledgement") advance("ACKNOWLEDGED");
        if (kind === "follow_up") {
          followUpStarted = true;
          advance("FOLLOW_UP_ACTIVE");
        }
        break;
      }
      case "message.replied":
        followUpStopReason = followUpStopReason ?? "reply";
        advance("RESPONDED");
        break;
      case "consultation.booked":
        followUpStopReason = "consultation_booked";
        advance("CONSULTATION_BOOKED");
        break;
      case "consultation.completed":
        advance("CONSULTATION_COMPLETED");
        break;
      case "deposit.requested":
        advance("DEPOSIT_REQUESTED");
        break;
      case "deposit.paid":
        followUpStopReason = "deposit_paid";
        advance("DEPOSIT_PAID");
        break;
      case "booking.created":
        advance("BOOKED");
        break;
      case "intervention.completed":
        advance("CONVERTED");
        break;
      case "lead.disqualified":
        followUpStopReason = "disqualified";
        exceptionState = "CLOSED_LOST";
        terminal = true;
        break;
      case "intervention.paused":
        followUpStopReason = "operator_pause";
        exceptionState = "PAUSED";
        break;
      case "workflow.escalated":
        followUpStopReason = "escalated";
        exceptionState = "ESCALATED";
        terminal = true;
        break;
      case "workflow.failed":
        failureCount += 1;
        if (payloadBoolean(event, "terminal")) {
          followUpStopReason = "terminal_failure";
          exceptionState = "FAILED";
          terminal = true;
        }
        break;
      case "workflow.retried":
        retryCount += 1;
        break;
      default:
        break;
    }
  }

  if (exceptionState) state = exceptionState;

  return {
    state,
    followUpActive: followUpStarted && followUpStopReason === null && !terminal,
    followUpStopReason,
    retryCount,
    failureCount,
    terminal,
    hasReply: events.some((event) => event.event_type === "message.replied"),
    hasConsultation: events.some((event) => event.event_type === "consultation.booked"),
    hasPaidDeposit: events.some((event) => event.event_type === "deposit.paid"),
  };
}

export function canSendRecoveryFollowUp(events: RecoveryEvent[]) {
  return deriveEnquiryRecoverySnapshot(events).followUpActive;
}
