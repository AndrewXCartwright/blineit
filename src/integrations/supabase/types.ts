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
      profiles: {
        Row: {
          allow_mentions: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          is_admin: boolean
          is_verified_investor: boolean | null
          kyc_status: string | null
          kyc_submitted_at: string | null
          kyc_verified_at: string | null
          location: string | null
          name: string | null
          prediction_win_rate: number | null
          profile_visibility: string | null
          referral_code: string | null
          referral_earnings: number | null
          referred_by: string | null
          show_investments: boolean | null
          show_on_leaderboard: boolean | null
          show_predictions: boolean | null
          total_invested: number | null
          twitter_handle: string | null
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
          email?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_admin?: boolean
          is_verified_investor?: boolean | null
          kyc_status?: string | null
          kyc_submitted_at?: string | null
          kyc_verified_at?: string | null
          location?: string | null
          name?: string | null
          prediction_win_rate?: number | null
          profile_visibility?: string | null
          referral_code?: string | null
          referral_earnings?: number | null
          referred_by?: string | null
          show_investments?: boolean | null
          show_on_leaderboard?: boolean | null
          show_predictions?: boolean | null
          total_invested?: number | null
          twitter_handle?: string | null
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
          email?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_admin?: boolean
          is_verified_investor?: boolean | null
          kyc_status?: string | null
          kyc_submitted_at?: string | null
          kyc_verified_at?: string | null
          location?: string | null
          name?: string | null
          prediction_win_rate?: number | null
          profile_visibility?: string | null
          referral_code?: string | null
          referral_earnings?: number | null
          referred_by?: string | null
          show_investments?: boolean | null
          show_on_leaderboard?: boolean | null
          show_predictions?: boolean | null
          total_invested?: number | null
          twitter_handle?: string | null
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
      referrals: {
        Row: {
          created_at: string
          id: string
          qualified_at: string | null
          referred_email: string
          referred_user_id: string | null
          referrer_id: string
          reward_paid: boolean | null
          status: string
          total_invested: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          qualified_at?: string | null
          referred_email: string
          referred_user_id?: string | null
          referrer_id: string
          reward_paid?: boolean | null
          status?: string
          total_invested?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          qualified_at?: string | null
          referred_email?: string
          referred_user_id?: string | null
          referrer_id?: string
          reward_paid?: boolean | null
          status?: string
          total_invested?: number | null
          updated_at?: string
        }
        Relationships: []
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
      check_rate_limit: {
        Args: { p_max_per_minute?: number; p_user_id: string }
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
      invest_in_loan: {
        Args: { p_amount: number; p_loan_id: string }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
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
      process_interest_payment: {
        Args: { p_investment_id: string }
        Returns: Json
      }
      process_loan_payoff: { Args: { p_investment_id: string }; Returns: Json }
      sell_tokens: {
        Args: { p_property_id: string; p_token_price: number; p_tokens: number }
        Returns: Json
      }
      toggle_follow: { Args: { p_following_id: string }; Returns: Json }
      toggle_like: {
        Args: { p_entity_id: string; p_entity_type: string }
        Returns: Json
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
