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
      car_brands: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name_ar: string
          name_en: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name_ar: string
          name_en: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name_ar?: string
          name_en?: string
          slug?: string
        }
        Relationships: []
      }
      car_content: {
        Row: {
          address: string | null
          car_id: string
          city: string | null
          color: string | null
          comfort_features: string[] | null
          cons: string[] | null
          created_at: string
          description: string | null
          entertainment_features: string[] | null
          features: string[] | null
          id: string
          ideal_for: string[] | null
          included_services: string[] | null
          interior_color: string | null
          locale: Database["public"]["Enums"]["content_locale"]
          pickup_locations: string[] | null
          pros: string[] | null
          requirements: string[] | null
          safety_features: string[] | null
          short_description: string | null
          title: string
          updated_at: string
          warranty: string | null
        }
        Insert: {
          address?: string | null
          car_id: string
          city?: string | null
          color?: string | null
          comfort_features?: string[] | null
          cons?: string[] | null
          created_at?: string
          description?: string | null
          entertainment_features?: string[] | null
          features?: string[] | null
          id?: string
          ideal_for?: string[] | null
          included_services?: string[] | null
          interior_color?: string | null
          locale: Database["public"]["Enums"]["content_locale"]
          pickup_locations?: string[] | null
          pros?: string[] | null
          requirements?: string[] | null
          safety_features?: string[] | null
          short_description?: string | null
          title: string
          updated_at?: string
          warranty?: string | null
        }
        Update: {
          address?: string | null
          car_id?: string
          city?: string | null
          color?: string | null
          comfort_features?: string[] | null
          cons?: string[] | null
          created_at?: string
          description?: string | null
          entertainment_features?: string[] | null
          features?: string[] | null
          id?: string
          ideal_for?: string[] | null
          included_services?: string[] | null
          interior_color?: string | null
          locale?: Database["public"]["Enums"]["content_locale"]
          pickup_locations?: string[] | null
          pros?: string[] | null
          requirements?: string[] | null
          safety_features?: string[] | null
          short_description?: string | null
          title?: string
          updated_at?: string
          warranty?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_content_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          acceleration: string | null
          accident_free: boolean | null
          address: string | null
          available: boolean
          brand: string
          brand_slug: string | null
          category: Database["public"]["Enums"]["car_category"]
          city: string
          class: Database["public"]["Enums"]["car_class"]
          color: string | null
          condition: Database["public"]["Enums"]["car_condition"]
          country: string
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          cylinders: number | null
          delivery_available: boolean | null
          doors: number
          down_payment: number | null
          drivetrain: Database["public"]["Enums"]["drivetrain"] | null
          electric_range: number | null
          engine: string | null
          financing_available: boolean | null
          fuel_city: number | null
          fuel_combined: number | null
          fuel_highway: number | null
          fuel_per_20km: number | null
          fuel_tank_capacity: number | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          horsepower: number | null
          id: string
          images: string[] | null
          insurance: string | null
          interior_color: string | null
          is_best_seller: boolean | null
          is_featured: boolean | null
          is_financeable: boolean
          is_hero: boolean | null
          is_new_arrival: boolean | null
          is_popular: boolean | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          mileage: number
          mileage_limit: number | null
          min_rental_days: number | null
          model: string
          monthly_installment: number | null
          negotiable: boolean | null
          owners_count: number | null
          pickup_locations: string[] | null
          price_daily: number | null
          price_hourly: number | null
          price_monthly: number | null
          price_old: number | null
          price_total: number | null
          price_weekly: number | null
          rating: number | null
          reviews_count: number | null
          seats: number
          security_deposit: number | null
          service_history: boolean | null
          slug: string
          status: string
          tenant_id: string
          thumbnail: string | null
          top_speed: number | null
          torque: number | null
          transmission: Database["public"]["Enums"]["transmission"]
          trim: string | null
          updated_at: string
          year: number
        }
        Insert: {
          acceleration?: string | null
          accident_free?: boolean | null
          address?: string | null
          available?: boolean
          brand: string
          brand_slug?: string | null
          category: Database["public"]["Enums"]["car_category"]
          city: string
          class: Database["public"]["Enums"]["car_class"]
          color?: string | null
          condition: Database["public"]["Enums"]["car_condition"]
          country: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          cylinders?: number | null
          delivery_available?: boolean | null
          doors: number
          down_payment?: number | null
          drivetrain?: Database["public"]["Enums"]["drivetrain"] | null
          electric_range?: number | null
          engine?: string | null
          financing_available?: boolean | null
          fuel_city?: number | null
          fuel_combined?: number | null
          fuel_highway?: number | null
          fuel_per_20km?: number | null
          fuel_tank_capacity?: number | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          horsepower?: number | null
          id?: string
          images?: string[] | null
          insurance?: string | null
          interior_color?: string | null
          is_best_seller?: boolean | null
          is_featured?: boolean | null
          is_financeable?: boolean
          is_hero?: boolean | null
          is_new_arrival?: boolean | null
          is_popular?: boolean | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          mileage?: number
          mileage_limit?: number | null
          min_rental_days?: number | null
          model: string
          monthly_installment?: number | null
          negotiable?: boolean | null
          owners_count?: number | null
          pickup_locations?: string[] | null
          price_daily?: number | null
          price_hourly?: number | null
          price_monthly?: number | null
          price_old?: number | null
          price_total?: number | null
          price_weekly?: number | null
          rating?: number | null
          reviews_count?: number | null
          seats: number
          security_deposit?: number | null
          service_history?: boolean | null
          slug: string
          status?: string
          tenant_id: string
          thumbnail?: string | null
          top_speed?: number | null
          torque?: number | null
          transmission: Database["public"]["Enums"]["transmission"]
          trim?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          acceleration?: string | null
          accident_free?: boolean | null
          address?: string | null
          available?: boolean
          brand?: string
          brand_slug?: string | null
          category?: Database["public"]["Enums"]["car_category"]
          city?: string
          class?: Database["public"]["Enums"]["car_class"]
          color?: string | null
          condition?: Database["public"]["Enums"]["car_condition"]
          country?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          cylinders?: number | null
          delivery_available?: boolean | null
          doors?: number
          down_payment?: number | null
          drivetrain?: Database["public"]["Enums"]["drivetrain"] | null
          electric_range?: number | null
          engine?: string | null
          financing_available?: boolean | null
          fuel_city?: number | null
          fuel_combined?: number | null
          fuel_highway?: number | null
          fuel_per_20km?: number | null
          fuel_tank_capacity?: number | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          horsepower?: number | null
          id?: string
          images?: string[] | null
          insurance?: string | null
          interior_color?: string | null
          is_best_seller?: boolean | null
          is_featured?: boolean | null
          is_financeable?: boolean
          is_hero?: boolean | null
          is_new_arrival?: boolean | null
          is_popular?: boolean | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          mileage?: number
          mileage_limit?: number | null
          min_rental_days?: number | null
          model?: string
          monthly_installment?: number | null
          negotiable?: boolean | null
          owners_count?: number | null
          pickup_locations?: string[] | null
          price_daily?: number | null
          price_hourly?: number | null
          price_monthly?: number | null
          price_old?: number | null
          price_total?: number | null
          price_weekly?: number | null
          rating?: number | null
          reviews_count?: number | null
          seats?: number
          security_deposit?: number | null
          service_history?: boolean | null
          slug?: string
          status?: string
          tenant_id?: string
          thumbnail?: string | null
          top_speed?: number | null
          torque?: number | null
          transmission?: Database["public"]["Enums"]["transmission"]
          trim?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cars_brand_slug_fkey"
            columns: ["brand_slug"]
            isOneToOne: false
            referencedRelation: "car_brands"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "cars_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          car_id: string | null
          created_at: string
          email: string | null
          id: string
          locale: Database["public"]["Enums"]["content_locale"] | null
          message: string | null
          name: string | null
          phone: string | null
          pickup_location: string | null
          rental_end: string | null
          rental_start: string | null
          source: string | null
          status: string | null
          tenant_id: string
          type: string
          whatsapp_opened: boolean
        }
        Insert: {
          car_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          locale?: Database["public"]["Enums"]["content_locale"] | null
          message?: string | null
          name?: string | null
          phone?: string | null
          pickup_location?: string | null
          rental_end?: string | null
          rental_start?: string | null
          source?: string | null
          status?: string | null
          tenant_id: string
          type?: string
          whatsapp_opened?: boolean
        }
        Update: {
          car_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          locale?: Database["public"]["Enums"]["content_locale"] | null
          message?: string | null
          name?: string | null
          phone?: string | null
          pickup_location?: string | null
          rental_end?: string | null
          rental_start?: string | null
          source?: string | null
          status?: string | null
          tenant_id?: string
          type?: string
          whatsapp_opened?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "leads_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_pages: {
        Row: {
          active: boolean
          content: Json | null
          created_at: string
          id: string
          slug: string
          sort_order: number | null
          tenant_id: string
          title_ar: string | null
          title_en: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          content?: Json | null
          created_at?: string
          id?: string
          slug: string
          sort_order?: number | null
          tenant_id: string
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          content?: Json | null
          created_at?: string
          id?: string
          slug?: string
          sort_order?: number | null
          tenant_id?: string
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_pages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_users: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          active: boolean
          address_ar: string | null
          address_en: string | null
          business_hours: Json | null
          color_accent: string
          color_primary: string
          color_secondary: string
          content: Json | null
          created_at: string
          domain: string | null
          email: string | null
          favicon_url: string | null
          features: Json
          id: string
          logo_url: string | null
          map_center: Json | null
          name: string
          name_ar: string | null
          og_image_url: string | null
          pages: Json | null
          phone: string | null
          plan: Database["public"]["Enums"]["tenant_plan"]
          sections: Json | null
          seo_desc_ar: string | null
          seo_desc_en: string | null
          seo_title_ar: string | null
          seo_title_en: string | null
          slug: string
          social: Json | null
          subdomain: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          active?: boolean
          address_ar?: string | null
          address_en?: string | null
          business_hours?: Json | null
          color_accent?: string
          color_primary?: string
          color_secondary?: string
          content?: Json | null
          created_at?: string
          domain?: string | null
          email?: string | null
          favicon_url?: string | null
          features?: Json
          id?: string
          logo_url?: string | null
          map_center?: Json | null
          name: string
          name_ar?: string | null
          og_image_url?: string | null
          pages?: Json | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["tenant_plan"]
          sections?: Json | null
          seo_desc_ar?: string | null
          seo_desc_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug: string
          social?: Json | null
          subdomain?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          active?: boolean
          address_ar?: string | null
          address_en?: string | null
          business_hours?: Json | null
          color_accent?: string
          color_primary?: string
          color_secondary?: string
          content?: Json | null
          created_at?: string
          domain?: string | null
          email?: string | null
          favicon_url?: string | null
          features?: Json
          id?: string
          logo_url?: string | null
          map_center?: Json | null
          name?: string
          name_ar?: string | null
          og_image_url?: string | null
          pages?: Json | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["tenant_plan"]
          sections?: Json | null
          seo_desc_ar?: string | null
          seo_desc_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug?: string
          social?: Json | null
          subdomain?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_tenant_id_by_domain: { Args: { p_domain: string }; Returns: string }
      get_tenant_id_by_slug: { Args: { p_slug: string }; Returns: string }
      mark_latest_lead_whatsapp: {
        Args: { p_phone: string; p_tenant_id: string }
        Returns: undefined
      }
      my_tenant_id: { Args: never; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      tenant_is_active: { Args: { p_tenant_id: string }; Returns: boolean }
    }
    Enums: {
      car_category:
        | "sedan"
        | "suv"
        | "coupe"
        | "hatchback"
        | "convertible"
        | "pickup"
        | "electric"
        | "sports"
        | "wagon"
        | "crossover"
        | "van"
        | "minivan"
        | "truck"
        | "mpv"
        | "supercar"
        | "roadster"
      car_class:
        | "economy"
        | "standard"
        | "premium"
        | "luxury"
        | "executive"
        | "performance"
        | "ultra-luxury"
      car_condition: "new" | "used" | "certified"
      content_locale: "ar" | "en"
      currency: "USD" | "EUR" | "AED"
      drivetrain: "FWD" | "RWD" | "AWD" | "4WD"
      fuel_type: "petrol" | "diesel" | "hybrid" | "electric" | "plug-in-hybrid"
      listing_type: "rent" | "sale" | "both"
      tenant_plan: "starter" | "pro" | "enterprise"
      transmission:
        | "automatic"
        | "manual"
        | "cvt"
        | "dual-clutch"
        | "semi-automatic"
      user_role: "owner" | "admin" | "editor"
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
      car_category: [
        "sedan",
        "suv",
        "coupe",
        "hatchback",
        "convertible",
        "pickup",
        "electric",
        "sports",
        "wagon",
        "crossover",
        "van",
        "minivan",
        "truck",
        "mpv",
        "supercar",
        "roadster",
      ],
      car_class: [
        "economy",
        "standard",
        "premium",
        "luxury",
        "executive",
        "performance",
        "ultra-luxury",
      ],
      car_condition: ["new", "used", "certified"],
      content_locale: ["ar", "en"],
      currency: ["USD", "EUR", "AED"],
      drivetrain: ["FWD", "RWD", "AWD", "4WD"],
      fuel_type: ["petrol", "diesel", "hybrid", "electric", "plug-in-hybrid"],
      listing_type: ["rent", "sale", "both"],
      tenant_plan: ["starter", "pro", "enterprise"],
      transmission: [
        "automatic",
        "manual",
        "cvt",
        "dual-clutch",
        "semi-automatic",
      ],
      user_role: ["owner", "admin", "editor"],
    },
  },
} as const
