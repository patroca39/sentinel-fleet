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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      drivers: {
        Row: {
          assigned_vehicle_id: number | null
          created_at: string | null
          driver_name: string
          id: number
          is_active: boolean | null
          operator_id: string
          phone_number: string | null
          telegram_id: string
        }
        Insert: {
          assigned_vehicle_id?: number | null
          created_at?: string | null
          driver_name: string
          id?: number
          is_active?: boolean | null
          operator_id: string
          phone_number?: string | null
          telegram_id: string
        }
        Update: {
          assigned_vehicle_id?: number | null
          created_at?: string | null
          driver_name?: string
          id?: number
          is_active?: boolean | null
          operator_id?: string
          phone_number?: string | null
          telegram_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_specs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_driver_vehicle"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_specs"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_anomalies: {
        Row: {
          alert_reason: string | null
          alert_type: string
          created_at: string | null
          details: string | null
          driver_id: string
          efficiency_drop: number | null
          estimated_loss: number | null
          id: number
          is_resolved: boolean | null
          log_id: number | null
          operator_id: string
          resolved_at: string | null
          vehicle_id: number
        }
        Insert: {
          alert_reason?: string | null
          alert_type: string
          created_at?: string | null
          details?: string | null
          driver_id: string
          efficiency_drop?: number | null
          estimated_loss?: number | null
          id?: number
          is_resolved?: boolean | null
          log_id?: number | null
          operator_id: string
          resolved_at?: string | null
          vehicle_id: number
        }
        Update: {
          alert_reason?: string | null
          alert_type?: string
          created_at?: string | null
          details?: string | null
          driver_id?: string
          efficiency_drop?: number | null
          estimated_loss?: number | null
          id?: number
          is_resolved?: boolean | null
          log_id?: number | null
          operator_id?: string
          resolved_at?: string | null
          vehicle_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fleet_anomalies_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleet_anomalies_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_specs"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_market_rates: {
        Row: {
          created_at: string | null
          effective_timestamp: string
          fuel_type: string
          id: number
          price_per_liter: number
          region: string
        }
        Insert: {
          created_at?: string | null
          effective_timestamp: string
          fuel_type: string
          id?: number
          price_per_liter: number
          region: string
        }
        Update: {
          created_at?: string | null
          effective_timestamp?: string
          fuel_type?: string
          id?: number
          price_per_liter?: number
          region?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          cost: number | null
          created_at: string | null
          driver_id: string
          driver_name: string
          efficiency: number | null
          fuel_liters: number | null
          id: number
          odometer: number | null
          operator_id: string | null
          receipt_id: string | null
          vehicle: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          driver_id: string
          driver_name: string
          efficiency?: number | null
          fuel_liters?: number | null
          id?: number
          odometer?: number | null
          operator_id?: string | null
          receipt_id?: string | null
          vehicle?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          driver_id?: string
          driver_name?: string
          efficiency?: number | null
          fuel_liters?: number | null
          id?: number
          odometer?: number | null
          operator_id?: string | null
          receipt_id?: string | null
          vehicle?: string | null
        }
        Relationships: []
      }
      maintenance_logs: {
        Row: {
          cost_breakdown: Json | null
          created_at: string | null
          driver_id: number | null
          id: number
          odometer_at_service: number
          operator_id: string | null
          receipt_id: string | null
          receipt_image_url: string | null
          service_date: string
          service_notes: string | null
          service_type: string | null
          services_performed: string | null
          shop_location: string | null
          shop_name: string | null
          total_cost: number
          vehicle_id: number | null
        }
        Insert: {
          cost_breakdown?: Json | null
          created_at?: string | null
          driver_id?: number | null
          id?: number
          odometer_at_service: number
          operator_id?: string | null
          receipt_id?: string | null
          receipt_image_url?: string | null
          service_date: string
          service_notes?: string | null
          service_type?: string | null
          services_performed?: string | null
          shop_location?: string | null
          shop_name?: string | null
          total_cost: number
          vehicle_id?: number | null
        }
        Update: {
          cost_breakdown?: Json | null
          created_at?: string | null
          driver_id?: number | null
          id?: number
          odometer_at_service?: number
          operator_id?: string | null
          receipt_id?: string | null
          receipt_image_url?: string | null
          service_date?: string
          service_notes?: string | null
          service_type?: string | null
          services_performed?: string | null
          shop_location?: string | null
          shop_name?: string | null
          total_cost?: number
          vehicle_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_maintenance_vehicle"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_specs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_specs"
            referencedColumns: ["id"]
          },
        ]
      }
      node_revocation_logs: {
        Row: {
          driver_name: string | null
          id: number
          revocation_reason: string | null
          revoked_at: string | null
          telegram_id: string | null
        }
        Insert: {
          driver_name?: string | null
          id?: number
          revocation_reason?: string | null
          revoked_at?: string | null
          telegram_id?: string | null
        }
        Update: {
          driver_name?: string | null
          id?: number
          revocation_reason?: string | null
          revoked_at?: string | null
          telegram_id?: string | null
        }
        Relationships: []
      }
      operator_profiles: {
        Row: {
          allowed_fleet_size: number | null
          company_name: string
          contact_number: string | null
          contact_person: string | null
          created_at: string | null
          id: string
          subscription_tier: string | null
        }
        Insert: {
          allowed_fleet_size?: number | null
          company_name: string
          contact_number?: string | null
          contact_person?: string | null
          created_at?: string | null
          id: string
          subscription_tier?: string | null
        }
        Update: {
          allowed_fleet_size?: number | null
          company_name?: string
          contact_number?: string | null
          contact_person?: string | null
          created_at?: string | null
          id?: string
          subscription_tier?: string | null
        }
        Relationships: []
      }
      vehicle_specs: {
        Row: {
          adjusted_km_per_liter: number | null
          base_target_km_per_liter: number | null
          current_odo: number | null
          efficiency_limit: number | null
          expected_route_km: number | null
          fuel_type: string
          gross_vehicle_weight_kg: number | null
          id: number
          last_spec_update: string | null
          lifetime_baseline_kml: number | null
          maintenance_interval_km: number | null
          maintenance_interval_months: number | null
          model_name: string
          next_pms: number | null
          operator_id: string
          passenger_capacity: number | null
          plate_number: string | null
          recommended_oil_type: string | null
          route_tolerance_percent: number | null
          sanity_floor_kml: number | null
          standard_tire_pressure_psi: number | null
          tank_capacity_liters: number | null
          vehicle_type: string
        }
        Insert: {
          adjusted_km_per_liter?: number | null
          base_target_km_per_liter?: number | null
          current_odo?: number | null
          efficiency_limit?: number | null
          expected_route_km?: number | null
          fuel_type: string
          gross_vehicle_weight_kg?: number | null
          id?: number
          last_spec_update?: string | null
          lifetime_baseline_kml?: number | null
          maintenance_interval_km?: number | null
          maintenance_interval_months?: number | null
          model_name: string
          next_pms?: number | null
          operator_id: string
          passenger_capacity?: number | null
          plate_number?: string | null
          recommended_oil_type?: string | null
          route_tolerance_percent?: number | null
          sanity_floor_kml?: number | null
          standard_tire_pressure_psi?: number | null
          tank_capacity_liters?: number | null
          vehicle_type: string
        }
        Update: {
          adjusted_km_per_liter?: number | null
          base_target_km_per_liter?: number | null
          current_odo?: number | null
          efficiency_limit?: number | null
          expected_route_km?: number | null
          fuel_type?: string
          gross_vehicle_weight_kg?: number | null
          id?: number
          last_spec_update?: string | null
          lifetime_baseline_kml?: number | null
          maintenance_interval_km?: number | null
          maintenance_interval_months?: number | null
          model_name?: string
          next_pms?: number | null
          operator_id?: string
          passenger_capacity?: number | null
          plate_number?: string | null
          recommended_oil_type?: string | null
          route_tolerance_percent?: number | null
          sanity_floor_kml?: number | null
          standard_tire_pressure_psi?: number | null
          tank_capacity_liters?: number | null
          vehicle_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
