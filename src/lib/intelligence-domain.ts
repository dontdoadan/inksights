export const EVIDENCE_CLASSIFICATIONS = [
  'observed',
  'derived',
  'modelled',
  'inferred',
  'evidence_backed',
] as const

export type EvidenceClassification = (typeof EVIDENCE_CLASSIFICATIONS)[number]

export type IntelligenceChain =
  | 'observation'
  | 'metric'
  | 'evidence'
  | 'finding'
  | 'diagnosis'
  | 'opportunity'
  | 'recommendation'
  | 'decision'
  | 'intervention'
  | 'expected_outcome'
  | 'outcome'
  | 'attribution'
  | 'learning'

export type Confidence = number | null

export interface MetricValue<T = number> {
  value: T
  unit?: string
  classification: EvidenceClassification
  confidence: Confidence
  sourceType?: string
  sourceRef?: string
  observedAt?: string
  lineage: string[]
}

export interface Finding {
  id: string
  studioId: string
  statement: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: Confidence
  evidenceIds: string[]
}

export interface Diagnosis {
  id: string
  studioId: string
  findingId: string
  primaryHypothesis: string
  competingExplanations: string[]
  supportingEvidenceIds: string[]
  missingEvidence: string[]
  confidence: Confidence
}

export interface Recommendation {
  id: string
  studioId: string
  diagnosisId: string
  opportunityId?: string
  title: string
  recommendation: string
  rationale?: string
  expectedEffect: Record<string, unknown>
  confidence: Confidence
  evidenceIds: string[]
}

export interface Decision {
  id: string
  studioId: string
  recommendationId: string
  decisionType:
    | 'implementation'
    | 'rejection'
    | 'deferral'
    | 'modification'
    | 'cancellation'
  decision: string
  rationale?: string
  expectedOutcome: Record<string, unknown>
  status:
    | 'proposed'
    | 'approved'
    | 'rejected'
    | 'modified'
    | 'deferred'
    | 'cancelled'
  decidedAt?: string
}

export interface Intervention {
  id: string
  studioId: string
  decisionId: string
  interventionType: string
  description: string
  target?: string
  baselinePeriod?: { start: string; end: string }
  implementationEvidence: string[]
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
}

export interface Outcome {
  id: string
  studioId: string
  interventionId: string
  metricDefinitionId?: string
  baselineValue?: number
  observedValue?: number
  delta?: number
  measurementPeriod: { start: string; end: string }
  sourceType: string
  sourceRef?: string
  classification: EvidenceClassification
  confidence: Confidence
}

export interface Attribution {
  id: string
  studioId: string
  interventionId: string
  outcomeId: string
  method:
    | 'before_after'
    | 'control_group'
    | 'experiment'
    | 'difference_in_differences'
    | 'modelled'
    | 'manual_analyst_assessment'
  attributedValue?: number
  attributedValuePence?: number
  confidence: Confidence
  confounders: string[]
  evidenceIds: string[]
}

export interface Learning {
  id: string
  studioId: string
  interventionId?: string
  outcomeId?: string
  attributionId?: string
  hypothesis: string
  result: string
  learningType: string
  confidence: Confidence
  appliesTo: Record<string, unknown>
  recommendationAdjustment: Record<string, unknown>
}

/**
 * Financial language guardrail: modelled estimates must remain explicitly labelled.
 */
export function formatEpistemicLabel(classification: EvidenceClassification): string {
  switch (classification) {
    case 'observed':
      return 'Observed'
    case 'derived':
      return 'Derived'
    case 'modelled':
      return 'Modelled'
    case 'inferred':
      return 'Inferred'
    case 'evidence_backed':
      return 'Evidence-backed'
  }
}

export function isObserved(classification: EvidenceClassification): boolean {
  return classification === 'observed'
}
