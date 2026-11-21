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
    PostgrestVersion: "14.15"
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
      atlas_claim_requests: {
        Row: {
          authority_role: string
          candidate_id: string | null
          created_at: string
          evidence_note: string
          id: string
          proposed_studio_name: string
          proposed_town: string
          proposed_website: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          studio_id: string | null
          updated_at: string
          user_id: string
          verification_method: string
        }
        Insert: {
          authority_role: string
          candidate_id?: string | null
          created_at?: string
          evidence_note: string
          id?: string
          proposed_studio_name: string
          proposed_town: string
          proposed_website?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          studio_id?: string | null
          updated_at?: string
          user_id: string
          verification_method: string
        }
        Update: {
          authority_role?: string
          candidate_id?: string | null
          created_at?: string
          evidence_note?: string
          id?: string
          proposed_studio_name?: string
          proposed_town?: string
          proposed_website?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          studio_id?: string | null
          updated_at?: string
          user_id?: string
          verification_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "atlas_claim_requests_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "studio_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlas_claim_requests_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_customer_enquiries: {
        Row: {
          consent_version: string
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          is_test: boolean
          marketing_opt_in: boolean
          privacy_notice_accepted_at: string
          profile_id: string
          recipient_notified_at: string | null
          status: string
          studio_id: string
          tattoo_brief: string
        }
        Insert: {
          consent_version: string
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          is_test?: boolean
          marketing_opt_in?: boolean
          privacy_notice_accepted_at: string
          profile_id: string
          recipient_notified_at?: string | null
          status?: string
          studio_id: string
          tattoo_brief: string
        }
        Update: {
          consent_version?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          is_test?: boolean
          marketing_opt_in?: boolean
          privacy_notice_accepted_at?: string
          profile_id?: string
          recipient_notified_at?: string | null
          status?: string
          studio_id?: string
          tattoo_brief?: string
        }
        Relationships: [
          {
            foreignKeyName: "atlas_customer_enquiries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "atlas_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlas_customer_enquiries_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_profile_drafts: {
        Row: {
          about: string | null
          created_at: string
          id: string
          instagram_url: string | null
          proposed_public_address: string | null
          reviewed_at: string | null
          status: string
          studio_id: string
          styles: string[]
          user_id: string
          website_url: string | null
        }
        Insert: {
          about?: string | null
          created_at?: string
          id?: string
          instagram_url?: string | null
          proposed_public_address?: string | null
          reviewed_at?: string | null
          status?: string
          studio_id: string
          styles?: string[]
          user_id: string
          website_url?: string | null
        }
        Update: {
          about?: string | null
          created_at?: string
          id?: string
          instagram_url?: string | null
          proposed_public_address?: string | null
          reviewed_at?: string | null
          status?: string
          studio_id?: string
          styles?: string[]
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atlas_profile_drafts_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_profiles: {
        Row: {
          about: string | null
          cover_url: string | null
          created_at: string
          id: string
          instagram_url: string | null
          latitude: number | null
          listing_status: string
          longitude: number | null
          name: string
          owner_public_location_confirmed: boolean
          postcode: string | null
          premises_reviewed_by: string | null
          premises_verified_at: string | null
          premises_verified_until: string | null
          public_address: string | null
          published_at: string | null
          reviewed_by: string | null
          slug: string
          studio_id: string
          styles: string[]
          town: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          about?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          instagram_url?: string | null
          latitude?: number | null
          listing_status?: string
          longitude?: number | null
          name: string
          owner_public_location_confirmed?: boolean
          postcode?: string | null
          premises_reviewed_by?: string | null
          premises_verified_at?: string | null
          premises_verified_until?: string | null
          public_address?: string | null
          published_at?: string | null
          reviewed_by?: string | null
          slug: string
          studio_id: string
          styles?: string[]
          town: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          about?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          instagram_url?: string | null
          latitude?: number | null
          listing_status?: string
          longitude?: number | null
          name?: string
          owner_public_location_confirmed?: boolean
          postcode?: string | null
          premises_reviewed_by?: string | null
          premises_verified_at?: string | null
          premises_verified_until?: string | null
          public_address?: string | null
          published_at?: string | null
          reviewed_by?: string | null
          slug?: string
          studio_id?: string
          styles?: string[]
          town?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atlas_profiles_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: true
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_publication_reviews: {
        Row: {
          decision: string
          evidence_note: string
          id: string
          profile_draft_id: string | null
          profile_id: string
          reviewed_at: string
          reviewer_id: string
          source_url: string | null
        }
        Insert: {
          decision: string
          evidence_note: string
          id?: string
          profile_draft_id?: string | null
          profile_id: string
          reviewed_at?: string
          reviewer_id: string
          source_url?: string | null
        }
        Update: {
          decision?: string
          evidence_note?: string
          id?: string
          profile_draft_id?: string | null
          profile_id?: string
          reviewed_at?: string
          reviewer_id?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atlas_publication_reviews_profile_draft_id_fkey"
            columns: ["profile_draft_id"]
            isOneToOne: false
            referencedRelation: "atlas_profile_drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlas_publication_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "atlas_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_studio_links: {
        Row: {
          created_at: string
          evidence: Json
          reviewed_at: string
          reviewer_id: string | null
          studio_id: string
          visibility_studio_id: string
        }
        Insert: {
          created_at?: string
          evidence?: Json
          reviewed_at?: string
          reviewer_id?: string | null
          studio_id: string
          visibility_studio_id: string
        }
        Update: {
          created_at?: string
          evidence?: Json
          reviewed_at?: string
          reviewer_id?: string | null
          studio_id?: string
          visibility_studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "atlas_studio_links_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: true
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlas_studio_links_visibility_studio_id_fkey"
            columns: ["visibility_studio_id"]
            isOneToOne: true
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
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
      bt_approvals: {
        Row: {
          actor_id: string
          created_at: string
          decision: string
          draft_digest: string
          id: string
          product_key: string
          rationale: string | null
          target_id: string
          target_type: string
          workspace_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          decision: string
          draft_digest: string
          id?: string
          product_key: string
          rationale?: string | null
          target_id: string
          target_type: string
          workspace_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          decision?: string
          draft_digest?: string
          id?: string
          product_key?: string
          rationale?: string | null
          target_id?: string
          target_type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bt_approvals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      bt_audit_events: {
        Row: {
          actor_id: string | null
          actor_type: string
          created_at: string
          event_data: Json
          event_key: string
          id: string
          product_key: string
          target_id: string | null
          target_type: string | null
          workspace_id: string
        }
        Insert: {
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          event_data?: Json
          event_key: string
          id?: string
          product_key: string
          target_id?: string | null
          target_type?: string | null
          workspace_id: string
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          event_data?: Json
          event_key?: string
          id?: string
          product_key?: string
          target_id?: string | null
          target_type?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bt_audit_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      bt_import_jobs: {
        Row: {
          completed_at: string | null
          content_sha256: string
          created_at: string
          created_by: string | null
          id: string
          mapping_version: string
          product_key: string
          rows_duplicate: number
          rows_invalid: number
          rows_total: number
          rows_valid: number
          source_filename: string | null
          source_system: string
          status: string
          workspace_id: string
        }
        Insert: {
          completed_at?: string | null
          content_sha256: string
          created_at?: string
          created_by?: string | null
          id?: string
          mapping_version: string
          product_key: string
          rows_duplicate?: number
          rows_invalid?: number
          rows_total?: number
          rows_valid?: number
          source_filename?: string | null
          source_system: string
          status?: string
          workspace_id: string
        }
        Update: {
          completed_at?: string | null
          content_sha256?: string
          created_at?: string
          created_by?: string | null
          id?: string
          mapping_version?: string
          product_key?: string
          rows_duplicate?: number
          rows_invalid?: number
          rows_total?: number
          rows_valid?: number
          source_filename?: string | null
          source_system?: string
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bt_import_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      bt_import_rows: {
        Row: {
          created_at: string
          id: string
          import_job_id: string
          mapped_payload: Json
          row_hash: string
          row_number: number
          row_status: string
          source_record_id: string | null
          validation_errors: Json
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          import_job_id: string
          mapped_payload: Json
          row_hash: string
          row_number: number
          row_status?: string
          source_record_id?: string | null
          validation_errors?: Json
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          import_job_id?: string
          mapped_payload?: Json
          row_hash?: string
          row_number?: number
          row_status?: string
          source_record_id?: string | null
          validation_errors?: Json
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bt_import_rows_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bt_import_rows_workspace_id_import_job_id_fkey"
            columns: ["workspace_id", "import_job_id"]
            isOneToOne: false
            referencedRelation: "bt_import_jobs"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      bt_usage_events: {
        Row: {
          created_at: string
          event_key: string
          id: string
          product_key: string
          source_ref: string | null
          unit_type: string
          units: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          event_key: string
          id?: string
          product_key: string
          source_ref?: string | null
          unit_type?: string
          units?: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          event_key?: string
          id?: string
          product_key?: string
          source_ref?: string | null
          unit_type?: string
          units?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bt_usage_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      bt_workflow_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          idempotency_key: string
          input_ref: Json
          product_key: string
          result_summary: Json
          started_at: string | null
          status: string
          workflow_key: string
          workflow_version: string
          workspace_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          idempotency_key: string
          input_ref?: Json
          product_key: string
          result_summary?: Json
          started_at?: string | null
          status?: string
          workflow_key: string
          workflow_version: string
          workspace_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string
          input_ref?: Json
          product_key?: string
          result_summary?: Json
          started_at?: string | null
          status?: string
          workflow_key?: string
          workflow_version?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bt_workflow_runs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      bt_workspace_members: {
        Row: {
          active: boolean
          created_at: string
          id: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          role: string
          user_id: string
          workspace_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bt_workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      bt_workspace_products: {
        Row: {
          created_at: string
          product_key: string
          product_version: string
          settings: Json
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          product_key: string
          product_version: string
          settings?: Json
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          product_key?: string
          product_version?: string
          settings?: Json
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bt_workspace_products_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      bt_workspaces: {
        Row: {
          business_type: string
          created_at: string
          created_by: string | null
          currency_code: string
          display_name: string
          id: string
          source_studio_id: string | null
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          business_type?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          display_name: string
          id?: string
          source_studio_id?: string | null
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          business_type?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          display_name?: string
          id?: string
          source_studio_id?: string | null
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
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
      founding_checkout_slots: {
        Row: {
          assigned_at: string | null
          assigned_invite_id: string | null
          consumed_at: string | null
          created_at: string
          retired_at: string | null
          slot_code: string
          status: string
          stripe_payment_link_id: string
          stripe_payment_link_url: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_invite_id?: string | null
          consumed_at?: string | null
          created_at?: string
          retired_at?: string | null
          slot_code: string
          status?: string
          stripe_payment_link_id: string
          stripe_payment_link_url: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_invite_id?: string | null
          consumed_at?: string | null
          created_at?: string
          retired_at?: string | null
          slot_code?: string
          status?: string
          stripe_payment_link_id?: string
          stripe_payment_link_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "founding_checkout_slots_invite_fkey"
            columns: ["assigned_invite_id"]
            isOneToOne: true
            referencedRelation: "founding_studio_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      founding_studio_invites: {
        Row: {
          amount_due_minor: number
          audit_id: string | null
          checkout_started_at: string | null
          completed_at: string | null
          contact_name: string
          contact_request_id: string | null
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          failure_reason: string | null
          id: string
          list_value_minor: number
          onboarding_status: string
          onboarding_submitted_at: string | null
          opened_at: string | null
          order_id: string | null
          reason: string
          revoked_at: string | null
          slot_code: string
          status: string
          stripe_customer_id: string | null
          stripe_payment_link_id: string
          stripe_payment_link_url: string
          stripe_session_id: string | null
          studio_id: string | null
          studio_name: string
          token_hash: string
          token_hint: string
          updated_at: string
          waiver_amount_minor: number
          website: string | null
        }
        Insert: {
          amount_due_minor?: number
          audit_id?: string | null
          checkout_started_at?: string | null
          completed_at?: string | null
          contact_name: string
          contact_request_id?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          expires_at: string
          failure_reason?: string | null
          id?: string
          list_value_minor?: number
          onboarding_status?: string
          onboarding_submitted_at?: string | null
          opened_at?: string | null
          order_id?: string | null
          reason: string
          revoked_at?: string | null
          slot_code: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_link_id: string
          stripe_payment_link_url: string
          stripe_session_id?: string | null
          studio_id?: string | null
          studio_name: string
          token_hash: string
          token_hint: string
          updated_at?: string
          waiver_amount_minor?: number
          website?: string | null
        }
        Update: {
          amount_due_minor?: number
          audit_id?: string | null
          checkout_started_at?: string | null
          completed_at?: string | null
          contact_name?: string
          contact_request_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          failure_reason?: string | null
          id?: string
          list_value_minor?: number
          onboarding_status?: string
          onboarding_submitted_at?: string | null
          opened_at?: string | null
          order_id?: string | null
          reason?: string
          revoked_at?: string | null
          slot_code?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_link_id?: string
          stripe_payment_link_url?: string
          stripe_session_id?: string | null
          studio_id?: string | null
          studio_name?: string
          token_hash?: string
          token_hint?: string
          updated_at?: string
          waiver_amount_minor?: number
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "founding_studio_invites_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founding_studio_invites_contact_request_id_fkey"
            columns: ["contact_request_id"]
            isOneToOne: false
            referencedRelation: "public_contact_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founding_studio_invites_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founding_studio_invites_slot_code_fkey"
            columns: ["slot_code"]
            isOneToOne: true
            referencedRelation: "founding_checkout_slots"
            referencedColumns: ["slot_code"]
          },
          {
            foreignKeyName: "founding_studio_invites_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      founding_studio_onboarding: {
        Row: {
          artist_count: number
          audit_id: string
          booking_process: string
          data_available: string
          instagram_url: string | null
          invite_id: string
          location: string
          notes: string | null
          primary_goal: string
          stripe_session_id: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          artist_count: number
          audit_id: string
          booking_process: string
          data_available: string
          instagram_url?: string | null
          invite_id: string
          location: string
          notes?: string | null
          primary_goal: string
          stripe_session_id: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          artist_count?: number
          audit_id?: string
          booking_process?: string
          data_available?: string
          instagram_url?: string | null
          invite_id?: string
          location?: string
          notes?: string | null
          primary_goal?: string
          stripe_session_id?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "founding_studio_onboarding_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founding_studio_onboarding_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: true
            referencedRelation: "founding_studio_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      inksights_mail_events: {
        Row: {
          actor_id: string | null
          details: Json
          event_type: string
          happened_at: string
          id: number
          outbox_id: string | null
        }
        Insert: {
          actor_id?: string | null
          details?: Json
          event_type: string
          happened_at?: string
          id?: never
          outbox_id?: string | null
        }
        Update: {
          actor_id?: string | null
          details?: Json
          event_type?: string
          happened_at?: string
          id?: never
          outbox_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inksights_mail_events_outbox_id_fkey"
            columns: ["outbox_id"]
            isOneToOne: false
            referencedRelation: "inksights_mail_outbox"
            referencedColumns: ["id"]
          },
        ]
      }
      inksights_mail_inbox: {
        Row: {
          created_at: string
          folder_id: string | null
          id: string
          is_test: boolean
          matched_outbox_id: string | null
          outcome: string
          preview: string | null
          received_at: string | null
          recipient: string | null
          sender: string
          subject: string | null
          updated_at: string
          zoho_message_id: string
          zoho_thread_id: string | null
        }
        Insert: {
          created_at?: string
          folder_id?: string | null
          id?: string
          is_test?: boolean
          matched_outbox_id?: string | null
          outcome?: string
          preview?: string | null
          received_at?: string | null
          recipient?: string | null
          sender: string
          subject?: string | null
          updated_at?: string
          zoho_message_id: string
          zoho_thread_id?: string | null
        }
        Update: {
          created_at?: string
          folder_id?: string | null
          id?: string
          is_test?: boolean
          matched_outbox_id?: string | null
          outcome?: string
          preview?: string | null
          received_at?: string | null
          recipient?: string | null
          sender?: string
          subject?: string | null
          updated_at?: string
          zoho_message_id?: string
          zoho_thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inksights_mail_inbox_matched_outbox_id_fkey"
            columns: ["matched_outbox_id"]
            isOneToOne: false
            referencedRelation: "inksights_mail_outbox"
            referencedColumns: ["id"]
          },
        ]
      }
      inksights_mail_outbox: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approved_digest: string | null
          attempt_count: number
          body: string
          created_at: string
          eligibility: string
          eligibility_evidence: string | null
          hubspot_contact_id: string | null
          id: string
          idempotency_key: string | null
          is_test: boolean
          last_error: string | null
          purpose: string
          recipient: string
          sent_at: string | null
          status: string
          studio_id: string | null
          subject: string
          suppression_checked_at: string | null
          updated_at: string
          zoho_draft_id: string | null
          zoho_message_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          approved_digest?: string | null
          attempt_count?: number
          body: string
          created_at?: string
          eligibility?: string
          eligibility_evidence?: string | null
          hubspot_contact_id?: string | null
          id?: string
          idempotency_key?: string | null
          is_test?: boolean
          last_error?: string | null
          purpose?: string
          recipient: string
          sent_at?: string | null
          status?: string
          studio_id?: string | null
          subject: string
          suppression_checked_at?: string | null
          updated_at?: string
          zoho_draft_id?: string | null
          zoho_message_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          approved_digest?: string | null
          attempt_count?: number
          body?: string
          created_at?: string
          eligibility?: string
          eligibility_evidence?: string | null
          hubspot_contact_id?: string | null
          id?: string
          idempotency_key?: string | null
          is_test?: boolean
          last_error?: string | null
          purpose?: string
          recipient?: string
          sent_at?: string | null
          status?: string
          studio_id?: string | null
          subject?: string
          suppression_checked_at?: string | null
          updated_at?: string
          zoho_draft_id?: string | null
          zoho_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inksights_mail_outbox_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      inksights_mail_suppressions: {
        Row: {
          created_at: string
          email: string
          reason: string
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          reason: string
          source: string
        }
        Update: {
          created_at?: string
          email?: string
          reason?: string
          source?: string
        }
        Relationships: []
      }
      inksights_mail_sync_state: {
        Row: {
          initialized: boolean
          last_polled_at: string | null
          mailbox: string
          updated_at: string
        }
        Insert: {
          initialized?: boolean
          last_polled_at?: string | null
          mailbox: string
          updated_at?: string
        }
        Update: {
          initialized?: boolean
          last_polled_at?: string | null
          mailbox?: string
          updated_at?: string
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
          access_type: string | null
          amount_collected_minor: number | null
          amount_total: number | null
          created_at: string
          currency: string | null
          customer_email: string | null
          founding_invite_id: string | null
          id: string
          list_value_minor: number | null
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
          waiver_amount_minor: number | null
        }
        Insert: {
          access_type?: string | null
          amount_collected_minor?: number | null
          amount_total?: number | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          founding_invite_id?: string | null
          id?: string
          list_value_minor?: number | null
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
          waiver_amount_minor?: number | null
        }
        Update: {
          access_type?: string | null
          amount_collected_minor?: number | null
          amount_total?: number | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          founding_invite_id?: string | null
          id?: string
          list_value_minor?: number | null
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
          waiver_amount_minor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_founding_invite_id_fkey"
            columns: ["founding_invite_id"]
            isOneToOne: false
            referencedRelation: "founding_studio_invites"
            referencedColumns: ["id"]
          },
        ]
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
          is_test: boolean
          location: string | null
          message: string
          metadata: Json
          name: string
          phone: string | null
          platform_key: string
          source: string
          status: string
          studio_name: string | null
          test_reason: string | null
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
          is_test?: boolean
          location?: string | null
          message: string
          metadata?: Json
          name: string
          phone?: string | null
          platform_key?: string
          source?: string
          status?: string
          studio_name?: string | null
          test_reason?: string | null
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
          is_test?: boolean
          location?: string | null
          message?: string
          metadata?: Json
          name?: string
          phone?: string | null
          platform_key?: string
          source?: string
          status?: string
          studio_name?: string | null
          test_reason?: string | null
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
      public_tool_submissions: {
        Row: {
          area: string | null
          canonical_studio_id: string | null
          consent_version: string
          dataset_version: string | null
          id: string
          normalized_inputs: Json
          quality_status: string
          result_snapshot: Json
          source_type: string
          studio_id: string | null
          studio_name: string | null
          studio_website: string | null
          submission_key: string
          submitted_at: string
          tool_key: string
          tool_version: string
        }
        Insert: {
          area?: string | null
          canonical_studio_id?: string | null
          consent_version: string
          dataset_version?: string | null
          id?: string
          normalized_inputs: Json
          quality_status?: string
          result_snapshot: Json
          source_type?: string
          studio_id?: string | null
          studio_name?: string | null
          studio_website?: string | null
          submission_key: string
          submitted_at?: string
          tool_key: string
          tool_version: string
        }
        Update: {
          area?: string | null
          canonical_studio_id?: string | null
          consent_version?: string
          dataset_version?: string | null
          id?: string
          normalized_inputs?: Json
          quality_status?: string
          result_snapshot?: Json
          source_type?: string
          studio_id?: string | null
          studio_name?: string | null
          studio_website?: string | null
          submission_key?: string
          submitted_at?: string
          tool_key?: string
          tool_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_tool_submissions_canonical_studio_id_fkey"
            columns: ["canonical_studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_tool_submissions_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
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
          is_test: boolean
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
          test_reason: string | null
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
          is_test?: boolean
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
          test_reason?: string | null
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
          is_test?: boolean
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
          test_reason?: string | null
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
      rr_actions: {
        Row: {
          action_type: string
          created_at: string
          created_by: string | null
          draft_body: string | null
          draft_digest: string | null
          draft_subject: string | null
          id: string
          opportunity_id: string
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          created_by?: string | null
          draft_body?: string | null
          draft_digest?: string | null
          draft_subject?: string | null
          id?: string
          opportunity_id: string
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          created_by?: string | null
          draft_body?: string | null
          draft_digest?: string | null
          draft_subject?: string | null
          id?: string
          opportunity_id?: string
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rr_actions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rr_actions_workspace_id_opportunity_id_fkey"
            columns: ["workspace_id", "opportunity_id"]
            isOneToOne: false
            referencedRelation: "rr_opportunities"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      rr_bookings: {
        Row: {
          balance_due_minor: number | null
          balance_paid_minor: number | null
          booking_value_minor: number | null
          client_id: string | null
          created_at: string
          deposit_due_minor: number | null
          deposit_paid_minor: number | null
          id: string
          project_id: string | null
          scheduled_at: string | null
          source_record_id: string
          source_system: string
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          balance_due_minor?: number | null
          balance_paid_minor?: number | null
          booking_value_minor?: number | null
          client_id?: string | null
          created_at?: string
          deposit_due_minor?: number | null
          deposit_paid_minor?: number | null
          id?: string
          project_id?: string | null
          scheduled_at?: string | null
          source_record_id: string
          source_system: string
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          balance_due_minor?: number | null
          balance_paid_minor?: number | null
          booking_value_minor?: number | null
          client_id?: string | null
          created_at?: string
          deposit_due_minor?: number | null
          deposit_paid_minor?: number | null
          id?: string
          project_id?: string | null
          scheduled_at?: string | null
          source_record_id?: string
          source_system?: string
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rr_bookings_workspace_id_client_id_fkey"
            columns: ["workspace_id", "client_id"]
            isOneToOne: false
            referencedRelation: "rr_clients"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "rr_bookings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rr_bookings_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "rr_projects"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      rr_capacity_periods: {
        Row: {
          available_hours: number
          booked_hours: number
          created_at: string
          id: string
          period_end: string
          period_start: string
          realised_hourly_value_minor: number | null
          source_record_id: string
          source_system: string
          workspace_id: string
        }
        Insert: {
          available_hours?: number
          booked_hours?: number
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          realised_hourly_value_minor?: number | null
          source_record_id: string
          source_system: string
          workspace_id: string
        }
        Update: {
          available_hours?: number
          booked_hours?: number
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          realised_hourly_value_minor?: number | null
          source_record_id?: string
          source_system?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rr_capacity_periods_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      rr_clients: {
        Row: {
          completed_sessions: number
          created_at: string
          display_name: string | null
          future_booking_at: string | null
          has_contact_route: boolean
          id: string
          last_completed_booking_at: string | null
          marketing_permission_state: string
          source_record_id: string
          source_system: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          completed_sessions?: number
          created_at?: string
          display_name?: string | null
          future_booking_at?: string | null
          has_contact_route?: boolean
          id?: string
          last_completed_booking_at?: string | null
          marketing_permission_state?: string
          source_record_id: string
          source_system: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          completed_sessions?: number
          created_at?: string
          display_name?: string | null
          future_booking_at?: string | null
          has_contact_route?: boolean
          id?: string
          last_completed_booking_at?: string | null
          marketing_permission_state?: string
          source_record_id?: string
          source_system?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rr_clients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      rr_enquiries: {
        Row: {
          client_id: string | null
          created_at: string
          created_at_source: string
          has_contact_route: boolean
          id: string
          quoted_value_minor: number | null
          source_record_id: string
          source_system: string
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_at_source: string
          has_contact_route?: boolean
          id?: string
          quoted_value_minor?: number | null
          source_record_id: string
          source_system: string
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_at_source?: string
          has_contact_route?: boolean
          id?: string
          quoted_value_minor?: number | null
          source_record_id?: string
          source_system?: string
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rr_enquiries_workspace_id_client_id_fkey"
            columns: ["workspace_id", "client_id"]
            isOneToOne: false
            referencedRelation: "rr_clients"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "rr_enquiries_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      rr_opportunities: {
        Row: {
          actionability: string
          confidence: number
          created_at: string
          detected_at: string
          evidence: Json
          explanation: string
          id: string
          opportunity_key: string
          opportunity_type: string
          priority_score: number
          product_key: string
          recommended_action: string
          rule_version: string
          source_group_key: string
          source_record_id: string
          source_system: string
          status: string
          title: string
          updated_at: string
          value_base_minor: number | null
          value_classification: string
          value_high_minor: number | null
          value_low_minor: number | null
          workspace_id: string
        }
        Insert: {
          actionability?: string
          confidence: number
          created_at?: string
          detected_at?: string
          evidence?: Json
          explanation: string
          id?: string
          opportunity_key: string
          opportunity_type: string
          priority_score: number
          product_key?: string
          recommended_action: string
          rule_version: string
          source_group_key: string
          source_record_id: string
          source_system: string
          status?: string
          title: string
          updated_at?: string
          value_base_minor?: number | null
          value_classification: string
          value_high_minor?: number | null
          value_low_minor?: number | null
          workspace_id: string
        }
        Update: {
          actionability?: string
          confidence?: number
          created_at?: string
          detected_at?: string
          evidence?: Json
          explanation?: string
          id?: string
          opportunity_key?: string
          opportunity_type?: string
          priority_score?: number
          product_key?: string
          recommended_action?: string
          rule_version?: string
          source_group_key?: string
          source_record_id?: string
          source_system?: string
          status?: string
          title?: string
          updated_at?: string
          value_base_minor?: number | null
          value_classification?: string
          value_high_minor?: number | null
          value_low_minor?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rr_opportunities_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      rr_outcomes: {
        Row: {
          action_id: string | null
          amount_minor: number | null
          classification: string
          currency_code: string
          evidence_ref: string | null
          id: string
          notes: string | null
          opportunity_id: string
          outcome_type: string
          recorded_at: string
          recorded_by: string | null
          workspace_id: string
        }
        Insert: {
          action_id?: string | null
          amount_minor?: number | null
          classification?: string
          currency_code?: string
          evidence_ref?: string | null
          id?: string
          notes?: string | null
          opportunity_id: string
          outcome_type: string
          recorded_at?: string
          recorded_by?: string | null
          workspace_id: string
        }
        Update: {
          action_id?: string | null
          amount_minor?: number | null
          classification?: string
          currency_code?: string
          evidence_ref?: string | null
          id?: string
          notes?: string | null
          opportunity_id?: string
          outcome_type?: string
          recorded_at?: string
          recorded_by?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rr_outcomes_workspace_id_action_id_fkey"
            columns: ["workspace_id", "action_id"]
            isOneToOne: false
            referencedRelation: "rr_actions"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "rr_outcomes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rr_outcomes_workspace_id_opportunity_id_fkey"
            columns: ["workspace_id", "opportunity_id"]
            isOneToOne: false
            referencedRelation: "rr_opportunities"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      rr_payments: {
        Row: {
          amount_minor: number
          booking_id: string | null
          created_at: string
          currency_code: string
          id: string
          paid_at: string | null
          payment_type: string
          project_id: string | null
          source_record_id: string
          source_system: string
          status: string
          workspace_id: string
        }
        Insert: {
          amount_minor: number
          booking_id?: string | null
          created_at?: string
          currency_code?: string
          id?: string
          paid_at?: string | null
          payment_type?: string
          project_id?: string | null
          source_record_id: string
          source_system: string
          status?: string
          workspace_id: string
        }
        Update: {
          amount_minor?: number
          booking_id?: string | null
          created_at?: string
          currency_code?: string
          id?: string
          paid_at?: string | null
          payment_type?: string
          project_id?: string | null
          source_record_id?: string
          source_system?: string
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rr_payments_workspace_id_booking_id_fkey"
            columns: ["workspace_id", "booking_id"]
            isOneToOne: false
            referencedRelation: "rr_bookings"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "rr_payments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rr_payments_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "rr_projects"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      rr_projects: {
        Row: {
          agreed_value_minor: number | null
          client_id: string | null
          created_at: string
          has_contact_route: boolean
          id: string
          last_activity_at: string | null
          next_session_at: string | null
          paid_value_minor: number | null
          sessions_completed: number | null
          sessions_planned: number | null
          source_record_id: string
          source_system: string
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          agreed_value_minor?: number | null
          client_id?: string | null
          created_at?: string
          has_contact_route?: boolean
          id?: string
          last_activity_at?: string | null
          next_session_at?: string | null
          paid_value_minor?: number | null
          sessions_completed?: number | null
          sessions_planned?: number | null
          source_record_id: string
          source_system: string
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          agreed_value_minor?: number | null
          client_id?: string | null
          created_at?: string
          has_contact_route?: boolean
          id?: string
          last_activity_at?: string | null
          next_session_at?: string | null
          paid_value_minor?: number | null
          sessions_completed?: number | null
          sessions_planned?: number | null
          source_record_id?: string
          source_system?: string
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rr_projects_workspace_id_client_id_fkey"
            columns: ["workspace_id", "client_id"]
            isOneToOne: false
            referencedRelation: "rr_clients"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "rr_projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "bt_workspaces"
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
      seo_authority_outreach: {
        Row: {
          channel: string
          created_at: string
          evidence_url: string | null
          external_message_id: string | null
          id: string
          message: string
          notes: string | null
          replied_at: string | null
          sent_at: string | null
          status: string
          subject: string | null
          target_id: string
          updated_at: string
        }
        Insert: {
          channel: string
          created_at?: string
          evidence_url?: string | null
          external_message_id?: string | null
          id?: string
          message: string
          notes?: string | null
          replied_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          target_id: string
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          evidence_url?: string | null
          external_message_id?: string | null
          id?: string
          message?: string
          notes?: string | null
          replied_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          target_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_authority_outreach_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "seo_authority_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_authority_targets: {
        Row: {
          authority_reason: string
          contact_method: string | null
          contact_value: string | null
          created_at: string
          domain: string | null
          id: string
          last_verified_at: string | null
          metadata: Json
          name: string
          priority: string
          source_url: string | null
          status: string
          target_key: string
          target_type: string
          updated_at: string
          url: string | null
        }
        Insert: {
          authority_reason: string
          contact_method?: string | null
          contact_value?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          last_verified_at?: string | null
          metadata?: Json
          name: string
          priority?: string
          source_url?: string | null
          status?: string
          target_key: string
          target_type: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          authority_reason?: string
          contact_method?: string | null
          contact_value?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          last_verified_at?: string | null
          metadata?: Json
          name?: string
          priority?: string
          source_url?: string | null
          status?: string
          target_key?: string
          target_type?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      seo_entity_profiles: {
        Row: {
          canonical_name: string
          created_at: string
          descriptor: string
          desired_handle: string | null
          id: string
          last_verified_at: string | null
          metadata: Json
          platform: string
          profile_key: string
          profile_url: string | null
          status: string
          updated_at: string
          verification_method: string | null
        }
        Insert: {
          canonical_name?: string
          created_at?: string
          descriptor?: string
          desired_handle?: string | null
          id?: string
          last_verified_at?: string | null
          metadata?: Json
          platform: string
          profile_key: string
          profile_url?: string | null
          status?: string
          updated_at?: string
          verification_method?: string | null
        }
        Update: {
          canonical_name?: string
          created_at?: string
          descriptor?: string
          desired_handle?: string | null
          id?: string
          last_verified_at?: string | null
          metadata?: Json
          platform?: string
          profile_key?: string
          profile_url?: string | null
          status?: string
          updated_at?: string
          verification_method?: string | null
        }
        Relationships: []
      }
      si_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          manifest_hash: string | null
          note: string
          report_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          manifest_hash?: string | null
          note?: string
          report_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          manifest_hash?: string | null
          note?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "si_events_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      si_progress: {
        Row: {
          attribution: string
          intervention: string
          learning: string
          outcome: string
          recommendation_id: string
          report_id: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attribution?: string
          intervention?: string
          learning?: string
          outcome?: string
          recommendation_id: string
          report_id: string
          status: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attribution?: string
          intervention?: string
          learning?: string
          outcome?: string
          recommendation_id?: string
          report_id?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "si_progress_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      si_report_access: {
        Row: {
          created_at: string
          granted_by: string | null
          report_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          report_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          report_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "si_report_access_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id"]
          },
        ]
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
      studio_profile_answer_history: {
        Row: {
          data_notice_version: string | null
          field_key: string
          id: number
          measurement_end: string | null
          measurement_start: string | null
          new_value: Json
          notice_acknowledged_at: string | null
          previous_period_end: string | null
          previous_period_start: string | null
          previous_value: Json | null
          recorded_at: string
          source_ref: string | null
          source_submission_id: string | null
          source_type: string
          studio_id: string
          verification_status: string
        }
        Insert: {
          data_notice_version?: string | null
          field_key: string
          id?: never
          measurement_end?: string | null
          measurement_start?: string | null
          new_value: Json
          notice_acknowledged_at?: string | null
          previous_period_end?: string | null
          previous_period_start?: string | null
          previous_value?: Json | null
          recorded_at?: string
          source_ref?: string | null
          source_submission_id?: string | null
          source_type: string
          studio_id: string
          verification_status: string
        }
        Update: {
          data_notice_version?: string | null
          field_key?: string
          id?: never
          measurement_end?: string | null
          measurement_start?: string | null
          new_value?: Json
          notice_acknowledged_at?: string | null
          previous_period_end?: string | null
          previous_period_start?: string | null
          previous_value?: Json | null
          recorded_at?: string
          source_ref?: string | null
          source_submission_id?: string | null
          source_type?: string
          studio_id?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_profile_answer_history_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_profile_answers: {
        Row: {
          answered_at: string
          confidence: number | null
          data_notice_version: string | null
          field_key: string
          measurement_end: string | null
          measurement_start: string | null
          notice_acknowledged_at: string | null
          source_ref: string | null
          source_submission_id: string | null
          source_type: string
          studio_id: string
          updated_at: string
          value_json: Json
          verification_status: string
        }
        Insert: {
          answered_at?: string
          confidence?: number | null
          data_notice_version?: string | null
          field_key: string
          measurement_end?: string | null
          measurement_start?: string | null
          notice_acknowledged_at?: string | null
          source_ref?: string | null
          source_submission_id?: string | null
          source_type: string
          studio_id: string
          updated_at?: string
          value_json: Json
          verification_status?: string
        }
        Update: {
          answered_at?: string
          confidence?: number | null
          data_notice_version?: string | null
          field_key?: string
          measurement_end?: string | null
          measurement_start?: string | null
          notice_acknowledged_at?: string | null
          source_ref?: string | null
          source_submission_id?: string | null
          source_type?: string
          studio_id?: string
          updated_at?: string
          value_json?: Json
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_profile_answers_source_submission_id_fkey"
            columns: ["source_submission_id"]
            isOneToOne: false
            referencedRelation: "public_tool_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_profile_answers_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_scoring_dimensions: {
        Row: {
          dimension_key: string
          dimension_weight: number
          label: string
          model_id: string
        }
        Insert: {
          dimension_key: string
          dimension_weight: number
          label: string
          model_id: string
        }
        Update: {
          dimension_key?: string
          dimension_weight?: number
          label?: string
          model_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_scoring_dimensions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "studio_scoring_models"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_scoring_metric_assessments: {
        Row: {
          benchmark_ref: string | null
          benchmark_state: string
          confidence: number | null
          created_at: string
          evidence_id: string | null
          id: string
          metric_value_id: string | null
          normalised_score: number
          observed_at: string
          review_status: string
          rule_id: string
          scoring_basis: Json
          source_ref: string | null
          source_tier: string
          studio_id: string
        }
        Insert: {
          benchmark_ref?: string | null
          benchmark_state: string
          confidence?: number | null
          created_at?: string
          evidence_id?: string | null
          id?: string
          metric_value_id?: string | null
          normalised_score: number
          observed_at?: string
          review_status?: string
          rule_id: string
          scoring_basis?: Json
          source_ref?: string | null
          source_tier: string
          studio_id: string
        }
        Update: {
          benchmark_ref?: string | null
          benchmark_state?: string
          confidence?: number | null
          created_at?: string
          evidence_id?: string | null
          id?: string
          metric_value_id?: string | null
          normalised_score?: number
          observed_at?: string
          review_status?: string
          rule_id?: string
          scoring_basis?: Json
          source_ref?: string | null
          source_tier?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_scoring_metric_assessments_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "intelligence_evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_scoring_metric_assessments_metric_value_id_fkey"
            columns: ["metric_value_id"]
            isOneToOne: false
            referencedRelation: "intelligence_metric_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_scoring_metric_assessments_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "studio_scoring_metric_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_scoring_metric_assessments_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "visibility_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_scoring_metric_rules: {
        Row: {
          active: boolean
          dimension_key: string
          id: string
          metric_key: string
          metric_weight: number
          model_id: string
          scoring_method: string
        }
        Insert: {
          active?: boolean
          dimension_key: string
          id?: string
          metric_key: string
          metric_weight?: number
          model_id: string
          scoring_method?: string
        }
        Update: {
          active?: boolean
          dimension_key?: string
          id?: string
          metric_key?: string
          metric_weight?: number
          model_id?: string
          scoring_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_scoring_metric_rules_model_id_dimension_key_fkey"
            columns: ["model_id", "dimension_key"]
            isOneToOne: false
            referencedRelation: "studio_scoring_dimensions"
            referencedColumns: ["model_id", "dimension_key"]
          },
        ]
      }
      studio_scoring_models: {
        Row: {
          created_at: string
          description: string | null
          id: string
          min_coverage: number
          model_key: string
          name: string
          status: string
          tier: string
          version: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          min_coverage: number
          model_key: string
          name: string
          status?: string
          tier: string
          version: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          min_coverage?: number
          model_key?: string
          name?: string
          status?: string
          tier?: string
          version?: number
        }
        Relationships: []
      }
      studio_scoring_snapshots: {
        Row: {
          assessment_ids: string[]
          coverage: number
          dimension_scores: Json
          engine_version: string
          evidence_quality: number | null
          id: string
          model_id: string
          period_end: string | null
          period_start: string | null
          score: number | null
          scored_at: string
          status: string
          studio_id: string
        }
        Insert: {
          assessment_ids?: string[]
          coverage: number
          dimension_scores?: Json
          engine_version?: string
          evidence_quality?: number | null
          id?: string
          model_id: string
          period_end?: string | null
          period_start?: string | null
          score?: number | null
          scored_at?: string
          status: string
          studio_id: string
        }
        Update: {
          assessment_ids?: string[]
          coverage?: number
          dimension_scores?: Json
          engine_version?: string
          evidence_quality?: number | null
          id?: string
          model_id?: string
          period_end?: string | null
          period_start?: string | null
          score?: number | null
          scored_at?: string
          status?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_scoring_snapshots_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "studio_scoring_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_scoring_snapshots_studio_id_fkey"
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
      tattoo_enquiries: {
        Row: {
          age_confirmed: boolean
          budget_range: string | null
          created_at: string
          description: string
          email: string
          full_name: string
          id: string
          instagram_handle: string | null
          is_test: boolean
          marketing_consent: boolean
          phone: string | null
          placement: string
          preferred_contact: string
          privacy_accepted: boolean
          project_type: string
          reference_links: string | null
          request_id: string
          sessions: string
          source_page: string
          status: string
          timeframe: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          age_confirmed?: boolean
          budget_range?: string | null
          created_at?: string
          description: string
          email: string
          full_name: string
          id?: string
          instagram_handle?: string | null
          is_test?: boolean
          marketing_consent?: boolean
          phone?: string | null
          placement: string
          preferred_contact: string
          privacy_accepted?: boolean
          project_type: string
          reference_links?: string | null
          request_id: string
          sessions: string
          source_page?: string
          status?: string
          timeframe?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          age_confirmed?: boolean
          budget_range?: string | null
          created_at?: string
          description?: string
          email?: string
          full_name?: string
          id?: string
          instagram_handle?: string | null
          is_test?: boolean
          marketing_consent?: boolean
          phone?: string | null
          placement?: string
          preferred_contact?: string
          privacy_accepted?: boolean
          project_type?: string
          reference_links?: string | null
          request_id?: string
          sessions?: string
          source_page?: string
          status?: string
          timeframe?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      tattoo_enquiry_attempts: {
        Row: {
          created_at: string
          fingerprint: string
          id: number
          route: string
        }
        Insert: {
          created_at?: string
          fingerprint: string
          id?: never
          route?: string
        }
        Update: {
          created_at?: string
          fingerprint?: string
          id?: never
          route?: string
        }
        Relationships: []
      }
      tattoo_portfolio_2027_applications: {
        Row: {
          age_confirmed: boolean
          artistic_direction: string
          concept_description: string
          created_at: string
          email: string
          existing_work: string | null
          full_name: string
          id: string
          image_paths: Json
          image_rights_confirmed: boolean
          instagram_handle: string | null
          internal_notes: string | null
          marketing_consent: boolean
          phone: string | null
          placement: string
          preferred_contact: string
          privacy_accepted: boolean
          project_preference: string | null
          project_size: string
          reference_links: string | null
          request_id: string
          source_page: string
          status: string
          timeframe: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          age_confirmed: boolean
          artistic_direction: string
          concept_description: string
          created_at?: string
          email: string
          existing_work?: string | null
          full_name: string
          id?: string
          image_paths?: Json
          image_rights_confirmed?: boolean
          instagram_handle?: string | null
          internal_notes?: string | null
          marketing_consent?: boolean
          phone?: string | null
          placement: string
          preferred_contact: string
          privacy_accepted: boolean
          project_preference?: string | null
          project_size: string
          reference_links?: string | null
          request_id: string
          source_page?: string
          status?: string
          timeframe?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          age_confirmed?: boolean
          artistic_direction?: string
          concept_description?: string
          created_at?: string
          email?: string
          existing_work?: string | null
          full_name?: string
          id?: string
          image_paths?: Json
          image_rights_confirmed?: boolean
          instagram_handle?: string | null
          internal_notes?: string | null
          marketing_consent?: boolean
          phone?: string | null
          placement?: string
          preferred_contact?: string
          privacy_accepted?: boolean
          project_preference?: string | null
          project_size?: string
          reference_links?: string | null
          request_id?: string
          source_page?: string
          status?: string
          timeframe?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tattoo_portfolio_2027_applications_project_preference_fkey"
            columns: ["project_preference"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_project_summary"
            referencedColumns: ["project_key"]
          },
          {
            foreignKeyName: "tattoo_portfolio_2027_applications_project_preference_fkey"
            columns: ["project_preference"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_projects"
            referencedColumns: ["project_key"]
          },
        ]
      }
      tattoo_portfolio_2027_assessments: {
        Row: {
          application_id: string
          artistic_potential: number
          assessed_at: string
          assessed_by: string | null
          client_commitment: number
          decision: string
          feasibility: number
          id: string
          originality: number
          portfolio_value: number
          technical_challenge: number
          total_score: number | null
          visual_impact: number
        }
        Insert: {
          application_id: string
          artistic_potential: number
          assessed_at?: string
          assessed_by?: string | null
          client_commitment: number
          decision?: string
          feasibility: number
          id?: string
          originality: number
          portfolio_value: number
          technical_challenge: number
          total_score?: number | null
          visual_impact: number
        }
        Update: {
          application_id?: string
          artistic_potential?: number
          assessed_at?: string
          assessed_by?: string | null
          client_commitment?: number
          decision?: string
          feasibility?: number
          id?: string
          originality?: number
          portfolio_value?: number
          technical_challenge?: number
          total_score?: number | null
          visual_impact?: number
        }
        Relationships: [
          {
            foreignKeyName: "tattoo_portfolio_2027_assessments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "tattoo_portfolio_2027_application_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tattoo_portfolio_2027_assessments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "tattoo_portfolio_2027_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      tattoo_portfolio_2027_attempts: {
        Row: {
          created_at: string
          fingerprint: string
          id: number
        }
        Insert: {
          created_at?: string
          fingerprint: string
          id?: never
        }
        Update: {
          created_at?: string
          fingerprint?: string
          id?: never
        }
        Relationships: []
      }
      tattoo_portfolio_2027_bookings: {
        Row: {
          agreed_price_gbp: number
          agreement_signed_at: string | null
          application_id: string
          booking_status: string
          completed_at: string | null
          created_at: string
          deposit_required_gbp: number | null
          first_session_at: string | null
          id: string
          image_permission_status: string
          notes: string | null
          project_key: string
        }
        Insert: {
          agreed_price_gbp: number
          agreement_signed_at?: string | null
          application_id: string
          booking_status?: string
          completed_at?: string | null
          created_at?: string
          deposit_required_gbp?: number | null
          first_session_at?: string | null
          id?: string
          image_permission_status?: string
          notes?: string | null
          project_key: string
        }
        Update: {
          agreed_price_gbp?: number
          agreement_signed_at?: string | null
          application_id?: string
          booking_status?: string
          completed_at?: string | null
          created_at?: string
          deposit_required_gbp?: number | null
          first_session_at?: string | null
          id?: string
          image_permission_status?: string
          notes?: string | null
          project_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "tattoo_portfolio_2027_bookings_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "tattoo_portfolio_2027_application_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tattoo_portfolio_2027_bookings_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "tattoo_portfolio_2027_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tattoo_portfolio_2027_bookings_project_key_fkey"
            columns: ["project_key"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_project_summary"
            referencedColumns: ["project_key"]
          },
          {
            foreignKeyName: "tattoo_portfolio_2027_bookings_project_key_fkey"
            columns: ["project_key"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_projects"
            referencedColumns: ["project_key"]
          },
        ]
      }
      tattoo_portfolio_2027_content: {
        Row: {
          asset_type: string
          booking_id: string | null
          caption: string | null
          captured_at: string | null
          created_at: string
          id: string
          performance_notes: string | null
          permission_id: string | null
          permission_status: string
          permitted_channels: string[]
          planned_publish_at: string | null
          publication_url: string | null
          published_at: string | null
          storage_path: string | null
        }
        Insert: {
          asset_type: string
          booking_id?: string | null
          caption?: string | null
          captured_at?: string | null
          created_at?: string
          id?: string
          performance_notes?: string | null
          permission_id?: string | null
          permission_status?: string
          permitted_channels?: string[]
          planned_publish_at?: string | null
          publication_url?: string | null
          published_at?: string | null
          storage_path?: string | null
        }
        Update: {
          asset_type?: string
          booking_id?: string | null
          caption?: string | null
          captured_at?: string | null
          created_at?: string
          id?: string
          performance_notes?: string | null
          permission_id?: string | null
          permission_status?: string
          permitted_channels?: string[]
          planned_publish_at?: string | null
          publication_url?: string | null
          published_at?: string | null
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tattoo_portfolio_2027_content_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_booking_financials"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "tattoo_portfolio_2027_content_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tattoo_portfolio_2027_content_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_image_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      tattoo_portfolio_2027_image_permissions: {
        Row: {
          booking_id: string
          consent_status: string
          created_at: string
          form_reference: string | null
          granted_at: string | null
          id: string
          include_face: boolean
          include_name: boolean
          include_voice: boolean
          notes: string | null
          permission_text_version: string
          permitted_channels: string[]
          permitted_material: string
          withdrawn_at: string | null
        }
        Insert: {
          booking_id: string
          consent_status?: string
          created_at?: string
          form_reference?: string | null
          granted_at?: string | null
          id?: string
          include_face?: boolean
          include_name?: boolean
          include_voice?: boolean
          notes?: string | null
          permission_text_version: string
          permitted_channels?: string[]
          permitted_material?: string
          withdrawn_at?: string | null
        }
        Update: {
          booking_id?: string
          consent_status?: string
          created_at?: string
          form_reference?: string | null
          granted_at?: string | null
          id?: string
          include_face?: boolean
          include_name?: boolean
          include_voice?: boolean
          notes?: string | null
          permission_text_version?: string
          permitted_channels?: string[]
          permitted_material?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tattoo_portfolio_2027_image_permissions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_booking_financials"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "tattoo_portfolio_2027_image_permissions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      tattoo_portfolio_2027_payments: {
        Row: {
          amount_gbp: number
          booking_id: string
          created_at: string
          id: string
          notes: string | null
          paid_at: string | null
          payment_reference: string | null
          payment_type: string
        }
        Insert: {
          amount_gbp: number
          booking_id: string
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          payment_type: string
        }
        Update: {
          amount_gbp?: number
          booking_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          payment_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "tattoo_portfolio_2027_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_booking_financials"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "tattoo_portfolio_2027_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      tattoo_portfolio_2027_projects: {
        Row: {
          active: boolean
          artistic_direction: string
          colour_approach: string
          created_at: string
          fixed_price_gbp: number
          minimum_days: number
          non_selected_estimate_gbp: number
          placement: string
          project_key: string
          project_size: string
          scope_summary: string
          sort_order: number
          standard_estimate_gbp: number
          title: string
        }
        Insert: {
          active?: boolean
          artistic_direction: string
          colour_approach: string
          created_at?: string
          fixed_price_gbp: number
          minimum_days: number
          non_selected_estimate_gbp: number
          placement: string
          project_key: string
          project_size: string
          scope_summary: string
          sort_order: number
          standard_estimate_gbp: number
          title: string
        }
        Update: {
          active?: boolean
          artistic_direction?: string
          colour_approach?: string
          created_at?: string
          fixed_price_gbp?: number
          minimum_days?: number
          non_selected_estimate_gbp?: number
          placement?: string
          project_key?: string
          project_size?: string
          scope_summary?: string
          sort_order?: number
          standard_estimate_gbp?: number
          title?: string
        }
        Relationships: []
      }
      tattoo_portfolio_2027_sessions: {
        Row: {
          actual_tattooing_minutes: number | null
          booking_id: string
          break_minutes: number
          created_at: string
          ended_at: string
          id: string
          session_date: string
          session_notes: string | null
          session_number: number
          started_at: string
        }
        Insert: {
          actual_tattooing_minutes?: number | null
          booking_id: string
          break_minutes?: number
          created_at?: string
          ended_at: string
          id?: string
          session_date: string
          session_notes?: string | null
          session_number: number
          started_at: string
        }
        Update: {
          actual_tattooing_minutes?: number | null
          booking_id?: string
          break_minutes?: number
          created_at?: string
          ended_at?: string
          id?: string
          session_date?: string
          session_notes?: string | null
          session_number?: number
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tattoo_portfolio_2027_sessions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_booking_financials"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "tattoo_portfolio_2027_sessions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_bookings"
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
      tattoo_portfolio_2027_application_scores: {
        Row: {
          artistic_direction: string | null
          artistic_potential: number | null
          assessed_at: string | null
          client_commitment: number | null
          created_at: string | null
          decision: string | null
          email: string | null
          feasibility: number | null
          full_name: string | null
          id: string | null
          instagram_handle: string | null
          originality: number | null
          phone: string | null
          placement: string | null
          portfolio_value: number | null
          project_preference: string | null
          project_size: string | null
          status: string | null
          technical_challenge: number | null
          total_score: number | null
          visual_impact: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tattoo_portfolio_2027_applications_project_preference_fkey"
            columns: ["project_preference"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_project_summary"
            referencedColumns: ["project_key"]
          },
          {
            foreignKeyName: "tattoo_portfolio_2027_applications_project_preference_fkey"
            columns: ["project_preference"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_projects"
            referencedColumns: ["project_key"]
          },
        ]
      }
      tattoo_portfolio_2027_booking_financials: {
        Row: {
          actual_tattooing_hours: number | null
          actual_tattooing_minutes: number | null
          agreed_price_gbp: number | null
          application_id: string | null
          balance_remaining_gbp: number | null
          booking_id: string | null
          booking_status: string | null
          collected_gbp_per_tattoo_hour: number | null
          deposit_required_gbp: number | null
          project_key: string | null
          revenue_collected_gbp: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tattoo_portfolio_2027_bookings_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "tattoo_portfolio_2027_application_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tattoo_portfolio_2027_bookings_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "tattoo_portfolio_2027_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tattoo_portfolio_2027_bookings_project_key_fkey"
            columns: ["project_key"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_project_summary"
            referencedColumns: ["project_key"]
          },
          {
            foreignKeyName: "tattoo_portfolio_2027_bookings_project_key_fkey"
            columns: ["project_key"]
            isOneToOne: false
            referencedRelation: "tattoo_portfolio_2027_projects"
            referencedColumns: ["project_key"]
          },
        ]
      }
      tattoo_portfolio_2027_campaign_dashboard: {
        Row: {
          actual_tattooing_hours: number | null
          balance_remaining_gbp: number | null
          confirmed_bookings: number | null
          contracted_revenue_gbp: number | null
          permissioned_content_assets: number | null
          published_content_assets: number | null
          qualified_applications: number | null
          reserve_applications: number | null
          revenue_collected_gbp: number | null
          selected_applications: number | null
          total_applications: number | null
        }
        Relationships: []
      }
      tattoo_portfolio_2027_project_summary: {
        Row: {
          application_count: number | null
          booking_count: number | null
          contracted_revenue_gbp: number | null
          fixed_price_gbp: number | null
          minimum_days: number | null
          project_key: string | null
          project_size: string | null
          sort_order: number | null
          title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      atlas_admin_review_claim: {
        Args: {
          p_actor_id: string
          p_authority_confirmed: boolean
          p_claim_id: string
          p_decision: string
          p_evidence_summary: string
          p_existing_studio_id?: string
          p_existing_visibility_id?: string
        }
        Returns: Json
      }
      atlas_admin_review_publication: {
        Args: {
          p_action: string
          p_actor_id: string
          p_draft_id?: string
          p_evidence_note: string
          p_latitude?: number
          p_longitude?: number
          p_owner_public_location_confirmed?: boolean
          p_profile_id: string
          p_public_address?: string
          p_source_url?: string
        }
        Returns: Json
      }
      begin_founding_studio_checkout: {
        Args: { p_token_hash: string }
        Returns: {
          checkout_email: string
          checkout_url: string
        }[]
      }
      calculate_studio_score_v1: {
        Args: {
          p_model_key: string
          p_period_end?: string
          p_period_start?: string
          p_studio_id: string
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
      claim_public_tool_submission_v1: {
        Args: {
          p_studio_id: string
          p_submission_id: string
          p_submission_key: string
          p_user_id: string
        }
        Returns: Json
      }
      consume_public_endpoint_rate_limit: {
        Args: {
          p_endpoint: string
          p_key_hash: string
          p_max_requests?: number
          p_window_started_at: string
        }
        Returns: boolean
      }
      create_founding_studio_invite: {
        Args: {
          p_contact_name: string
          p_email: string
          p_expires_at?: string
          p_reason: string
          p_studio_name: string
          p_token_hash: string
          p_token_hint: string
          p_website: string
        }
        Returns: {
          expires_at: string
          invite_id: string
          slot_code: string
        }[]
      }
      generate_studio_search_universe: {
        Args: { p_report_run_id?: string; p_studio_id: string }
        Returns: number
      }
      generate_visibility_report: {
        Args: { p_report_run_id: string }
        Returns: Json
      }
      get_search_provider_status: {
        Args: { p_studio_id?: string }
        Returns: Json
      }
      lock_golden_audit_run: { Args: { p_audit_id: string }; Returns: boolean }
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
      process_founding_studio_checkout: {
        Args: {
          p_amount_total: number
          p_contact_name: string
          p_currency: string
          p_customer_id: string
          p_email: string
          p_event_id: string
          p_livemode: boolean
          p_payment_link_id: string
          p_session_id: string
          p_studio_name: string
          p_website: string
        }
        Returns: Json
      }
      publish_visibility_report: {
        Args: { p_public_token: string; p_report_id: string }
        Returns: Json
      }
      reconcile_reviewed_studio_submissions_v1: {
        Args: { p_legacy_studio_id: string }
        Returns: number
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
      resolve_founding_studio_completion: {
        Args: { p_session_id: string }
        Returns: {
          audit_id: string
          contact_name: string
          invite_status: string
          onboarding_status: string
          studio_name: string
          website: string
        }[]
      }
      resolve_founding_studio_invite: {
        Args: { p_token_hash: string }
        Returns: {
          amount_due_minor: number
          can_checkout: boolean
          contact_name: string
          email_hint: string
          expires_at: string
          invite_status: string
          list_value_minor: number
          studio_name: string
          waiver_amount_minor: number
        }[]
      }
      revoke_founding_studio_invite: {
        Args: { p_invite_id: string }
        Returns: undefined
      }
      si_command: {
        Args: { p_action: string; p_payload?: Json; p_report?: string }
        Returns: string
      }
      submit_founding_studio_onboarding: {
        Args: {
          p_artist_count: number
          p_booking_process: string
          p_data_available: string
          p_instagram_url?: string
          p_location: string
          p_notes?: string
          p_primary_goal: string
          p_session_id: string
        }
        Returns: {
          audit_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
