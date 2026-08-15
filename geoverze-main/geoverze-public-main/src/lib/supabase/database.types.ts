export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      profile_preferences: {
        Row: {
          interests: string[];
          locale: string;
          motion_pref: string;
          skill_level: string | null;
          toggles: Json;
          units_pref: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          interests?: string[];
          locale?: string;
          motion_pref?: string;
          skill_level?: string | null;
          toggles?: Json;
          units_pref?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          interests?: string[];
          locale?: string;
          motion_pref?: string;
          skill_level?: string | null;
          toggles?: Json;
          units_pref?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          age_bracket: string;
          avatar_id: string | null;
          avatar_url: string | null;
          bio: string | null;
          country_code: string | null;
          created_at: string;
          date_of_birth: string | null;
          display_name: string | null;
          id: string;
          status: string;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          age_bracket?: string;
          avatar_id?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          country_code?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          display_name?: string | null;
          id: string;
          status?: string;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          age_bracket?: string;
          avatar_id?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          country_code?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          display_name?: string | null;
          id?: string;
          status?: string;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          attempt_id: string;
          best_streak: number;
          completed_at: string;
          correct: number;
          credits_earned: number;
          duration_ms: number;
          id: string;
          mode: string;
          quiz_id: string;
          score: number;
          total: number;
          user_id: string;
          xp_earned: number;
        };
        Insert: {
          attempt_id?: string;
          best_streak?: number;
          completed_at?: string;
          correct: number;
          credits_earned?: number;
          duration_ms: number;
          id?: string;
          mode: string;
          quiz_id: string;
          score: number;
          total: number;
          user_id: string;
          xp_earned?: number;
        };
        Update: {
          attempt_id?: string;
          best_streak?: number;
          completed_at?: string;
          correct?: number;
          credits_earned?: number;
          duration_ms?: number;
          id?: string;
          mode?: string;
          quiz_id?: string;
          score?: number;
          total?: number;
          user_id?: string;
          xp_earned?: number;
        };
        Relationships: [];
      };
      user_progression: {
        Row: {
          credits: number;
          current_streak: number;
          last_played_date: string | null;
          level: number;
          longest_streak: number;
          total_answered: number;
          total_correct: number;
          total_quizzes: number;
          updated_at: string;
          user_id: string;
          xp: number;
        };
        Insert: {
          credits?: number;
          current_streak?: number;
          last_played_date?: string | null;
          level?: number;
          longest_streak?: number;
          total_answered?: number;
          total_correct?: number;
          total_quizzes?: number;
          updated_at?: string;
          user_id: string;
          xp?: number;
        };
        Update: {
          credits?: number;
          current_streak?: number;
          last_played_date?: string | null;
          level?: number;
          longest_streak?: number;
          total_answered?: number;
          total_correct?: number;
          total_quizzes?: number;
          updated_at?: string;
          user_id?: string;
          xp?: number;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: { _user_id?: string }; Returns: boolean };
      record_quiz_attempt: {
        Args: {
          _attempt_id: string;
          _best_streak: number;
          _correct: number;
          _duration_ms: number;
          _mode: string;
          _quiz_id: string;
          _score: number;
          _total: number;
        };
        Returns: Json;
      };
      set_age_bracket: { Args: { _bracket: string }; Returns: undefined };
    };
    Enums: {
      app_role: "user" | "creator" | "admin" | "super_admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "creator", "admin", "super_admin"],
    },
  },
} as const;
