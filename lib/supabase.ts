import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          url: string;
          description?: string;
          folder_id?: string;
          tags: string[];
          thumbnail_url?: string;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          url: string;
          description?: string;
          folder_id?: string;
          tags?: string[];
          thumbnail_url?: string;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          url?: string;
          description?: string;
          folder_id?: string;
          tags?: string[];
          thumbnail_url?: string;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
          sort_order?: number;
        };
      };
      folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          parent_folder_id?: string;
          icon?: string;
          color?: string;
          created_at: string;
          updated_at: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          parent_folder_id?: string;
          icon?: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          parent_folder_id?: string;
          icon?: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
          sort_order?: number;
        };
      };
      classification_rules: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          match_field: "url" | "title" | "domain";
          match_type: "contains" | "starts_with" | "ends_with" | "regex";
          keyword: string;
          target_folder_id: string;
          priority: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          match_field: "url" | "title" | "domain";
          match_type: "contains" | "starts_with" | "ends_with" | "regex";
          keyword: string;
          target_folder_id: string;
          priority?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          match_field?: "url" | "title" | "domain";
          match_type?: "contains" | "starts_with" | "ends_with" | "regex";
          keyword?: string;
          target_folder_id?: string;
          priority?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
