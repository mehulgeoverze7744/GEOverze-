/**
 * Generated from the Supabase project schema (Phase 2A: profiles + user_roles
 * only). Regenerate with the Supabase MCP `generate_typescript_types` tool
 * whenever the schema changes — do not hand-edit the `Database` shape.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
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
    };
    Enums: {
      app_role: "user" | "creator" | "admin" | "super_admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
