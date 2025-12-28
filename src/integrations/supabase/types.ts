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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accredited_investors: {
        Row: {
          accreditation_type: string
          annual_income: number | null
          created_at: string
          documents: Json | null
          expires_at: string | null
          id: string
          investor_type: string
          net_worth: number | null
          reviewer_notes: string | null
          updated_at: string
          user_id: string
          verification_method: string | null
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          accreditation_type: string
          annual_income?: number | null
          created_at?: string
          documents?: Json | null
          expires_at?: string | null
          id?: string
          investor_type: string
          net_worth?: number | null
          reviewer_notes?: string | null
          updated_at?: string
          user_id: string
          verification_method?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          accreditation_type?: string
          annual_income?: number | null
          created_at?: string
          documents?: Json | null
          expires_at?: string | null
          id?: string
          investor_type?: string
          net_worth?: number | null
          reviewer_notes?: string | null
          updated_at?: string
          user_id?: string
          verification_method?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      alert_history: {
        Row: {
          actual_value: number
          alert_id: string
          alert_type: string
          created_at: string
          id: string
          is_read: boolean
          item_id: string
          item_type: string
          message: string
          threshold_value: number
          user_id: string
        }
        Insert: {
          actual_value: number
          alert_id: string
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean
          item_id: string
          item_type: string
          message: string
          threshold_value: number
          user_id: string
        }
        Update: {
          actual_value?: number
          alert_id?: string
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          item_id?: string
          item_type?: string
          message?: string
          threshold_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_history_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "price_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      api_applications: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          oauth_client_id: string
          oauth_client_secret_hash: string | null
          redirect_uris: Json
          status: string
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          oauth_client_id?: string
          oauth_client_secret_hash?: string | null
          redirect_uris?: Json
          status?: string
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          oauth_client_id?: string
          oauth_client_secret_hash?: string | null
          redirect_uris?: Json
          status?: string
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          environment: string
          expires_at: string | null
          id: string
          ip_whitelist: Json | null
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: Json
          rate_limit_tier: string
          requests_this_month: number
          requests_today: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          environment?: string
          expires_at?: string | null
          id?: string
          ip_whitelist?: Json | null
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: Json
          rate_limit_tier?: string
          requests_this_month?: number
          requests_today?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          environment?: string
          expires_at?: string | null
          id?: string
          ip_whitelist?: Json | null
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json
          rate_limit_tier?: string
          requests_this_month?: number
          requests_today?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_requests_log: {
        Row: {
          api_key_id: string
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          ip_address: string | null
          method: string
          request_body: Json | null
          response_time_ms: number
          status_code: number
          user_agent: string | null
          user_id: string
        }
        Insert: {
          api_key_id: string
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          method: string
          request_body?: Json | null
          response_time_ms?: number
          status_code: number
          user_agent?: string | null
          user_id: string
        }
        Update: {
          api_key_id?: string
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          method?: string
          request_body?: Json | null
          response_time_ms?: number
          status_code?: number
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_requests_log_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      api_webhooks: {
        Row: {
          created_at: string
          events: Json
          failure_count: number
          id: string
          is_active: boolean
          last_triggered_at: string | null
          name: string
          secret: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: Json
          failure_count?: number
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name: string
          secret: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: Json
          failure_count?: number
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name?: string
          secret?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      asset_price_history: {
        Row: {
          entity_id: string
          entity_type: string
          id: string
          price: number
          recorded_at: string
        }
        Insert: {
          entity_id: string
          entity_type: string
          id?: string
          price: number
          recorded_at?: string
        }
        Update: {
          entity_id?: string
          entity_type?: string
          id?: string
          price?: number
          recorded_at?: string
        }
        Relationships: []
      }
      auth_events: {
        Row: {
          auth_method: string
          created_at: string
          device_id: string | null
          event_type: string
          failure_reason: string | null
          id: string
          ip_address: string | null
          location: string | null
          success: boolean
          user_id: string
        }
        Insert: {
          auth_method: string
          created_at?: string
          device_id?: string | null
          event_type: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          success?: boolean
          user_id: string
        }
        Update: {
          auth_method?: string
          created_at?: string
          device_id?: string | null
          event_type?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          success?: boolean
          user_id?: string
        }
        Relationships: []
      }
      auto_invest_allocations: {
        Row: {
          allocation_percent: number
          category: string | null
          created_at: string
          id: string
          plan_id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          allocation_percent: number
          category?: string | null
          created_at?: string
          id?: string
          plan_id: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          allocation_percent?: number
          category?: string | null
          created_at?: string
          id?: string
          plan_id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_invest_allocations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "auto_invest_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_invest_execution_details: {
        Row: {
          actual_amount: number
          created_at: string
          execution_id: string
          failure_reason: string | null
          id: string
          intended_amount: number
          status: string
          target_id: string
          target_name: string
          target_type: string
          token_price: number
          tokens_purchased: number
          transaction_id: string | null
        }
        Insert: {
          actual_amount?: number
          created_at?: string
          execution_id: string
          failure_reason?: string | null
          id?: string
          intended_amount: number
          status?: string
          target_id: string
          target_name: string
          target_type: string
          token_price?: number
          tokens_purchased?: number
          transaction_id?: string | null
        }
        Update: {
          actual_amount?: number
          created_at?: string
          execution_id?: string
          failure_reason?: string | null
          id?: string
          intended_amount?: number
          status?: string
          target_id?: string
          target_name?: string
          target_type?: string
          token_price?: number
          tokens_purchased?: number
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_invest_execution_details_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "auto_invest_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_invest_executions: {
        Row: {
          actual_amount: number
          completed_at: string | null
          created_at: string
          execution_date: string
          failure_reason: string | null
          id: string
          plan_id: string
          status: string
          total_amount: number
          user_id: string
        }
        Insert: {
          actual_amount?: number
          completed_at?: string | null
          created_at?: string
          execution_date: string
          failure_reason?: string | null
          id?: string
          plan_id: string
          status?: string
          total_amount: number
          user_id: string
        }
        Update: {
          actual_amount?: number
          completed_at?: string | null
          created_at?: string
          execution_date?: string
          failure_reason?: string | null
          id?: string
          plan_id?: string
          status?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_invest_executions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "auto_invest_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_invest_plans: {
        Row: {
          amount: number
          created_at: string
          frequency: string
          funding_source: string
          id: string
          insufficient_funds_action: string
          last_execution_date: string | null
          linked_account_id: string | null
          name: string
          next_execution_date: string
          pause_until: string | null
          paused_at: string | null
          start_date: string
          status: string
          total_executions: number
          total_invested: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          frequency?: string
          funding_source?: string
          id?: string
          insufficient_funds_action?: string
          last_execution_date?: string | null
          linked_account_id?: string | null
          name: string
          next_execution_date: string
          pause_until?: string | null
          paused_at?: string | null
          start_date: string
          status?: string
          total_executions?: number
          total_invested?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          frequency?: string
          funding_source?: string
          id?: string
          insufficient_funds_action?: string
          last_execution_date?: string | null
          linked_account_id?: string | null
          name?: string
          next_execution_date?: string
          pause_until?: string | null
          paused_at?: string | null
          start_date?: string
          status?: string
          total_executions?: number
          total_invested?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_invest_plans_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "linked_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      biometric_settings: {
        Row: {
          biometric_enabled: boolean
          biometric_type: string | null
          created_at: string
          device_id: string
          device_name: string
          failed_attempts: number
          id: string
          last_biometric_auth: string | null
          locked_until: string | null
          pin_enabled: boolean
          pin_hash: string | null
          require_biometric_for_login: boolean
          require_biometric_for_transactions: boolean
          require_biometric_for_transfers: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          biometric_enabled?: boolean
          biometric_type?: string | null
          created_at?: string
          device_id: string
          device_name: string
          failed_attempts?: number
          id?: string
          last_biometric_auth?: string | null
          locked_until?: string | null
          pin_enabled?: boolean
          pin_hash?: string | null
          require_biometric_for_login?: boolean
          require_biometric_for_transactions?: boolean
          require_biometric_for_transfers?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          biometric_enabled?: boolean
          biometric_type?: string | null
          created_at?: string
          device_id?: string
          device_name?: string
          failed_attempts?: number
          id?: string
          last_biometric_auth?: string | null
          locked_until?: string | null
          pin_enabled?: boolean
          pin_hash?: string | null
          require_biometric_for_login?: boolean
          require_biometric_for_transactions?: boolean
          require_biometric_for_transfers?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      buy_orders: {
        Row: {
          buyer_id: string
          created_at: string
          expires_at: string | null
          filled_quantity: number
          id: string
          item_id: string
          item_type: string
          max_price_per_token: number
          status: string
          token_quantity: number
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          expires_at?: string | null
          filled_quantity?: number
          id?: string
          item_id: string
          item_type: string
          max_price_per_token: number
          status?: string
          token_quantity: number
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          expires_at?: string | null
          filled_quantity?: number
          id?: string
          item_id?: string
          item_type?: string
          max_price_per_token?: number
          status?: string
          token_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      calculation_history: {
        Row: {
          calculator_type: string
          created_at: string
          id: string
          inputs: Json
          results: Json
          user_id: string
        }
        Insert: {
          calculator_type: string
          created_at?: string
          id?: string
          inputs?: Json
          results?: Json
          user_id: string
        }
        Update: {
          calculator_type?: string
          created_at?: string
          id?: string
          inputs?: Json
          results?: Json
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          is_hidden: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          parent_id: string | null
          replies_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          replies_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          replies_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comparison_history: {
        Row: {
          comparison_type: string
          created_at: string
          id: string
          item_ids: string[]
          user_id: string
        }
        Insert: {
          comparison_type: string
          created_at?: string
          id?: string
          item_ids: string[]
          user_id: string
        }
        Update: {
          comparison_type?: string
          created_at?: string
          id?: string
          item_ids?: string[]
          user_id?: string
        }
        Relationships: []
      }
      comparisons: {
        Row: {
          comparison_type: string
          created_at: string
          id: string
          item_ids: string[]
          name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comparison_type: string
          created_at?: string
          id?: string
          item_ids?: string[]
          name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comparison_type?: string
          created_at?: string
          id?: string
          item_ids?: string[]
          name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_envelopes: {
        Row: {
          completed_at: string | null
          created_at: string
          decline_reason: string | null
          declined_at: string | null
          expires_at: string | null
          id: string
          investment_amount: number | null
          loan_id: string | null
          property_id: string | null
          provider: string | null
          provider_envelope_id: string | null
          sent_at: string | null
          signed_at: string | null
          signed_document_url: string | null
          status: string
          template_id: string | null
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          decline_reason?: string | null
          declined_at?: string | null
          expires_at?: string | null
          id?: string
          investment_amount?: number | null
          loan_id?: string | null
          property_id?: string | null
          provider?: string | null
          provider_envelope_id?: string | null
          sent_at?: string | null
          signed_at?: string | null
          signed_document_url?: string | null
          status?: string
          template_id?: string | null
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          decline_reason?: string | null
          declined_at?: string | null
          expires_at?: string | null
          id?: string
          investment_amount?: number | null
          loan_id?: string | null
          property_id?: string | null
          provider?: string | null
          provider_envelope_id?: string | null
          sent_at?: string | null
          signed_at?: string | null
          signed_document_url?: string | null
          status?: string
          template_id?: string | null
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_envelopes_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_envelopes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_envelopes_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      document_fields: {
        Row: {
          created_at: string
          envelope_id: string
          field_name: string
          field_type: string
          field_value: string | null
          id: string
          is_required: boolean | null
          signed_at: string | null
        }
        Insert: {
          created_at?: string
          envelope_id: string
          field_name: string
          field_type?: string
          field_value?: string | null
          id?: string
          is_required?: boolean | null
          signed_at?: string | null
        }
        Update: {
          created_at?: string
          envelope_id?: string
          field_name?: string
          field_type?: string
          field_value?: string | null
          id?: string
          is_required?: boolean | null
          signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_fields_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "document_envelopes"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          document_type: string
          id: string
          is_active: boolean | null
          name: string
          provider_template_id: string | null
          required_for: string[] | null
          signing_order: number | null
          template_url: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          document_type: string
          id?: string
          is_active?: boolean | null
          name: string
          provider_template_id?: string | null
          required_for?: string[] | null
          signing_order?: number | null
          template_url?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          document_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          provider_template_id?: string | null
          required_for?: string[] | null
          signing_order?: number | null
          template_url?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      drip_property_settings: {
        Row: {
          created_at: string
          custom_property_id: string | null
          id: string
          is_enabled: boolean
          property_id: string
          reinvest_to: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_property_id?: string | null
          id?: string
          is_enabled?: boolean
          property_id: string
          reinvest_to?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_property_id?: string | null
          id?: string
          is_enabled?: boolean
          property_id?: string
          reinvest_to?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drip_property_settings_custom_property_id_fkey"
            columns: ["custom_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drip_property_settings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      drip_settings: {
        Row: {
          created_at: string
          drip_balance: number
          drip_type: string
          id: string
          is_enabled: boolean
          minimum_reinvest_amount: number
          reinvest_debt_interest: boolean
          reinvest_equity_dividends: boolean
          reinvest_prediction_winnings: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          drip_balance?: number
          drip_type?: string
          id?: string
          is_enabled?: boolean
          minimum_reinvest_amount?: number
          reinvest_debt_interest?: boolean
          reinvest_equity_dividends?: boolean
          reinvest_prediction_winnings?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          drip_balance?: number
          drip_type?: string
          id?: string
          is_enabled?: boolean
          minimum_reinvest_amount?: number
          reinvest_debt_interest?: boolean
          reinvest_equity_dividends?: boolean
          reinvest_prediction_winnings?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      drip_summary: {
        Row: {
          created_at: string
          estimated_extra_value: number
          id: string
          period: string
          period_start: string
          tokens_acquired: number
          total_reinvested: number
          user_id: string
        }
        Insert: {
          created_at?: string
          estimated_extra_value?: number
          id?: string
          period: string
          period_start: string
          tokens_acquired?: number
          total_reinvested?: number
          user_id: string
        }
        Update: {
          created_at?: string
          estimated_extra_value?: number
          id?: string
          period?: string
          period_start?: string
          tokens_acquired?: number
          total_reinvested?: number
          user_id?: string
        }
        Relationships: []
      }
      drip_transactions: {
        Row: {
          created_at: string
          executed_at: string | null
          id: string
          reinvest_amount: number
          reinvest_property_id: string
          remainder_to_balance: number
          source_amount: number
          source_id: string
          source_type: string
          status: string
          token_price: number
          tokens_purchased: number
          user_id: string
        }
        Insert: {
          created_at?: string
          executed_at?: string | null
          id?: string
          reinvest_amount: number
          reinvest_property_id: string
          remainder_to_balance?: number
          source_amount: number
          source_id: string
          source_type: string
          status?: string
          token_price: number
          tokens_purchased: number
          user_id: string
        }
        Update: {
          created_at?: string
          executed_at?: string | null
          id?: string
          reinvest_amount?: number
          reinvest_property_id?: string
          remainder_to_balance?: number
          source_amount?: number
          source_id?: string
          source_type?: string
          status?: string
          token_price?: number
          tokens_purchased?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drip_transactions_reinvest_property_id_fkey"
            columns: ["reinvest_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      exclusive_offerings: {
        Row: {
          closes_at: string | null
          created_at: string
          current_raised: number
          description: string
          documents: Json | null
          hold_period_years: number | null
          id: string
          investor_requirements: Json | null
          minimum_investment: number
          name: string
          offering_type: string
          opens_at: string | null
          status: string
          target_irr: number | null
          target_multiple: number | null
          target_raise: number
        }
        Insert: {
          closes_at?: string | null
          created_at?: string
          current_raised?: number
          description: string
          documents?: Json | null
          hold_period_years?: number | null
          id?: string
          investor_requirements?: Json | null
          minimum_investment: number
          name: string
          offering_type: string
          opens_at?: string | null
          status?: string
          target_irr?: number | null
          target_multiple?: number | null
          target_raise: number
        }
        Update: {
          closes_at?: string | null
          created_at?: string
          current_raised?: number
          description?: string
          documents?: Json | null
          hold_period_years?: number | null
          id?: string
          investor_requirements?: Json | null
          minimum_investment?: number
          name?: string
          offering_type?: string
          opens_at?: string | null
          status?: string
          target_irr?: number | null
          target_multiple?: number | null
          target_raise?: number
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      governance_delegates: {
        Row: {
          created_at: string
          delegate_to: string
          id: string
          is_active: boolean
          item_id: string | null
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delegate_to: string
          id?: string
          is_active?: boolean
          item_id?: string | null
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delegate_to?: string
          id?: string
          is_active?: boolean
          item_id?: string | null
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      governance_proposals: {
        Row: {
          created_at: string
          created_by: string
          description: string
          documents: Json
          executed_at: string | null
          execution_details: string | null
          id: string
          item_id: string
          item_type: string
          options: Json
          pass_threshold: number
          proposal_type: string
          quorum_percentage: number
          status: string
          title: string
          updated_at: string
          voting_ends_at: string
          voting_starts_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description: string
          documents?: Json
          executed_at?: string | null
          execution_details?: string | null
          id?: string
          item_id: string
          item_type?: string
          options?: Json
          pass_threshold?: number
          proposal_type?: string
          quorum_percentage?: number
          status?: string
          title: string
          updated_at?: string
          voting_ends_at: string
          voting_starts_at: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          documents?: Json
          executed_at?: string | null
          execution_details?: string | null
          id?: string
          item_id?: string
          item_type?: string
          options?: Json
          pass_threshold?: number
          proposal_type?: string
          quorum_percentage?: number
          status?: string
          title?: string
          updated_at?: string
          voting_ends_at?: string
          voting_starts_at?: string
        }
        Relationships: []
      }
      governance_snapshots: {
        Row: {
          created_at: string
          id: string
          proposal_id: string
          snapshot_at: string
          tokens_held: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          proposal_id: string
          snapshot_at?: string
          tokens_held?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          proposal_id?: string
          snapshot_at?: string
          tokens_held?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_snapshots_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "governance_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_votes: {
        Row: {
          created_at: string
          id: string
          proposal_id: string
          user_id: string
          vote_option: string
          voted_at: string
          voting_power: number
        }
        Insert: {
          created_at?: string
          id?: string
          proposal_id: string
          user_id: string
          vote_option: string
          voted_at?: string
          voting_power?: number
        }
        Update: {
          created_at?: string
          id?: string
          proposal_id?: string
          user_id?: string
          vote_option?: string
          voted_at?: string
          voting_power?: number
        }
        Relationships: [
          {
            foreignKeyName: "governance_votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "governance_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      institutional_accounts: {
        Row: {
          aum: number | null
          authorized_signers: Json | null
          compliance_contact: Json | null
          created_at: string
          ein: string | null
          entity_name: string
          entity_type: string
          formation_date: string | null
          formation_state: string | null
          id: string
          status: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aum?: number | null
          authorized_signers?: Json | null
          compliance_contact?: Json | null
          created_at?: string
          ein?: string | null
          entity_name: string
          entity_type: string
          formation_date?: string | null
          formation_state?: string | null
          id?: string
          status?: string
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aum?: number | null
          authorized_signers?: Json | null
          compliance_contact?: Json | null
          created_at?: string
          ein?: string | null
          entity_name?: string
          entity_type?: string
          formation_date?: string | null
          formation_state?: string | null
          id?: string
          status?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      institutional_transactions: {
        Row: {
          amount: number
          created_at: string
          documents_signed: Json | null
          id: string
          institutional_account_id: string
          offering_id: string
          shares_units: number
          status: string
          transaction_type: string
          wire_reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          documents_signed?: Json | null
          id?: string
          institutional_account_id: string
          offering_id: string
          shares_units: number
          status?: string
          transaction_type: string
          wire_reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          documents_signed?: Json | null
          id?: string
          institutional_account_id?: string
          offering_id?: string
          shares_units?: number
          status?: string
          transaction_type?: string
          wire_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institutional_transactions_institutional_account_id_fkey"
            columns: ["institutional_account_id"]
            isOneToOne: false
            referencedRelation: "institutional_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institutional_transactions_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "exclusive_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          full_legal_name: string | null
          id: string
          id_back_url: string | null
          id_front_url: string | null
          id_type: string | null
          phone_number: string | null
          postal_code: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          selfie_url: string | null
          ssn_last4: string | null
          state: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_legal_name?: string | null
          id?: string
          id_back_url?: string | null
          id_front_url?: string | null
          id_type?: string | null
          phone_number?: string | null
          postal_code?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          selfie_url?: string | null
          ssn_last4?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_legal_name?: string | null
          id?: string
          id_back_url?: string | null
          id_front_url?: string | null
          id_type?: string | null
          phone_number?: string | null
          postal_code?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          selfie_url?: string | null
          ssn_last4?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      linked_accounts: {
        Row: {
          account_id: string | null
          account_mask: string | null
          account_name: string
          account_type: string
          created_at: string
          id: string
          institution_id: string | null
          institution_logo: string | null
          institution_name: string
          is_primary: boolean | null
          is_verified: boolean | null
          plaid_access_token: string | null
          plaid_item_id: string | null
          updated_at: string
          user_id: string
          verification_status: string | null
        }
        Insert: {
          account_id?: string | null
          account_mask?: string | null
          account_name: string
          account_type?: string
          created_at?: string
          id?: string
          institution_id?: string | null
          institution_logo?: string | null
          institution_name: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          plaid_access_token?: string | null
          plaid_item_id?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
        }
        Update: {
          account_id?: string | null
          account_mask?: string | null
          account_name?: string
          account_type?: string
          created_at?: string
          id?: string
          institution_id?: string | null
          institution_logo?: string | null
          institution_name?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          plaid_access_token?: string | null
          plaid_item_id?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      listings: {
        Row: {
          created_at: string
          expires_at: string | null
          filled_quantity: number
          id: string
          item_id: string
          item_type: string
          min_purchase_quantity: number
          price_per_token: number
          seller_id: string
          status: string
          token_quantity: number
          total_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          filled_quantity?: number
          id?: string
          item_id: string
          item_type: string
          min_purchase_quantity?: number
          price_per_token: number
          seller_id: string
          status?: string
          token_quantity: number
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          filled_quantity?: number
          id?: string
          item_id?: string
          item_type?: string
          min_purchase_quantity?: number
          price_per_token?: number
          seller_id?: string
          status?: string
          token_quantity?: number
          total_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      loan_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          loan_id: string
          payment_date: string
          payment_type: string
          status: string
          user_id: string
          user_investment_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          loan_id: string
          payment_date?: string
          payment_type: string
          status?: string
          user_id: string
          user_investment_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          loan_id?: string
          payment_date?: string
          payment_type?: string
          status?: string
          user_id?: string
          user_investment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_payments_user_investment_id_fkey"
            columns: ["user_investment_id"]
            isOneToOne: false
            referencedRelation: "user_loan_investments"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          amount_funded: number
          apy: number
          borrower_type: string | null
          city: string
          created_at: string
          description: string | null
          dscr: number | null
          id: string
          image_url: string | null
          investor_count: number
          loan_amount: number
          loan_position: string
          loan_type: string
          ltv_ratio: number
          maturity_date: string | null
          max_investment: number | null
          min_investment: number
          name: string
          payment_frequency: string | null
          personal_guarantee: boolean | null
          property_id: string | null
          property_value: number | null
          start_date: string | null
          state: string
          status: string
          term_months: number
          updated_at: string
        }
        Insert: {
          amount_funded?: number
          apy: number
          borrower_type?: string | null
          city: string
          created_at?: string
          description?: string | null
          dscr?: number | null
          id?: string
          image_url?: string | null
          investor_count?: number
          loan_amount: number
          loan_position: string
          loan_type: string
          ltv_ratio: number
          maturity_date?: string | null
          max_investment?: number | null
          min_investment?: number
          name: string
          payment_frequency?: string | null
          personal_guarantee?: boolean | null
          property_id?: string | null
          property_value?: number | null
          start_date?: string | null
          state: string
          status?: string
          term_months: number
          updated_at?: string
        }
        Update: {
          amount_funded?: number
          apy?: number
          borrower_type?: string | null
          city?: string
          created_at?: string
          description?: string | null
          dscr?: number | null
          id?: string
          image_url?: string | null
          investor_count?: number
          loan_amount?: number
          loan_position?: string
          loan_type?: string
          ltv_ratio?: number
          maturity_date?: string | null
          max_investment?: number | null
          min_investment?: number
          name?: string
          payment_frequency?: string | null
          personal_guarantee?: boolean | null
          property_id?: string | null
          property_value?: number | null
          start_date?: string | null
          state?: string
          status?: string
          term_months?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      market_news: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          published_at: string
          source: string
          source_name: string | null
          source_url: string | null
          summary: string | null
          tags: Json | null
          title: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          published_at?: string
          source?: string
          source_name?: string | null
          source_url?: string | null
          summary?: string | null
          tags?: Json | null
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published_at?: string
          source?: string
          source_name?: string | null
          source_url?: string | null
          summary?: string | null
          tags?: Json | null
          title?: string
        }
        Relationships: []
      }
      market_price_history: {
        Row: {
          id: string
          market_id: string
          recorded_at: string
          yes_price: number
        }
        Insert: {
          id?: string
          market_id: string
          recorded_at?: string
          yes_price: number
        }
        Update: {
          id?: string
          market_id?: string
          recorded_at?: string
          yes_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "market_price_history_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      plaid_identity_verification: {
        Row: {
          created_at: string
          id: string
          plaid_idv_id: string | null
          risk_level: string | null
          status: string
          user_id: string
          verified_address: string | null
          verified_dob: string | null
          verified_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          plaid_idv_id?: string | null
          risk_level?: string | null
          status?: string
          user_id: string
          verified_address?: string | null
          verified_dob?: string | null
          verified_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          plaid_idv_id?: string | null
          risk_level?: string | null
          status?: string
          user_id?: string
          verified_address?: string | null
          verified_dob?: string | null
          verified_name?: string | null
        }
        Relationships: []
      }
      platform_announcements: {
        Row: {
          action_text: string | null
          action_url: string | null
          announcement_type: string
          banner_image: string | null
          content: string
          created_at: string
          expires_at: string | null
          id: string
          is_dismissible: boolean
          priority: string
          starts_at: string
          target_audience: string
          title: string
        }
        Insert: {
          action_text?: string | null
          action_url?: string | null
          announcement_type?: string
          banner_image?: string | null
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_dismissible?: boolean
          priority?: string
          starts_at?: string
          target_audience?: string
          title: string
        }
        Update: {
          action_text?: string | null
          action_url?: string | null
          announcement_type?: string
          banner_image?: string | null
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_dismissible?: boolean
          priority?: string
          starts_at?: string
          target_audience?: string
          title?: string
        }
        Relationships: []
      }
      portfolio_snapshots: {
        Row: {
          cash_balance: number
          created_at: string
          debt_value: number
          equity_value: number
          id: string
          prediction_value: number
          snapshot_date: string
          total_value: number
          user_id: string
        }
        Insert: {
          cash_balance?: number
          created_at?: string
          debt_value?: number
          equity_value?: number
          id?: string
          prediction_value?: number
          snapshot_date?: string
          total_value?: number
          user_id: string
        }
        Update: {
          cash_balance?: number
          created_at?: string
          debt_value?: number
          equity_value?: number
          id?: string
          prediction_value?: number
          snapshot_date?: string
          total_value?: number
          user_id?: string
        }
        Relationships: []
      }
      prediction_markets: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_resolved: boolean | null
          no_price: number
          property_id: string | null
          question: string
          resolution: string | null
          status: string | null
          title: string | null
          traders_count: number
          updated_at: string
          volume: number
          yes_price: number
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_resolved?: boolean | null
          no_price?: number
          property_id?: string | null
          question: string
          resolution?: string | null
          status?: string | null
          title?: string | null
          traders_count?: number
          updated_at?: string
          volume?: number
          yes_price?: number
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_resolved?: boolean | null
          no_price?: number
          property_id?: string | null
          question?: string
          resolution?: string | null
          status?: string | null
          title?: string | null
          traders_count?: number
          updated_at?: string
          volume?: number
          yes_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "prediction_markets_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_active: boolean
          is_recurring: boolean
          item_id: string
          item_type: string
          last_triggered_at: string | null
          threshold_value: number
          trigger_count: number
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          item_id: string
          item_type: string
          last_triggered_at?: string | null
          threshold_value: number
          trigger_count?: number
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          item_id?: string
          item_type?: string
          last_triggered_at?: string | null
          threshold_value?: number
          trigger_count?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allow_mentions: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          documents_signed: number | null
          email: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          is_admin: boolean
          is_verified_investor: boolean | null
          kyc_status: string | null
          kyc_submitted_at: string | null
          kyc_verified_at: string | null
          last_document_signed_at: string | null
          location: string | null
          name: string | null
          prediction_win_rate: number | null
          preferred_currency: string | null
          preferred_date_format: string | null
          preferred_language: string | null
          preferred_number_format: string | null
          profile_visibility: string | null
          qualified_referrals: number | null
          referral_code: string | null
          referral_commission_earned: number | null
          referral_earnings: number | null
          referral_tier: string | null
          referral_tier_level: number | null
          referred_by: string | null
          show_investments: boolean | null
          show_on_leaderboard: boolean | null
          show_predictions: boolean | null
          total_invested: number | null
          total_referrals: number | null
          twitter_handle: string | null
          two_factor_backup_codes: string[] | null
          two_factor_enabled: boolean | null
          two_factor_enabled_at: string | null
          two_factor_method: string | null
          two_factor_phone: string | null
          two_factor_secret: string | null
          updated_at: string
          user_id: string
          wallet_balance: number | null
          website_url: string | null
        }
        Insert: {
          allow_mentions?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          documents_signed?: number | null
          email?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_admin?: boolean
          is_verified_investor?: boolean | null
          kyc_status?: string | null
          kyc_submitted_at?: string | null
          kyc_verified_at?: string | null
          last_document_signed_at?: string | null
          location?: string | null
          name?: string | null
          prediction_win_rate?: number | null
          preferred_currency?: string | null
          preferred_date_format?: string | null
          preferred_language?: string | null
          preferred_number_format?: string | null
          profile_visibility?: string | null
          qualified_referrals?: number | null
          referral_code?: string | null
          referral_commission_earned?: number | null
          referral_earnings?: number | null
          referral_tier?: string | null
          referral_tier_level?: number | null
          referred_by?: string | null
          show_investments?: boolean | null
          show_on_leaderboard?: boolean | null
          show_predictions?: boolean | null
          total_invested?: number | null
          total_referrals?: number | null
          twitter_handle?: string | null
          two_factor_backup_codes?: string[] | null
          two_factor_enabled?: boolean | null
          two_factor_enabled_at?: string | null
          two_factor_method?: string | null
          two_factor_phone?: string | null
          two_factor_secret?: string | null
          updated_at?: string
          user_id: string
          wallet_balance?: number | null
          website_url?: string | null
        }
        Update: {
          allow_mentions?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          documents_signed?: number | null
          email?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_admin?: boolean
          is_verified_investor?: boolean | null
          kyc_status?: string | null
          kyc_submitted_at?: string | null
          kyc_verified_at?: string | null
          last_document_signed_at?: string | null
          location?: string | null
          name?: string | null
          prediction_win_rate?: number | null
          preferred_currency?: string | null
          preferred_date_format?: string | null
          preferred_language?: string | null
          preferred_number_format?: string | null
          profile_visibility?: string | null
          qualified_referrals?: number | null
          referral_code?: string | null
          referral_commission_earned?: number | null
          referral_earnings?: number | null
          referral_tier?: string | null
          referral_tier_level?: number | null
          referred_by?: string | null
          show_investments?: boolean | null
          show_on_leaderboard?: boolean | null
          show_predictions?: boolean | null
          total_invested?: number | null
          total_referrals?: number | null
          twitter_handle?: string | null
          two_factor_backup_codes?: string[] | null
          two_factor_enabled?: boolean | null
          two_factor_enabled_at?: string | null
          two_factor_method?: string | null
          two_factor_phone?: string | null
          two_factor_secret?: string | null
          updated_at?: string
          user_id?: string
          wallet_balance?: number | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          apy: number
          category: string
          city: string
          created_at: string
          description: string | null
          holders: number
          id: string
          image_url: string | null
          is_hot: boolean | null
          name: string
          occupancy: number
          state: string
          token_price: number
          total_tokens: number
          units: number
          updated_at: string
          value: number
          year_built: number | null
        }
        Insert: {
          address: string
          apy?: number
          category?: string
          city: string
          created_at?: string
          description?: string | null
          holders?: number
          id?: string
          image_url?: string | null
          is_hot?: boolean | null
          name: string
          occupancy?: number
          state: string
          token_price?: number
          total_tokens?: number
          units?: number
          updated_at?: string
          value?: number
          year_built?: number | null
        }
        Update: {
          address?: string
          apy?: number
          category?: string
          city?: string
          created_at?: string
          description?: string | null
          holders?: number
          id?: string
          image_url?: string | null
          is_hot?: boolean | null
          name?: string
          occupancy?: number
          state?: string
          token_price?: number
          total_tokens?: number
          units?: number
          updated_at?: string
          value?: number
          year_built?: number | null
        }
        Relationships: []
      }
      property_updates: {
        Row: {
          content: string
          created_at: string
          created_by: string
          documents: Json | null
          id: string
          images: Json | null
          is_major: boolean
          item_id: string
          item_type: string
          published_at: string
          summary: string | null
          title: string
          update_type: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          documents?: Json | null
          id?: string
          images?: Json | null
          is_major?: boolean
          item_id: string
          item_type?: string
          published_at?: string
          summary?: string | null
          title: string
          update_type?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          documents?: Json | null
          id?: string
          images?: Json | null
          is_major?: boolean
          item_id?: string
          item_type?: string
          published_at?: string
          summary?: string | null
          title?: string
          update_type?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      recent_searches: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          query: string
          search_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          query: string
          search_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          query?: string
          search_type?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_contests: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          name: string
          prize_pool: number
          prizes: Json | null
          rules: Json | null
          start_date: string
          status: string
          winner_ids: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          name: string
          prize_pool?: number
          prizes?: Json | null
          rules?: Json | null
          start_date: string
          status?: string
          winner_ids?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          prize_pool?: number
          prizes?: Json | null
          rules?: Json | null
          start_date?: string
          status?: string
          winner_ids?: Json | null
        }
        Relationships: []
      }
      referral_leaderboard: {
        Row: {
          commission_earned: number
          created_at: string
          id: string
          period: string
          period_end: string
          period_start: string
          rank: number | null
          referral_count: number
          total_invested_by_referrals: number
          updated_at: string
          user_id: string
        }
        Insert: {
          commission_earned?: number
          created_at?: string
          id?: string
          period?: string
          period_end: string
          period_start: string
          rank?: number | null
          referral_count?: number
          total_invested_by_referrals?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          commission_earned?: number
          created_at?: string
          id?: string
          period?: string
          period_end?: string
          period_start?: string
          rank?: number | null
          referral_count?: number
          total_invested_by_referrals?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_milestones: {
        Row: {
          achieved_at: string | null
          claimed_at: string | null
          created_at: string
          id: string
          milestone_name: string
          milestone_type: string
          milestone_value: number
          reward_description: string | null
          reward_type: string
          reward_value: number
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          claimed_at?: string | null
          created_at?: string
          id?: string
          milestone_name: string
          milestone_type: string
          milestone_value: number
          reward_description?: string | null
          reward_type: string
          reward_value?: number
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          claimed_at?: string | null
          created_at?: string
          id?: string
          milestone_name?: string
          milestone_type?: string
          milestone_value?: number
          reward_description?: string | null
          reward_type?: string
          reward_value?: number
          user_id?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          amount: number
          created_at: string
          credited_at: string | null
          id: string
          referral_id: string
          reward_type: string
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          credited_at?: string | null
          id?: string
          referral_id: string
          reward_type: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credited_at?: string | null
          id?: string
          referral_id?: string
          reward_type?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_tiers: {
        Row: {
          badge_color: string
          badge_icon: string
          bonus_per_referral: number
          commission_rate: number
          created_at: string
          id: string
          min_referrals: number
          perks: Json | null
          tier_level: number
          tier_name: string
        }
        Insert: {
          badge_color: string
          badge_icon: string
          bonus_per_referral?: number
          commission_rate?: number
          created_at?: string
          id?: string
          min_referrals?: number
          perks?: Json | null
          tier_level: number
          tier_name: string
        }
        Update: {
          badge_color?: string
          badge_icon?: string
          bonus_per_referral?: number
          commission_rate?: number
          created_at?: string
          id?: string
          min_referrals?: number
          perks?: Json | null
          tier_level?: number
          tier_name?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_earned: number | null
          commission_rate_applied: number | null
          created_at: string
          id: string
          qualified_at: string | null
          referred_email: string
          referred_user_id: string | null
          referrer_id: string
          reward_paid: boolean | null
          status: string
          tier_at_referral: string | null
          total_invested: number | null
          updated_at: string
        }
        Insert: {
          bonus_earned?: number | null
          commission_rate_applied?: number | null
          created_at?: string
          id?: string
          qualified_at?: string | null
          referred_email: string
          referred_user_id?: string | null
          referrer_id: string
          reward_paid?: boolean | null
          status?: string
          tier_at_referral?: string | null
          total_invested?: number | null
          updated_at?: string
        }
        Update: {
          bonus_earned?: number | null
          commission_rate_applied?: number | null
          created_at?: string
          id?: string
          qualified_at?: string | null
          referred_email?: string
          referred_user_id?: string | null
          referrer_id?: string
          reward_paid?: boolean | null
          status?: string
          tier_at_referral?: string | null
          total_invested?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      relationship_managers: {
        Row: {
          assigned_accounts: Json | null
          calendar_link: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          photo_url: string | null
        }
        Insert: {
          assigned_accounts?: Json | null
          calendar_link?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          photo_url?: string | null
        }
        Update: {
          assigned_accounts?: Json | null
          calendar_link?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
        }
        Relationships: []
      }
      report_exports: {
        Row: {
          created_at: string
          expires_at: string | null
          file_format: string
          file_size: number | null
          file_url: string | null
          id: string
          parameters: Json | null
          report_type: string
          saved_report_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          file_format: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          parameters?: Json | null
          report_type: string
          saved_report_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          file_format?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          parameters?: Json | null
          report_type?: string
          saved_report_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_exports_saved_report_id_fkey"
            columns: ["saved_report_id"]
            isOneToOne: false
            referencedRelation: "saved_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          entity_id: string
          entity_type: string
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          entity_id: string
          entity_type: string
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      saved_calculations: {
        Row: {
          calculator_type: string
          created_at: string
          id: string
          inputs: Json
          loan_id: string | null
          name: string
          property_id: string | null
          results: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          calculator_type: string
          created_at?: string
          id?: string
          inputs?: Json
          loan_id?: string | null
          name: string
          property_id?: string | null
          results?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          calculator_type?: string
          created_at?: string
          id?: string
          inputs?: Json
          loan_id?: string | null
          name?: string
          property_id?: string | null
          results?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_calculations_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_calculations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_reports: {
        Row: {
          columns: Json | null
          created_at: string
          description: string | null
          filters: Json | null
          format: string
          id: string
          last_generated_at: string | null
          name: string
          report_type: string
          schedule: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          columns?: Json | null
          created_at?: string
          description?: string | null
          filters?: Json | null
          format?: string
          id?: string
          last_generated_at?: string | null
          name: string
          report_type: string
          schedule?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          columns?: Json | null
          created_at?: string
          description?: string | null
          filters?: Json | null
          format?: string
          id?: string
          last_generated_at?: string | null
          name?: string
          report_type?: string
          schedule?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          last_run_at: string | null
          name: string
          notify_new_matches: boolean | null
          results_count: number | null
          search_type: string
          sort_by: string | null
          sort_order: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          last_run_at?: string | null
          name: string
          notify_new_matches?: boolean | null
          results_count?: number | null
          search_type?: string
          sort_by?: string | null
          sort_order?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          last_run_at?: string | null
          name?: string
          notify_new_matches?: boolean | null
          results_count?: number | null
          search_type?: string
          sort_by?: string | null
          sort_order?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_reports: {
        Row: {
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          email_delivery: boolean
          frequency: string
          id: string
          is_active: boolean
          last_sent_at: string | null
          next_send_at: string
          saved_report_id: string
          time_of_day: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          email_delivery?: boolean
          frequency: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          next_send_at: string
          saved_report_id: string
          time_of_day?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          email_delivery?: boolean
          frequency?: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          next_send_at?: string
          saved_report_id?: string
          time_of_day?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reports_saved_report_id_fkey"
            columns: ["saved_report_id"]
            isOneToOne: false
            referencedRelation: "saved_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      search_analytics: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          query: string | null
          results_count: number | null
          search_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          query?: string | null
          results_count?: number | null
          search_type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          query?: string | null
          results_count?: number | null
          search_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      supported_languages: {
        Row: {
          code: string
          completion_percentage: number | null
          created_at: string
          direction: string
          flag_emoji: string
          is_active: boolean | null
          name: string
          native_name: string
        }
        Insert: {
          code: string
          completion_percentage?: number | null
          created_at?: string
          direction?: string
          flag_emoji: string
          is_active?: boolean | null
          name: string
          native_name: string
        }
        Update: {
          code?: string
          completion_percentage?: number | null
          created_at?: string
          direction?: string
          flag_emoji?: string
          is_active?: boolean | null
          name?: string
          native_name?: string
        }
        Relationships: []
      }
      tax_documents: {
        Row: {
          created_at: string
          data: Json | null
          document_type: string
          file_url: string | null
          generated_at: string | null
          id: string
          status: string
          tax_year: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          document_type: string
          file_url?: string | null
          generated_at?: string | null
          id?: string
          status?: string
          tax_year: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          document_type?: string
          file_url?: string | null
          generated_at?: string | null
          id?: string
          status?: string
          tax_year?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_settings: {
        Row: {
          cost_basis_method: string
          created_at: string
          electronic_delivery: boolean
          email_notifications: boolean
          filing_status: string | null
          id: string
          mail_paper_copies: boolean
          state: string | null
          tax_id_encrypted: string | null
          tax_id_last_four: string | null
          tax_id_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cost_basis_method?: string
          created_at?: string
          electronic_delivery?: boolean
          email_notifications?: boolean
          filing_status?: string | null
          id?: string
          mail_paper_copies?: boolean
          state?: string | null
          tax_id_encrypted?: string | null
          tax_id_last_four?: string | null
          tax_id_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cost_basis_method?: string
          created_at?: string
          electronic_delivery?: boolean
          email_notifications?: boolean
          filing_status?: string | null
          id?: string
          mail_paper_copies?: boolean
          state?: string | null
          tax_id_encrypted?: string | null
          tax_id_last_four?: string | null
          tax_id_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      taxable_events: {
        Row: {
          cost_basis: number | null
          created_at: string
          description: string
          event_date: string
          event_type: string
          fees: number
          gain_loss: number | null
          gross_amount: number
          holding_period: string | null
          id: string
          item_id: string
          item_name: string
          item_type: string
          net_amount: number
          tax_year: number
          user_id: string
        }
        Insert: {
          cost_basis?: number | null
          created_at?: string
          description: string
          event_date: string
          event_type: string
          fees?: number
          gain_loss?: number | null
          gross_amount: number
          holding_period?: string | null
          id?: string
          item_id: string
          item_name: string
          item_type: string
          net_amount: number
          tax_year: number
          user_id: string
        }
        Update: {
          cost_basis?: number | null
          created_at?: string
          description?: string
          event_date?: string
          event_type?: string
          fees?: number
          gain_loss?: number | null
          gross_amount?: number
          holding_period?: string | null
          id?: string
          item_id?: string
          item_name?: string
          item_type?: string
          net_amount?: number
          tax_year?: number
          user_id?: string
        }
        Relationships: []
      }
      token_price_history: {
        Row: {
          created_at: string
          high: number | null
          id: string
          item_id: string
          item_type: string
          low: number | null
          period: string
          period_start: string
          price: number
          trade_count: number
          volume: number
        }
        Insert: {
          created_at?: string
          high?: number | null
          id?: string
          item_id: string
          item_type: string
          low?: number | null
          period: string
          period_start: string
          price: number
          trade_count?: number
          volume?: number
        }
        Update: {
          created_at?: string
          high?: number | null
          id?: string
          item_id?: string
          item_type?: string
          low?: number | null
          period?: string
          period_start?: string
          price?: number
          trade_count?: number
          volume?: number
        }
        Relationships: []
      }
      trades: {
        Row: {
          buy_order_id: string | null
          buyer_id: string
          created_at: string
          executed_at: string | null
          id: string
          item_id: string
          item_type: string
          listing_id: string | null
          platform_fee: number
          price_per_token: number
          seller_id: string
          seller_receives: number
          status: string
          token_quantity: number
          total_price: number
        }
        Insert: {
          buy_order_id?: string | null
          buyer_id: string
          created_at?: string
          executed_at?: string | null
          id?: string
          item_id: string
          item_type: string
          listing_id?: string | null
          platform_fee?: number
          price_per_token: number
          seller_id: string
          seller_receives: number
          status?: string
          token_quantity: number
          total_price: number
        }
        Update: {
          buy_order_id?: string | null
          buyer_id?: string
          created_at?: string
          executed_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          listing_id?: string | null
          platform_fee?: number
          price_per_token?: number
          seller_id?: string
          seller_receives?: number
          status?: string
          token_quantity?: number
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "trades_buy_order_id_fkey"
            columns: ["buy_order_id"]
            isOneToOne: false
            referencedRelation: "buy_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          market_id: string | null
          property_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          market_id?: string | null
          property_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          market_id?: string | null
          property_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          amount: number
          completed_at: string | null
          confirmation_number: string | null
          created_at: string
          currency: string | null
          failure_reason: string | null
          id: string
          initiated_at: string
          linked_account_id: string | null
          plaid_transfer_id: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          confirmation_number?: string | null
          created_at?: string
          currency?: string | null
          failure_reason?: string | null
          id?: string
          initiated_at?: string
          linked_account_id?: string | null
          plaid_transfer_id?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          confirmation_number?: string | null
          created_at?: string
          currency?: string | null
          failure_reason?: string | null
          id?: string
          initiated_at?: string
          linked_account_id?: string | null
          plaid_transfer_id?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "linked_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          context: string | null
          created_at: string
          id: string
          key: string
          language: string
          updated_at: string
          value: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          key: string
          language: string
          updated_at?: string
          value: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          key?: string
          language?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "translations_language_fkey"
            columns: ["language"]
            isOneToOne: false
            referencedRelation: "supported_languages"
            referencedColumns: ["code"]
          },
        ]
      }
      trusted_devices: {
        Row: {
          created_at: string
          device_hash: string
          device_name: string | null
          id: string
          last_used_at: string
          trusted_until: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_hash: string
          device_name?: string | null
          id?: string
          last_used_at?: string
          trusted_until?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_hash?: string
          device_name?: string | null
          id?: string
          last_used_at?: string
          trusted_until?: string
          user_id?: string
        }
        Relationships: []
      }
      two_factor_attempts: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          method: string
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          method: string
          success?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          method?: string
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      update_reads: {
        Row: {
          created_at: string
          id: string
          read_at: string
          update_id: string
          update_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          read_at?: string
          update_id: string
          update_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          read_at?: string
          update_id?: string
          update_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_type: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_type: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_bets: {
        Row: {
          amount: number
          created_at: string
          entry_price: number
          id: string
          is_settled: boolean | null
          market_id: string
          payout: number | null
          position: string
          shares: number
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          entry_price: number
          id?: string
          is_settled?: boolean | null
          market_id: string
          payout?: number | null
          position: string
          shares: number
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          entry_price?: number
          id?: string
          is_settled?: boolean | null
          market_id?: string
          payout?: number | null
          position?: string
          shares?: number
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bets_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feed_preferences: {
        Row: {
          categories_filter: Json | null
          created_at: string
          email_digest: string
          id: string
          properties_filter: Json | null
          show_announcements: boolean
          show_market_news: boolean
          show_property_updates: boolean
          show_social_activity: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          categories_filter?: Json | null
          created_at?: string
          email_digest?: string
          id?: string
          properties_filter?: Json | null
          show_announcements?: boolean
          show_market_news?: boolean
          show_property_updates?: boolean
          show_social_activity?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          categories_filter?: Json | null
          created_at?: string
          email_digest?: string
          id?: string
          properties_filter?: Json | null
          show_announcements?: boolean
          show_market_news?: boolean
          show_property_updates?: boolean
          show_social_activity?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_holdings: {
        Row: {
          average_buy_price: number
          created_at: string
          id: string
          property_id: string
          tokens: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_buy_price?: number
          created_at?: string
          id?: string
          property_id: string
          tokens?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_buy_price?: number
          created_at?: string
          id?: string
          property_id?: string
          tokens?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_holdings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_loan_investments: {
        Row: {
          created_at: string
          expected_monthly_payment: number
          id: string
          investment_date: string
          loan_id: string
          next_payment_date: string | null
          principal_invested: number
          status: string
          total_interest_earned: number
          total_principal_returned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expected_monthly_payment: number
          id?: string
          investment_date?: string
          loan_id: string
          next_payment_date?: string | null
          principal_invested: number
          status?: string
          total_interest_earned?: number
          total_principal_returned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expected_monthly_payment?: number
          id?: string
          investment_date?: string
          loan_id?: string
          next_payment_date?: string | null
          principal_invested?: number
          status?: string
          total_interest_earned?: number
          total_principal_returned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_loan_investments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_performance: {
        Row: {
          created_at: string
          deposits: number
          dividends_earned: number
          ending_value: number
          id: string
          interest_earned: number
          period: string
          period_start: string
          prediction_pnl: number
          return_percentage: number
          starting_value: number
          total_return: number
          user_id: string
          withdrawals: number
        }
        Insert: {
          created_at?: string
          deposits?: number
          dividends_earned?: number
          ending_value?: number
          id?: string
          interest_earned?: number
          period: string
          period_start: string
          prediction_pnl?: number
          return_percentage?: number
          starting_value?: number
          total_return?: number
          user_id: string
          withdrawals?: number
        }
        Update: {
          created_at?: string
          deposits?: number
          dividends_earned?: number
          ending_value?: number
          id?: string
          interest_earned?: number
          period?: string
          period_start?: string
          prediction_pnl?: number
          return_percentage?: number
          starting_value?: number
          total_return?: number
          user_id?: string
          withdrawals?: number
        }
        Relationships: []
      }
      user_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_hidden: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          prediction_id: string | null
          property_id: string | null
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          prediction_id?: string | null
          property_id?: string | null
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          prediction_id?: string | null
          property_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_rate_limits: {
        Row: {
          last_trade_at: string | null
          trades_last_minute: number | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          last_trade_at?: string | null
          trades_last_minute?: number | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          last_trade_at?: string | null
          trades_last_minute?: number | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      user_signatures: {
        Row: {
          created_at: string
          font_style: string | null
          id: string
          is_default: boolean | null
          signature_data: string
          signature_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          font_style?: string | null
          id?: string
          is_default?: boolean | null
          signature_data: string
          signature_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          font_style?: string | null
          id?: string
          is_default?: boolean | null
          signature_data?: string
          signature_type?: string
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          asset_class: string
          created_at: string
          email: string
          id: string
          notified: boolean
          referral_code: string | null
          referred_by: string | null
          user_id: string | null
        }
        Insert: {
          asset_class: string
          created_at?: string
          email: string
          id?: string
          notified?: boolean
          referral_code?: string | null
          referred_by?: string | null
          user_id?: string | null
        }
        Update: {
          asset_class?: string
          created_at?: string
          email?: string
          id?: string
          notified?: boolean
          referral_code?: string | null
          referred_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      watchlist_items: {
        Row: {
          added_price: number
          created_at: string
          id: string
          item_id: string
          item_type: string
          notes: string | null
          position: number
          target_price: number | null
          user_id: string
          watchlist_id: string
        }
        Insert: {
          added_price: number
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          notes?: string | null
          position?: number
          target_price?: number | null
          user_id: string
          watchlist_id: string
        }
        Update: {
          added_price?: number
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          notes?: string | null
          position?: number
          target_price?: number | null
          user_id?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_items_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          item_count: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          item_count?: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          item_count?: number
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          attempts: number
          created_at: string
          delivered_at: string | null
          event_type: string
          id: string
          next_retry_at: string | null
          payload: Json
          response_body: string | null
          status: string
          status_code: number | null
          webhook_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          delivered_at?: string | null
          event_type: string
          id?: string
          next_retry_at?: string | null
          payload?: Json
          response_body?: string | null
          status?: string
          status_code?: number | null
          webhook_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          delivered_at?: string | null
          event_type?: string
          id?: string
          next_retry_at?: string | null
          payload?: Json
          response_body?: string | null
          status?: string
          status_code?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "api_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_comment: {
        Args: {
          p_content: string
          p_entity_id: string
          p_entity_type: string
          p_parent_id?: string
        }
        Returns: Json
      }
      buy_tokens: {
        Args: { p_property_id: string; p_token_price: number; p_tokens: number }
        Returns: Json
      }
      cancel_listing: { Args: { p_listing_id: string }; Returns: Json }
      check_2fa_rate_limit: { Args: { p_user_id: string }; Returns: Json }
      check_rate_limit: {
        Args: { p_max_per_minute?: number; p_user_id: string }
        Returns: Json
      }
      complete_transfer: { Args: { p_transfer_id: string }; Returns: Json }
      create_document_envelope: {
        Args: {
          p_investment_amount?: number
          p_loan_id?: string
          p_property_id?: string
          p_template_id: string
        }
        Returns: Json
      }
      create_listing: {
        Args: {
          p_expires_at?: string
          p_item_id: string
          p_item_type: string
          p_min_purchase?: number
          p_price_per_token: number
          p_quantity: number
        }
        Returns: Json
      }
      create_system_notification: {
        Args: {
          p_data?: Json
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      credit_referral_reward: {
        Args: {
          p_amount: number
          p_referral_id: string
          p_reward_type: string
          p_user_id: string
        }
        Returns: string
      }
      ensure_default_watchlist: { Args: { p_user_id: string }; Returns: string }
      execute_market_trade: {
        Args: { p_buyer_id: string; p_listing_id: string; p_quantity: number }
        Returns: Json
      }
      invest_in_loan: {
        Args: { p_amount: number; p_loan_id: string }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
      is_device_trusted: {
        Args: { p_device_hash: string; p_user_id: string }
        Returns: boolean
      }
      log_2fa_attempt: {
        Args: {
          p_ip_address?: string
          p_method: string
          p_success: boolean
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      notify_bet_result: {
        Args: {
          p_amount: number
          p_market_title: string
          p_user_id: string
          p_won: boolean
        }
        Returns: string
      }
      notify_token_transaction: {
        Args: {
          p_is_buy: boolean
          p_property_name: string
          p_tokens: number
          p_user_id: string
        }
        Returns: string
      }
      place_bet: {
        Args: {
          p_amount: number
          p_entry_price: number
          p_market_id: string
          p_position: string
        }
        Returns: Json
      }
      process_all_interest_payments: { Args: never; Returns: Json }
      process_deposit: {
        Args: { p_amount: number; p_linked_account_id: string }
        Returns: Json
      }
      process_interest_payment: {
        Args: { p_investment_id: string }
        Returns: Json
      }
      process_loan_payoff: { Args: { p_investment_id: string }; Returns: Json }
      process_withdrawal: {
        Args: { p_amount: number; p_linked_account_id: string }
        Returns: Json
      }
      sell_tokens: {
        Args: { p_property_id: string; p_token_price: number; p_tokens: number }
        Returns: Json
      }
      sign_document: {
        Args: {
          p_envelope_id: string
          p_fields?: Json
          p_signature_data: string
        }
        Returns: Json
      }
      toggle_follow: { Args: { p_following_id: string }; Returns: Json }
      toggle_like: {
        Args: { p_entity_id: string; p_entity_type: string }
        Returns: Json
      }
      trust_device: {
        Args: {
          p_device_hash: string
          p_device_name?: string
          p_user_id: string
        }
        Returns: string
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
