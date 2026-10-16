// Generated from the Supabase schema (supabase/migrations). Regenerate after schema changes.

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      ngo_private: {
        Row: {
          contact_person: string | null;
          contact_person_phone: string | null;
          data_received_on: string | null;
          internal_notes: string | null;
          ngo_id: string;
        };
        Insert: {
          contact_person?: string | null;
          contact_person_phone?: string | null;
          data_received_on?: string | null;
          internal_notes?: string | null;
          ngo_id: string;
        };
        Update: {
          contact_person?: string | null;
          contact_person_phone?: string | null;
          data_received_on?: string | null;
          internal_notes?: string | null;
          ngo_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ngo_private_ngo_id_fkey";
            columns: ["ngo_id"];
            isOneToOne: true;
            referencedRelation: "ngos";
            referencedColumns: ["id"];
          },
        ];
      };
      ngos: {
        Row: {
          activities: string[];
          address: string | null;
          area: string | null;
          causes: string[];
          cover_url: string | null;
          created_at: string;
          description: string;
          donation_link: string | null;
          email: string | null;
          facebook: string | null;
          founded_year: number | null;
          gallery_urls: string[];
          help_notes: string | null;
          help_types: string[];
          id: string;
          instagram: string | null;
          is_featured: boolean;
          is_sample: boolean;
          languages: string[];
          lat: number | null;
          linkedin: string | null;
          lng: number | null;
          logo_url: string | null;
          maps_url: string | null;
          name: string;
          phone: string | null;
          published_at: string | null;
          registration_number: string | null;
          registration_type: string | null;
          slug: string;
          status: string;
          tagline: string | null;
          updated_at: string;
          visiting_hours: string | null;
          website: string | null;
          whatsapp: string | null;
          youtube: string | null;
        };
        Insert: {
          activities?: string[];
          address?: string | null;
          area?: string | null;
          causes?: string[];
          cover_url?: string | null;
          created_at?: string;
          description?: string;
          donation_link?: string | null;
          email?: string | null;
          facebook?: string | null;
          founded_year?: number | null;
          gallery_urls?: string[];
          help_notes?: string | null;
          help_types?: string[];
          id?: string;
          instagram?: string | null;
          is_featured?: boolean;
          is_sample?: boolean;
          languages?: string[];
          lat?: number | null;
          linkedin?: string | null;
          lng?: number | null;
          logo_url?: string | null;
          maps_url?: string | null;
          name: string;
          phone?: string | null;
          published_at?: string | null;
          registration_number?: string | null;
          registration_type?: string | null;
          slug: string;
          status?: string;
          tagline?: string | null;
          updated_at?: string;
          visiting_hours?: string | null;
          website?: string | null;
          whatsapp?: string | null;
          youtube?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ngos"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type NgoRow = Database["public"]["Tables"]["ngos"]["Row"];
export type NgoPrivateRow = Database["public"]["Tables"]["ngo_private"]["Row"];
