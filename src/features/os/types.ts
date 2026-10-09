export type FounderPriority = {
  rank: number;
  owner: string;
  title: string;
  status: string;
  outcome: string;
  deadline: string | null;
  next_action: string;
  priority_key: string;
  risk_summary: string;
  success_criteria: string;
};

export type FounderRisk = {
  owner: string;
  title: string;
  status: string;
  category: string;
  risk_key: string;
  mitigation: string;
  risk_score: number;
  next_action: string;
};

export type CommercialMetric = {
  name: string;
  unit: string;
  value: number | null;
  domain: string;
  metric_key: string;
  source_ref: string | null;
  measured_at: string | null;
  classification: string | null;
};

export type FounderAction = {
  owner: string;
  title: string;
  status: string;
  deadline: string | null;
  action_key: string;
  source_ref: string | null;
  source_type: string;
};

export type FounderEvidenceGap = {
  title: string;
  statement: string;
  confidence: number | null;
  source_ref: string | null;
  evidence_key: string;
  classification: string;
};

export type ParkedIdea = {
  title: string;
  scoring: Record<string, number>;
  idea_key: string;
  revisit_at: string | null;
  description: string;
};

export type FounderDecision = {
  id?: string;
  title?: string;
  decision?: string;
  rationale?: string;
  status?: string;
};

export type FounderBrief = {
  cycle_id: string;
  business_key: string;
  cycle_key: string;
  period_start: string;
  period_end: string;
  company_outcome: string;
  success_measure: string;
  priorities: FounderPriority[];
  risks: FounderRisk[];
  commercial_health: CommercialMetric[];
  decisions_required: FounderDecision[];
  execution_queue: FounderAction[];
  evidence_gaps: FounderEvidenceGap[];
  parked_ideas: ParkedIdea[];
};

export type AuditDigest = {
  id: string;
  studio_id: string;
  studio_name: string;
  status: string;
  qa_status: string;
  report_status: string;
  created_at: string;
};

export type FounderSnapshot = {
  generated_at: string;
  admin_role: string;
  brief: FounderBrief | null;
  counts: {
    studios: number;
    visibility_studios: number;
    audits: number;
    paid_orders: number;
  };
  latest_audits: AuditDigest[];
};
