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
        Relationships: []
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
          country: string | null
          resource_kind: Database["public"]["Enums"]["library_resource_kind"]
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
          search_vector: unknown | null
        }
        Insert: {
          attachments?: Json
          author_handle: string
          author_user_id?: string | null
          continent?: string
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
          country?: string | null
          resource_kind?: Database["public"]["Enums"]["library_resource_kind"]
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
          country?: string | null
          resource_kind?: Database["public"]["Enums"]["library_resource_kind"]
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
          cancel_at_period_end: boolean
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string
          id: string
          metadata: Json
          plan_tier: string
          provider_customer_id: string | null
          provider_name: string | null
          provider_subscription_id: string | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_interval?: string
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          metadata?: Json
          plan_tier: string
          provider_customer_id?: string | null
          provider_name?: string | null
          provider_subscription_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_interval?: string
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          metadata?: Json
          plan_tier?: string
          provider_customer_id?: string | null
          provider_name?: string | null
          provider_subscription_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
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
      [_ in never]: never
    }
    Functions: {
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
      create_multiplayer_room: {
        Args: { _max_players: number; _quiz_id: string }
        Returns: Json
      }
      create_pvp_room: { Args: { _quiz_id: string }; Returns: Json }
      finalize_multiplayer_rankings: {
        Args: { _room_id: string }
        Returns: undefined
      }
      generate_pvp_room_code: { Args: never; Returns: string }
      get_my_plan_tier: { Args: never; Returns: Json }
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id?: string }; Returns: boolean }
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
      join_multiplayer_room: { Args: { _room_code: string }; Returns: Json }
      join_pvp_room: { Args: { _room_code: string }; Returns: Json }
      leave_multiplayer_room: { Args: { _room_id: string }; Returns: Json }
      leave_pvp_room: { Args: { _room_id: string }; Returns: Json }
      level_from_xp: { Args: { _xp: number }; Returns: number }
      map_plan_tier_to_rollover_key: {
        Args: { _plan_tier: string }
        Returns: string
      }
      membership_grant_idempotency_key: {
        Args: { _grant_period_start: string; _subscription_id: string }
        Returns: string
      }
      normalize_typed_answer: { Args: { p_text: string }; Returns: string }
      place_credit_order: {
        Args: { _idempotency_key: string; _lines: Json }
        Returns: Json
      }
      reconcile_membership_credit_grants: {
        Args: { _limit?: number }
        Returns: Json
      }
      reconcile_user_credits: { Args: { _user_id: string }; Returns: number }
      resolve_product_entitlement_type: {
        Args: { _metadata: Json; _slug: string }
        Returns: string
      }
      resolve_user_subscription_tier: {
        Args: { _user_id: string }
        Returns: string
      }
      upsert_library_progress: {
        Args: {
          _completed?: boolean
          _progress_percent: number
          _resource_id: string
        }
        Returns: undefined
      }
      set_age_bracket: { Args: { _bracket: string }; Returns: undefined }
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
      start_multiplayer_match: { Args: { _room_id: string }; Returns: Json }
      start_pvp_match: { Args: { _room_id: string }; Returns: Json }
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
      sync_multiplayer_room_ready_state: {
        Args: { _room_id: string }
        Returns: Database["public"]["Enums"]["pvp_room_status"]
      }
      sync_pvp_room_ready_state: {
        Args: { _room_id: string }
        Returns: Database["public"]["Enums"]["pvp_room_status"]
      }
    }
    Enums: {
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
      app_role: "user" | "creator" | "admin" | "super_admin"
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
    Enums: {
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
      app_role: ["user", "creator", "admin", "super_admin"],
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
