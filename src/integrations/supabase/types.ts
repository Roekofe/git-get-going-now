export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cost_parameters: {
        Row: {
          created_at: string
          effective_date: string
          id: string
          parameter_name: string
          parameter_unit: string | null
          parameter_value: number
        }
        Insert: {
          created_at?: string
          effective_date?: string
          id?: string
          parameter_name: string
          parameter_unit?: string | null
          parameter_value: number
        }
        Update: {
          created_at?: string
          effective_date?: string
          id?: string
          parameter_name?: string
          parameter_unit?: string | null
          parameter_value?: number
        }
        Relationships: []
      }
      dispensaries: {
        Row: {
          Confidence_Score: string | null
          created_at: string
          Hoodie_ID: string | null
          Hoodie_License: string | null
          id: string
          Is_Verified: string | null
          Match_Type: string | null
          OLCC_Business_Name: string | null
          Survey_Display_Name: string | null
          Verification_Notes: string | null
          Verified_License: string | null
        }
        Insert: {
          Confidence_Score?: string | null
          created_at?: string
          Hoodie_ID?: string | null
          Hoodie_License?: string | null
          id?: string
          Is_Verified?: string | null
          Match_Type?: string | null
          OLCC_Business_Name?: string | null
          Survey_Display_Name?: string | null
          Verification_Notes?: string | null
          Verified_License?: string | null
        }
        Update: {
          Confidence_Score?: string | null
          created_at?: string
          Hoodie_ID?: string | null
          Hoodie_License?: string | null
          id?: string
          Is_Verified?: string | null
          Match_Type?: string | null
          OLCC_Business_Name?: string | null
          Survey_Display_Name?: string | null
          Verification_Notes?: string | null
          Verified_License?: string | null
        }
        Relationships: []
      }
      target_dispensaries: {
        Row: {
          banner: string | null
          converted: boolean | null
          created_at: string
          custom_cadence_days: number | null
          dispensary_name: string
          first_order_month: string | null
          id: string
          is_vip: boolean | null
          last_visit_date: string | null
          match_confidence: number | null
          matched_dispensary_id: string | null
          next_due_date: string | null
          percent_change_ytd: number | null
          priority_score: number | null
          report_month: string
          sales_apr: number | null
          sales_feb: number | null
          sales_jan: number | null
          sales_mar: number | null
          sales_may: number | null
          smokiez_sales_ytd: number | null
          smokiez_share_percent: number | null
          state: string
          target_rationale: string | null
          target_tier: string | null
          total_sales_ytd: number | null
          trend_classification: string | null
          updated_at: string
          visit_notes: string | null
        }
        Insert: {
          banner?: string | null
          converted?: boolean | null
          created_at?: string
          custom_cadence_days?: number | null
          dispensary_name: string
          first_order_month?: string | null
          id?: string
          is_vip?: boolean | null
          last_visit_date?: string | null
          match_confidence?: number | null
          matched_dispensary_id?: string | null
          next_due_date?: string | null
          percent_change_ytd?: number | null
          priority_score?: number | null
          report_month: string
          sales_apr?: number | null
          sales_feb?: number | null
          sales_jan?: number | null
          sales_mar?: number | null
          sales_may?: number | null
          smokiez_sales_ytd?: number | null
          smokiez_share_percent?: number | null
          state: string
          target_rationale?: string | null
          target_tier?: string | null
          total_sales_ytd?: number | null
          trend_classification?: string | null
          updated_at?: string
          visit_notes?: string | null
        }
        Update: {
          banner?: string | null
          converted?: boolean | null
          created_at?: string
          custom_cadence_days?: number | null
          dispensary_name?: string
          first_order_month?: string | null
          id?: string
          is_vip?: boolean | null
          last_visit_date?: string | null
          match_confidence?: number | null
          matched_dispensary_id?: string | null
          next_due_date?: string | null
          percent_change_ytd?: number | null
          priority_score?: number | null
          report_month?: string
          sales_apr?: number | null
          sales_feb?: number | null
          sales_jan?: number | null
          sales_mar?: number | null
          sales_may?: number | null
          smokiez_sales_ytd?: number | null
          smokiez_share_percent?: number | null
          state?: string
          target_rationale?: string | null
          target_tier?: string | null
          total_sales_ytd?: number | null
          trend_classification?: string | null
          updated_at?: string
          visit_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "target_dispensaries_matched_dispensary_id_fkey"
            columns: ["matched_dispensary_id"]
            isOneToOne: false
            referencedRelation: "available_targets"
            referencedColumns: ["dispensary_id"]
          },
          {
            foreignKeyName: "target_dispensaries_matched_dispensary_id_fkey"
            columns: ["matched_dispensary_id"]
            isOneToOne: false
            referencedRelation: "dispensaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "target_dispensaries_matched_dispensary_id_fkey"
            columns: ["matched_dispensary_id"]
            isOneToOne: false
            referencedRelation: "due_targets"
            referencedColumns: ["dispensary_id"]
          },
        ]
      }
      users: {
        Row: {
          active: boolean | null
          created_at: string
          email: string
          hourly_rate: number | null
          id: string
          name: string | null
          rate_effective_date: string | null
          role: string | null
          territory: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          email: string
          hourly_rate?: number | null
          id?: string
          name?: string | null
          rate_effective_date?: string | null
          role?: string | null
          territory?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          email?: string
          hourly_rate?: number | null
          id?: string
          name?: string | null
          rate_effective_date?: string | null
          role?: string | null
          territory?: string | null
        }
        Relationships: []
      }
      visit_cadence_settings: {
        Row: {
          created_at: string
          default_cadence_days: number
          description: string | null
          id: string
          target_tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_cadence_days: number
          description?: string | null
          id?: string
          target_tier: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_cadence_days?: number
          description?: string | null
          id?: string
          target_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          actual_date: string | null
          actual_drive_distance: number | null
          actual_fuel_cost: number | null
          actual_hours_driving: number | null
          actual_hours_onsite: number | null
          actual_samples_quantity: number | null
          actual_samples_value: number | null
          actual_total_cost: number | null
          analysis_status: string | null
          cost_variance_percent: number | null
          created_at: string
          dispensary_id: string
          distance_variance_percent: number | null
          estimated_cost: number | null
          id: string
          meals_cost: number | null
          misc_costs: number | null
          notes: string | null
          planned_date: string | null
          planned_drive_distance: number | null
          planned_fuel_cost: number | null
          planned_hours_driving: number | null
          planned_hours_onsite: number | null
          planned_samples_quantity: number | null
          planned_samples_value: number | null
          planned_total_cost: number | null
          rep_email: string
          samples_given: string | null
          swag_cost: number | null
          target_dispensary_id: string | null
          target_objective: string | null
          time_variance_percent: number | null
          visit_purpose: string | null
          visit_status: string | null
          visit_timestamp: string
        }
        Insert: {
          actual_date?: string | null
          actual_drive_distance?: number | null
          actual_fuel_cost?: number | null
          actual_hours_driving?: number | null
          actual_hours_onsite?: number | null
          actual_samples_quantity?: number | null
          actual_samples_value?: number | null
          actual_total_cost?: number | null
          analysis_status?: string | null
          cost_variance_percent?: number | null
          created_at?: string
          dispensary_id: string
          distance_variance_percent?: number | null
          estimated_cost?: number | null
          id?: string
          meals_cost?: number | null
          misc_costs?: number | null
          notes?: string | null
          planned_date?: string | null
          planned_drive_distance?: number | null
          planned_fuel_cost?: number | null
          planned_hours_driving?: number | null
          planned_hours_onsite?: number | null
          planned_samples_quantity?: number | null
          planned_samples_value?: number | null
          planned_total_cost?: number | null
          rep_email: string
          samples_given?: string | null
          swag_cost?: number | null
          target_dispensary_id?: string | null
          target_objective?: string | null
          time_variance_percent?: number | null
          visit_purpose?: string | null
          visit_status?: string | null
          visit_timestamp: string
        }
        Update: {
          actual_date?: string | null
          actual_drive_distance?: number | null
          actual_fuel_cost?: number | null
          actual_hours_driving?: number | null
          actual_hours_onsite?: number | null
          actual_samples_quantity?: number | null
          actual_samples_value?: number | null
          actual_total_cost?: number | null
          analysis_status?: string | null
          cost_variance_percent?: number | null
          created_at?: string
          dispensary_id?: string
          distance_variance_percent?: number | null
          estimated_cost?: number | null
          id?: string
          meals_cost?: number | null
          misc_costs?: number | null
          notes?: string | null
          planned_date?: string | null
          planned_drive_distance?: number | null
          planned_fuel_cost?: number | null
          planned_hours_driving?: number | null
          planned_hours_onsite?: number | null
          planned_samples_quantity?: number | null
          planned_samples_value?: number | null
          planned_total_cost?: number | null
          rep_email?: string
          samples_given?: string | null
          swag_cost?: number | null
          target_dispensary_id?: string | null
          target_objective?: string | null
          time_variance_percent?: number | null
          visit_purpose?: string | null
          visit_status?: string | null
          visit_timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_dispensary_id_fkey"
            columns: ["dispensary_id"]
            isOneToOne: false
            referencedRelation: "available_targets"
            referencedColumns: ["dispensary_id"]
          },
          {
            foreignKeyName: "visits_dispensary_id_fkey"
            columns: ["dispensary_id"]
            isOneToOne: false
            referencedRelation: "dispensaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_dispensary_id_fkey"
            columns: ["dispensary_id"]
            isOneToOne: false
            referencedRelation: "due_targets"
            referencedColumns: ["dispensary_id"]
          },
          {
            foreignKeyName: "visits_target_dispensary_id_fkey"
            columns: ["target_dispensary_id"]
            isOneToOne: false
            referencedRelation: "available_targets"
            referencedColumns: ["target_id"]
          },
          {
            foreignKeyName: "visits_target_dispensary_id_fkey"
            columns: ["target_dispensary_id"]
            isOneToOne: false
            referencedRelation: "due_targets"
            referencedColumns: ["target_id"]
          },
          {
            foreignKeyName: "visits_target_dispensary_id_fkey"
            columns: ["target_dispensary_id"]
            isOneToOne: false
            referencedRelation: "target_dispensaries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      available_targets: {
        Row: {
          banner: string | null
          cadence_status: string | null
          converted: boolean | null
          custom_cadence_days: number | null
          days_until_due: number | null
          default_cadence_days: number | null
          dispensary_id: string | null
          dispensary_name: string | null
          effective_cadence_days: number | null
          hoodie_id: string | null
          is_vip: boolean | null
          last_visit_date: string | null
          match_confidence: number | null
          next_due_date: string | null
          percent_change_ytd: number | null
          priority_score: number | null
          smokiez_share_percent: number | null
          survey_name: string | null
          target_id: string | null
          target_rationale: string | null
          target_tier: string | null
          total_sales_ytd: number | null
          trend_classification: string | null
          verified_license: string | null
          visit_notes: string | null
          visit_status: string | null
        }
        Relationships: []
      }
      due_targets: {
        Row: {
          banner: string | null
          cadence_status: string | null
          converted: boolean | null
          custom_cadence_days: number | null
          days_until_due: number | null
          default_cadence_days: number | null
          dispensary_id: string | null
          dispensary_name: string | null
          effective_cadence_days: number | null
          hoodie_id: string | null
          is_vip: boolean | null
          last_visit_date: string | null
          match_confidence: number | null
          next_due_date: string | null
          percent_change_ytd: number | null
          priority_score: number | null
          smokiez_share_percent: number | null
          survey_name: string | null
          target_id: string | null
          target_rationale: string | null
          target_tier: string | null
          total_sales_ytd: number | null
          trend_classification: string | null
          verified_license: string | null
          visit_notes: string | null
          visit_status: string | null
        }
        Relationships: []
      }
      unmatched_targets: {
        Row: {
          banner: string | null
          dispensary_name: string | null
          priority_score: number | null
          target_rationale: string | null
          target_tier: string | null
          total_sales_ytd: number | null
          trend_classification: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_name_similarity: {
        Args: { name1: string; name2: string }
        Returns: number
      }
      calculate_next_due_date: {
        Args: {
          p_target_tier: string
          p_custom_cadence_days: number
          p_last_visit_date: string
        }
        Returns: string
      }
      calculate_priority_score: {
        Args: {
          p_is_vip: boolean
          p_state: string
          p_converted: boolean
          p_smokiez_share_percent: number
          p_trend_classification: string
          p_total_sales_ytd: number
        }
        Returns: number
      }
      get_target_tier: {
        Args: {
          p_is_vip: boolean
          p_state: string
          p_converted: boolean
          p_trend_classification: string
        }
        Returns: string
      }
      match_target_dispensaries: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      update_all_next_due_dates: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
