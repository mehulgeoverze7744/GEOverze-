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
      admin_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          outcome: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          outcome?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          outcome?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          audience: string
          body: string
          channel: string
          created_at: string
          created_by: string | null
          id: string
          sent_at: string | null
          status: string
          title: string
        }
        Insert: {
          audience?: string
          body: string
          channel?: string
          created_at?: string
          created_by?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          title: string
        }
        Update: {
          audience?: string
          body?: string
          channel?: string
          created_at?: string
          created_by?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      billing_customers: {
        Row: {
          created_at: string
          email_at_creation: string | null
          id: string
          metadata: Json
          provider: string
          provider_customer_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_at_creation?: string | null
          id?: string
          metadata?: Json
          provider: string
          provider_customer_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_at_creation?: string | null
          id?: string
          metadata?: Json
          provider?: string
          provider_customer_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_invoices: {
        Row: {
          base_amount_minor: number
          billing_interval: string | null
          charge_currency: string
          created_at: string
          gst_amount_minor: number
          gst_rate_percent: number
          id: string
          invoice_number: string
          is_mock: boolean
          metadata: Json
          plan_tier: string | null
          status: string
          subscription_id: string | null
          total_amount_minor: number
          updated_at: string
          user_id: string
        }
        Insert: {
          base_amount_minor?: number
          billing_interval?: string | null
          charge_currency?: string
          created_at?: string
          gst_amount_minor?: number
          gst_rate_percent?: number
          id?: string
          invoice_number: string
          is_mock?: boolean
          metadata?: Json
          plan_tier?: string | null
          status?: string
          subscription_id?: string | null
          total_amount_minor?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          base_amount_minor?: number
          billing_interval?: string | null
          charge_currency?: string
          created_at?: string
          gst_amount_minor?: number
          gst_rate_percent?: number
          id?: string
          invoice_number?: string
          is_mock?: boolean
          metadata?: Json
          plan_tier?: string | null
          status?: string
          subscription_id?: string | null
          total_amount_minor?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_plan_tier_fkey"
            columns: ["plan_tier"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["tier"]
          },
          {
            foreignKeyName: "billing_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_payments: {
        Row: {
          attempted_at: string
          billing_period_end: string | null
          billing_period_start: string | null
          catalog_usd_amount_cents: number
          charge_amount_minor: number
          charge_currency: string
          created_at: string
          cycle_number: number | null
          failure_code: string | null
          failure_reason: string | null
          id: string
          metadata: Json
          paid_at: string | null
          plan_promotion_id: string | null
          plan_tier: string
          price_snapshot_id: string
          provider: string
          provider_invoice_id: string | null
          provider_payment_id: string
          provider_subscription_id: string
          status: string
          subscription_id: string
          user_id: string
          webhook_event_id: string
        }
        Insert: {
          attempted_at?: string
          billing_period_end?: string | null
          billing_period_start?: string | null
          catalog_usd_amount_cents: number
          charge_amount_minor: number
          charge_currency: string
          created_at?: string
          cycle_number?: number | null
          failure_code?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json
          paid_at?: string | null
          plan_promotion_id?: string | null
          plan_tier: string
          price_snapshot_id: string
          provider: string
          provider_invoice_id?: string | null
          provider_payment_id: string
          provider_subscription_id: string
          status: string
          subscription_id: string
          user_id: string
          webhook_event_id: string
        }
        Update: {
          attempted_at?: string
          billing_period_end?: string | null
          billing_period_start?: string | null
          catalog_usd_amount_cents?: number
          charge_amount_minor?: number
          charge_currency?: string
          created_at?: string
          cycle_number?: number | null
          failure_code?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json
          paid_at?: string | null
          plan_promotion_id?: string | null
          plan_tier?: string
          price_snapshot_id?: string
          provider?: string
          provider_invoice_id?: string | null
          provider_payment_id?: string
          provider_subscription_id?: string
          status?: string
          subscription_id?: string
          user_id?: string
          webhook_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_payments_plan_promotion_id_fkey"
            columns: ["plan_promotion_id"]
            isOneToOne: false
            referencedRelation: "plan_promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_payments_plan_tier_fkey"
            columns: ["plan_tier"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["tier"]
          },
          {
            foreignKeyName: "billing_payments_price_snapshot_id_fkey"
            columns: ["price_snapshot_id"]
            isOneToOne: false
            referencedRelation: "billing_price_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_payments_webhook_event_id_fkey"
            columns: ["webhook_event_id"]
            isOneToOne: false
            referencedRelation: "billing_webhook_events"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_price_snapshots: {
        Row: {
          billing_interval: string
          billing_provider_plan_instance_id: string
          billing_provider_price_id: string
          catalog_usd_amount_cents: number
          catalog_usd_currency: string
          charge_amount_minor: number
          charge_currency: string
          created_at: string
          fx_rate: number | null
          fx_rate_at: string | null
          fx_source: string | null
          fx_unrounded_amount: number | null
          id: string
          metadata: Json
          plan_promotion_id: string | null
          plan_tier: string
          previous_snapshot_id: string | null
          price_lock_policy: string
          provider_plan_id: string
          rounding_mode: string
          snapshot_reason: string
          subscription_id: string
          user_id: string
          webhook_event_id: string | null
        }
        Insert: {
          billing_interval: string
          billing_provider_plan_instance_id: string
          billing_provider_price_id: string
          catalog_usd_amount_cents: number
          catalog_usd_currency?: string
          charge_amount_minor: number
          charge_currency: string
          created_at?: string
          fx_rate?: number | null
          fx_rate_at?: string | null
          fx_source?: string | null
          fx_unrounded_amount?: number | null
          id?: string
          metadata?: Json
          plan_promotion_id?: string | null
          plan_tier: string
          previous_snapshot_id?: string | null
          price_lock_policy: string
          provider_plan_id: string
          rounding_mode: string
          snapshot_reason: string
          subscription_id: string
          user_id: string
          webhook_event_id?: string | null
        }
        Update: {
          billing_interval?: string
          billing_provider_plan_instance_id?: string
          billing_provider_price_id?: string
          catalog_usd_amount_cents?: number
          catalog_usd_currency?: string
          charge_amount_minor?: number
          charge_currency?: string
          created_at?: string
          fx_rate?: number | null
          fx_rate_at?: string | null
          fx_source?: string | null
          fx_unrounded_amount?: number | null
          id?: string
          metadata?: Json
          plan_promotion_id?: string | null
          plan_tier?: string
          previous_snapshot_id?: string | null
          price_lock_policy?: string
          provider_plan_id?: string
          rounding_mode?: string
          snapshot_reason?: string
          subscription_id?: string
          user_id?: string
          webhook_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_price_snapshots_billing_provider_plan_instance_id_fkey"
            columns: ["billing_provider_plan_instance_id"]
            isOneToOne: false
            referencedRelation: "billing_provider_plan_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_price_snapshots_billing_provider_price_id_fkey"
            columns: ["billing_provider_price_id"]
            isOneToOne: false
            referencedRelation: "billing_provider_prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_price_snapshots_plan_promotion_id_fkey"
            columns: ["plan_promotion_id"]
            isOneToOne: false
            referencedRelation: "plan_promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_price_snapshots_plan_tier_fkey"
            columns: ["plan_tier"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["tier"]
          },
          {
            foreignKeyName: "billing_price_snapshots_previous_snapshot_id_fkey"
            columns: ["previous_snapshot_id"]
            isOneToOne: false
            referencedRelation: "billing_price_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_price_snapshots_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_price_snapshots_webhook_event_id_fkey"
            columns: ["webhook_event_id"]
            isOneToOne: false
            referencedRelation: "billing_webhook_events"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_provider_plan_instances: {
        Row: {
          billing_interval: string
          billing_provider_price_id: string
          catalog_usd_amount_cents: number
          charge_amount_minor: number
          charge_currency: string
          created_at: string
          id: string
          metadata: Json
          plan_promotion_id: string | null
          provider: string
          provider_plan_id: string
        }
        Insert: {
          billing_interval: string
          billing_provider_price_id: string
          catalog_usd_amount_cents: number
          charge_amount_minor: number
          charge_currency: string
          created_at?: string
          id?: string
          metadata?: Json
          plan_promotion_id?: string | null
          provider: string
          provider_plan_id: string
        }
        Update: {
          billing_interval?: string
          billing_provider_price_id?: string
          catalog_usd_amount_cents?: number
          charge_amount_minor?: number
          charge_currency?: string
          created_at?: string
          id?: string
          metadata?: Json
          plan_promotion_id?: string | null
          provider?: string
          provider_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_provider_plan_instances_billing_provider_price_id_fkey"
            columns: ["billing_provider_price_id"]
            isOneToOne: false
            referencedRelation: "billing_provider_prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_provider_plan_instances_plan_promotion_id_fkey"
            columns: ["plan_promotion_id"]
            isOneToOne: false
            referencedRelation: "plan_promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_provider_prices: {
        Row: {
          active: boolean
          billing_interval: string
          created_at: string
          currency: string
          id: string
          metadata: Json
          plan_promotion_id: string | null
          plan_tier: string
          price_lock_policy: string
          pricing_mode: string
          provider: string
          rounding_mode: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          billing_interval: string
          created_at?: string
          currency: string
          id?: string
          metadata?: Json
          plan_promotion_id?: string | null
          plan_tier: string
          price_lock_policy?: string
          pricing_mode: string
          provider: string
          rounding_mode?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          billing_interval?: string
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          plan_promotion_id?: string | null
          plan_tier?: string
          price_lock_policy?: string
          pricing_mode?: string
          provider?: string
          rounding_mode?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_provider_prices_plan_promotion_id_fkey"
            columns: ["plan_promotion_id"]
            isOneToOne: false
            referencedRelation: "plan_promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_provider_prices_plan_tier_fkey"
            columns: ["plan_tier"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["tier"]
          },
        ]
      }
      billing_webhook_events: {
        Row: {
          attempt_count: number
          event_type: string
          id: string
          metadata: Json
          normalized_event_type: string | null
          payload: Json
          payload_sha256: string
          processed_at: string | null
          processing_error: string | null
          processing_status: string
          provider: string
          provider_customer_id: string | null
          provider_event_created_at: string | null
          provider_event_id: string
          provider_payment_id: string | null
          provider_subscription_id: string | null
          received_at: string
          subscription_id: string | null
        }
        Insert: {
          attempt_count?: number
          event_type: string
          id?: string
          metadata?: Json
          normalized_event_type?: string | null
          payload: Json
          payload_sha256: string
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string
          provider: string
          provider_customer_id?: string | null
          provider_event_created_at?: string | null
          provider_event_id: string
          provider_payment_id?: string | null
          provider_subscription_id?: string | null
          received_at?: string
          subscription_id?: string | null
        }
        Update: {
          attempt_count?: number
          event_type?: string
          id?: string
          metadata?: Json
          normalized_event_type?: string | null
          payload?: Json
          payload_sha256?: string
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string
          provider?: string
          provider_customer_id?: string | null
          provider_event_created_at?: string | null
          provider_event_id?: string
          provider_payment_id?: string | null
          provider_subscription_id?: string | null
          received_at?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_webhook_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          assigned_to: string | null
          created_at: string
          details: string
          id: string
          reason: string
          reporter_id: string | null
          resolution_note: string
          severity: string
          status: string
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          details?: string
          id?: string
          reason: string
          reporter_id?: string | null
          resolution_note?: string
          severity?: string
          status?: string
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          details?: string
          id?: string
          reason?: string
          reporter_id?: string | null
          resolution_note?: string
          severity?: string
          status?: string
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_ledger_entries: {
        Row: {
          amount: number
          created_at: string
          entry_type: string
          expires_at: string | null
          id: string
          idempotency_key: string
          metadata: Json
          month_key: string | null
          plan_tier_at_earn: string | null
          reference_id: string | null
          reference_type: string | null
          remaining_amount: number | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          entry_type: string
          expires_at?: string | null
          id?: string
          idempotency_key: string
          metadata?: Json
          month_key?: string | null
          plan_tier_at_earn?: string | null
          reference_id?: string | null
          reference_type?: string | null
          remaining_amount?: number | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          entry_type?: string
          expires_at?: string | null
          id?: string
          idempotency_key?: string
          metadata?: Json
          month_key?: string | null
          plan_tier_at_earn?: string | null
          reference_id?: string | null
          reference_type?: string | null
          remaining_amount?: number | null
          user_id?: string
        }
        Relationships: []
      }
      credit_plan_rollover_config: {
        Row: {
          plan_tier: string
          rollover_months: number
        }
        Insert: {
          plan_tier: string
          rollover_months: number
        }
        Update: {
          plan_tier?: string
          rollover_months?: number
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          month_key: string
          opponent_user_id: string | null
          room_id: string
          user_id: string
          win_tier: number
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          month_key: string
          opponent_user_id?: string | null
          room_id: string
          user_id: string
          win_tier: number
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          month_key?: string
          opponent_user_id?: string | null
          room_id?: string
          user_id?: string
          win_tier?: number
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "pvp_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      draw_events: {
        Row: {
          body: string | null
          created_at: string
          id: number
          payload: Json | null
          room_id: string
          turn_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: never
          payload?: Json | null
          room_id: string
          turn_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: never
          payload?: Json | null
          room_id?: string
          turn_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "draw_events_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "draw_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_events_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: false
            referencedRelation: "draw_turns"
            referencedColumns: ["id"]
          },
        ]
      }
      draw_participants: {
        Row: {
          correct_count: number
          id: string
          is_ready: boolean
          joined_at: string
          last_seen_at: string
          left_game: boolean
          ready_at: string | null
          room_id: string
          total_score: number
          turns_drawn: number
          user_id: string
        }
        Insert: {
          correct_count?: number
          id?: string
          is_ready?: boolean
          joined_at?: string
          last_seen_at?: string
          left_game?: boolean
          ready_at?: string | null
          room_id: string
          total_score?: number
          turns_drawn?: number
          user_id: string
        }
        Update: {
          correct_count?: number
          id?: string
          is_ready?: boolean
          joined_at?: string
          last_seen_at?: string
          left_game?: boolean
          ready_at?: string | null
          room_id?: string
          total_score?: number
          turns_drawn?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draw_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "draw_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      draw_rooms: {
        Row: {
          categories: Database["public"]["Enums"]["draw_word_category"][]
          completed_at: string | null
          created_at: string
          current_round: number
          current_turn_index: number
          difficulty: Database["public"]["Enums"]["draw_difficulty"]
          host_user_id: string
          id: string
          max_players: number
          room_code: string
          rounds: number
          started_at: string | null
          status: Database["public"]["Enums"]["draw_room_status"]
          turn_order: string[]
          turn_seconds: number
          used_word_ids: string[]
        }
        Insert: {
          categories?: Database["public"]["Enums"]["draw_word_category"][]
          completed_at?: string | null
          created_at?: string
          current_round?: number
          current_turn_index?: number
          difficulty?: Database["public"]["Enums"]["draw_difficulty"]
          host_user_id: string
          id?: string
          max_players: number
          room_code: string
          rounds: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["draw_room_status"]
          turn_order?: string[]
          turn_seconds?: number
          used_word_ids?: string[]
        }
        Update: {
          categories?: Database["public"]["Enums"]["draw_word_category"][]
          completed_at?: string | null
          created_at?: string
          current_round?: number
          current_turn_index?: number
          difficulty?: Database["public"]["Enums"]["draw_difficulty"]
          host_user_id?: string
          id?: string
          max_players?: number
          room_code?: string
          rounds?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["draw_room_status"]
          turn_order?: string[]
          turn_seconds?: number
          used_word_ids?: string[]
        }
        Relationships: []
      }
      draw_strokes: {
        Row: {
          color: string | null
          created_at: string
          id: number
          kind: string
          points: Json | null
          room_id: string
          size: number | null
          tool: string | null
          turn_id: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: never
          kind: string
          points?: Json | null
          room_id: string
          size?: number | null
          tool?: string | null
          turn_id: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: never
          kind?: string
          points?: Json | null
          room_id?: string
          size?: number | null
          tool?: string | null
          turn_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draw_strokes_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "draw_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_strokes_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: false
            referencedRelation: "draw_turns"
            referencedColumns: ["id"]
          },
        ]
      }
      draw_turn_guesses: {
        Row: {
          correct: boolean
          guessed_at: string
          id: string
          points_awarded: number
          room_id: string
          turn_id: string
          user_id: string
        }
        Insert: {
          correct?: boolean
          guessed_at?: string
          id?: string
          points_awarded?: number
          room_id: string
          turn_id: string
          user_id: string
        }
        Update: {
          correct?: boolean
          guessed_at?: string
          id?: string
          points_awarded?: number
          room_id?: string
          turn_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draw_turn_guesses_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "draw_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_turn_guesses_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: false
            referencedRelation: "draw_turns"
            referencedColumns: ["id"]
          },
        ]
      }
      draw_turns: {
        Row: {
          choose_deadline: string | null
          created_at: string
          drawer_user_id: string
          ended_at: string | null
          hint_revealed_count: number
          id: string
          room_id: string
          round_number: number
          secret_word_id: string | null
          status: string
          turn_ends_at: string | null
          turn_number: number
          turn_started_at: string | null
          word_option_ids: string[]
        }
        Insert: {
          choose_deadline?: string | null
          created_at?: string
          drawer_user_id: string
          ended_at?: string | null
          hint_revealed_count?: number
          id?: string
          room_id: string
          round_number: number
          secret_word_id?: string | null
          status?: string
          turn_ends_at?: string | null
          turn_number: number
          turn_started_at?: string | null
          word_option_ids?: string[]
        }
        Update: {
          choose_deadline?: string | null
          created_at?: string
          drawer_user_id?: string
          ended_at?: string | null
          hint_revealed_count?: number
          id?: string
          room_id?: string
          round_number?: number
          secret_word_id?: string | null
          status?: string
          turn_ends_at?: string | null
          turn_number?: number
          turn_started_at?: string | null
          word_option_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "draw_turns_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "draw_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_turns_secret_word_id_fkey"
            columns: ["secret_word_id"]
            isOneToOne: false
            referencedRelation: "draw_words"
            referencedColumns: ["id"]
          },
        ]
      }
      draw_words: {
        Row: {
          aliases: string[]
          category: Database["public"]["Enums"]["draw_word_category"]
          difficulty: Database["public"]["Enums"]["draw_difficulty"]
          id: string
          word: string
        }
        Insert: {
          aliases?: string[]
          category: Database["public"]["Enums"]["draw_word_category"]
          difficulty: Database["public"]["Enums"]["draw_difficulty"]
          id?: string
          word: string
        }
        Update: {
          aliases?: string[]
          category?: Database["public"]["Enums"]["draw_word_category"]
          difficulty?: Database["public"]["Enums"]["draw_difficulty"]
          id?: string
          word?: string
        }
        Relationships: []
      }
      gstore_order_items: {
        Row: {
          category: string
          created_at: string
          id: string
          line_total_minor: number
          options: Json
          order_id: string
          product_id: string
          product_image_snapshot: string
          product_name: string
          product_slug: string
          quantity: number
          sku: string
          unit_price_minor: number
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          line_total_minor: number
          options?: Json
          order_id: string
          product_id: string
          product_image_snapshot?: string
          product_name: string
          product_slug: string
          quantity: number
          sku?: string
          unit_price_minor: number
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          line_total_minor?: number
          options?: Json
          order_id?: string
          product_id?: string
          product_image_snapshot?: string
          product_name?: string
          product_slug?: string
          quantity?: number
          sku?: string
          unit_price_minor?: number
        }
        Relationships: [
          {
            foreignKeyName: "gstore_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "gstore_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      gstore_orders: {
        Row: {
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_notes: string
          discount_minor: number
          guest_token: string | null
          id: string
          idempotency_key: string | null
          is_mock: boolean
          order_number: string
          order_status: string
          payment_status: string
          shipping_city: string
          shipping_country: string
          shipping_line1: string
          shipping_line2: string
          shipping_method: string
          shipping_minor: number
          shipping_name: string
          shipping_pincode: string
          shipping_state: string
          subtotal_minor: number
          tax_minor: number
          total_minor: number
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          customer_phone?: string
          delivery_notes?: string
          discount_minor?: number
          guest_token?: string | null
          id?: string
          idempotency_key?: string | null
          is_mock?: boolean
          order_number: string
          order_status?: string
          payment_status?: string
          shipping_city: string
          shipping_country?: string
          shipping_line1: string
          shipping_line2?: string
          shipping_method?: string
          shipping_minor?: number
          shipping_name: string
          shipping_pincode: string
          shipping_state: string
          subtotal_minor: number
          tax_minor?: number
          total_minor: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_notes?: string
          discount_minor?: number
          guest_token?: string | null
          id?: string
          idempotency_key?: string | null
          is_mock?: boolean
          order_number?: string
          order_status?: string
          payment_status?: string
          shipping_city?: string
          shipping_country?: string
          shipping_line1?: string
          shipping_line2?: string
          shipping_method?: string
          shipping_minor?: number
          shipping_name?: string
          shipping_pincode?: string
          shipping_state?: string
          subtotal_minor?: number
          tax_minor?: number
          total_minor?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      gstore_payments: {
        Row: {
          amount_minor: number
          created_at: string
          currency: string
          id: string
          idempotency_key: string | null
          is_mock: boolean
          order_id: string
          payment_method: string | null
          provider: string
          provider_order_id: string | null
          provider_payment_id: string | null
          provider_signature: string | null
          status: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          amount_minor: number
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string | null
          is_mock?: boolean
          order_id: string
          payment_method?: string | null
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          provider_signature?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          amount_minor?: number
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string | null
          is_mock?: boolean
          order_id?: string
          payment_method?: string | null
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          provider_signature?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gstore_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "gstore_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      gstore_price_entries: {
        Row: {
          created_at: string
          created_by: string | null
          currency_code: string
          id: string
          is_active: boolean
          price_minor: number
          product_slug: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency_code: string
          id?: string
          is_active?: boolean
          price_minor: number
          product_slug: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency_code?: string
          id?: string
          is_active?: boolean
          price_minor?: number
          product_slug?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gstore_price_entries_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "payment_currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      imp_chat: {
        Row: {
          body: string
          created_at: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "imp_chat_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "imp_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      imp_clues: {
        Row: {
          clue_text: string | null
          id: string
          room_id: string
          round_number: number
          skipped: boolean
          submitted_at: string
          user_id: string
        }
        Insert: {
          clue_text?: string | null
          id?: string
          room_id: string
          round_number: number
          skipped?: boolean
          submitted_at?: string
          user_id: string
        }
        Update: {
          clue_text?: string | null
          id?: string
          room_id?: string
          round_number?: number
          skipped?: boolean
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "imp_clues_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "imp_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      imp_participants: {
        Row: {
          id: string
          is_excluded: boolean
          is_host: boolean
          is_ready: boolean
          joined_at: string
          last_seen_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_excluded?: boolean
          is_host?: boolean
          is_ready?: boolean
          joined_at?: string
          last_seen_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_excluded?: boolean
          is_host?: boolean
          is_ready?: boolean
          joined_at?: string
          last_seen_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "imp_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "imp_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      imp_roles: {
        Row: {
          id: string
          received_word: string
          role: Database["public"]["Enums"]["imp_player_role"]
          room_id: string
          user_id: string
          word_pair_id: string
        }
        Insert: {
          id?: string
          received_word: string
          role: Database["public"]["Enums"]["imp_player_role"]
          room_id: string
          user_id: string
          word_pair_id: string
        }
        Update: {
          id?: string
          received_word?: string
          role?: Database["public"]["Enums"]["imp_player_role"]
          room_id?: string
          user_id?: string
          word_pair_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "imp_roles_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "imp_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imp_roles_word_pair_id_fkey"
            columns: ["word_pair_id"]
            isOneToOne: false
            referencedRelation: "imp_word_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      imp_rooms: {
        Row: {
          category: Database["public"]["Enums"]["imp_word_category"] | null
          clue_order_1: string[]
          clue_order_2: string[]
          clue_order_3: string[]
          clue_turn_seconds: number
          completed_at: string | null
          created_at: string
          current_clue_index: number
          current_round: number
          difficulty: Database["public"]["Enums"]["imp_difficulty"]
          host_user_id: string
          id: string
          imposter_caught: boolean | null
          max_players: number
          phase: Database["public"]["Enums"]["imp_game_phase"] | null
          phase_deadline: string | null
          revealed_actual_word: string | null
          revealed_imposter_id: string | null
          revealed_imposter_word: string | null
          room_code: string
          started_at: string | null
          status: Database["public"]["Enums"]["imp_room_status"]
        }
        Insert: {
          category?: Database["public"]["Enums"]["imp_word_category"] | null
          clue_order_1?: string[]
          clue_order_2?: string[]
          clue_order_3?: string[]
          clue_turn_seconds?: number
          completed_at?: string | null
          created_at?: string
          current_clue_index?: number
          current_round?: number
          difficulty?: Database["public"]["Enums"]["imp_difficulty"]
          host_user_id: string
          id?: string
          imposter_caught?: boolean | null
          max_players: number
          phase?: Database["public"]["Enums"]["imp_game_phase"] | null
          phase_deadline?: string | null
          revealed_actual_word?: string | null
          revealed_imposter_id?: string | null
          revealed_imposter_word?: string | null
          room_code: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["imp_room_status"]
        }
        Update: {
          category?: Database["public"]["Enums"]["imp_word_category"] | null
          clue_order_1?: string[]
          clue_order_2?: string[]
          clue_order_3?: string[]
          clue_turn_seconds?: number
          completed_at?: string | null
          created_at?: string
          current_clue_index?: number
          current_round?: number
          difficulty?: Database["public"]["Enums"]["imp_difficulty"]
          host_user_id?: string
          id?: string
          imposter_caught?: boolean | null
          max_players?: number
          phase?: Database["public"]["Enums"]["imp_game_phase"] | null
          phase_deadline?: string | null
          revealed_actual_word?: string | null
          revealed_imposter_id?: string | null
          revealed_imposter_word?: string | null
          room_code?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["imp_room_status"]
        }
        Relationships: []
      }
      imp_scores: {
        Row: {
          clues_submitted: number
          escape_bonus: number
          id: string
          imposter_escaped: boolean
          points_for_vote: number
          role: Database["public"]["Enums"]["imp_player_role"] | null
          room_id: string
          total_points: number
          user_id: string
          vote_correct: boolean | null
          vote_target_id: string | null
        }
        Insert: {
          clues_submitted?: number
          escape_bonus?: number
          id?: string
          imposter_escaped?: boolean
          points_for_vote?: number
          role?: Database["public"]["Enums"]["imp_player_role"] | null
          room_id: string
          total_points?: number
          user_id: string
          vote_correct?: boolean | null
          vote_target_id?: string | null
        }
        Update: {
          clues_submitted?: number
          escape_bonus?: number
          id?: string
          imposter_escaped?: boolean
          points_for_vote?: number
          role?: Database["public"]["Enums"]["imp_player_role"] | null
          room_id?: string
          total_points?: number
          user_id?: string
          vote_correct?: boolean | null
          vote_target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imp_scores_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "imp_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      imp_votes: {
        Row: {
          created_at: string
          id: string
          room_id: string
          target_user_id: string
          voter_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          room_id: string
          target_user_id: string
          voter_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          room_id?: string
          target_user_id?: string
          voter_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "imp_votes_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "imp_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      imp_word_pairs: {
        Row: {
          actual_word: string
          category: Database["public"]["Enums"]["imp_word_category"]
          created_at: string
          difficulty: Database["public"]["Enums"]["imp_difficulty"]
          id: string
          imposter_word: string
        }
        Insert: {
          actual_word: string
          category: Database["public"]["Enums"]["imp_word_category"]
          created_at?: string
          difficulty: Database["public"]["Enums"]["imp_difficulty"]
          id?: string
          imposter_word: string
        }
        Update: {
          actual_word?: string
          category?: Database["public"]["Enums"]["imp_word_category"]
          created_at?: string
          difficulty?: Database["public"]["Enums"]["imp_difficulty"]
          id?: string
          imposter_word?: string
        }
        Relationships: []
      }
      library_collection_items: {
        Row: {
          collection_id: string
          position: number
          resource_id: string
        }
        Insert: {
          collection_id: string
          position: number
          resource_id: string
        }
        Update: {
          collection_id?: string
          position?: number
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "library_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_collection_items_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "library_catalogue_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_collection_items_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "library_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      library_collections: {
        Row: {
          art_key: string
          continent: string
          created_at: string
          curator_handle: string
          description: string
          featured: boolean
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["library_resource_status"]
          subject_category: string
          title: string
          updated_at: string
        }
        Insert: {
          art_key: string
          continent?: string
          created_at?: string
          curator_handle: string
          description: string
          featured?: boolean
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["library_resource_status"]
          subject_category: string
          title: string
          updated_at?: string
        }
        Update: {
          art_key?: string
          continent?: string
          created_at?: string
          curator_handle?: string
          description?: string
          featured?: boolean
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["library_resource_status"]
          subject_category?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_collections_curator_handle_fkey"
            columns: ["curator_handle"]
            isOneToOne: false
            referencedRelation: "library_creators"
            referencedColumns: ["handle"]
          },
        ]
      }
      library_creators: {
        Row: {
          art_key: string
          bio: string
          created_at: string
          display_name: string
          featured_collection_slug: string | null
          handle: string
          joined_at: string
          location: string | null
          role: string
          updated_at: string
          user_id: string | null
          verified: boolean
        }
        Insert: {
          art_key: string
          bio: string
          created_at?: string
          display_name: string
          featured_collection_slug?: string | null
          handle: string
          joined_at: string
          location?: string | null
          role: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          art_key?: string
          bio?: string
          created_at?: string
          display_name?: string
          featured_collection_slug?: string | null
          handle?: string
          joined_at?: string
          location?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "library_creators_featured_collection_slug_fkey"
            columns: ["featured_collection_slug"]
            isOneToOne: false
            referencedRelation: "library_collections"
            referencedColumns: ["slug"]
          },
        ]
      }
      library_resource_blocks: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["library_block_kind"]
          payload: Json
          position: number
          resource_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["library_block_kind"]
          payload: Json
          position: number
          resource_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["library_block_kind"]
          payload?: Json
          position?: number
          resource_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_resource_blocks_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "library_catalogue_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_resource_blocks_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "library_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      library_resource_stats: {
        Row: {
          bookmark_count: number
          like_count: number
          resource_id: string
          updated_at: string
          view_count: number
        }
        Insert: {
          bookmark_count?: number
          like_count?: number
          resource_id: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          bookmark_count?: number
          like_count?: number
          resource_id?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "library_resource_stats_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: true
            referencedRelation: "library_catalogue_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_resource_stats_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: true
            referencedRelation: "library_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      library_resources: {
        Row: {
          attachments: Json
          author_handle: string
          author_user_id: string | null
          continent: string
          country: string | null
          cover_art_key: string | null
          cover_label: string | null
          created_at: string
          created_by: string | null
          dek: string
          difficulty: Database["public"]["Enums"]["library_difficulty"]
          featured: boolean
          gallery_paths: string[]
          id: string
          language: string
          min_access_tier: string | null
          published_at: string | null
          read_time_minutes: number
          region: string | null
          resource_kind: Database["public"]["Enums"]["library_resource_kind"]
          search_vector: unknown
          seo_canonical_path: string | null
          seo_keywords: string[]
          seo_meta_description: string | null
          seo_meta_title: string | null
          seo_og_description: string | null
          seo_og_title: string | null
          slug: string
          status: Database["public"]["Enums"]["library_resource_status"]
          subject_category: string
          tags: string[]
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attachments?: Json
          author_handle: string
          author_user_id?: string | null
          continent?: string
          country?: string | null
          cover_art_key?: string | null
          cover_label?: string | null
          created_at?: string
          created_by?: string | null
          dek: string
          difficulty?: Database["public"]["Enums"]["library_difficulty"]
          featured?: boolean
          gallery_paths?: string[]
          id?: string
          language?: string
          min_access_tier?: string | null
          published_at?: string | null
          read_time_minutes?: number
          region?: string | null
          resource_kind?: Database["public"]["Enums"]["library_resource_kind"]
          search_vector?: unknown
          seo_canonical_path?: string | null
          seo_keywords?: string[]
          seo_meta_description?: string | null
          seo_meta_title?: string | null
          seo_og_description?: string | null
          seo_og_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["library_resource_status"]
          subject_category: string
          tags?: string[]
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attachments?: Json
          author_handle?: string
          author_user_id?: string | null
          continent?: string
          country?: string | null
          cover_art_key?: string | null
          cover_label?: string | null
          created_at?: string
          created_by?: string | null
          dek?: string
          difficulty?: Database["public"]["Enums"]["library_difficulty"]
          featured?: boolean
          gallery_paths?: string[]
          id?: string
          language?: string
          min_access_tier?: string | null
          published_at?: string | null
          read_time_minutes?: number
          region?: string | null
          resource_kind?: Database["public"]["Enums"]["library_resource_kind"]
          search_vector?: unknown
          seo_canonical_path?: string | null
          seo_keywords?: string[]
          seo_meta_description?: string | null
          seo_meta_title?: string | null
          seo_og_description?: string | null
          seo_og_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["library_resource_status"]
          subject_category?: string
          tags?: string[]
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_resources_author_handle_fkey"
            columns: ["author_handle"]
            isOneToOne: false
            referencedRelation: "library_creators"
            referencedColumns: ["handle"]
          },
          {
            foreignKeyName: "library_resources_min_access_tier_fkey"
            columns: ["min_access_tier"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["tier"]
          },
        ]
      }
      membership_credit_grants: {
        Row: {
          created_at: string
          credit_amount: number
          grant_period_end: string
          grant_period_start: string
          id: string
          idempotency_key: string
          ledger_entry_id: string | null
          metadata: Json
          plan_tier: string
          rollover_tier_key: string
          skip_reason: string | null
          status: string
          subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credit_amount: number
          grant_period_end: string
          grant_period_start: string
          id?: string
          idempotency_key: string
          ledger_entry_id?: string | null
          metadata?: Json
          plan_tier: string
          rollover_tier_key: string
          skip_reason?: string | null
          status: string
          subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credit_amount?: number
          grant_period_end?: string
          grant_period_start?: string
          id?: string
          idempotency_key?: string
          ledger_entry_id?: string | null
          metadata?: Json
          plan_tier?: string
          rollover_tier_key?: string
          skip_reason?: string | null
          status?: string
          subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_credit_grants_ledger_entry_id_fkey"
            columns: ["ledger_entry_id"]
            isOneToOne: false
            referencedRelation: "credit_ledger_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_credit_grants_plan_tier_fkey"
            columns: ["plan_tier"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["tier"]
          },
          {
            foreignKeyName: "membership_credit_grants_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_testers: {
        Row: {
          added_by: string | null
          created_at: string
          note: string
          user_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          note?: string
          user_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          note?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_audit_log: {
        Row: {
          amount_minor: number | null
          billing_type: string
          created_at: string
          currency: string | null
          error: string | null
          event: string
          id: string
          ip_address: string | null
          metadata: Json
          order_id: string | null
          payment_id: string | null
          provider: string
          provider_order_id: string | null
          provider_payment_id: string | null
          purpose: string
          success: boolean
          user_id: string | null
        }
        Insert: {
          amount_minor?: number | null
          billing_type: string
          created_at?: string
          currency?: string | null
          error?: string | null
          event: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          order_id?: string | null
          payment_id?: string | null
          provider: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          purpose: string
          success: boolean
          user_id?: string | null
        }
        Update: {
          amount_minor?: number | null
          billing_type?: string
          created_at?: string
          currency?: string | null
          error?: string | null
          event?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          order_id?: string | null
          payment_id?: string | null
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          purpose?: string
          success?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      payment_currencies: {
        Row: {
          code: string
          created_at: string
          decimal_places: number
          disabled_reason: string | null
          enabled: boolean
          enabled_at: string | null
          enabled_by: string | null
          locale: string
          minor_unit_factor: number
          name: string
          symbol: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          decimal_places?: number
          disabled_reason?: string | null
          enabled?: boolean
          enabled_at?: string | null
          enabled_by?: string | null
          locale?: string
          minor_unit_factor?: number
          name: string
          symbol: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          decimal_places?: number
          disabled_reason?: string | null
          enabled?: boolean
          enabled_at?: string | null
          enabled_by?: string | null
          locale?: string
          minor_unit_factor?: number
          name?: string
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_providers: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          admin_note: string
          created_at: string
          enabled: boolean
          id: string
          name: string
          priority: number
          supported_countries: string[]
          supported_currencies: string[]
          supports_one_time: boolean
          supports_subscriptions: boolean
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          admin_note?: string
          created_at?: string
          enabled?: boolean
          id: string
          name: string
          priority?: number
          supported_countries?: string[]
          supported_currencies?: string[]
          supports_one_time?: boolean
          supports_subscriptions?: boolean
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          admin_note?: string
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          priority?: number
          supported_countries?: string[]
          supported_currencies?: string[]
          supports_one_time?: boolean
          supports_subscriptions?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      payment_webhook_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          processed: boolean
          processed_at: string | null
          processing_error: string | null
          razorpay_event_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
          razorpay_event_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
          razorpay_event_id?: string
        }
        Relationships: []
      }
      plan_promotions: {
        Row: {
          active: boolean
          billing_interval: string
          created_at: string
          ends_at: string | null
          id: string
          intro_period_months: number | null
          label: string
          metadata: Json
          plan_tier: string
          price_cents: number
          starts_at: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          billing_interval: string
          created_at?: string
          ends_at?: string | null
          id?: string
          intro_period_months?: number | null
          label: string
          metadata?: Json
          plan_tier: string
          price_cents: number
          starts_at?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          billing_interval?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          intro_period_months?: number | null
          label?: string
          metadata?: Json
          plan_tier?: string
          price_cents?: number
          starts_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_promotions_plan_tier_fkey"
            columns: ["plan_tier"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["tier"]
          },
        ]
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profile_preferences: {
        Row: {
          interests: string[]
          locale: string
          motion_pref: string
          skill_level: string | null
          toggles: Json
          units_pref: string
          updated_at: string
          user_id: string
        }
        Insert: {
          interests?: string[]
          locale?: string
          motion_pref?: string
          skill_level?: string | null
          toggles?: Json
          units_pref?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          interests?: string[]
          locale?: string
          motion_pref?: string
          skill_level?: string | null
          toggles?: Json
          units_pref?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_bracket: string
          avatar_id: string | null
          avatar_url: string | null
          bio: string | null
          country_code: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          id: string
          status: string
          updated_at: string
          username: string | null
        }
        Insert: {
          age_bracket?: string
          avatar_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          country_code?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          id: string
          status?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          age_bracket?: string
          avatar_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          country_code?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          id?: string
          status?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      pvp_participants: {
        Row: {
          attempt_id: string | null
          best_streak: number | null
          correct: number | null
          credits_earned: number | null
          duration_ms: number | null
          finish_rank: number | null
          id: string
          is_ready: boolean
          joined_at: string
          ready_at: string | null
          room_id: string
          score: number | null
          submitted_at: string | null
          total: number | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          attempt_id?: string | null
          best_streak?: number | null
          correct?: number | null
          credits_earned?: number | null
          duration_ms?: number | null
          finish_rank?: number | null
          id?: string
          is_ready?: boolean
          joined_at?: string
          ready_at?: string | null
          room_id: string
          score?: number | null
          submitted_at?: string | null
          total?: number | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          attempt_id?: string | null
          best_streak?: number | null
          correct?: number | null
          credits_earned?: number | null
          duration_ms?: number | null
          finish_rank?: number | null
          id?: string
          is_ready?: boolean
          joined_at?: string
          ready_at?: string | null
          room_id?: string
          score?: number | null
          submitted_at?: string | null
          total?: number | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pvp_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "pvp_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      pvp_rooms: {
        Row: {
          active_player_count: number | null
          completed_at: string | null
          created_at: string
          host_user_id: string
          id: string
          max_players: number
          min_players: number
          quiz_id: string
          rankings_finalized_at: string | null
          rewards_settled_at: string | null
          room_code: string
          room_mode: Database["public"]["Enums"]["room_mode"]
          started_at: string | null
          status: Database["public"]["Enums"]["pvp_room_status"]
          winner_user_id: string | null
        }
        Insert: {
          active_player_count?: number | null
          completed_at?: string | null
          created_at?: string
          host_user_id: string
          id?: string
          max_players?: number
          min_players?: number
          quiz_id: string
          rankings_finalized_at?: string | null
          rewards_settled_at?: string | null
          room_code: string
          room_mode?: Database["public"]["Enums"]["room_mode"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["pvp_room_status"]
          winner_user_id?: string | null
        }
        Update: {
          active_player_count?: number | null
          completed_at?: string | null
          created_at?: string
          host_user_id?: string
          id?: string
          max_players?: number
          min_players?: number
          quiz_id?: string
          rankings_finalized_at?: string | null
          rewards_settled_at?: string | null
          room_code?: string
          room_mode?: Database["public"]["Enums"]["room_mode"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["pvp_room_status"]
          winner_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pvp_rooms_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          attempt_id: string
          best_streak: number
          completed_at: string
          correct: number
          credits_earned: number
          duration_ms: number
          id: string
          mode: string
          quiz_id: string
          score: number
          total: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          attempt_id?: string
          best_streak?: number
          completed_at?: string
          correct: number
          credits_earned?: number
          duration_ms: number
          id?: string
          mode: string
          quiz_id: string
          score: number
          total: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          attempt_id?: string
          best_streak?: number
          completed_at?: string
          correct?: number
          credits_earned?: number
          duration_ms?: number
          id?: string
          mode?: string
          quiz_id?: string
          score?: number
          total?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          accepted: string[] | null
          answer_bool: boolean | null
          answer_id: string | null
          answer_ids: string[] | null
          board_art: string | null
          explanation: string | null
          id: string
          items: string[] | null
          media: Json | null
          options: Json | null
          placeholder: string | null
          position: number
          prompt: string
          quiz_id: string
          regions: Json | null
          targets: string[] | null
          type: Database["public"]["Enums"]["question_type"]
        }
        Insert: {
          accepted?: string[] | null
          answer_bool?: boolean | null
          answer_id?: string | null
          answer_ids?: string[] | null
          board_art?: string | null
          explanation?: string | null
          id?: string
          items?: string[] | null
          media?: Json | null
          options?: Json | null
          placeholder?: string | null
          position: number
          prompt: string
          quiz_id: string
          regions?: Json | null
          targets?: string[] | null
          type: Database["public"]["Enums"]["question_type"]
        }
        Update: {
          accepted?: string[] | null
          answer_bool?: boolean | null
          answer_id?: string | null
          answer_ids?: string[] | null
          board_art?: string | null
          explanation?: string | null
          id?: string
          items?: string[] | null
          media?: Json | null
          options?: Json | null
          placeholder?: string | null
          position?: number
          prompt?: string
          quiz_id?: string
          regions?: Json | null
          targets?: string[] | null
          type?: Database["public"]["Enums"]["question_type"]
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          art: string
          category_id: string
          created_at: string
          creator: string
          description: string | null
          difficulty: string
          id: string
          is_published: boolean
          language: string
          minutes: number
          reward_credits: number
          reward_xp: number
          title: string
          updated_at: string
        }
        Insert: {
          art: string
          category_id: string
          created_at?: string
          creator: string
          description?: string | null
          difficulty: string
          id: string
          is_published?: boolean
          language?: string
          minutes?: number
          reward_credits?: number
          reward_xp?: number
          title: string
          updated_at?: string
        }
        Update: {
          art?: string
          category_id?: string
          created_at?: string
          creator?: string
          description?: string | null
          difficulty?: string
          id?: string
          is_published?: boolean
          language?: string
          minutes?: number
          reward_credits?: number
          reward_xp?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipping_zone_methods: {
        Row: {
          carrier: string | null
          display_order: number
          estimated_days_max: number
          estimated_days_min: number
          id: string
          label: string
          method_id: string
          note: string
          price_minor: number
          trackable: boolean
          zone_id: string
        }
        Insert: {
          carrier?: string | null
          display_order?: number
          estimated_days_max?: number
          estimated_days_min?: number
          id?: string
          label: string
          method_id: string
          note?: string
          price_minor?: number
          trackable?: boolean
          zone_id: string
        }
        Update: {
          carrier?: string | null
          display_order?: number
          estimated_days_max?: number
          estimated_days_min?: number
          id?: string
          label?: string
          method_id?: string
          note?: string
          price_minor?: number
          trackable?: boolean
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_zone_methods_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "shipping_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          countries: string[]
          created_at: string
          currency_code: string
          disabled_reason: string | null
          enabled: boolean
          free_shipping_threshold_minor: number
          id: string
          name: string
          operations_notes: string | null
          supports_digital: boolean
          supports_physical: boolean
          updated_at: string
        }
        Insert: {
          countries?: string[]
          created_at?: string
          currency_code: string
          disabled_reason?: string | null
          enabled?: boolean
          free_shipping_threshold_minor?: number
          id: string
          name: string
          operations_notes?: string | null
          supports_digital?: boolean
          supports_physical?: boolean
          updated_at?: string
        }
        Update: {
          countries?: string[]
          created_at?: string
          currency_code?: string
          disabled_reason?: string | null
          enabled?: boolean
          free_shipping_threshold_minor?: number
          id?: string
          name?: string
          operations_notes?: string | null
          supports_digital?: boolean
          supports_physical?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_zones_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "payment_currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      store_order_lines: {
        Row: {
          created_at: string
          fulfillment_type: Database["public"]["Enums"]["store_product_fulfillment_type"]
          id: string
          line_credits: number
          metadata: Json
          order_id: string
          product_id: string | null
          product_name: string
          product_slug: string
          quantity: number
          unit_credits: number
        }
        Insert: {
          created_at?: string
          fulfillment_type: Database["public"]["Enums"]["store_product_fulfillment_type"]
          id?: string
          line_credits: number
          metadata?: Json
          order_id: string
          product_id?: string | null
          product_name: string
          product_slug: string
          quantity: number
          unit_credits: number
        }
        Update: {
          created_at?: string
          fulfillment_type?: Database["public"]["Enums"]["store_product_fulfillment_type"]
          id?: string
          line_credits?: number
          metadata?: Json
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_slug?: string
          quantity?: number
          unit_credits?: number
        }
        Relationships: [
          {
            foreignKeyName: "store_order_lines_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "store_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_order_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "store_products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_orders: {
        Row: {
          created_at: string
          credits_total: number
          id: string
          idempotency_key: string
          metadata: Json
          placed_at: string | null
          status: Database["public"]["Enums"]["store_order_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_total: number
          id?: string
          idempotency_key: string
          metadata?: Json
          placed_at?: string | null
          status?: Database["public"]["Enums"]["store_order_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_total?: number
          id?: string
          idempotency_key?: string
          metadata?: Json
          placed_at?: string | null
          status?: Database["public"]["Enums"]["store_order_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_products: {
        Row: {
          active: boolean
          created_at: string
          credit_price: number
          description: string
          fulfillment_type: Database["public"]["Enums"]["store_product_fulfillment_type"]
          id: string
          metadata: Json
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          credit_price: number
          description?: string
          fulfillment_type?: Database["public"]["Enums"]["store_product_fulfillment_type"]
          id?: string
          metadata?: Json
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          credit_price?: number
          description?: string
          fulfillment_type?: Database["public"]["Enums"]["store_product_fulfillment_type"]
          id?: string
          metadata?: Json
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          active: boolean
          annual_price_cents: number | null
          created_at: string
          credit_rollover_months: number
          display_name: string
          is_creator_plan: boolean
          metadata: Json
          monthly_credit_grant: number
          monthly_price_cents: number
          monthly_quiz_limit: number | null
          multiplayer_limit: number | null
          pvp_limit: number | null
          rollover_tier_key: string
          solo_quiz_limit: number | null
          tier: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          annual_price_cents?: number | null
          created_at?: string
          credit_rollover_months?: number
          display_name: string
          is_creator_plan?: boolean
          metadata?: Json
          monthly_credit_grant?: number
          monthly_price_cents?: number
          monthly_quiz_limit?: number | null
          multiplayer_limit?: number | null
          pvp_limit?: number | null
          rollover_tier_key: string
          solo_quiz_limit?: number | null
          tier: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          annual_price_cents?: number | null
          created_at?: string
          credit_rollover_months?: number
          display_name?: string
          is_creator_plan?: boolean
          metadata?: Json
          monthly_credit_grant?: number
          monthly_price_cents?: number
          monthly_quiz_limit?: number | null
          multiplayer_limit?: number | null
          pvp_limit?: number | null
          rollover_tier_key?: string
          solo_quiz_limit?: number | null
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plans_rollover_tier_key_fkey"
            columns: ["rollover_tier_key"]
            isOneToOne: false
            referencedRelation: "credit_plan_rollover_config"
            referencedColumns: ["plan_tier"]
          },
        ]
      }
      support_ticket_messages: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          channel: string
          created_at: string
          id: string
          priority: string
          requester_email: string
          requester_id: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          channel?: string
          created_at?: string
          id?: string
          priority?: string
          requester_email?: string
          requester_id?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          channel?: string
          created_at?: string
          id?: string
          priority?: string
          requester_email?: string
          requester_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_entitlements: {
        Row: {
          entitlement_type: string
          granted_at: string
          id: string
          metadata: Json
          product_id: string | null
          product_slug: string
          source_order_id: string | null
          source_type: string
          user_id: string
        }
        Insert: {
          entitlement_type: string
          granted_at?: string
          id?: string
          metadata?: Json
          product_id?: string | null
          product_slug: string
          source_order_id?: string | null
          source_type: string
          user_id: string
        }
        Update: {
          entitlement_type?: string
          granted_at?: string
          id?: string
          metadata?: Json
          product_id?: string | null
          product_slug?: string
          source_order_id?: string | null
          source_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_entitlements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "store_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_entitlements_source_order_id_fkey"
            columns: ["source_order_id"]
            isOneToOne: false
            referencedRelation: "store_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_library_bookmarks: {
        Row: {
          created_at: string
          resource_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          resource_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_library_bookmarks_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "library_catalogue_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_library_bookmarks_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "library_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_library_likes: {
        Row: {
          created_at: string
          resource_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          resource_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_library_likes_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "library_catalogue_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_library_likes_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "library_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_library_progress: {
        Row: {
          completed_at: string | null
          progress_percent: number
          resource_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          progress_percent?: number
          resource_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          progress_percent?: number
          resource_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_library_progress_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "library_catalogue_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_library_progress_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "library_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_library_view_dedupe: {
        Row: {
          last_counted_at: string
          resource_id: string
          user_id: string
        }
        Insert: {
          last_counted_at: string
          resource_id: string
          user_id: string
        }
        Update: {
          last_counted_at?: string
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_library_view_dedupe_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "library_catalogue_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_library_view_dedupe_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "library_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progression: {
        Row: {
          credits: number
          credits_month_key: string | null
          current_streak: number
          last_played_date: string | null
          level: number
          longest_streak: number
          total_answered: number
          total_correct: number
          total_quizzes: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          credits?: number
          credits_month_key?: string | null
          current_streak?: number
          last_played_date?: string | null
          level?: number
          longest_streak?: number
          total_answered?: number
          total_correct?: number
          total_quizzes?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          credits?: number
          credits_month_key?: string | null
          current_streak?: number
          last_played_date?: string | null
          level?: number
          longest_streak?: number
          total_answered?: number
          total_correct?: number
          total_quizzes?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_interval: string
          billing_provider_price_id: string | null
          cancel_at_period_end: boolean
          cancelled_at: string | null
          charge_currency: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string
          current_price_snapshot_id: string | null
          id: string
          intro_cycles_completed: number
          intro_cycles_total: number | null
          metadata: Json
          plan_promotion_id: string | null
          plan_tier: string
          provider_customer_id: string | null
          provider_last_event_at: string | null
          provider_last_event_id: string | null
          provider_name: string | null
          provider_subscription_id: string | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_interval?: string
          billing_provider_price_id?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          charge_currency?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          current_price_snapshot_id?: string | null
          id?: string
          intro_cycles_completed?: number
          intro_cycles_total?: number | null
          metadata?: Json
          plan_promotion_id?: string | null
          plan_tier: string
          provider_customer_id?: string | null
          provider_last_event_at?: string | null
          provider_last_event_id?: string | null
          provider_name?: string | null
          provider_subscription_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_interval?: string
          billing_provider_price_id?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          charge_currency?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          current_price_snapshot_id?: string | null
          id?: string
          intro_cycles_completed?: number
          intro_cycles_total?: number | null
          metadata?: Json
          plan_promotion_id?: string | null
          plan_tier?: string
          provider_customer_id?: string | null
          provider_last_event_at?: string | null
          provider_last_event_id?: string | null
          provider_name?: string | null
          provider_subscription_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_billing_provider_price_id_fkey"
            columns: ["billing_provider_price_id"]
            isOneToOne: false
            referencedRelation: "billing_provider_prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_current_price_snapshot_id_fkey"
            columns: ["current_price_snapshot_id"]
            isOneToOne: false
            referencedRelation: "billing_price_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_promotion_id_fkey"
            columns: ["plan_promotion_id"]
            isOneToOne: false
            referencedRelation: "plan_promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_tier_fkey"
            columns: ["plan_tier"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["tier"]
          },
        ]
      }
    }
    Views: {
      library_catalogue_resources: {
        Row: {
          author_handle: string | null
          bookmark_count: number | null
          continent: string | null
          cover_art_key: string | null
          cover_label: string | null
          dek: string | null
          difficulty: Database["public"]["Enums"]["library_difficulty"] | null
          featured: boolean | null
          id: string | null
          language: string | null
          like_count: number | null
          min_access_tier: string | null
          published_at: string | null
          read_time_minutes: number | null
          resource_kind:
            | Database["public"]["Enums"]["library_resource_kind"]
            | null
          search_vector: unknown
          slug: string | null
          status: Database["public"]["Enums"]["library_resource_status"] | null
          subject_category: string | null
          tags: string[] | null
          title: string | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "library_resources_author_handle_fkey"
            columns: ["author_handle"]
            isOneToOne: false
            referencedRelation: "library_creators"
            referencedColumns: ["handle"]
          },
          {
            foreignKeyName: "library_resources_min_access_tier_fkey"
            columns: ["min_access_tier"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["tier"]
          },
        ]
      }
    }
    Functions: {
      admin_adjust_credits: {
        Args: {
          _amount: number
          _note?: string
          _reason: string
          _user_id: string
        }
        Returns: Json
      }
      admin_dashboard_metrics: { Args: never; Returns: Json }
      admin_growth_series: { Args: never; Returns: Json }
      admin_list_directory: {
        Args: never
        Returns: {
          age_bracket: string
          avatar_url: string
          bio: string
          country_code: string
          created_at: string
          credits: number
          current_streak: number
          display_name: string
          email: string
          id: string
          last_played_date: string
          last_sign_in_at: string
          level: number
          plan_tier: string
          roles: Database["public"]["Enums"]["app_role"][]
          status: string
          subscription_status: string
          total_quizzes: number
          username: string
          xp: number
        }[]
      }
      admin_set_platform_setting: {
        Args: { _key: string; _value: Json }
        Returns: Json
      }
      admin_set_profile_status: {
        Args: { _status: string; _user_id: string }
        Returns: Json
      }
      admin_set_user_role: {
        Args: {
          _grant: boolean
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: Json
      }
      admin_update_gstore_order: {
        Args: {
          p_order_id: string
          p_order_status?: string
          p_tracking_number?: string
        }
        Returns: Json
      }
      admin_update_profile_fields: {
        Args: {
          _bio?: string
          _country_code?: string
          _display_name?: string
          _user_id: string
        }
        Returns: Json
      }
      admin_write_audit_log: {
        Args: {
          _action: string
          _entity_id?: string
          _entity_type: string
          _metadata?: Json
          _outcome?: string
        }
        Returns: string
      }
      advance_draw_room_turn_index: {
        Args: { _room_id: string }
        Returns: undefined
      }
      advance_draw_turn: { Args: { _room_id: string }; Returns: Json }
      advance_imp_phase: { Args: { _room_id: string }; Returns: Json }
      append_credit_ledger_entry: {
        Args: {
          _amount: number
          _earned_at?: string
          _entry_type: string
          _idempotency_key: string
          _metadata?: Json
          _month_key?: string
          _plan_tier?: string
          _reference_id?: string
          _reference_type?: string
          _user_id: string
        }
        Returns: string
      }
      apply_razorpay_subscription_event: {
        Args: {
          p_event_type: string
          p_internal_subscription_id?: string
          p_period_key?: string
          p_provider_payment_id?: string
          p_provider_subscription_id: string
        }
        Returns: Json
      }
      apply_user_progression_rewards: {
        Args: {
          _correct: number
          _credits_earned: number
          _earned_at?: string
          _ledger_entry_type?: string
          _ledger_idempotency_key?: string
          _ledger_reference_id?: string
          _ledger_reference_type?: string
          _month_key: string
          _total: number
          _user_id: string
          _xp_earned: number
        }
        Returns: Json
      }
      assign_random_quiz: {
        Args: { p_category_id: string; p_difficulty: string }
        Returns: Json
      }
      attach_gstore_razorpay_order: {
        Args: {
          p_order_id: string
          p_payment_id: string
          p_provider_order_id: string
        }
        Returns: Json
      }
      attach_gstore_razorpay_order_guest: {
        Args: {
          p_guest_token: string
          p_order_id: string
          p_payment_id: string
          p_provider_order_id: string
        }
        Returns: Json
      }
      begin_draw_turn: { Args: { _room_id: string }; Returns: undefined }
      begin_mock_subscription: {
        Args: {
          p_base_amount_minor: number
          p_billing_interval: string
          p_charge_amount_minor: number
          p_gst_amount_minor: number
          p_idempotency_key: string
          p_plan_tier: string
        }
        Returns: Json
      }
      begin_mock_upgrade: {
        Args: {
          p_billing_interval: string
          p_idempotency_key: string
          p_target_plan_tier: string
        }
        Returns: Json
      }
      begin_razorpay_subscription: {
        Args: {
          p_base_amount_minor: number
          p_billing_interval: string
          p_charge_amount_minor: number
          p_gst_amount_minor: number
          p_idempotency_key: string
          p_plan_tier: string
          p_provider_plan_id: string
          p_provider_subscription_id: string
        }
        Returns: Json
      }
      build_draw_room_state: { Args: { _room_id: string }; Returns: Json }
      build_imp_room_state: { Args: { _room_id: string }; Returns: Json }
      build_multiplayer_room_state: {
        Args: { _room_id: string }
        Returns: Json
      }
      build_pvp_room_state: { Args: { _room_id: string }; Returns: Json }
      calculate_pvp_credit_award: {
        Args: {
          _month_key: string
          _player_a: string
          _player_b: string
          _room_id: string
        }
        Returns: Json
      }
      cancel_gstore_order: { Args: { p_order_id: string }; Returns: Json }
      cancel_mock_subscription: {
        Args: { p_subscription_id: string }
        Returns: Json
      }
      choose_draw_word: {
        Args: { _turn_id: string; _word_id: string }
        Returns: Json
      }
      claim_payment_webhook_event: {
        Args: {
          p_event_type: string
          p_payload: Json
          p_razorpay_event_id: string
        }
        Returns: Json
      }
      complete_multiplayer_match_if_ready: {
        Args: { _room_id: string }
        Returns: undefined
      }
      complete_pvp_match_if_ready: {
        Args: { _room_id: string }
        Returns: undefined
      }
      compute_credit_expires_at: {
        Args: { _earned_at: string; _plan_tier: string }
        Returns: string
      }
      compute_membership_grant_period: {
        Args: { _at_time?: string; _subscription_id: string }
        Returns: {
          grant_period_end: string
          grant_period_start: string
        }[]
      }
      confirm_gstore_payment: {
        Args: {
          p_order_id: string
          p_outcome: string
          p_payment_id: string
          p_provider_order_id: string
          p_provider_payment_id: string
          p_provider_signature: string
        }
        Returns: Json
      }
      confirm_gstore_payment_guest: {
        Args: {
          p_guest_token: string
          p_order_id: string
          p_outcome: string
          p_payment_id: string
          p_provider_order_id: string
          p_provider_payment_id: string
          p_provider_signature: string
        }
        Returns: Json
      }
      confirm_mock_subscription: {
        Args: { p_outcome: string; p_subscription_id: string }
        Returns: Json
      }
      confirm_mock_upgrade: {
        Args: { p_outcome: string; p_upgrade_payment_id: string }
        Returns: Json
      }
      confirm_razorpay_subscription: {
        Args: {
          p_provider_payment_id: string
          p_provider_subscription_id: string
          p_subscription_id: string
        }
        Returns: Json
      }
      create_draw_room: {
        Args: {
          _categories: string[]
          _difficulty: string
          _max_players: number
          _rounds: number
          _turn_seconds?: number
        }
        Returns: Json
      }
      create_gstore_order: {
        Args: {
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_delivery_notes: string
          p_discount_minor: number
          p_idempotency_key: string
          p_is_mock?: boolean
          p_items: Json
          p_shipping_city: string
          p_shipping_country: string
          p_shipping_line1: string
          p_shipping_line2: string
          p_shipping_method: string
          p_shipping_minor: number
          p_shipping_name: string
          p_shipping_pincode: string
          p_shipping_state: string
          p_subtotal_minor: number
          p_tax_minor: number
          p_total_minor: number
        }
        Returns: Json
      }
      create_gstore_order_guest: {
        Args: {
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_delivery_notes: string
          p_discount_minor: number
          p_idempotency_key: string
          p_is_mock?: boolean
          p_items: Json
          p_shipping_city: string
          p_shipping_country: string
          p_shipping_line1: string
          p_shipping_line2: string
          p_shipping_method: string
          p_shipping_minor: number
          p_shipping_name: string
          p_shipping_pincode: string
          p_shipping_state: string
          p_subtotal_minor: number
          p_tax_minor: number
          p_total_minor: number
        }
        Returns: Json
      }
      create_imp_room: {
        Args: { _category?: string; _difficulty?: string; _max_players: number }
        Returns: Json
      }
      create_multiplayer_room: {
        Args: { _max_players: number; _quiz_id: string }
        Returns: Json
      }
      create_pvp_room: { Args: { _quiz_id: string }; Returns: Json }
      draw_mask_word: {
        Args: { _revealed_count: number; _turn_id: string; _word: string }
        Returns: string
      }
      draw_normalize_text: { Args: { _text: string }; Returns: string }
      fetch_draw_strokes_since: {
        Args: { _after_id?: number; _turn_id: string }
        Returns: {
          color: string | null
          created_at: string
          id: number
          kind: string
          points: Json | null
          room_id: string
          size: number | null
          tool: string | null
          turn_id: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "draw_strokes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      finalize_imp_game: { Args: { _room_id: string }; Returns: undefined }
      finalize_multiplayer_rankings: {
        Args: { _room_id: string }
        Returns: undefined
      }
      fulfill_gstore_order_from_webhook: {
        Args: {
          p_gstore_order_id?: string
          p_gstore_payment_id?: string
          p_outcome?: string
          p_payment_method?: string
          p_provider_order_id: string
          p_provider_payment_id: string
        }
        Returns: Json
      }
      generate_draw_room_code: { Args: never; Returns: string }
      generate_imp_clue_order: {
        Args: { _room_id: string; _round: number }
        Returns: string[]
      }
      generate_imp_room_code: { Args: never; Returns: string }
      generate_pvp_room_code: { Args: never; Returns: string }
      get_guest_order_detail: {
        Args: { p_guest_token: string; p_order_number: string }
        Returns: Json
      }
      get_imp_clue_order: {
        Args: { _room: Database["public"]["Tables"]["imp_rooms"]["Row"] }
        Returns: string[]
      }
      get_my_invoices: { Args: never; Returns: Json }
      get_my_plan_tier: { Args: never; Returns: Json }
      get_my_tester_status: { Args: never; Returns: boolean }
      get_user_plan_tier: { Args: { _user_id: string }; Returns: string }
      grade_quiz_answer: {
        Args: {
          p_accepted: string[]
          p_answer_bool: boolean
          p_answer_id: string
          p_answer_ids: string[]
          p_skipped: boolean
          p_type: Database["public"]["Enums"]["question_type"]
          p_value: Json
        }
        Returns: boolean
      }
      grade_quiz_submission: {
        Args: {
          _answers: Json
          _duration_ms: number
          _enforce_duration?: boolean
          _quiz_id: string
        }
        Returns: Json
      }
      grant_credit_order_entitlements: {
        Args: { _order_id: string }
        Returns: Json
      }
      grant_membership_credits_for_period: {
        Args: { _grant_period_start: string; _subscription_id: string }
        Returns: Json
      }
      grant_membership_credits_for_user: {
        Args: { _user_id: string }
        Returns: Json
      }
      grant_razorpay_membership_credits: {
        Args: {
          p_billing_interval: string
          p_period_key: string
          p_plan_tier: string
          p_subscription_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_payment_audit_log: {
        Args: {
          p_amount_minor?: number
          p_billing_type: string
          p_currency?: string
          p_error?: string
          p_event: string
          p_metadata?: Json
          p_order_id?: string
          p_payment_id?: string
          p_provider: string
          p_provider_order_id?: string
          p_provider_payment_id?: string
          p_purpose: string
          p_success: boolean
          p_user_id?: string
        }
        Returns: string
      }
      is_admin: { Args: { _user_id?: string }; Returns: boolean }
      is_draw_room_participant: {
        Args: { _room_id: string; _user_id: string }
        Returns: boolean
      }
      is_imp_participant: {
        Args: { _room_id: string; _uid: string }
        Returns: boolean
      }
      is_membership_grant_eligible: {
        Args: {
          _at_time: string
          _monthly_credit_grant: number
          _period_end: string
          _period_start: string
          _status: string
        }
        Returns: boolean
      }
      is_pvp_room_participant: {
        Args: { _room_id: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id?: string }; Returns: boolean }
      join_draw_room: { Args: { _room_code: string }; Returns: Json }
      join_imp_room: { Args: { _room_code: string }; Returns: Json }
      join_multiplayer_room: { Args: { _room_code: string }; Returns: Json }
      join_pvp_room: { Args: { _room_code: string }; Returns: Json }
      leave_draw_room: { Args: { _room_id: string }; Returns: Json }
      leave_imp_room: { Args: { _room_id: string }; Returns: Json }
      leave_multiplayer_room: { Args: { _room_id: string }; Returns: Json }
      leave_pvp_room: { Args: { _room_id: string }; Returns: Json }
      level_from_xp: { Args: { _xp: number }; Returns: number }
      library_block_search_text: {
        Args: {
          _kind: Database["public"]["Enums"]["library_block_kind"]
          _payload: Json
        }
        Returns: string
      }
      library_media_collection_slug_from_path: {
        Args: { _object_name: string }
        Returns: string
      }
      library_media_creator_handle_from_path: {
        Args: { _object_name: string }
        Returns: string
      }
      library_media_resource_slug_from_path: {
        Args: { _object_name: string }
        Returns: string
      }
      library_refresh_resource_search_vector: {
        Args: { _resource_id: string }
        Returns: undefined
      }
      library_storage_object_is_public: {
        Args: { _object_name: string }
        Returns: boolean
      }
      library_storage_user_can_manage: {
        Args: { _object_name: string; _user_id?: string }
        Returns: boolean
      }
      library_tier_rank: { Args: { _tier: string }; Returns: number }
      library_user_can_access_resource: {
        Args: { _resource_id: string; _user_id?: string }
        Returns: boolean
      }
      library_user_curates_collection: {
        Args: { _collection_id: string; _user_id?: string }
        Returns: boolean
      }
      library_user_owns_creator_handle: {
        Args: { _handle: string; _user_id?: string }
        Returns: boolean
      }
      library_user_owns_resource: {
        Args: { _resource_id: string; _user_id?: string }
        Returns: boolean
      }
      map_plan_tier_to_rollover_key: {
        Args: { _plan_tier: string }
        Returns: string
      }
      mark_payment_webhook_event: {
        Args: { p_error?: string; p_id: string; p_processed: boolean }
        Returns: undefined
      }
      mark_stale_imp_players: { Args: { _room_id: string }; Returns: undefined }
      membership_grant_idempotency_key: {
        Args: { _grant_period_start: string; _subscription_id: string }
        Returns: string
      }
      normalize_typed_answer: { Args: { p_text: string }; Returns: string }
      place_credit_order: {
        Args: { _idempotency_key: string; _lines: Json }
        Returns: Json
      }
      reactivate_mock_subscription: {
        Args: { p_subscription_id: string }
        Returns: Json
      }
      reconcile_membership_credit_grants: {
        Args: { _limit?: number }
        Returns: Json
      }
      reconcile_user_credits: { Args: { _user_id: string }; Returns: number }
      record_library_view: { Args: { _resource_id: string }; Returns: Json }
      request_cancel_subscription: { Args: never; Returns: Json }
      request_reactivate_subscription: { Args: never; Returns: Json }
      require_admin: { Args: never; Returns: string }
      require_super_admin: { Args: never; Returns: string }
      resolve_product_entitlement_type: {
        Args: { _metadata: Json; _slug: string }
        Returns: string
      }
      resolve_user_subscription_tier: {
        Args: { _user_id: string }
        Returns: string
      }
      restart_draw_game: { Args: { _room_id: string }; Returns: Json }
      restart_imp_game: { Args: { _room_id: string }; Returns: Json }
      schedule_cancel_mock_subscription: {
        Args: { p_subscription_id: string }
        Returns: Json
      }
      send_draw_message: {
        Args: { _message: string; _room_id: string }
        Returns: Json
      }
      send_imp_message: {
        Args: { _body: string; _room_id: string }
        Returns: Json
      }
      set_age_bracket: { Args: { _bracket: string }; Returns: undefined }
      set_draw_ready: {
        Args: { _ready: boolean; _room_id: string }
        Returns: Json
      }
      set_imp_ready: {
        Args: { _ready: boolean; _room_id: string }
        Returns: Json
      }
      set_multiplayer_ready: {
        Args: { _ready: boolean; _room_id: string }
        Returns: Json
      }
      set_pvp_ready: {
        Args: { _ready: boolean; _room_id: string }
        Returns: Json
      }
      settle_multiplayer_match_rewards: {
        Args: { _room_id: string }
        Returns: Json
      }
      settle_pvp_match_rewards: { Args: { _room_id: string }; Returns: Json }
      spend_credits: {
        Args: {
          _amount: number
          _entry_type: string
          _idempotency_key: string
          _metadata?: Json
          _reference_id: string
          _reference_type: string
          _user_id: string
        }
        Returns: Json
      }
      start_draw_game: { Args: { _room_id: string }; Returns: Json }
      start_imp_game: { Args: { _room_id: string }; Returns: Json }
      start_multiplayer_match: { Args: { _room_id: string }; Returns: Json }
      start_pvp_match: { Args: { _room_id: string }; Returns: Json }
      submit_draw_stroke: {
        Args: {
          _color: string
          _kind: string
          _points: Json
          _room_id: string
          _size: number
          _tool: string
          _turn_id: string
        }
        Returns: number
      }
      submit_imp_clue: {
        Args: { _clue: string; _room_id: string }
        Returns: Json
      }
      submit_imp_vote: {
        Args: { _room_id: string; _target_user_id: string }
        Returns: Json
      }
      submit_multiplayer_attempt: {
        Args: {
          _answers: Json
          _attempt_id: string
          _duration_ms: number
          _room_id: string
        }
        Returns: Json
      }
      submit_pvp_attempt: {
        Args: {
          _answers: Json
          _attempt_id: string
          _duration_ms: number
          _room_id: string
        }
        Returns: Json
      }
      submit_quiz_attempt: {
        Args: {
          _answers: Json
          _attempt_id: string
          _duration_ms: number
          _mode: string
          _quiz_id: string
        }
        Returns: Json
      }
      sync_draw_room_ready_state: {
        Args: { _room_id: string }
        Returns: Database["public"]["Enums"]["draw_room_status"]
      }
      sync_multiplayer_room_ready_state: {
        Args: { _room_id: string }
        Returns: Database["public"]["Enums"]["pvp_room_status"]
      }
      sync_pvp_room_ready_state: {
        Args: { _room_id: string }
        Returns: Database["public"]["Enums"]["pvp_room_status"]
      }
      touch_draw_presence: { Args: { _room_id: string }; Returns: undefined }
      touch_imp_presence: { Args: { _room_id: string }; Returns: undefined }
      upsert_library_progress: {
        Args: {
          _completed?: boolean
          _progress_percent: number
          _resource_id: string
        }
        Returns: undefined
      }
      upsert_razorpay_plan_id: {
        Args: {
          p_billing_interval: string
          p_charge_amount_minor: number
          p_plan_tier: string
          p_provider_plan_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "creator" | "admin" | "super_admin"
      draw_difficulty: "easy" | "medium" | "hard"
      draw_room_status:
        | "waiting"
        | "ready"
        | "playing"
        | "completed"
        | "cancelled"
      draw_word_category:
        | "geography_countries"
        | "capitals_flags"
        | "landmarks_monuments"
        | "maps_physical"
        | "space_astronomy"
        | "planets_universe"
      imp_difficulty: "easy" | "medium" | "hard"
      imp_game_phase: "clue" | "discussion" | "voting" | "finalizing" | "reveal"
      imp_player_role: "regular" | "imposter"
      imp_room_status:
        | "waiting"
        | "ready"
        | "playing"
        | "completed"
        | "cancelled"
      imp_word_category:
        | "geography_countries"
        | "capitals_flags"
        | "landmarks_monuments"
        | "maps_physical"
        | "space_astronomy"
        | "planets_universe"
      library_block_kind:
        | "heading"
        | "paragraph"
        | "list"
        | "quote"
        | "image"
        | "map"
        | "facts"
        | "didYouKnow"
        | "table"
        | "reference"
      library_difficulty: "beginner" | "intermediate" | "advanced" | "expert"
      library_resource_kind:
        | "article"
        | "country_profile"
        | "continent_collection"
        | "map"
        | "infographic"
        | "pdf"
        | "educational_resource"
      library_resource_status: "draft" | "pending" | "published" | "archived"
      pvp_room_status:
        | "waiting"
        | "ready"
        | "playing"
        | "completed"
        | "cancelled"
      question_type:
        | "single"
        | "multiple"
        | "boolean"
        | "image"
        | "map"
        | "typed"
        | "order"
        | "dragdrop"
      room_mode: "pvp" | "multiplayer"
      store_order_status:
        | "pending"
        | "completed"
        | "failed"
        | "cancelled"
        | "refunded"
      store_product_fulfillment_type: "digital" | "physical"
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
    Enums: {
      app_role: ["user", "creator", "admin", "super_admin"],
      draw_difficulty: ["easy", "medium", "hard"],
      draw_room_status: [
        "waiting",
        "ready",
        "playing",
        "completed",
        "cancelled",
      ],
      draw_word_category: [
        "geography_countries",
        "capitals_flags",
        "landmarks_monuments",
        "maps_physical",
        "space_astronomy",
        "planets_universe",
      ],
      imp_difficulty: ["easy", "medium", "hard"],
      imp_game_phase: ["clue", "discussion", "voting", "finalizing", "reveal"],
      imp_player_role: ["regular", "imposter"],
      imp_room_status: [
        "waiting",
        "ready",
        "playing",
        "completed",
        "cancelled",
      ],
      imp_word_category: [
        "geography_countries",
        "capitals_flags",
        "landmarks_monuments",
        "maps_physical",
        "space_astronomy",
        "planets_universe",
      ],
      library_block_kind: [
        "heading",
        "paragraph",
        "list",
        "quote",
        "image",
        "map",
        "facts",
        "didYouKnow",
        "table",
        "reference",
      ],
      library_difficulty: ["beginner", "intermediate", "advanced", "expert"],
      library_resource_kind: [
        "article",
        "country_profile",
        "continent_collection",
        "map",
        "infographic",
        "pdf",
        "educational_resource",
      ],
      library_resource_status: ["draft", "pending", "published", "archived"],
      pvp_room_status: [
        "waiting",
        "ready",
        "playing",
        "completed",
        "cancelled",
      ],
      question_type: [
        "single",
        "multiple",
        "boolean",
        "image",
        "map",
        "typed",
        "order",
        "dragdrop",
      ],
      room_mode: ["pvp", "multiplayer"],
      store_order_status: [
        "pending",
        "completed",
        "failed",
        "cancelled",
        "refunded",
      ],
      store_product_fulfillment_type: ["digital", "physical"],
    },
  },
} as const
