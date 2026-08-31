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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id?: string }; Returns: boolean }
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
      set_age_bracket: { Args: { _bracket: string }; Returns: undefined }
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
