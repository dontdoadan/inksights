export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      _golden_acceptance_chunks: {
        Row: {
          payload: string
          seq: number
        }
        Insert: {
          payload: string
          seq: number
        }
        Update: {
          payload?: string
          seq?: number
        }
        Relationships: []
      }
      audit_diagnoses: {
        Row: {
          audit_id: string
          confidence: string
          constraint_family: string | null
          constraint_type: string
          created_at: string
          id: string
          rank: number
          resolution_state: string | null
          statement: string
          title: string
        }
        Insert: {
          audit_id: string
          confidence: string
          constraint_family?: string | null
          constraint_type: string
          created_at?: string
          id?: string
          rank: number
          resolution_state?: string | null
          statement: string
          title: string
        }
        Update: {
          audit_id?: string
          confidence?: string
          constraint_family?: string | null
          constraint_type?: string
          created_at?: string
          id?: string
          rank?: number
          resolution_state?: string | null
          statement?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_diagnoses_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_evidence: {
        Row: {
          audit_id: string
          classification: string
          confidence: string
          created_at: string
          evidence_type: string
          id: string
          observed_at: string | null
          provenance: Json
          source_id: string | null
          summary: string
          title: string
        }
        Insert: {
          audit_id: string
          classification: string
          confidence: string
          created_at?: string
          evidence_type: string
          id?: string
          observed_at?: string | null
          provenance?: Json
          source_id?: string | null
          summary: string
          title: string
        }
        Update: {
          audit_id?: string
          classification?: string
          confidence?: string
          created_at?: string
          evidence_type?: string
          id?: string
          observed_at?: string | null
          provenance?: Json
          source_id?: string | null
          summary?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_evidence_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_evidence_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "audit_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_finding_evidence: {
        Row: {
          evidence_id: string
          finding_id: string
        }
        Insert: {
          evidence_id: string
          finding_id: string
        }
        Update: {
          evidence_id?: string
          finding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_finding_evidence_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "audit_evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_finding_evidence_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "audit_findings"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_findings: {
        Row: {
          audit_id: string
          category: string
          classification: string
          confidence: string
          created_at: string
          finding_key: string
          id: string
          materiality: string
          statement: string
          status: string
          title: string
        }
        Insert: {
          audit_id: string
          category: string
          classification: string
          confidence: string
          created_at?: string
          finding_key: string
          id?: string
          materiality?: string
          statement: string
          status?: string
          title: string
        }
        Update: {
          audit_id?: string
          category?: string
          classification?: string
          confidence?: string
          created_at?: string
          finding_key?: string
          id?: string
          materiality?: string
          statement?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_findings_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_interventions: {
        Row: {
          audit_id: string
          baseline: Json
          completed_at: string | null
          description: string
          id: string
          measurement_plan: Json
          recommendation_id: string | null
          selected_at: string
          started_at: string | null
          status: string
          target_metric_key: string | null
          title: string
        }
        Insert: {
          audit_id: string
          baseline?: Json
          completed_at?: string | null
          description: string
          id?: string
          measurement_plan?: Json
          recommendation_id?: string | null
          selected_at?: string
          started_at?: string | null
          status?: string
          target_metric_key?: string | null
          title: string
        }
        Update: {
          audit_id?: string
          baseline?: Json
          completed_at?: string | null
          description?: string
          id?: string
          measurement_plan?: Json
          recommendation_id?: string | null
          selected_at?: string
          started_at?: string | null
          status?: string
          target_metric_key?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_interventions_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_interventions_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "audit_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_metrics: {
        Row: {
          audit_id: string
          calculation_version: string
          confidence: string
          created_at: string
          evidence_classification: string
          id: string
          measurement_status: string
          metric_key: string
          not_measurable_reason: string | null
          period_end: string | null
          period_start: string | null
          provenance: Json
          required_source: string | null
          unit: string | null
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          audit_id: string
          calculation_version?: string
          confidence: string
          created_at?: string
          evidence_classification: string
          id?: string
          measurement_status: string
          metric_key: string
          not_measurable_reason?: string | null
          period_end?: string | null
          period_start?: string | null
          provenance?: Json
          required_source?: string | null
          unit?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          audit_id?: string
          calculation_version?: string
          confidence?: string
          created_at?: string
          evidence_classification?: string
          id?: string
          measurement_status?: string
          metric_key?: string
          not_measurable_reason?: string | null
          period_end?: string | null
          period_start?: string | null
          provenance?: Json
          required_source?: string | null
          unit?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_metrics_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_opportunities: {
        Row: {
          assumptions: Json
          audit_id: string
          confidence: string
          confidence_score: number
          cost_score: number
          created_at: string
          diagnosis_id: string | null
          ease_score: number
          evidence_classification: string
          id: string
          impact_high: number | null
          impact_low: number | null
          impact_score: number
          impact_unit: string | null
          mechanism: string
          overall_score: number
          speed_score: number
          title: string
          value_classification: string | null
        }
        Insert: {
          assumptions?: Json
          audit_id: string
          confidence: string
          confidence_score: number
          cost_score: number
          created_at?: string
          diagnosis_id?: string | null
          ease_score: number
          evidence_classification: string
          id?: string
          impact_high?: number | null
          impact_low?: number | null
          impact_score: number
          impact_unit?: string | null
          mechanism: string
          overall_score: number
          speed_score: number
          title: string
          value_classification?: string | null
        }
        Update: {
          assumptions?: Json
          audit_id?: string
          confidence?: string
          confidence_score?: number
          cost_score?: number
          created_at?: string
          diagnosis_id?: string | null
          ease_score?: number
          evidence_classification?: string
          id?: string
          impact_high?: number | null
          impact_low?: number | null
          impact_score?: number
          impact_unit?: string | null
          mechanism?: string
          overall_score?: number
          speed_score?: number
          title?: string
          value_classification?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_opportunities_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_opportunities_diagnosis_id_fkey"
            columns: ["diagnosis_id"]
            isOneToOne: false
            referencedRelation: "audit_diagnoses"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_raw_records: {
        Row: {
          audit_id: string
          created_at: string
          id: number
          parse_error: string | null
          parse_status: string
          raw_payload: Json
          source_id: string
          source_row: number | null
          source_row_key: string | null
        }
        Insert: {
          audit_id: string
          created_at?: string
          id?: never
          parse_error?: string | null
          parse_status?: string
          raw_payload: Json
          source_id: string
          source_row?: number | null
          source_row_key?: string | null
        }
        Update: {
          audit_id?: string
          created_at?: string
          id?: never
          parse_error?: string | null
          parse_status?: string
          raw_payload?: Json
          source_id?: string
          source_row?: number | null
          source_row_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_raw_records_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_raw_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "audit_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_recommendations: {
        Row: {
          action: string
          audit_id: string
          created_at: string
          id: string
          opportunity_id: string | null
          owner_role: string | null
          phase: string | null
          priority: number
          rationale: string
          sequence: number
          target_metric_key: string | null
          title: string
        }
        Insert: {
          action: string
          audit_id: string
          created_at?: string
          id?: string
          opportunity_id?: string | null
          owner_role?: string | null
          phase?: string | null
          priority: number
          rationale: string
          sequence: number
          target_metric_key?: string | null
          title: string
        }
        Update: {
          action?: string
          audit_id?: string
          created_at?: string
          id?: string
          opportunity_id?: string | null
          owner_role?: string | null
          phase?: string | null
          priority?: number
          rationale?: string
          sequence?: number
          target_metric_key?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_recommendations_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_recommendations_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "audit_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_runs: {
        Row: {
          audit_id: string
          completed_at: string | null
          engine_key: string
          error_code: string | null
          error_message: string | null
          id: string
          input_hash: string | null
          input_summary: Json
          output_summary: Json
          retry_count: number
          started_at: string
          status: string
        }
        Insert: {
          audit_id: string
          completed_at?: string | null
          engine_key: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          input_hash?: string | null
          input_summary?: Json
          output_summary?: Json
          retry_count?: number
          started_at?: string
          status?: string
        }
        Update: {
          audit_id?: string
          completed_at?: string | null
          engine_key?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          input_hash?: string | null
          input_summary?: Json
          output_summary?: Json
          retry_count?: number
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_runs_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_sources: {
        Row: {
          audit_id: string
          id: string
          ingested_at: string
          metadata: Json
          observed_at: string | null
          source_hash: string | null
          source_name: string
          source_type: string
          source_uri: string | null
          storage_path: string | null
        }
        Insert: {
          audit_id: string
          id?: string
          ingested_at?: string
          metadata?: Json
          observed_at?: string | null
          source_hash?: string | null
          source_name: string
          source_type: string
          source_uri?: string | null
          storage_path?: string | null
        }
        Update: {
          audit_id?: string
          id?: string
          ingested_at?: string
          metadata?: Json
          observed_at?: string | null
          source_hash?: string | null
          source_name?: string
          source_type?: string
          source_uri?: string | null
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_sources_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audits: {
        Row: {
          audit_type: string
          audit_version: string
          completed_at: string | null
          context: Json
          created_at: string
          created_by: string | null
          id: string
          mode: string
          period_end: string | null
          period_start: string | null
          qa_status: string
          report_status: string
          started_at: string | null
          status: string
          studio_id: string
        }
        Insert: {
          audit_type?: string
          audit_version: string
          completed_at?: string | null
          context?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          mode: string
          period_end?: string | null
          period_start?: string | null
          qa_status?: string
          report_status?: string
          started_at?: string | null
          status?: string
          studio_id: string
        }
        Update: {
          audit_type?: string
          audit_version?: string
          completed_at?: string | null
          context?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          mode?: string
          period_end?: string | null
          period_start?: string | null
          qa_status?: string
          report_status?: string
          started_at?: string | null
          status?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audits_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      client_aliases: {
        Row: {
          client_id: string | null
          confidence: string
          created_at: string
          id: string
          match_status: string
          normalised_label: string
          raw_label: string
          studio_id: string
        }
        Insert: {
          client_id?: string | null
          confidence?: string
          created_at?: string
          id?: string
          match_status?: string
          normalised_label: string
          raw_label: string
          studio_id: string
        }
        Update: {
          client_id?: string | null
          confidence?: string
          created_at?: string
          id?: string
          match_status?: string
          normalised_label?: string
          raw_label?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_aliases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_aliases_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          canonical_label: string
          confidence: string
          created_at: string
          id: string
          studio_id: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          canonical_label: string
          confidence?: string
          created_at?: string
          id?: string
          studio_id: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          canonical_label?: string
          confidence?: string
          created_at?: string
          id?: string
          studio_id?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_articles: {
        Row: {
          body: Json
          category: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body?: Json
          category?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: Json
          category?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      cms_faqs: {
        Row: {
          answer: string
          created_at: string
          created_by: string | null
          id: string
          question: string
          scope: string
          sort_order: number
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          answer: string
          created_at?: string
          created_by?: string | null
          id?: string
          question: string
          scope?: string
          sort_order?: number
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          answer?: string
          created_at?: string
          created_by?: string | null
          id?: string
          question?: string
          scope?: string
          sort_order?: number
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      cms_navigation: {
        Row: {
          area: string
          created_at: string
          created_by: string | null
          href: string
          id: string
          label: string
          open_in_new_tab: boolean
          sort_order: number
          updated_at: string
          updated_by: string | null
          visible: boolean
        }
        Insert: {
          area: string
          created_at?: string
          created_by?: string | null
          href: string
          id?: string
          label: string
          open_in_new_tab?: boolean
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
          visible?: boolean
        }
        Update: {
          area?: string
          created_at?: string
          created_by?: string | null
          href?: string
          id?: string
          label?: string
          open_in_new_tab?: boolean
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
          visible?: boolean
        }
        Relationships: []
      }
      cms_pages: {
        Row: {
          canonical_path: string | null
          content: Json
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          page_type: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          canonical_path?: string | null
          content?: Json
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          page_type?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          canonical_path?: string | null
          content?: Json
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          page_type?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      cms_site_settings: {
        Row: {
          created_at: string
          description: string | null
          is_public: boolean
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_public?: boolean
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          is_public?: boolean
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          brief: string | null
          budget: string | null
          consent_at: string | null
          created_at: string
          email: string
          hubspot_contact_id: string | null
          hubspot_sync_status: string
          id: string
          name: string
          phone: string | null
          placement: string | null
          project_type: string | null
          source: string
          status: string
        }
        Insert: {
          brief?: string | null
          budget?: string | null
          consent_at?: string | null
          created_at?: string
          email: string
          hubspot_contact_id?: string | null
          hubspot_sync_status?: string
          id?: string
          name: string
          phone?: string | null
          placement?: string | null
          project_type?: string | null
          source?: string
          status?: string
        }
        Update: {
          brief?: string | null
          budget?: string | null
          consent_at?: string | null
          created_at?: string
          email?: string
          hubspot_contact_id?: string | null
          hubspot_sync_status?: string
          id?: string
          name?: string
          phone?: string | null
          placement?: string | null
          project_type?: string | null
          source?: string
          status?: string
        }
        Relationships: []
      }
      integration_events: {
        Row: {
          attempt_count: number
          contact_ref: string | null
          correlation_id: string
          created_at: string
          error_code: string | null
          error_detail: string | null
          event_id: string
          event_type: string
          idempotency_key: string
          intervention_id: string | null
          occurred_at: string
          opportunity_ref: string | null
          payload: Json
          processing_status: string
          received_at: string
          source_event_id: string | null
          source_system: string
          studio_id: string | null
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          contact_ref?: string | null
          correlation_id: string
          created_at?: string
          error_code?: string | null
          error_detail?: string | null
          event_id?: string
          event_type: string
          idempotency_key: string
          intervention_id?: string | null
          occurred_at: string
          opportunity_ref?: string | null
          payload?: Json
          processing_status?: string
          received_at?: string
          source_event_id?: string | null
          source_system: string
          studio_id?: string | null
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          contact_ref?: string | null
          correlation_id?: string
          created_at?: string
          error_code?: string | null
          error_detail?: string | null
          event_id?: string
          event_type?: string
          idempotency_key?: string
          intervention_id?: string | null
          occurred_at?: string
          opportunity_ref?: string | null
          payload?: Json
          processing_status?: string
          received_at?: string
          source_event_id?: string | null
          source_system?: string
          studio_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_events_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "intelligence_interventions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_events_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_runtime_config: {
        Row: {
          config_key: string
          config_value: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      intelligence_attributions: {
        Row: {
          attributed_value: number | null
          attributed_value_pence: number | null
          attribution_confidence: number | null
          attribution_method: string
          confounders: Json
          created_at: string
          evidence_ids: string[]
          id: string
          intervention_id: string
          outcome_id: string
          rationale: string | null
          studio_id: string
        }
        Insert: {
          attributed_value?: number | null
          attributed_value_pence?: number | null
          attribution_confidence?: number | null
          attribution_method: string
          confounders?: Json
          created_at?: string
          evidence_ids?: string[]
          id?: string
          intervention_id: string
          outcome_id: string
          rationale?: string | null
          studio_id: string
        }
        Update: {
          attributed_value?: number | null
          attributed_value_pence?: number | null
          attribution_confidence?: number | null
          attribution_method?: string
          confounders?: Json
          created_at?: string
          evidence_ids?: string[]
          id?: string
          intervention_id?: string
          outcome_id?: string
          rationale?: string | null
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_attributions_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "intelligence_interventions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_attributions_outcome_id_fkey"
            columns: ["outcome_id"]
            isOneToOne: false
            referencedRelation: "intelligence_outcomes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_attributions_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_business_profiles: {
        Row: {
          business_model: string | null
          business_type: string
          created_at: string
          currency: string
          industry: string | null
          metadata: Json
          studio_id: string
          subindustry: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          business_model?: string | null
          business_type?: string
          created_at?: string
          currency?: string
          industry?: string | null
          metadata?: Json
          studio_id: string
          subindustry?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          business_model?: string | null
          business_type?: string
          created_at?: string
          currency?: string
          industry?: string | null
          metadata?: Json
          studio_id?: string
          subindustry?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_business_profiles_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: true
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_calculation_runs: {
        Row: {
          assumptions: Json
          created_at: string
          engine_version: string
          evidence_ids: string[]
          evidence_quality_score: number | null
          id: string
          input_snapshot: Json
          output_snapshot: Json
          period_end: string | null
          period_start: string | null
          status: string
          studio_id: string
          updated_at: string
          warnings: Json
        }
        Insert: {
          assumptions?: Json
          created_at?: string
          engine_version: string
          evidence_ids?: string[]
          evidence_quality_score?: number | null
          id?: string
          input_snapshot: Json
          output_snapshot: Json
          period_end?: string | null
          period_start?: string | null
          status?: string
          studio_id: string
          updated_at?: string
          warnings?: Json
        }
        Update: {
          assumptions?: Json
          created_at?: string
          engine_version?: string
          evidence_ids?: string[]
          evidence_quality_score?: number | null
          id?: string
          input_snapshot?: Json
          output_snapshot?: Json
          period_end?: string | null
          period_start?: string | null
          status?: string
          studio_id?: string
          updated_at?: string
          warnings?: Json
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_calculation_runs_engine_version_fkey"
            columns: ["engine_version"]
            isOneToOne: false
            referencedRelation: "intelligence_calculation_versions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "intelligence_calculation_runs_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_calculation_versions: {
        Row: {
          calibration_status: string
          config: Json
          created_at: string
          description: string | null
          key: string
          name: string
          status: string
        }
        Insert: {
          calibration_status?: string
          config?: Json
          created_at?: string
          description?: string | null
          key: string
          name: string
          status?: string
        }
        Update: {
          calibration_status?: string
          config?: Json
          created_at?: string
          description?: string | null
          key?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      intelligence_decisions: {
        Row: {
          created_at: string
          decided_at: string | null
          decision: string
          decision_type: string
          expected_outcome: Json
          id: string
          owner: string | null
          rationale: string | null
          recommendation_id: string
          status: string
          studio_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decision: string
          decision_type?: string
          expected_outcome?: Json
          id?: string
          owner?: string | null
          rationale?: string | null
          recommendation_id: string
          status?: string
          studio_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decision?: string
          decision_type?: string
          expected_outcome?: Json
          id?: string
          owner?: string | null
          rationale?: string | null
          recommendation_id?: string
          status?: string
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_decisions_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "intelligence_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_decisions_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_diagnoses: {
        Row: {
          competing_explanations: Json
          confidence: number | null
          created_at: string
          finding_id: string
          id: string
          missing_evidence: Json
          primary_hypothesis: string
          resolution_state: string | null
          status: string
          studio_id: string
          supporting_evidence_ids: string[]
          updated_at: string
        }
        Insert: {
          competing_explanations?: Json
          confidence?: number | null
          created_at?: string
          finding_id: string
          id?: string
          missing_evidence?: Json
          primary_hypothesis: string
          resolution_state?: string | null
          status?: string
          studio_id: string
          supporting_evidence_ids?: string[]
          updated_at?: string
        }
        Update: {
          competing_explanations?: Json
          confidence?: number | null
          created_at?: string
          finding_id?: string
          id?: string
          missing_evidence?: Json
          primary_hypothesis?: string
          resolution_state?: string | null
          status?: string
          studio_id?: string
          supporting_evidence_ids?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_diagnoses_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "intelligence_findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_diagnoses_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_diagnostic_questions: {
        Row: {
          calculation_rule: Json
          category: string
          created_at: string
          diagnostic_template_id: string
          evidence_requirement: string | null
          id: string
          metadata: Json
          question: string
          question_type: string
          recommendation_rule: Json
          required: boolean
          scoring_rule: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          calculation_rule?: Json
          category: string
          created_at?: string
          diagnostic_template_id: string
          evidence_requirement?: string | null
          id?: string
          metadata?: Json
          question: string
          question_type: string
          recommendation_rule?: Json
          required?: boolean
          scoring_rule?: Json
          sort_order: number
          updated_at?: string
        }
        Update: {
          calculation_rule?: Json
          category?: string
          created_at?: string
          diagnostic_template_id?: string
          evidence_requirement?: string | null
          id?: string
          metadata?: Json
          question?: string
          question_type?: string
          recommendation_rule?: Json
          required?: boolean
          scoring_rule?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_diagnostic_questions_diagnostic_template_id_fkey"
            columns: ["diagnostic_template_id"]
            isOneToOne: false
            referencedRelation: "intelligence_diagnostic_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_diagnostic_templates: {
        Row: {
          created_at: string
          description: string | null
          diagnostic_key: string
          growth_levers: Json
          id: string
          mapped_playbook_keys: Json
          name: string
          opportunity_formula: Json
          provenance: Json
          scoring_model: Json
          status: string
          universal_dimensions: Json
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          diagnostic_key: string
          growth_levers?: Json
          id?: string
          mapped_playbook_keys?: Json
          name: string
          opportunity_formula?: Json
          provenance?: Json
          scoring_model?: Json
          status?: string
          universal_dimensions?: Json
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          diagnostic_key?: string
          growth_levers?: Json
          id?: string
          mapped_playbook_keys?: Json
          name?: string
          opportunity_formula?: Json
          provenance?: Json
          scoring_model?: Json
          status?: string
          universal_dimensions?: Json
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      intelligence_economic_opportunities: {
        Row: {
          assumptions: Json
          calculation_run_id: string
          capacity_scale_base: number
          capacity_scale_high: number
          capacity_scale_low: number
          classification: string
          constrained_base_pence: number
          constrained_contribution_base_pence: number | null
          constrained_contribution_high_pence: number | null
          constrained_contribution_low_pence: number | null
          constrained_high_pence: number
          constrained_low_pence: number
          constraints: Json
          created_at: string
          evidence_ids: string[]
          evidence_quality_score: number | null
          id: string
          lever: string
          status: string
          studio_id: string
          title: string
          unconstrained_base_pence: number
          unconstrained_high_pence: number
          unconstrained_low_pence: number
          updated_at: string
          value_classification: string | null
        }
        Insert: {
          assumptions?: Json
          calculation_run_id: string
          capacity_scale_base?: number
          capacity_scale_high?: number
          capacity_scale_low?: number
          classification?: string
          constrained_base_pence: number
          constrained_contribution_base_pence?: number | null
          constrained_contribution_high_pence?: number | null
          constrained_contribution_low_pence?: number | null
          constrained_high_pence: number
          constrained_low_pence: number
          constraints?: Json
          created_at?: string
          evidence_ids?: string[]
          evidence_quality_score?: number | null
          id?: string
          lever?: string
          status?: string
          studio_id: string
          title: string
          unconstrained_base_pence: number
          unconstrained_high_pence: number
          unconstrained_low_pence: number
          updated_at?: string
          value_classification?: string | null
        }
        Update: {
          assumptions?: Json
          calculation_run_id?: string
          capacity_scale_base?: number
          capacity_scale_high?: number
          capacity_scale_low?: number
          classification?: string
          constrained_base_pence?: number
          constrained_contribution_base_pence?: number | null
          constrained_contribution_high_pence?: number | null
          constrained_contribution_low_pence?: number | null
          constrained_high_pence?: number
          constrained_low_pence?: number
          constraints?: Json
          created_at?: string
          evidence_ids?: string[]
          evidence_quality_score?: number | null
          id?: string
          lever?: string
          status?: string
          studio_id?: string
          title?: string
          unconstrained_base_pence?: number
          unconstrained_high_pence?: number
          unconstrained_low_pence?: number
          updated_at?: string
          value_classification?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_economic_opportunities_run_studio_fkey"
            columns: ["calculation_run_id", "studio_id"]
            isOneToOne: false
            referencedRelation: "intelligence_calculation_runs"
            referencedColumns: ["id", "studio_id"]
          },
          {
            foreignKeyName: "intelligence_economic_opportunities_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_evidence: {
        Row: {
          claim: string | null
          classification: string
          confidence: number | null
          created_at: string
          evidence_type: string
          id: string
          metric_value_id: string | null
          observed_at: string | null
          payload: Json
          source_ref: string | null
          source_type: string
          studio_id: string
        }
        Insert: {
          claim?: string | null
          classification: string
          confidence?: number | null
          created_at?: string
          evidence_type: string
          id?: string
          metric_value_id?: string | null
          observed_at?: string | null
          payload?: Json
          source_ref?: string | null
          source_type: string
          studio_id: string
        }
        Update: {
          claim?: string | null
          classification?: string
          confidence?: number | null
          created_at?: string
          evidence_type?: string
          id?: string
          metric_value_id?: string | null
          observed_at?: string | null
          payload?: Json
          source_ref?: string | null
          source_type?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_evidence_metric_value_id_fkey"
            columns: ["metric_value_id"]
            isOneToOne: false
            referencedRelation: "intelligence_metric_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_evidence_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_findings: {
        Row: {
          confidence: number | null
          created_at: string
          evidence_ids: string[]
          finding_type: string
          id: string
          severity: string
          statement: string
          status: string
          studio_id: string
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          evidence_ids?: string[]
          finding_type: string
          id?: string
          severity?: string
          statement: string
          status?: string
          studio_id: string
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          evidence_ids?: string[]
          finding_type?: string
          id?: string
          severity?: string
          statement?: string
          status?: string
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_findings_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_growth_diagnostics: {
        Row: {
          assumptions: Json
          atv_opportunity_pence: number | null
          average_transaction_value_pence: number | null
          baseline_revenue_pence: number | null
          confidence: number | null
          constraints: Json
          created_at: string
          customer_opportunity_pence: number | null
          diagnostic_version: string
          evidence_ids: string[]
          frequency_opportunity_pence: number | null
          id: string
          period_end: string
          period_start: string
          primary_lever: string | null
          purchase_frequency: number | null
          status: string
          studio_id: string
          transactions: number | null
          unique_customers: number | null
          updated_at: string
        }
        Insert: {
          assumptions?: Json
          atv_opportunity_pence?: number | null
          average_transaction_value_pence?: number | null
          baseline_revenue_pence?: number | null
          confidence?: number | null
          constraints?: Json
          created_at?: string
          customer_opportunity_pence?: number | null
          diagnostic_version?: string
          evidence_ids?: string[]
          frequency_opportunity_pence?: number | null
          id?: string
          period_end: string
          period_start: string
          primary_lever?: string | null
          purchase_frequency?: number | null
          status?: string
          studio_id: string
          transactions?: number | null
          unique_customers?: number | null
          updated_at?: string
        }
        Update: {
          assumptions?: Json
          atv_opportunity_pence?: number | null
          average_transaction_value_pence?: number | null
          baseline_revenue_pence?: number | null
          confidence?: number | null
          constraints?: Json
          created_at?: string
          customer_opportunity_pence?: number | null
          diagnostic_version?: string
          evidence_ids?: string[]
          frequency_opportunity_pence?: number | null
          id?: string
          period_end?: string
          period_start?: string
          primary_lever?: string | null
          purchase_frequency?: number | null
          status?: string
          studio_id?: string
          transactions?: number | null
          unique_customers?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_growth_diagnostics_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_interventions: {
        Row: {
          baseline_period_end: string | null
          baseline_period_start: string | null
          created_at: string
          decision_id: string
          description: string
          end_at: string | null
          id: string
          implementation_evidence: Json
          intervention_type: string
          owner: string | null
          start_at: string | null
          status: string
          studio_id: string
          target: string | null
          updated_at: string
        }
        Insert: {
          baseline_period_end?: string | null
          baseline_period_start?: string | null
          created_at?: string
          decision_id: string
          description: string
          end_at?: string | null
          id?: string
          implementation_evidence?: Json
          intervention_type: string
          owner?: string | null
          start_at?: string | null
          status?: string
          studio_id: string
          target?: string | null
          updated_at?: string
        }
        Update: {
          baseline_period_end?: string | null
          baseline_period_start?: string | null
          created_at?: string
          decision_id?: string
          description?: string
          end_at?: string | null
          id?: string
          implementation_evidence?: Json
          intervention_type?: string
          owner?: string | null
          start_at?: string | null
          status?: string
          studio_id?: string
          target?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_interventions_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "intelligence_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_interventions_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_learning: {
        Row: {
          applies_to: Json
          attribution_id: string | null
          confidence: number | null
          created_at: string
          hypothesis: string
          id: string
          intervention_id: string | null
          learning_type: string
          outcome_id: string | null
          recommendation_adjustment: Json
          result: string
          studio_id: string
        }
        Insert: {
          applies_to?: Json
          attribution_id?: string | null
          confidence?: number | null
          created_at?: string
          hypothesis: string
          id?: string
          intervention_id?: string | null
          learning_type: string
          outcome_id?: string | null
          recommendation_adjustment?: Json
          result: string
          studio_id: string
        }
        Update: {
          applies_to?: Json
          attribution_id?: string | null
          confidence?: number | null
          created_at?: string
          hypothesis?: string
          id?: string
          intervention_id?: string | null
          learning_type?: string
          outcome_id?: string | null
          recommendation_adjustment?: Json
          result?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_learning_attribution_id_fkey"
            columns: ["attribution_id"]
            isOneToOne: false
            referencedRelation: "intelligence_attributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_learning_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "intelligence_interventions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_learning_outcome_id_fkey"
            columns: ["outcome_id"]
            isOneToOne: false
            referencedRelation: "intelligence_outcomes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_learning_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_metric_definitions: {
        Row: {
          classification: string
          created_at: string
          description: string | null
          formula: string | null
          id: string
          key: string
          name: string
          status: string
          unit: string | null
          updated_at: string
          version: number
        }
        Insert: {
          classification?: string
          created_at?: string
          description?: string | null
          formula?: string | null
          id?: string
          key: string
          name: string
          status?: string
          unit?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          classification?: string
          created_at?: string
          description?: string | null
          formula?: string | null
          id?: string
          key?: string
          name?: string
          status?: string
          unit?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      intelligence_metric_values: {
        Row: {
          classification: string
          confidence: number | null
          created_at: string
          id: string
          lineage: Json
          metric_definition_id: string
          observed_at: string | null
          source_ref: string | null
          source_type: string | null
          studio_id: string
          unit: string | null
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          classification: string
          confidence?: number | null
          created_at?: string
          id?: string
          lineage?: Json
          metric_definition_id: string
          observed_at?: string | null
          source_ref?: string | null
          source_type?: string | null
          studio_id: string
          unit?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          classification?: string
          confidence?: number | null
          created_at?: string
          id?: string
          lineage?: Json
          metric_definition_id?: string
          observed_at?: string | null
          source_ref?: string | null
          source_type?: string | null
          studio_id?: string
          unit?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_metric_values_metric_definition_id_fkey"
            columns: ["metric_definition_id"]
            isOneToOne: false
            referencedRelation: "intelligence_metric_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_metric_values_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_opportunity_scores: {
        Row: {
          confidence_score: number
          created_at: string
          diagnosis_id: string | null
          diagnostic_id: string | null
          ease_score: number
          evidence_ids: string[]
          evidence_strength_score: number
          feasibility_score: number
          id: string
          impact_score: number
          learning_value_score: number
          lever: string
          opportunity_value_pence: number | null
          playbook_id: string | null
          rationale: string | null
          scoring_version: string
          speed_score: number
          status: string
          strategic_fit_score: number
          studio_id: string
          title: string
          total_score: number | null
          updated_at: string
        }
        Insert: {
          confidence_score: number
          created_at?: string
          diagnosis_id?: string | null
          diagnostic_id?: string | null
          ease_score: number
          evidence_ids?: string[]
          evidence_strength_score: number
          feasibility_score: number
          id?: string
          impact_score: number
          learning_value_score: number
          lever: string
          opportunity_value_pence?: number | null
          playbook_id?: string | null
          rationale?: string | null
          scoring_version?: string
          speed_score: number
          status?: string
          strategic_fit_score: number
          studio_id: string
          title: string
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          diagnosis_id?: string | null
          diagnostic_id?: string | null
          ease_score?: number
          evidence_ids?: string[]
          evidence_strength_score?: number
          feasibility_score?: number
          id?: string
          impact_score?: number
          learning_value_score?: number
          lever?: string
          opportunity_value_pence?: number | null
          playbook_id?: string | null
          rationale?: string | null
          scoring_version?: string
          speed_score?: number
          status?: string
          strategic_fit_score?: number
          studio_id?: string
          title?: string
          total_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_opportunity_scores_diagnosis_id_fkey"
            columns: ["diagnosis_id"]
            isOneToOne: false
            referencedRelation: "intelligence_diagnoses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_opportunity_scores_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "intelligence_growth_diagnostics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_opportunity_scores_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "intelligence_playbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_opportunity_scores_scoring_version_fkey"
            columns: ["scoring_version"]
            isOneToOne: false
            referencedRelation: "intelligence_opportunity_scoring_versions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "intelligence_opportunity_scores_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_opportunity_scoring_versions: {
        Row: {
          created_at: string
          description: string | null
          key: string
          name: string
          status: string
          weights: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          key: string
          name: string
          status?: string
          weights: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          key?: string
          name?: string
          status?: string
          weights?: Json
        }
        Relationships: []
      }
      intelligence_outcomes: {
        Row: {
          baseline_value: number | null
          classification: string
          confidence: number | null
          created_at: string
          delta: number | null
          id: string
          intervention_id: string
          measurement_period_end: string
          measurement_period_start: string
          metric_definition_id: string | null
          observed_at: string
          observed_value: number | null
          payload: Json
          source_ref: string | null
          source_type: string
          studio_id: string
          value_classification: string | null
        }
        Insert: {
          baseline_value?: number | null
          classification?: string
          confidence?: number | null
          created_at?: string
          delta?: number | null
          id?: string
          intervention_id: string
          measurement_period_end: string
          measurement_period_start: string
          metric_definition_id?: string | null
          observed_at?: string
          observed_value?: number | null
          payload?: Json
          source_ref?: string | null
          source_type: string
          studio_id: string
          value_classification?: string | null
        }
        Update: {
          baseline_value?: number | null
          classification?: string
          confidence?: number | null
          created_at?: string
          delta?: number | null
          id?: string
          intervention_id?: string
          measurement_period_end?: string
          measurement_period_start?: string
          metric_definition_id?: string | null
          observed_at?: string
          observed_value?: number | null
          payload?: Json
          source_ref?: string | null
          source_type?: string
          studio_id?: string
          value_classification?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_outcomes_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "intelligence_interventions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_outcomes_metric_definition_id_fkey"
            columns: ["metric_definition_id"]
            isOneToOne: false
            referencedRelation: "intelligence_metric_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_outcomes_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_playbooks: {
        Row: {
          action_steps: Json
          category: string
          created_at: string
          effort_score: number
          expected_time_to_signal_days: number | null
          guardrail_metric_keys: Json
          hypothesis: string
          id: string
          key: string
          lever: string
          name: string
          primary_metric_key: string
          required_metric_keys: Json
          risk_score: number
          status: string
          trigger_description: string
          updated_at: string
          version: number
        }
        Insert: {
          action_steps?: Json
          category: string
          created_at?: string
          effort_score?: number
          expected_time_to_signal_days?: number | null
          guardrail_metric_keys?: Json
          hypothesis: string
          id?: string
          key: string
          lever: string
          name: string
          primary_metric_key: string
          required_metric_keys?: Json
          risk_score?: number
          status?: string
          trigger_description: string
          updated_at?: string
          version?: number
        }
        Update: {
          action_steps?: Json
          category?: string
          created_at?: string
          effort_score?: number
          expected_time_to_signal_days?: number | null
          guardrail_metric_keys?: Json
          hypothesis?: string
          id?: string
          key?: string
          lever?: string
          name?: string
          primary_metric_key?: string
          required_metric_keys?: Json
          risk_score?: number
          status?: string
          trigger_description?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      intelligence_recommendations: {
        Row: {
          confidence: number | null
          created_at: string
          diagnosis_id: string
          evidence_ids: string[]
          expected_effect: Json
          id: string
          implementation_effort: string | null
          measurement_window_days: number | null
          opportunity_id: string | null
          opportunity_score_id: string | null
          playbook_id: string | null
          primary_metric_key: string | null
          rationale: string | null
          recommendation: string
          status: string
          studio_id: string
          target_value: number | null
          title: string
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          diagnosis_id: string
          evidence_ids?: string[]
          expected_effect?: Json
          id?: string
          implementation_effort?: string | null
          measurement_window_days?: number | null
          opportunity_id?: string | null
          opportunity_score_id?: string | null
          playbook_id?: string | null
          primary_metric_key?: string | null
          rationale?: string | null
          recommendation: string
          status?: string
          studio_id: string
          target_value?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          diagnosis_id?: string
          evidence_ids?: string[]
          expected_effect?: Json
          id?: string
          implementation_effort?: string | null
          measurement_window_days?: number | null
          opportunity_id?: string | null
          opportunity_score_id?: string | null
          playbook_id?: string | null
          primary_metric_key?: string | null
          rationale?: string | null
          recommendation?: string
          status?: string
          studio_id?: string
          target_value?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_recommendations_diagnosis_id_fkey"
            columns: ["diagnosis_id"]
            isOneToOne: false
            referencedRelation: "intelligence_diagnoses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_recommendations_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "visibility_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_recommendations_opportunity_score_id_fkey"
            columns: ["opportunity_score_id"]
            isOneToOne: false
            referencedRelation: "intelligence_opportunity_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_recommendations_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "intelligence_playbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_recommendations_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_source_registry: {
        Row: {
          approved: boolean
          created_at: string
          domain: string | null
          geographic_relevance: string | null
          id: string
          last_reviewed_at: string | null
          metadata: Json
          notes: string | null
          reliability_score: number | null
          source_key: string
          source_name: string
          source_type: string
          source_url: string | null
          updated_at: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          domain?: string | null
          geographic_relevance?: string | null
          id?: string
          last_reviewed_at?: string | null
          metadata?: Json
          notes?: string | null
          reliability_score?: number | null
          source_key: string
          source_name: string
          source_type: string
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          domain?: string | null
          geographic_relevance?: string | null
          id?: string
          last_reviewed_at?: string | null
          metadata?: Json
          notes?: string | null
          reliability_score?: number | null
          source_key?: string
          source_name?: string
          source_type?: string
          source_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      intelligence_taxonomy: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          metadata: Json
          parent_id: string | null
          taxonomy_key: string
          taxonomy_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          metadata?: Json
          parent_id?: string | null
          taxonomy_key: string
          taxonomy_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          parent_id?: string | null
          taxonomy_key?: string
          taxonomy_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_taxonomy_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "intelligence_taxonomy"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_actions: {
        Row: {
          action_key: string
          business_key: string
          completed_at: string | null
          completion_evidence: string | null
          created_at: string
          cycle_id: string | null
          deadline: string | null
          id: string
          metadata: Json
          owner: string | null
          priority_id: string | null
          source_ref: string | null
          source_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          action_key: string
          business_key: string
          completed_at?: string | null
          completion_evidence?: string | null
          created_at?: string
          cycle_id?: string | null
          deadline?: string | null
          id?: string
          metadata?: Json
          owner?: string | null
          priority_id?: string | null
          source_ref?: string | null
          source_type?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          action_key?: string
          business_key?: string
          completed_at?: string | null
          completion_evidence?: string | null
          created_at?: string
          cycle_id?: string | null
          deadline?: string | null
          id?: string
          metadata?: Json
          owner?: string | null
          priority_id?: string | null
          source_ref?: string | null
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_actions_business_key_fkey"
            columns: ["business_key"]
            isOneToOne: false
            referencedRelation: "ops_businesses"
            referencedColumns: ["business_key"]
          },
          {
            foreignKeyName: "ops_actions_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "ops_current_founder_brief"
            referencedColumns: ["cycle_id"]
          },
          {
            foreignKeyName: "ops_actions_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "ops_operating_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_actions_priority_id_fkey"
            columns: ["priority_id"]
            isOneToOne: false
            referencedRelation: "ops_priorities"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_asset_relationships: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          relationship_type: string
          source_asset_id: string
          target_asset_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          relationship_type: string
          source_asset_id: string
          target_asset_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          relationship_type?: string
          source_asset_id?: string
          target_asset_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_asset_relationships_source_asset_id_fkey"
            columns: ["source_asset_id"]
            isOneToOne: false
            referencedRelation: "ops_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_asset_relationships_target_asset_id_fkey"
            columns: ["target_asset_id"]
            isOneToOne: false
            referencedRelation: "ops_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_assets: {
        Row: {
          asset_key: string
          asset_type: string
          business_key: string
          canonical_system_id: string | null
          canonical_uri: string | null
          category: string | null
          classification_confidence: number | null
          content_hash: string | null
          created_at: string
          drive_file_id: string | null
          github_path: string | null
          github_repo: string | null
          id: string
          last_verified_at: string | null
          metadata: Json
          provenance: Json
          review_status: string
          sensitivity: string
          status: string
          supabase_reference: string | null
          supersedes_asset_id: string | null
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          asset_key: string
          asset_type: string
          business_key: string
          canonical_system_id?: string | null
          canonical_uri?: string | null
          category?: string | null
          classification_confidence?: number | null
          content_hash?: string | null
          created_at?: string
          drive_file_id?: string | null
          github_path?: string | null
          github_repo?: string | null
          id?: string
          last_verified_at?: string | null
          metadata?: Json
          provenance?: Json
          review_status?: string
          sensitivity?: string
          status?: string
          supabase_reference?: string | null
          supersedes_asset_id?: string | null
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          asset_key?: string
          asset_type?: string
          business_key?: string
          canonical_system_id?: string | null
          canonical_uri?: string | null
          category?: string | null
          classification_confidence?: number | null
          content_hash?: string | null
          created_at?: string
          drive_file_id?: string | null
          github_path?: string | null
          github_repo?: string | null
          id?: string
          last_verified_at?: string | null
          metadata?: Json
          provenance?: Json
          review_status?: string
          sensitivity?: string
          status?: string
          supabase_reference?: string | null
          supersedes_asset_id?: string | null
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ops_assets_business_key_fkey"
            columns: ["business_key"]
            isOneToOne: false
            referencedRelation: "ops_businesses"
            referencedColumns: ["business_key"]
          },
          {
            foreignKeyName: "ops_assets_canonical_system_id_fkey"
            columns: ["canonical_system_id"]
            isOneToOne: false
            referencedRelation: "ops_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_assets_supersedes_asset_id_fkey"
            columns: ["supersedes_asset_id"]
            isOneToOne: false
            referencedRelation: "ops_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_businesses: {
        Row: {
          business_key: string
          canonical_domain: string | null
          created_at: string
          drive_folder_id: string | null
          metadata: Json
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          business_key: string
          canonical_domain?: string | null
          created_at?: string
          drive_folder_id?: string | null
          metadata?: Json
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          business_key?: string
          canonical_domain?: string | null
          created_at?: string
          drive_folder_id?: string | null
          metadata?: Json
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ops_changes: {
        Row: {
          approved_by: string | null
          business_key: string
          canonical_system_id: string | null
          change_key: string
          change_type: string
          completed_at: string | null
          created_at: string
          id: string
          metadata: Json
          requested_by: string | null
          risk_level: string
          rollback_plan: string | null
          source_ref: string | null
          started_at: string | null
          status: string
          summary: string | null
          title: string
          updated_at: string
          verification: Json
        }
        Insert: {
          approved_by?: string | null
          business_key: string
          canonical_system_id?: string | null
          change_key: string
          change_type: string
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          requested_by?: string | null
          risk_level?: string
          rollback_plan?: string | null
          source_ref?: string | null
          started_at?: string | null
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
          verification?: Json
        }
        Update: {
          approved_by?: string | null
          business_key?: string
          canonical_system_id?: string | null
          change_key?: string
          change_type?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          requested_by?: string | null
          risk_level?: string
          rollback_plan?: string | null
          source_ref?: string | null
          started_at?: string | null
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          verification?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ops_changes_business_key_fkey"
            columns: ["business_key"]
            isOneToOne: false
            referencedRelation: "ops_businesses"
            referencedColumns: ["business_key"]
          },
          {
            foreignKeyName: "ops_changes_canonical_system_id_fkey"
            columns: ["canonical_system_id"]
            isOneToOne: false
            referencedRelation: "ops_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_decisions: {
        Row: {
          alternatives: Json
          approver: string | null
          business_key: string
          context: string | null
          created_at: string
          decided_at: string | null
          decision: string | null
          decision_key: string
          decision_type: string | null
          id: string
          impacts: Json
          metadata: Json
          rationale: string | null
          related_asset_id: string | null
          related_workflow_id: string | null
          review_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          alternatives?: Json
          approver?: string | null
          business_key: string
          context?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: string | null
          decision_key: string
          decision_type?: string | null
          id?: string
          impacts?: Json
          metadata?: Json
          rationale?: string | null
          related_asset_id?: string | null
          related_workflow_id?: string | null
          review_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          alternatives?: Json
          approver?: string | null
          business_key?: string
          context?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: string | null
          decision_key?: string
          decision_type?: string | null
          id?: string
          impacts?: Json
          metadata?: Json
          rationale?: string | null
          related_asset_id?: string | null
          related_workflow_id?: string | null
          review_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_decisions_business_key_fkey"
            columns: ["business_key"]
            isOneToOne: false
            referencedRelation: "ops_businesses"
            referencedColumns: ["business_key"]
          },
          {
            foreignKeyName: "ops_decisions_related_asset_id_fkey"
            columns: ["related_asset_id"]
            isOneToOne: false
            referencedRelation: "ops_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_decisions_related_workflow_id_fkey"
            columns: ["related_workflow_id"]
            isOneToOne: false
            referencedRelation: "ops_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_evidence: {
        Row: {
          business_key: string
          classification: string
          confidence: number | null
          created_at: string
          evidence_key: string
          evidence_type: string
          id: string
          metadata: Json
          observed_at: string | null
          related_decision_id: string | null
          related_priority_id: string | null
          source_ref: string | null
          source_system_key: string | null
          statement: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          business_key: string
          classification: string
          confidence?: number | null
          created_at?: string
          evidence_key: string
          evidence_type: string
          id?: string
          metadata?: Json
          observed_at?: string | null
          related_decision_id?: string | null
          related_priority_id?: string | null
          source_ref?: string | null
          source_system_key?: string | null
          statement: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          business_key?: string
          classification?: string
          confidence?: number | null
          created_at?: string
          evidence_key?: string
          evidence_type?: string
          id?: string
          metadata?: Json
          observed_at?: string | null
          related_decision_id?: string | null
          related_priority_id?: string | null
          source_ref?: string | null
          source_system_key?: string | null
          statement?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_evidence_business_key_fkey"
            columns: ["business_key"]
            isOneToOne: false
            referencedRelation: "ops_businesses"
            referencedColumns: ["business_key"]
          },
          {
            foreignKeyName: "ops_evidence_related_decision_id_fkey"
            columns: ["related_decision_id"]
            isOneToOne: false
            referencedRelation: "ops_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_evidence_related_priority_id_fkey"
            columns: ["related_priority_id"]
            isOneToOne: false
            referencedRelation: "ops_priorities"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_exceptions: {
        Row: {
          created_at: string
          description: string | null
          exception_key: string
          exception_type: string
          id: string
          intake_item_id: string | null
          metadata: Json
          requires_human: boolean
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          title: string
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          exception_key: string
          exception_type: string
          id?: string
          intake_item_id?: string | null
          metadata?: Json
          requires_human?: boolean
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          exception_key?: string
          exception_type?: string
          id?: string
          intake_item_id?: string | null
          metadata?: Json
          requires_human?: boolean
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ops_exceptions_intake_item_id_fkey"
            columns: ["intake_item_id"]
            isOneToOne: false
            referencedRelation: "ops_intake_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_exceptions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "ops_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_ideas: {
        Row: {
          business_key: string
          created_at: string
          description: string | null
          id: string
          idea_key: string
          metadata: Json
          revisit_at: string | null
          scoring: Json
          source_ref: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          business_key: string
          created_at?: string
          description?: string | null
          id?: string
          idea_key: string
          metadata?: Json
          revisit_at?: string | null
          scoring?: Json
          source_ref?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          business_key?: string
          created_at?: string
          description?: string | null
          id?: string
          idea_key?: string
          metadata?: Json
          revisit_at?: string | null
          scoring?: Json
          source_ref?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_ideas_business_key_fkey"
            columns: ["business_key"]
            isOneToOne: false
            referencedRelation: "ops_businesses"
            referencedColumns: ["business_key"]
          },
        ]
      }
      ops_intake_items: {
        Row: {
          canonical_system_id: string | null
          classification_confidence: number | null
          content_hash: string | null
          created_at: string
          destination_folder_id: string | null
          detected_asset_type: string | null
          detected_business_key: string | null
          detected_category: string | null
          drive_file_id: string
          duplicate_of_asset_id: string | null
          error_detail: string | null
          extracted_summary: string | null
          first_seen_at: string
          id: string
          metadata: Json
          mime_type: string | null
          original_name: string
          processed_at: string | null
          processing_status: string
          proposed_name: string | null
          result_asset_id: string | null
          updated_at: string
        }
        Insert: {
          canonical_system_id?: string | null
          classification_confidence?: number | null
          content_hash?: string | null
          created_at?: string
          destination_folder_id?: string | null
          detected_asset_type?: string | null
          detected_business_key?: string | null
          detected_category?: string | null
          drive_file_id: string
          duplicate_of_asset_id?: string | null
          error_detail?: string | null
          extracted_summary?: string | null
          first_seen_at?: string
          id?: string
          metadata?: Json
          mime_type?: string | null
          original_name: string
          processed_at?: string | null
          processing_status?: string
          proposed_name?: string | null
          result_asset_id?: string | null
          updated_at?: string
        }
        Update: {
          canonical_system_id?: string | null
          classification_confidence?: number | null
          content_hash?: string | null
          created_at?: string
          destination_folder_id?: string | null
          detected_asset_type?: string | null
          detected_business_key?: string | null
          detected_category?: string | null
          drive_file_id?: string
          duplicate_of_asset_id?: string | null
          error_detail?: string | null
          extracted_summary?: string | null
          first_seen_at?: string
          id?: string
          metadata?: Json
          mime_type?: string | null
          original_name?: string
          processed_at?: string | null
          processing_status?: string
          proposed_name?: string | null
          result_asset_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_intake_items_canonical_system_id_fkey"
            columns: ["canonical_system_id"]
            isOneToOne: false
            referencedRelation: "ops_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_intake_items_detected_business_key_fkey"
            columns: ["detected_business_key"]
            isOneToOne: false
            referencedRelation: "ops_businesses"
            referencedColumns: ["business_key"]
          },
          {
            foreignKeyName: "ops_intake_items_duplicate_of_asset_id_fkey"
            columns: ["duplicate_of_asset_id"]
            isOneToOne: false
            referencedRelation: "ops_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_intake_items_result_asset_id_fkey"
            columns: ["result_asset_id"]
            isOneToOne: false
            referencedRelation: "ops_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_integrations: {
        Row: {
          auth_method: string | null
          created_at: string
          data_objects: string[]
          direction: string
          failure_mode: string | null
          id: string
          integration_key: string
          last_verified_at: string | null
          metadata: Json
          monitoring: Json
          name: string
          owner: string | null
          purpose: string
          retry_policy: Json
          source_system_id: string | null
          status: string
          target_system_id: string | null
          trigger_type: string | null
          updated_at: string
        }
        Insert: {
          auth_method?: string | null
          created_at?: string
          data_objects?: string[]
          direction?: string
          failure_mode?: string | null
          id?: string
          integration_key: string
          last_verified_at?: string | null
          metadata?: Json
          monitoring?: Json
          name: string
          owner?: string | null
          purpose: string
          retry_policy?: Json
          source_system_id?: string | null
          status?: string
          target_system_id?: string | null
          trigger_type?: string | null
          updated_at?: string
        }
        Update: {
          auth_method?: string | null
          created_at?: string
          data_objects?: string[]
          direction?: string
          failure_mode?: string | null
          id?: string
          integration_key?: string
          last_verified_at?: string | null
          metadata?: Json
          monitoring?: Json
          name?: string
          owner?: string | null
          purpose?: string
          retry_policy?: Json
          source_system_id?: string | null
          status?: string
          target_system_id?: string | null
          trigger_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_integrations_source_system_id_fkey"
            columns: ["source_system_id"]
            isOneToOne: false
            referencedRelation: "ops_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_integrations_target_system_id_fkey"
            columns: ["target_system_id"]
            isOneToOne: false
            referencedRelation: "ops_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_metric_definitions: {
        Row: {
          active: boolean
          business_key: string
          cadence: string
          calculation_definition: string | null
          created_at: string
          description: string | null
          domain: string
          id: string
          is_primary: boolean
          metadata: Json
          metric_key: string
          name: string
          source_object: string | null
          source_system_key: string | null
          target_direction: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          business_key: string
          cadence?: string
          calculation_definition?: string | null
          created_at?: string
          description?: string | null
          domain: string
          id?: string
          is_primary?: boolean
          metadata?: Json
          metric_key: string
          name: string
          source_object?: string | null
          source_system_key?: string | null
          target_direction?: string | null
          unit: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          business_key?: string
          cadence?: string
          calculation_definition?: string | null
          created_at?: string
          description?: string | null
          domain?: string
          id?: string
          is_primary?: boolean
          metadata?: Json
          metric_key?: string
          name?: string
          source_object?: string | null
          source_system_key?: string | null
          target_direction?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_metric_definitions_business_key_fkey"
            columns: ["business_key"]
            isOneToOne: false
            referencedRelation: "ops_businesses"
            referencedColumns: ["business_key"]
          },
        ]
      }
      ops_metric_snapshots: {
        Row: {
          business_key: string
          created_at: string
          denominator: number | null
          evidence_classification: string
          id: string
          measured_at: string
          metadata: Json
          metric_key: string
          numerator: number | null
          period_end: string | null
          period_start: string | null
          source_ref: string | null
          value: number | null
        }
        Insert: {
          business_key: string
          created_at?: string
          denominator?: number | null
          evidence_classification?: string
          id?: string
          measured_at?: string
          metadata?: Json
          metric_key: string
          numerator?: number | null
          period_end?: string | null
          period_start?: string | null
          source_ref?: string | null
          value?: number | null
        }
        Update: {
          business_key?: string
          created_at?: string
          denominator?: number | null
          evidence_classification?: string
          id?: string
          measured_at?: string
          metadata?: Json
          metric_key?: string
          numerator?: number | null
          period_end?: string | null
          period_start?: string | null
          source_ref?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ops_metric_snapshots_business_key_fkey"
            columns: ["business_key"]
            isOneToOne: false
            referencedRelation: "ops_businesses"
            referencedColumns: ["business_key"]
          },
          {
            foreignKeyName: "ops_metric_snapshots_metric_key_fkey"
            columns: ["metric_key"]
            isOneToOne: false
            referencedRelation: "ops_metric_definitions"
            referencedColumns: ["metric_key"]
          },
        ]
      }
      ops_operating_cycles: {
        Row: {
          business_key: string
          closed_at: string | null
          company_outcome: string | null
          created_at: string
          cycle_key: string
          cycle_type: string
          id: string
          metadata: Json
          opened_at: string
          owner: string | null
          period_end: string
          period_start: string
          review_summary: string | null
          status: string
          success_measure: string | null
          updated_at: string
        }
        Insert: {
          business_key: string
          closed_at?: string | null
          company_outcome?: string | null
          created_at?: string
          cycle_key: string
          cycle_type: string
          id?: string
          metadata?: Json
          opened_at?: string
          owner?: string | null
          period_end: string
          period_start: string
          review_summary?: string | null
          status?: string
          success_measure?: string | null
          updated_at?: string
        }
        Update: {
          business_key?: string
          closed_at?: string | null
          company_outcome?: string | null
          created_at?: string
          cycle_key?: string
          cycle_type?: string
          id?: string
          metadata?: Json
          opened_at?: string
          owner?: string | null
          period_end?: string
          period_start?: string
          review_summary?: string | null
          status?: string
          success_measure?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_operating_cycles_business_key_fkey"
            columns: ["business_key"]
            isOneToOne: false
            referencedRelation: "ops_businesses"
            referencedColumns: ["business_key"]
          },
        ]
      }
      ops_priorities: {
        Row: {
          business_key: string
          created_at: string
          cycle_id: string | null
          deadline: string | null
          id: string
          metadata: Json
          next_action: string | null
          outcome: string | null
          owner: string | null
          priority_key: string
          rank: number
          risk_summary: string | null
          scoring: Json
          source_ref: string | null
          status: string
          success_criteria: string | null
          title: string
          updated_at: string
        }
        Insert: {
          business_key: string
          created_at?: string
          cycle_id?: string | null
          deadline?: string | null
          id?: string
          metadata?: Json
          next_action?: string | null
          outcome?: string | null
          owner?: string | null
          priority_key: string
          rank?: number
          risk_summary?: string | null
          scoring?: Json
          source_ref?: string | null
          status?: string
          success_criteria?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          business_key?: string
          created_at?: string
          cycle_id?: string | null
          deadline?: string | null
          id?: string
          metadata?: Json
          next_action?: string | null
          outcome?: string | null
          owner?: string | null
          priority_key?: string
          rank?: number
          risk_summary?: string | null
          scoring?: Json
          source_ref?: string | null
          status?: string
          success_criteria?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_priorities_business_key_fkey"
            columns: ["business_key"]
            isOneToOne: false
            referencedRelation: "ops_businesses"
            referencedColumns: ["business_key"]
          },
          {
            foreignKeyName: "ops_priorities_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "ops_current_founder_brief"
            referencedColumns: ["cycle_id"]
          },
          {
            foreignKeyName: "ops_priorities_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "ops_operating_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_risks: {
        Row: {
          business_key: string
          category: string | null
          created_at: string
          cycle_id: string | null
          due_at: string | null
          id: string
          impact: number
          likelihood: number
          metadata: Json
          mitigation: string | null
          next_action: string | null
          owner: string | null
          risk_key: string
          risk_score: number | null
          source_ref: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          business_key: string
          category?: string | null
          created_at?: string
          cycle_id?: string | null
          due_at?: string | null
          id?: string
          impact?: number
          likelihood?: number
          metadata?: Json
          mitigation?: string | null
          next_action?: string | null
          owner?: string | null
          risk_key: string
          risk_score?: number | null
          source_ref?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          business_key?: string
          category?: string | null
          created_at?: string
          cycle_id?: string | null
          due_at?: string | null
          id?: string
          impact?: number
          likelihood?: number
          metadata?: Json
          mitigation?: string | null
          next_action?: string | null
          owner?: string | null
          risk_key?: string
          risk_score?: number | null
          source_ref?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_risks_business_key_fkey"
            columns: ["business_key"]
            isOneToOne: false
            referencedRelation: "ops_businesses"
            referencedColumns: ["business_key"]
          },
          {
            foreignKeyName: "ops_risks_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "ops_current_founder_brief"
            referencedColumns: ["cycle_id"]
          },
          {
            foreignKeyName: "ops_risks_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "ops_operating_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_routes: {
        Row: {
          active: boolean
          asset_type: string
          auto_file_threshold: number
          business_key: string
          canonical_system_id: string | null
          category: string | null
          created_at: string
          destination_folder_id: string | null
          destination_path: string | null
          id: string
          metadata: Json
          naming_pattern: string | null
          review_threshold: number
          route_key: string
          sensitivity: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          asset_type: string
          auto_file_threshold?: number
          business_key: string
          canonical_system_id?: string | null
          category?: string | null
          created_at?: string
          destination_folder_id?: string | null
          destination_path?: string | null
          id?: string
          metadata?: Json
          naming_pattern?: string | null
          review_threshold?: number
          route_key: string
          sensitivity?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          asset_type?: string
          auto_file_threshold?: number
          business_key?: string
          canonical_system_id?: string | null
          category?: string | null
          created_at?: string
          destination_folder_id?: string | null
          destination_path?: string | null
          id?: string
          metadata?: Json
          naming_pattern?: string | null
          review_threshold?: number
          route_key?: string
          sensitivity?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_routes_business_key_fkey"
            columns: ["business_key"]
            isOneToOne: false
            referencedRelation: "ops_businesses"
            referencedColumns: ["business_key"]
          },
          {
            foreignKeyName: "ops_routes_canonical_system_id_fkey"
            columns: ["canonical_system_id"]
            isOneToOne: false
            referencedRelation: "ops_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_systems: {
        Row: {
          agent_access: string | null
          backup_strategy: string | null
          base_url: string | null
          business_scope: string[]
          canonical_role: string
          category: string
          cost_model: string | null
          created_at: string
          data_classification: string
          environment: string | null
          external_id: string | null
          failure_impact: string | null
          id: string
          metadata: Json
          name: string
          owner: string | null
          status: string
          system_key: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          agent_access?: string | null
          backup_strategy?: string | null
          base_url?: string | null
          business_scope?: string[]
          canonical_role: string
          category: string
          cost_model?: string | null
          created_at?: string
          data_classification?: string
          environment?: string | null
          external_id?: string | null
          failure_impact?: string | null
          id?: string
          metadata?: Json
          name: string
          owner?: string | null
          status?: string
          system_key: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          agent_access?: string | null
          backup_strategy?: string | null
          base_url?: string | null
          business_scope?: string[]
          canonical_role?: string
          category?: string
          cost_model?: string | null
          created_at?: string
          data_classification?: string
          environment?: string | null
          external_id?: string | null
          failure_impact?: string | null
          id?: string
          metadata?: Json
          name?: string
          owner?: string | null
          status?: string
          system_key?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      ops_workflows: {
        Row: {
          approval_rules: Json
          automation_level: string
          business_key: string
          created_at: string
          failure_handling: Json
          id: string
          input_contract: Json
          metadata: Json
          name: string
          output_contract: Json
          owner: string | null
          purpose: string
          service_level: Json
          status: string
          steps: Json
          trigger_event: string | null
          updated_at: string
          version: string
          workflow_key: string
        }
        Insert: {
          approval_rules?: Json
          automation_level?: string
          business_key: string
          created_at?: string
          failure_handling?: Json
          id?: string
          input_contract?: Json
          metadata?: Json
          name: string
          output_contract?: Json
          owner?: string | null
          purpose: string
          service_level?: Json
          status?: string
          steps?: Json
          trigger_event?: string | null
          updated_at?: string
          version?: string
          workflow_key: string
        }
        Update: {
          approval_rules?: Json
          automation_level?: string
          business_key?: string
          created_at?: string
          failure_handling?: Json
          id?: string
          input_contract?: Json
          metadata?: Json
          name?: string
          output_contract?: Json
          owner?: string | null
          purpose?: string
          service_level?: Json
          status?: string
          steps?: Json
          trigger_event?: string | null
          updated_at?: string
          version?: string
          workflow_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_workflows_business_key_fkey"
            columns: ["business_key"]
            isOneToOne: false
            referencedRelation: "ops_businesses"
            referencedColumns: ["business_key"]
          },
        ]
      }
      orders: {
        Row: {
          amount_total: number | null
          created_at: string
          currency: string | null
          customer_email: string | null
          id: string
          metadata: Json
          offer_slug: string
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          stripe_session_id: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_total?: number | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          id?: string
          metadata?: Json
          offer_slug: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_session_id: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_total?: number | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          id?: string
          metadata?: Json
          offer_slug?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_session_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      platform_admins: {
        Row: {
          active: boolean
          created_at: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          artist_count: number | null
          created_at: string
          full_name: string | null
          id: string
          location: string | null
          onboarding_stage: string
          studio_name: string | null
          updated_at: string
        }
        Insert: {
          artist_count?: number | null
          created_at?: string
          full_name?: string | null
          id: string
          location?: string | null
          onboarding_stage?: string
          studio_name?: string | null
          updated_at?: string
        }
        Update: {
          artist_count?: number | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          onboarding_stage?: string
          studio_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      public_contact_requests: {
        Row: {
          business_key: string
          consent_at: string
          created_at: string
          data_classification: string
          email: string
          hubspot_company_id: string | null
          hubspot_contact_id: string | null
          hubspot_deal_id: string | null
          hubspot_last_attempt_at: string | null
          hubspot_sync_attempts: number
          hubspot_sync_error: string | null
          hubspot_synced_at: string | null
          id: string
          internal_notified_at: string | null
          location: string | null
          message: string
          metadata: Json
          name: string
          phone: string | null
          platform_key: string
          source: string
          status: string
          studio_name: string | null
          topic: string
          updated_at: string
          website: string | null
        }
        Insert: {
          business_key?: string
          consent_at: string
          created_at?: string
          data_classification?: string
          email: string
          hubspot_company_id?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          hubspot_last_attempt_at?: string | null
          hubspot_sync_attempts?: number
          hubspot_sync_error?: string | null
          hubspot_synced_at?: string | null
          id?: string
          internal_notified_at?: string | null
          location?: string | null
          message: string
          metadata?: Json
          name: string
          phone?: string | null
          platform_key?: string
          source?: string
          status?: string
          studio_name?: string | null
          topic: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          business_key?: string
          consent_at?: string
          created_at?: string
          data_classification?: string
          email?: string
          hubspot_company_id?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          hubspot_last_attempt_at?: string | null
          hubspot_sync_attempts?: number
          hubspot_sync_error?: string | null
          hubspot_synced_at?: string | null
          id?: string
          internal_notified_at?: string | null
          location?: string | null
          message?: string
          metadata?: Json
          name?: string
          phone?: string | null
          platform_key?: string
          source?: string
          status?: string
          studio_name?: string | null
          topic?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      public_endpoint_rate_limits: {
        Row: {
          endpoint: string
          key_hash: string
          last_seen_at: string
          request_count: number
          window_started_at: string
        }
        Insert: {
          endpoint: string
          key_hash: string
          last_seen_at?: string
          request_count?: number
          window_started_at: string
        }
        Update: {
          endpoint?: string
          key_hash?: string
          last_seen_at?: string
          request_count?: number
          window_started_at?: string
        }
        Relationships: []
      }
      qa_checks: {
        Row: {
          audit_id: string | null
          check_key: string
          checked_at: string
          evidence: Json
          id: string
          message: string
          report_version_id: string | null
          severity: string
          status: string
        }
        Insert: {
          audit_id?: string | null
          check_key: string
          checked_at?: string
          evidence?: Json
          id?: string
          message: string
          report_version_id?: string | null
          severity?: string
          status: string
        }
        Update: {
          audit_id?: string | null
          check_key?: string
          checked_at?: string
          evidence?: Json
          id?: string
          message?: string
          report_version_id?: string | null
          severity?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "qa_checks_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_checks_report_version_id_fkey"
            columns: ["report_version_id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      report_versions: {
        Row: {
          audit_id: string
          generated_at: string
          id: string
          manifest: Json
          manifest_hash: string | null
          pdf_storage_path: string | null
          qa_status: string
          secure_token_hash: string | null
          status: string
          version: number
          web_slug: string | null
        }
        Insert: {
          audit_id: string
          generated_at?: string
          id?: string
          manifest?: Json
          manifest_hash?: string | null
          pdf_storage_path?: string | null
          qa_status?: string
          secure_token_hash?: string | null
          status?: string
          version: number
          web_slug?: string | null
        }
        Update: {
          audit_id?: string
          generated_at?: string
          id?: string
          manifest?: Json
          manifest_hash?: string | null
          pdf_storage_path?: string | null
          qa_status?: string
          secure_token_hash?: string | null
          status?: string
          version?: number
          web_slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_versions_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_audit_leads: {
        Row: {
          area: string | null
          average_booking_value: number | null
          cancellation_rate: number | null
          consent_at: string
          created_at: string
          email: string
          hubspot_company_id: string | null
          hubspot_contact_id: string | null
          hubspot_deal_id: string | null
          hubspot_last_attempt_at: string | null
          hubspot_sync_attempts: number
          hubspot_sync_error: string | null
          hubspot_synced_at: string | null
          id: string
          internal_notified_at: string | null
          marketing_consent: boolean
          monthly_available_hours: number | null
          monthly_booked_hours: number | null
          monthly_bookings: number | null
          monthly_enquiries: number | null
          monthly_revenue_band: string | null
          name: string
          no_show_rate: number | null
          primary_problem: string | null
          repeat_client_rate: number | null
          source: string
          source_context: Json
          status: string
          studio_name: string
          team_size: number
          website: string | null
        }
        Insert: {
          area?: string | null
          average_booking_value?: number | null
          cancellation_rate?: number | null
          consent_at: string
          created_at?: string
          email: string
          hubspot_company_id?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          hubspot_last_attempt_at?: string | null
          hubspot_sync_attempts?: number
          hubspot_sync_error?: string | null
          hubspot_synced_at?: string | null
          id?: string
          internal_notified_at?: string | null
          marketing_consent?: boolean
          monthly_available_hours?: number | null
          monthly_booked_hours?: number | null
          monthly_bookings?: number | null
          monthly_enquiries?: number | null
          monthly_revenue_band?: string | null
          name: string
          no_show_rate?: number | null
          primary_problem?: string | null
          repeat_client_rate?: number | null
          source?: string
          source_context?: Json
          status?: string
          studio_name: string
          team_size: number
          website?: string | null
        }
        Update: {
          area?: string | null
          average_booking_value?: number | null
          cancellation_rate?: number | null
          consent_at?: string
          created_at?: string
          email?: string
          hubspot_company_id?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          hubspot_last_attempt_at?: string | null
          hubspot_sync_attempts?: number
          hubspot_sync_error?: string | null
          hubspot_synced_at?: string | null
          id?: string
          internal_notified_at?: string | null
          marketing_consent?: boolean
          monthly_available_hours?: number | null
          monthly_booked_hours?: number | null
          monthly_bookings?: number | null
          monthly_enquiries?: number | null
          monthly_revenue_band?: string | null
          name?: string
          no_show_rate?: number | null
          primary_problem?: string | null
          repeat_client_rate?: number | null
          source?: string
          source_context?: Json
          status?: string
          studio_name?: string
          team_size?: number
          website?: string | null
        }
        Relationships: []
      }
      revenue_audits: {
        Row: {
          audit_version: string
          cancellation_opportunity: number
          capacity_opportunity: number
          conversion_opportunity: number
          created_at: string
          findings: Json
          id: string
          lead_id: string
          opportunity_high: number
          opportunity_low: number
          primary_opportunity: string
          recommendations: Json
          retention_opportunity: number
          score: number
        }
        Insert: {
          audit_version?: string
          cancellation_opportunity?: number
          capacity_opportunity?: number
          conversion_opportunity?: number
          created_at?: string
          findings?: Json
          id?: string
          lead_id: string
          opportunity_high?: number
          opportunity_low?: number
          primary_opportunity: string
          recommendations?: Json
          retention_opportunity?: number
          score: number
        }
        Update: {
          audit_version?: string
          cancellation_opportunity?: number
          capacity_opportunity?: number
          conversion_opportunity?: number
          created_at?: string
          findings?: Json
          id?: string
          lead_id?: string
          opportunity_high?: number
          opportunity_low?: number
          primary_opportunity?: string
          recommendations?: Json
          retention_opportunity?: number
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "revenue_audits_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "revenue_audit_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      scenarios: {
        Row: {
          audience: string
          created_at: string
          id: string
          inputs: Json
          name: string
          results: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          audience?: string
          created_at?: string
          id?: string
          inputs?: Json
          name: string
          results?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          audience?: string
          created_at?: string
          id?: string
          inputs?: Json
          name?: string
          results?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      studio_aliases: {
        Row: {
          active: boolean
          alias_type: string
          alias_value: string
          first_observed_at: string
          id: string
          last_observed_at: string
          normalized_value: string
          source_id: string | null
          studio_id: string
        }
        Insert: {
          active?: boolean
          alias_type: string
          alias_value: string
          first_observed_at?: string
          id?: string
          last_observed_at?: string
          normalized_value: string
          source_id?: string | null
          studio_id: string
        }
        Update: {
          active?: boolean
          alias_type?: string
          alias_value?: string
          first_observed_at?: string
          id?: string
          last_observed_at?: string
          normalized_value?: string
          source_id?: string | null
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_aliases_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "studio_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_aliases_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_candidates: {
        Row: {
          address: string | null
          companies_house_number: string | null
          created_at: string
          id: string
          identity_status: string
          instagram_handle: string | null
          latitude: number | null
          legal_entity_type: string | null
          location: unknown
          longitude: number | null
          match_confidence: number | null
          matched_studio_id: string | null
          name: string | null
          normalized_name: string | null
          normalized_postcode: string | null
          observed_at: string
          payload: Json
          phone: string | null
          postcode: string | null
          region: string | null
          reviewed_at: string | null
          source_id: string
          source_record_key: string | null
          source_url: string | null
          town: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          address?: string | null
          companies_house_number?: string | null
          created_at?: string
          id?: string
          identity_status?: string
          instagram_handle?: string | null
          latitude?: number | null
          legal_entity_type?: string | null
          location?: unknown
          longitude?: number | null
          match_confidence?: number | null
          matched_studio_id?: string | null
          name?: string | null
          normalized_name?: string | null
          normalized_postcode?: string | null
          observed_at?: string
          payload?: Json
          phone?: string | null
          postcode?: string | null
          region?: string | null
          reviewed_at?: string | null
          source_id: string
          source_record_key?: string | null
          source_url?: string | null
          town?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          address?: string | null
          companies_house_number?: string | null
          created_at?: string
          id?: string
          identity_status?: string
          instagram_handle?: string | null
          latitude?: number | null
          legal_entity_type?: string | null
          location?: unknown
          longitude?: number | null
          match_confidence?: number | null
          matched_studio_id?: string | null
          name?: string | null
          normalized_name?: string | null
          normalized_postcode?: string | null
          observed_at?: string
          payload?: Json
          phone?: string | null
          postcode?: string | null
          region?: string | null
          reviewed_at?: string | null
          source_id?: string
          source_record_key?: string | null
          source_url?: string | null
          town?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "studio_candidates_matched_studio_id_fkey"
            columns: ["matched_studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_candidates_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "studio_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_change_events: {
        Row: {
          change_type: string
          created_at: string
          detected_at: string
          evidence: Json
          field_name: string | null
          id: string
          new_value: Json | null
          previous_value: Json | null
          reviewed_at: string | null
          source_id: string | null
          status: string
          studio_id: string
        }
        Insert: {
          change_type: string
          created_at?: string
          detected_at?: string
          evidence?: Json
          field_name?: string | null
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          reviewed_at?: string | null
          source_id?: string | null
          status?: string
          studio_id: string
        }
        Update: {
          change_type?: string
          created_at?: string
          detected_at?: string
          evidence?: Json
          field_name?: string | null
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          reviewed_at?: string | null
          source_id?: string | null
          status?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_change_events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "studio_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_change_events_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_identity_matches: {
        Row: {
          candidate_id: string
          created_at: string
          evidence: Json
          id: string
          match_method: string
          match_score: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          studio_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          evidence?: Json
          id?: string
          match_method: string
          match_score: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          studio_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          evidence?: Json
          id?: string
          match_method?: string
          match_score?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_identity_matches_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "studio_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_identity_matches_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_members: {
        Row: {
          active: boolean
          created_at: string
          role: string
          studio_id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          role?: string
          studio_id: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          role?: string
          studio_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_members_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_source_observations: {
        Row: {
          candidate_id: string | null
          confidence: number | null
          content_hash: string | null
          created_at: string
          field_name: string | null
          id: string
          observation_type: string
          observed_at: string
          observed_value: Json
          raw_payload: Json
          source_id: string
          source_record_key: string | null
          source_url: string | null
          studio_id: string | null
        }
        Insert: {
          candidate_id?: string | null
          confidence?: number | null
          content_hash?: string | null
          created_at?: string
          field_name?: string | null
          id?: string
          observation_type: string
          observed_at?: string
          observed_value?: Json
          raw_payload?: Json
          source_id: string
          source_record_key?: string | null
          source_url?: string | null
          studio_id?: string | null
        }
        Update: {
          candidate_id?: string | null
          confidence?: number | null
          content_hash?: string | null
          created_at?: string
          field_name?: string | null
          id?: string
          observation_type?: string
          observed_at?: string
          observed_value?: Json
          raw_payload?: Json
          source_id?: string
          source_record_key?: string | null
          source_url?: string | null
          studio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "studio_source_observations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "studio_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_source_observations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "studio_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_source_observations_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_sources: {
        Row: {
          access_method: string
          active: boolean
          created_at: string
          id: string
          notes: string | null
          permitted_for_commercial_use: boolean | null
          refresh_interval_days: number
          source_key: string
          source_name: string
          source_type: string
          terms_url: string | null
          updated_at: string
        }
        Insert: {
          access_method: string
          active?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          permitted_for_commercial_use?: boolean | null
          refresh_interval_days?: number
          source_key: string
          source_name: string
          source_type: string
          terms_url?: string | null
          updated_at?: string
        }
        Update: {
          access_method?: string
          active?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          permitted_for_commercial_use?: boolean | null
          refresh_interval_days?: number
          source_key?: string
          source_name?: string
          source_type?: string
          terms_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      studio_verification_events: {
        Row: {
          confidence: number | null
          created_at: string
          evidence: Json
          expires_at: string | null
          id: string
          reviewer_id: string | null
          source_id: string | null
          status: string
          studio_id: string
          verification_type: string
          verified_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          evidence?: Json
          expires_at?: string | null
          id?: string
          reviewer_id?: string | null
          source_id?: string | null
          status: string
          studio_id: string
          verification_type: string
          verified_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          evidence?: Json
          expires_at?: string | null
          id?: string
          reviewer_id?: string | null
          source_id?: string | null
          status?: string
          studio_id?: string
          verification_type?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_verification_events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "studio_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_verification_events_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          created_at: string
          id: string
          internal_validation: boolean
          name: string
          primary_location: string | null
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id: string
          internal_validation?: boolean
          name: string
          primary_location?: string | null
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          internal_validation?: boolean
          name?: string
          primary_location?: string | null
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "studios_visibility_identity_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_pence: number
          audit_source_id: string
          client_alias_id: string | null
          client_id: string | null
          created_at: string
          currency: string
          duplicate_status: string
          id: string
          raw_reference: string | null
          source_row_key: string
          studio_id: string
          transaction_date: string
        }
        Insert: {
          amount_pence: number
          audit_source_id: string
          client_alias_id?: string | null
          client_id?: string | null
          created_at?: string
          currency?: string
          duplicate_status?: string
          id?: string
          raw_reference?: string | null
          source_row_key: string
          studio_id: string
          transaction_date: string
        }
        Update: {
          amount_pence?: number
          audit_source_id?: string
          client_alias_id?: string | null
          client_id?: string | null
          created_at?: string
          currency?: string
          duplicate_status?: string
          id?: string
          raw_reference?: string | null
          source_row_key?: string
          studio_id?: string
          transaction_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_audit_source_id_fkey"
            columns: ["audit_source_id"]
            isOneToOne: false
            referencedRelation: "audit_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_client_alias_id_fkey"
            columns: ["client_alias_id"]
            isOneToOne: false
            referencedRelation: "client_aliases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_competitor_observations: {
        Row: {
          competitor_name: string
          domain: string | null
          id: string
          keyword_overlap: number | null
          observed_at: string
          query: string | null
          rank: number | null
          raw_data: Json
          report_run_id: string | null
          source_provider: string
          studio_id: string
          visibility_share: number | null
        }
        Insert: {
          competitor_name: string
          domain?: string | null
          id?: string
          keyword_overlap?: number | null
          observed_at?: string
          query?: string | null
          rank?: number | null
          raw_data?: Json
          report_run_id?: string | null
          source_provider: string
          studio_id: string
          visibility_share?: number | null
        }
        Update: {
          competitor_name?: string
          domain?: string | null
          id?: string
          keyword_overlap?: number | null
          observed_at?: string
          query?: string | null
          rank?: number | null
          raw_data?: Json
          report_run_id?: string | null
          source_provider?: string
          studio_id?: string
          visibility_share?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "visibility_competitor_observations_report_run_id_fkey"
            columns: ["report_run_id"]
            isOneToOne: false
            referencedRelation: "visibility_report_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visibility_competitor_observations_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_competitors: {
        Row: {
          authority_score: number | null
          competitor_name: string
          created_at: string
          domain: string | null
          estimated_traffic: number | null
          id: string
          local_area: string | null
          notes: string | null
          observed_at: string
          raw_data: Json
          source_provider: string
          studio_id: string
        }
        Insert: {
          authority_score?: number | null
          competitor_name: string
          created_at?: string
          domain?: string | null
          estimated_traffic?: number | null
          id?: string
          local_area?: string | null
          notes?: string | null
          observed_at?: string
          raw_data?: Json
          source_provider?: string
          studio_id: string
        }
        Update: {
          authority_score?: number | null
          competitor_name?: string
          created_at?: string
          domain?: string | null
          estimated_traffic?: number | null
          id?: string
          local_area?: string | null
          notes?: string | null
          observed_at?: string
          raw_data?: Json
          source_provider?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visibility_competitors_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_keywords: {
        Row: {
          cpc_pence: number
          created_at: string
          current_rank: number | null
          id: string
          keyword: string
          keyword_difficulty: number | null
          keyword_group: string
          local_pack_present: boolean | null
          normalized_keyword: string | null
          observed_at: string
          previous_rank: number | null
          raw_data: Json
          search_intent: string
          search_volume: number
          source_provider: string
          studio_id: string
          target_url: string | null
        }
        Insert: {
          cpc_pence?: number
          created_at?: string
          current_rank?: number | null
          id?: string
          keyword: string
          keyword_difficulty?: number | null
          keyword_group?: string
          local_pack_present?: boolean | null
          normalized_keyword?: string | null
          observed_at?: string
          previous_rank?: number | null
          raw_data?: Json
          search_intent?: string
          search_volume?: number
          source_provider?: string
          studio_id: string
          target_url?: string | null
        }
        Update: {
          cpc_pence?: number
          created_at?: string
          current_rank?: number | null
          id?: string
          keyword?: string
          keyword_difficulty?: number | null
          keyword_group?: string
          local_pack_present?: boolean | null
          normalized_keyword?: string | null
          observed_at?: string
          previous_rank?: number | null
          raw_data?: Json
          search_intent?: string
          search_volume?: number
          source_provider?: string
          studio_id?: string
          target_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visibility_keywords_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_observations: {
        Row: {
          entity_name: string | null
          id: number
          keyword_id: string | null
          metric_name: string | null
          metric_text: string | null
          metric_value: number | null
          observation_type: string
          observed_at: string
          raw_data: Json
          source_provider: string
          source_reference: string | null
          studio_id: string
        }
        Insert: {
          entity_name?: string | null
          id?: never
          keyword_id?: string | null
          metric_name?: string | null
          metric_text?: string | null
          metric_value?: number | null
          observation_type: string
          observed_at?: string
          raw_data?: Json
          source_provider: string
          source_reference?: string | null
          studio_id: string
        }
        Update: {
          entity_name?: string | null
          id?: never
          keyword_id?: string | null
          metric_name?: string | null
          metric_text?: string | null
          metric_value?: number | null
          observation_type?: string
          observed_at?: string
          raw_data?: Json
          source_provider?: string
          source_reference?: string | null
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visibility_observations_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "visibility_keywords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visibility_observations_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_opportunities: {
        Row: {
          commercial_intent_score: number
          conversion_potential_score: number
          created_at: string
          demand_score: number
          description: string
          estimated_monthly_clicks: number | null
          estimated_monthly_enquiries: number | null
          estimated_monthly_revenue_pence: number | null
          evidence: Json
          id: string
          keyword_id: string | null
          local_relevance_score: number
          lsos_score: number
          opportunity_type: string
          position_opportunity_score: number
          priority: number
          recommended_action: string | null
          status: string
          studio_id: string
          title: string
          updated_at: string
        }
        Insert: {
          commercial_intent_score?: number
          conversion_potential_score?: number
          created_at?: string
          demand_score?: number
          description: string
          estimated_monthly_clicks?: number | null
          estimated_monthly_enquiries?: number | null
          estimated_monthly_revenue_pence?: number | null
          evidence?: Json
          id?: string
          keyword_id?: string | null
          local_relevance_score?: number
          lsos_score?: number
          opportunity_type: string
          position_opportunity_score?: number
          priority?: number
          recommended_action?: string | null
          status?: string
          studio_id: string
          title: string
          updated_at?: string
        }
        Update: {
          commercial_intent_score?: number
          conversion_potential_score?: number
          created_at?: string
          demand_score?: number
          description?: string
          estimated_monthly_clicks?: number | null
          estimated_monthly_enquiries?: number | null
          estimated_monthly_revenue_pence?: number | null
          evidence?: Json
          id?: string
          keyword_id?: string | null
          local_relevance_score?: number
          lsos_score?: number
          opportunity_type?: string
          position_opportunity_score?: number
          priority?: number
          recommended_action?: string | null
          status?: string
          studio_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visibility_opportunities_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "visibility_keywords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visibility_opportunities_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_pipeline_runs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          input_payload: Json
          output_payload: Json
          provider: string
          records_read: number
          records_written: number
          report_run_id: string | null
          stage: string
          started_at: string
          status: string
          studio_id: string | null
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          input_payload?: Json
          output_payload?: Json
          provider: string
          records_read?: number
          records_written?: number
          report_run_id?: string | null
          stage: string
          started_at?: string
          status?: string
          studio_id?: string | null
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          input_payload?: Json
          output_payload?: Json
          provider?: string
          records_read?: number
          records_written?: number
          report_run_id?: string | null
          stage?: string
          started_at?: string
          status?: string
          studio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visibility_pipeline_runs_report_run_id_fkey"
            columns: ["report_run_id"]
            isOneToOne: false
            referencedRelation: "visibility_report_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visibility_pipeline_runs_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_provider_configs: {
        Row: {
          capabilities: Json
          config: Json
          created_at: string
          enabled: boolean
          id: string
          provider: string
          scope: string
          studio_id: string | null
          updated_at: string
        }
        Insert: {
          capabilities?: Json
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          provider: string
          scope?: string
          studio_id?: string | null
          updated_at?: string
        }
        Update: {
          capabilities?: Json
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          provider?: string
          scope?: string
          studio_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visibility_provider_configs_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_provider_observations: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          observed_at: string
          pipeline_run_id: string | null
          provider: string
          report_run_id: string | null
          request_payload: Json
          response_payload: Json
          response_status: number | null
          studio_id: string | null
          units_consumed: number | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          observed_at?: string
          pipeline_run_id?: string | null
          provider: string
          report_run_id?: string | null
          request_payload?: Json
          response_payload?: Json
          response_status?: number | null
          studio_id?: string | null
          units_consumed?: number | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          observed_at?: string
          pipeline_run_id?: string | null
          provider?: string
          report_run_id?: string | null
          request_payload?: Json
          response_payload?: Json
          response_status?: number | null
          studio_id?: string | null
          units_consumed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "visibility_provider_observations_pipeline_run_id_fkey"
            columns: ["pipeline_run_id"]
            isOneToOne: false
            referencedRelation: "visibility_pipeline_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visibility_provider_observations_report_run_id_fkey"
            columns: ["report_run_id"]
            isOneToOne: false
            referencedRelation: "visibility_report_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visibility_provider_observations_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_report_runs: {
        Row: {
          action_plan: Json
          approval_required: boolean
          approved_at: string | null
          commercial_opportunity: Json
          competitor_intelligence: Json
          contact_email: string | null
          contact_name: string | null
          created_at: string
          current_visibility: Json
          data_classification: string
          executive_summary: string | null
          id: string
          input_summary: Json
          methodology: Json
          opportunity_summary: Json
          public_token: string | null
          published_at: string | null
          qa_checks: Json
          report_version: string
          reporting_period_end: string | null
          reporting_period_start: string | null
          score_components: Json
          search_demand: Json
          status: string
          studio_id: string
          updated_at: string
          visibility_score: number | null
        }
        Insert: {
          action_plan?: Json
          approval_required?: boolean
          approved_at?: string | null
          commercial_opportunity?: Json
          competitor_intelligence?: Json
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          current_visibility?: Json
          data_classification?: string
          executive_summary?: string | null
          id?: string
          input_summary?: Json
          methodology?: Json
          opportunity_summary?: Json
          public_token?: string | null
          published_at?: string | null
          qa_checks?: Json
          report_version?: string
          reporting_period_end?: string | null
          reporting_period_start?: string | null
          score_components?: Json
          search_demand?: Json
          status?: string
          studio_id: string
          updated_at?: string
          visibility_score?: number | null
        }
        Update: {
          action_plan?: Json
          approval_required?: boolean
          approved_at?: string | null
          commercial_opportunity?: Json
          competitor_intelligence?: Json
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          current_visibility?: Json
          data_classification?: string
          executive_summary?: string | null
          id?: string
          input_summary?: Json
          methodology?: Json
          opportunity_summary?: Json
          public_token?: string | null
          published_at?: string | null
          qa_checks?: Json
          report_version?: string
          reporting_period_end?: string | null
          reporting_period_start?: string | null
          score_components?: Json
          search_demand?: Json
          status?: string
          studio_id?: string
          updated_at?: string
          visibility_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "visibility_report_runs_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_report_snapshots: {
        Row: {
          captured_at: string
          id: string
          report_run_id: string
          snapshot: Json
          snapshot_type: string
        }
        Insert: {
          captured_at?: string
          id?: string
          report_run_id: string
          snapshot?: Json
          snapshot_type: string
        }
        Update: {
          captured_at?: string
          id?: string
          report_run_id?: string
          snapshot?: Json
          snapshot_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "visibility_report_snapshots_report_run_id_fkey"
            columns: ["report_run_id"]
            isOneToOne: false
            referencedRelation: "visibility_report_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_search_universe: {
        Row: {
          body_area: string | null
          business_relevance: number | null
          canonical_query: string
          capability: number
          category: string
          commercial_intent: number
          competitor_position: number | null
          content_exists: boolean | null
          conversion_potential: number
          created_at: string
          current_position: number | null
          customer_type: string | null
          demand: number
          dimension_values: Json
          id: string
          intent: string
          landing_page: string | null
          local_relevance: number
          location: string | null
          location_level: string | null
          lsos: number
          portfolio_relevance: number | null
          problem_need: string | null
          query: string
          ranking_opportunity: number
          report_run_id: string | null
          search_id: string
          semantic_reason: string | null
          semantic_valid: boolean
          serp_features: Json
          service: string | null
          source_type: string
          status: string
          studio_id: string
          studio_relevance: number
          style: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          body_area?: string | null
          business_relevance?: number | null
          canonical_query: string
          capability?: number
          category: string
          commercial_intent?: number
          competitor_position?: number | null
          content_exists?: boolean | null
          conversion_potential?: number
          created_at?: string
          current_position?: number | null
          customer_type?: string | null
          demand?: number
          dimension_values?: Json
          id?: string
          intent: string
          landing_page?: string | null
          local_relevance?: number
          location?: string | null
          location_level?: string | null
          lsos?: number
          portfolio_relevance?: number | null
          problem_need?: string | null
          query: string
          ranking_opportunity?: number
          report_run_id?: string | null
          search_id: string
          semantic_reason?: string | null
          semantic_valid?: boolean
          serp_features?: Json
          service?: string | null
          source_type?: string
          status?: string
          studio_id: string
          studio_relevance?: number
          style?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          body_area?: string | null
          business_relevance?: number | null
          canonical_query?: string
          capability?: number
          category?: string
          commercial_intent?: number
          competitor_position?: number | null
          content_exists?: boolean | null
          conversion_potential?: number
          created_at?: string
          current_position?: number | null
          customer_type?: string | null
          demand?: number
          dimension_values?: Json
          id?: string
          intent?: string
          landing_page?: string | null
          local_relevance?: number
          location?: string | null
          location_level?: string | null
          lsos?: number
          portfolio_relevance?: number | null
          problem_need?: string | null
          query?: string
          ranking_opportunity?: number
          report_run_id?: string | null
          search_id?: string
          semantic_reason?: string | null
          semantic_valid?: boolean
          serp_features?: Json
          service?: string | null
          source_type?: string
          status?: string
          studio_id?: string
          studio_relevance?: number
          style?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visibility_search_universe_report_run_id_fkey"
            columns: ["report_run_id"]
            isOneToOne: false
            referencedRelation: "visibility_report_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visibility_search_universe_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_serp_observations: {
        Row: {
          database: string | null
          domain: string | null
          id: string
          is_competitor: boolean
          is_studio: boolean
          observed_at: string
          query: string
          raw_data: Json
          report_run_id: string | null
          result_position: number | null
          result_type: string | null
          search_universe_id: string | null
          source_provider: string
          studio_id: string
          title: string | null
          url: string | null
        }
        Insert: {
          database?: string | null
          domain?: string | null
          id?: string
          is_competitor?: boolean
          is_studio?: boolean
          observed_at?: string
          query: string
          raw_data?: Json
          report_run_id?: string | null
          result_position?: number | null
          result_type?: string | null
          search_universe_id?: string | null
          source_provider: string
          studio_id: string
          title?: string | null
          url?: string | null
        }
        Update: {
          database?: string | null
          domain?: string | null
          id?: string
          is_competitor?: boolean
          is_studio?: boolean
          observed_at?: string
          query?: string
          raw_data?: Json
          report_run_id?: string | null
          result_position?: number | null
          result_type?: string | null
          search_universe_id?: string | null
          source_provider?: string
          studio_id?: string
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visibility_serp_observations_report_run_id_fkey"
            columns: ["report_run_id"]
            isOneToOne: false
            referencedRelation: "visibility_report_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visibility_serp_observations_search_universe_id_fkey"
            columns: ["search_universe_id"]
            isOneToOne: false
            referencedRelation: "visibility_search_universe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visibility_serp_observations_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_studio_capabilities: {
        Row: {
          active: boolean
          confidence: number
          created_at: string
          dimension: string
          evidence: Json
          id: string
          normalized_value: string
          source_type: string
          studio_id: string
          updated_at: string
          value: string
        }
        Insert: {
          active?: boolean
          confidence?: number
          created_at?: string
          dimension: string
          evidence?: Json
          id?: string
          normalized_value: string
          source_type?: string
          studio_id: string
          updated_at?: string
          value: string
        }
        Update: {
          active?: boolean
          confidence?: number
          created_at?: string
          dimension?: string
          evidence?: Json
          id?: string
          normalized_value?: string
          source_type?: string
          studio_id?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "visibility_studio_capabilities_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_studios: {
        Row: {
          artist_count: number
          average_booking_value_pence: number | null
          canonical_status: string
          companies_house_number: string | null
          created_at: string
          first_observed_at: string | null
          id: string
          identity_confidence: number
          last_observed_at: string | null
          last_verified_at: string | null
          latitude: number | null
          legal_entity_type: string | null
          location: unknown
          location_count: number
          longitude: number | null
          monthly_search_to_booking_rate: number | null
          next_review_at: string | null
          normalized_name: string | null
          normalized_postcode: string | null
          postcode: string | null
          region: string | null
          status: string
          studio_name: string
          town: string | null
          trading_address: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          artist_count?: number
          average_booking_value_pence?: number | null
          canonical_status?: string
          companies_house_number?: string | null
          created_at?: string
          first_observed_at?: string | null
          id?: string
          identity_confidence?: number
          last_observed_at?: string | null
          last_verified_at?: string | null
          latitude?: number | null
          legal_entity_type?: string | null
          location?: unknown
          location_count?: number
          longitude?: number | null
          monthly_search_to_booking_rate?: number | null
          next_review_at?: string | null
          normalized_name?: string | null
          normalized_postcode?: string | null
          postcode?: string | null
          region?: string | null
          status?: string
          studio_name: string
          town?: string | null
          trading_address?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          artist_count?: number
          average_booking_value_pence?: number | null
          canonical_status?: string
          companies_house_number?: string | null
          created_at?: string
          first_observed_at?: string | null
          id?: string
          identity_confidence?: number
          last_observed_at?: string | null
          last_verified_at?: string | null
          latitude?: number | null
          legal_entity_type?: string | null
          location?: unknown
          location_count?: number
          longitude?: number | null
          monthly_search_to_booking_rate?: number | null
          next_review_at?: string | null
          normalized_name?: string | null
          normalized_postcode?: string | null
          postcode?: string | null
          region?: string | null
          status?: string
          studio_name?: string
          town?: string | null
          trading_address?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      website_events: {
        Row: {
          business_key: string
          consent_type: string
          created_at: string
          event_name: string
          id: string
          page_path: string
          properties: Json
          referrer: string | null
          session_id: string | null
        }
        Insert: {
          business_key?: string
          consent_type?: string
          created_at?: string
          event_name: string
          id?: string
          page_path: string
          properties?: Json
          referrer?: string | null
          session_id?: string | null
        }
        Update: {
          business_key?: string
          consent_type?: string
          created_at?: string
          event_name?: string
          id?: string
          page_path?: string
          properties?: Json
          referrer?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      ops_current_founder_brief: {
        Row: {
          business_key: string | null
          commercial_health: Json | null
          company_outcome: string | null
          cycle_id: string | null
          cycle_key: string | null
          decisions_required: Json | null
          evidence_gaps: Json | null
          execution_queue: Json | null
          parked_ideas: Json | null
          period_end: string | null
          period_start: string | null
          priorities: Json | null
          risks: Json | null
          success_measure: string | null
        }
        Insert: {
          business_key?: string | null
          commercial_health?: never
          company_outcome?: string | null
          cycle_id?: string | null
          cycle_key?: string | null
          decisions_required?: never
          evidence_gaps?: never
          execution_queue?: never
          parked_ideas?: never
          period_end?: string | null
          period_start?: string | null
          priorities?: never
          risks?: never
          success_measure?: string | null
        }
        Update: {
          business_key?: string | null
          commercial_health?: never
          company_outcome?: string | null
          cycle_id?: string | null
          cycle_key?: string | null
          decisions_required?: never
          evidence_gaps?: never
          execution_queue?: never
          parked_ideas?: never
          period_end?: string | null
          period_start?: string | null
          priorities?: never
          risks?: never
          success_measure?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ops_operating_cycles_business_key_fkey"
            columns: ["business_key"]
            isOneToOne: false
            referencedRelation: "ops_businesses"
            referencedColumns: ["business_key"]
          },
        ]
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      calculate_visibility_lso: {
        Args: {
          p_conversion: number
          p_demand: number
          p_intent: number
          p_local: number
          p_position: number
        }
        Returns: number
      }
      can_read_studio: { Args: { p_studio_id: string }; Returns: boolean }
      consume_public_endpoint_rate_limit: {
        Args: {
          p_endpoint: string
          p_key_hash: string
          p_max_requests?: number
          p_window_started_at: string
        }
        Returns: boolean
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      generate_studio_search_universe: {
        Args: { p_report_run_id?: string; p_studio_id: string }
        Returns: number
      }
      generate_visibility_report: {
        Args: { p_report_run_id: string }
        Returns: Json
      }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_search_provider_status: {
        Args: { p_studio_id?: string }
        Returns: Json
      }
      gettransactionid: { Args: never; Returns: unknown }
      lock_golden_audit_run: { Args: { p_audit_id: string }; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      persist_golden_audit_ledger: {
        Args: {
          p_audit_id: string
          p_potential_duplicate_rows: number
          p_rejected: Json
          p_rows: Json
          p_source_hash: string
          p_source_name: string
          p_source_type: string
          p_storage_path: string
          p_total_pence: number
        }
        Returns: Json
      }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      publish_visibility_report: {
        Args: { p_public_token: string; p_report_id: string }
        Returns: Json
      }
      record_integration_event: {
        Args: {
          p_contact_ref?: string
          p_correlation_id: string
          p_event_type: string
          p_idempotency_key: string
          p_intervention_id?: string
          p_occurred_at: string
          p_opportunity_ref?: string
          p_payload?: Json
          p_source_event_id?: string
          p_source_system: string
          p_studio_id?: string
        }
        Returns: {
          attempt_count: number
          contact_ref: string | null
          correlation_id: string
          created_at: string
          error_code: string | null
          error_detail: string | null
          event_id: string
          event_type: string
          idempotency_key: string
          intervention_id: string | null
          occurred_at: string
          opportunity_ref: string | null
          payload: Json
          processing_status: string
          received_at: string
          source_event_id: string | null
          source_system: string
          studio_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "integration_events"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
