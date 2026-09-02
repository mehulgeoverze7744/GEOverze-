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
      profiles: {
        Row: {
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
      quiz_attempts: {
        Row: {
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
      compute_credit_expires_at: {
        Args: { _earned_at: string; _plan_tier: string }
        Returns: string
      }
      get_my_plan_tier: { Args: never; Returns: Json }
      get_user_plan_tier: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id?: string }; Returns: boolean }
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
      record_library_view: { Args: { _resource_id: string }; Returns: Json }
      record_quiz_attempt: {
        Args: {
          _best_streak: number
          _correct: number
          _duration_ms: number
          _mode: string
          _quiz_id: string
          _score: number
          _total: number
        }
        Returns: Json
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
    }
    Enums: {
      app_role: "user" | "creator" | "admin" | "super_admin"
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
      question_type:
        | "single"
        | "multiple"
        | "boolean"
        | "image"
        | "map"
        | "typed"
        | "order"
        | "dragdrop"
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
    },
  },
} as const
