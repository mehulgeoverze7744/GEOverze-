export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      credit_transactions: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          month_key: string;
          opponent_user_id: string;
          room_id: string;
          user_id: string;
          win_tier: number;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          month_key: string;
          opponent_user_id: string;
          room_id: string;
          user_id: string;
          win_tier: number;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          month_key?: string;
          opponent_user_id?: string;
          room_id?: string;
          user_id?: string;
          win_tier?: number;
        };
        Relationships: [
          {
            foreignKeyName: "credit_transactions_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: true;
            referencedRelation: "pvp_rooms";
            referencedColumns: ["id"];
          },
        ];
      };
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
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_questions: {
        Row: {
          accepted: string[] | null;
          answer_bool: boolean | null;
          answer_id: string | null;
          answer_ids: string[] | null;
          board_art: string | null;
          explanation: string | null;
          id: string;
          items: string[] | null;
          media: Json | null;
          options: Json | null;
          placeholder: string | null;
          position: number;
          prompt: string;
          quiz_id: string;
          regions: Json | null;
          targets: string[] | null;
          type: Database["public"]["Enums"]["question_type"];
        };
        Insert: {
          accepted?: string[] | null;
          answer_bool?: boolean | null;
          answer_id?: string | null;
          answer_ids?: string[] | null;
          board_art?: string | null;
          explanation?: string | null;
          id?: string;
          items?: string[] | null;
          media?: Json | null;
          options?: Json | null;
          placeholder?: string | null;
          position: number;
          prompt: string;
          quiz_id: string;
          regions?: Json | null;
          targets?: string[] | null;
          type: Database["public"]["Enums"]["question_type"];
        };
        Update: {
          accepted?: string[] | null;
          answer_bool?: boolean | null;
          answer_id?: string | null;
          answer_ids?: string[] | null;
          board_art?: string | null;
          explanation?: string | null;
          id?: string;
          items?: string[] | null;
          media?: Json | null;
          options?: Json | null;
          placeholder?: string | null;
          position?: number;
          prompt?: string;
          quiz_id?: string;
          regions?: Json | null;
          targets?: string[] | null;
          type?: Database["public"]["Enums"]["question_type"];
        };
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
        ];
      };
      quizzes: {
        Row: {
          art: string;
          category_id: string;
          created_at: string;
          creator: string;
          description: string | null;
          difficulty: string;
          id: string;
          is_published: boolean;
          language: string;
          minutes: number;
          reward_credits: number;
          reward_xp: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          art: string;
          category_id: string;
          created_at?: string;
          creator: string;
          description?: string | null;
          difficulty: string;
          id: string;
          is_published?: boolean;
          language?: string;
          minutes?: number;
          reward_credits?: number;
          reward_xp?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          art?: string;
          category_id?: string;
          created_at?: string;
          creator?: string;
          description?: string | null;
          difficulty?: string;
          id?: string;
          is_published?: boolean;
          language?: string;
          minutes?: number;
          reward_credits?: number;
          reward_xp?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_progression: {
        Row: {
          credits: number;
          credits_month_key: string | null;
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
      pvp_participants: {
        Row: {
          attempt_id: string | null;
          best_streak: number | null;
          correct: number | null;
          credits_earned: number | null;
          duration_ms: number | null;
          id: string;
          is_ready: boolean;
          joined_at: string;
          ready_at: string | null;
          room_id: string;
          score: number | null;
          submitted_at: string | null;
          total: number | null;
          user_id: string;
          xp_earned: number | null;
        };
        Insert: {
          id?: string;
          is_ready?: boolean;
          joined_at?: string;
          ready_at?: string | null;
          room_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          is_ready?: boolean;
          joined_at?: string;
          ready_at?: string | null;
          room_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pvp_participants_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "pvp_rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      pvp_rooms: {
        Row: {
          completed_at: string | null;
          created_at: string;
          host_user_id: string;
          id: string;
          max_players: number;
          quiz_id: string;
          rewards_settled_at: string | null;
          room_code: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["pvp_room_status"];
          winner_user_id: string | null;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          host_user_id: string;
          id?: string;
          max_players?: number;
          quiz_id: string;
          room_code: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["pvp_room_status"];
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          host_user_id?: string;
          id?: string;
          max_players?: number;
          quiz_id?: string;
          room_code?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["pvp_room_status"];
        };
        Relationships: [
          {
            foreignKeyName: "pvp_rooms_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      build_pvp_room_state: {
        Args: { _room_id: string };
        Returns: Json;
      };
      create_pvp_room: {
        Args: { _quiz_id: string };
        Returns: Json;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: { _user_id?: string }; Returns: boolean };
      join_pvp_room: {
        Args: { _room_code: string };
        Returns: Json;
      };
      leave_pvp_room: {
        Args: { _room_id: string };
        Returns: Json;
      };
      set_pvp_ready: {
        Args: { _ready: boolean; _room_id: string };
        Returns: Json;
      };
      start_pvp_match: {
        Args: { _room_id: string };
        Returns: Json;
      };
      submit_pvp_attempt: {
        Args: {
          _answers: Json;
          _attempt_id: string;
          _duration_ms: number;
          _room_id: string;
        };
        Returns: Json;
      };
      submit_quiz_attempt: {
        Args: {
          _answers: Json;
          _attempt_id: string;
          _duration_ms: number;
          _mode: string;
          _quiz_id: string;
        };
        Returns: Json;
      };
      set_age_bracket: { Args: { _bracket: string }; Returns: undefined };
    };
    Enums: {
      app_role: "user" | "creator" | "admin" | "super_admin";
      pvp_room_status: "waiting" | "ready" | "playing" | "completed" | "cancelled";
      question_type:
        | "single"
        | "multiple"
        | "boolean"
        | "image"
        | "map"
        | "typed"
        | "order"
        | "dragdrop";
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
    | keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
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
    | keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
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
    | keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
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
    | keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
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
} as const;
