export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      locales: {
        Row: {
          code: string;
          name: string;
          native_name: string;
          is_active: boolean | null;
          sort_order: number | null;
        };
        Insert: {
          code: string;
          name: string;
          native_name: string;
          is_active?: boolean | null;
          sort_order?: number | null;
        };
        Update: {
          code?: string;
          name?: string;
          native_name?: string;
          is_active?: boolean | null;
          sort_order?: number | null;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          domain: string;
          status: 'trial' | 'active' | 'suspended' | 'churned';
          plan_tier: 'starter' | 'professional' | 'enterprise';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          monthly_fee_per_fte: number;
          default_locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          domain: string;
          status?: 'trial' | 'active' | 'suspended' | 'churned';
          plan_tier?: 'starter' | 'professional' | 'enterprise';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          monthly_fee_per_fte?: number;
          default_locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          domain?: string;
          status?: 'trial' | 'active' | 'suspended' | 'churned';
          plan_tier?: 'starter' | 'professional' | 'enterprise';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          monthly_fee_per_fte?: number;
          default_locale?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      company_contacts: {
        Row: {
          id: string;
          company_id: string;
          email: string;
          name: string | null;
          role: 'admin' | 'hr' | 'finance';
          locale: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          email: string;
          name?: string | null;
          role?: 'admin' | 'hr' | 'finance';
          locale?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          email?: string;
          name?: string | null;
          role?: 'admin' | 'hr' | 'finance';
          locale?: string;
          created_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          company_id: string;
          email: string;
          name: string | null;
          fte_score: number;
          status: 'active' | 'inactive' | 'departed';
          locale: string;
          onboarded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          email: string;
          name?: string | null;
          fte_score?: number;
          status?: 'active' | 'inactive' | 'departed';
          locale?: string;
          onboarded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          email?: string;
          name?: string | null;
          fte_score?: number;
          status?: 'active' | 'inactive' | 'departed';
          locale?: string;
          onboarded_at?: string | null;
          created_at?: string;
        };
      };
      budget_periods: {
        Row: {
          id: string;
          company_id: string;
          period_start: string;
          period_end: string;
          status: 'open' | 'closed' | 'archived';
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          period_start: string;
          period_end: string;
          status?: 'open' | 'closed' | 'archived';
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          period_start?: string;
          period_end?: string;
          status?: 'open' | 'closed' | 'archived';
          created_at?: string;
        };
      };
      employee_budgets: {
        Row: {
          id: string;
          employee_id: string;
          budget_period_id: string;
          base_amount: number;
          bonus_amount: number;
          total_amount: number;
          spent_amount: number;
          remaining_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          budget_period_id: string;
          base_amount?: number;
          bonus_amount?: number;
          total_amount?: number;
          spent_amount?: number;
          remaining_amount?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          budget_period_id?: string;
          base_amount?: number;
          bonus_amount?: number;
          total_amount?: number;
          spent_amount?: number;
          remaining_amount?: number;
          created_at?: string;
        };
      };
      providers: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: 'fitness' | 'mindfulness' | 'coaching' | 'nutrition' | 'wellness' | 'other' | null;
          logo_url: string | null;
          website_url: string | null;
          status: 'pending' | 'approved' | 'rejected' | 'suspended';
          onboarding_type: 'curated' | 'self_service';
          contact_email: string | null;
          stripe_connect_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: 'fitness' | 'mindfulness' | 'coaching' | 'nutrition' | 'wellness' | 'other' | null;
          logo_url?: string | null;
          website_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'suspended';
          onboarding_type?: 'curated' | 'self_service';
          contact_email?: string | null;
          stripe_connect_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: 'fitness' | 'mindfulness' | 'coaching' | 'nutrition' | 'wellness' | 'other' | null;
          logo_url?: string | null;
          website_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'suspended';
          onboarding_type?: 'curated' | 'self_service';
          contact_email?: string | null;
          stripe_connect_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      provider_translations: {
        Row: {
          id: string;
          provider_id: string;
          locale: string;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          provider_id: string;
          locale: string;
          name: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          provider_id?: string;
          locale?: string;
          name?: string;
          description?: string | null;
        };
      };
      offerings: {
        Row: {
          id: string;
          provider_id: string;
          name: string;
          description: string | null;
          price: number;
          category: 'fitness' | 'mindfulness' | 'coaching' | 'nutrition' | 'wellness' | 'other' | null;
          type: 'subscription' | 'one_time' | 'voucher' | 'package';
          duration_months: number | null;
          image_url: string | null;
          status: 'draft' | 'active' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          name: string;
          description?: string | null;
          price: number;
          category?: 'fitness' | 'mindfulness' | 'coaching' | 'nutrition' | 'wellness' | 'other' | null;
          type?: 'subscription' | 'one_time' | 'voucher' | 'package';
          duration_months?: number | null;
          image_url?: string | null;
          status?: 'draft' | 'active' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          category?: 'fitness' | 'mindfulness' | 'coaching' | 'nutrition' | 'wellness' | 'other' | null;
          type?: 'subscription' | 'one_time' | 'voucher' | 'package';
          duration_months?: number | null;
          image_url?: string | null;
          status?: 'draft' | 'active' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      offering_translations: {
        Row: {
          id: string;
          offering_id: string;
          locale: string;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          offering_id: string;
          locale: string;
          name: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          offering_id?: string;
          locale?: string;
          name?: string;
          description?: string | null;
        };
      };
      orders: {
        Row: {
          id: string;
          employee_id: string;
          offering_id: string;
          amount: number;
          status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled' | 'refunded';
          order_date: string;
          fulfillment_date: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          offering_id: string;
          amount: number;
          status?: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled' | 'refunded';
          order_date?: string;
          fulfillment_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          offering_id?: string;
          amount?: number;
          status?: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled' | 'refunded';
          order_date?: string;
          fulfillment_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      budget_transactions: {
        Row: {
          id: string;
          employee_budget_id: string;
          order_id: string | null;
          type: 'allocation' | 'spend' | 'bonus' | 'refund' | 'rollover';
          amount: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_budget_id: string;
          order_id?: string | null;
          type: 'allocation' | 'spend' | 'bonus' | 'refund' | 'rollover';
          amount: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_budget_id?: string;
          order_id?: string | null;
          type?: 'allocation' | 'spend' | 'bonus' | 'refund' | 'rollover';
          amount?: number;
          description?: string | null;
          created_at?: string;
        };
      };
      company_invoices: {
        Row: {
          id: string;
          company_id: string;
          stripe_invoice_id: string | null;
          period_start: string;
          period_end: string;
          employee_count: number;
          total_amount: number;
          status: 'draft' | 'open' | 'paid' | 'overdue' | 'void';
          due_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          stripe_invoice_id?: string | null;
          period_start: string;
          period_end: string;
          employee_count?: number;
          total_amount?: number;
          status?: 'draft' | 'open' | 'paid' | 'overdue' | 'void';
          due_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          stripe_invoice_id?: string | null;
          period_start?: string;
          period_end?: string;
          employee_count?: number;
          total_amount?: number;
          status?: 'draft' | 'open' | 'paid' | 'overdue' | 'void';
          due_date?: string | null;
          created_at?: string;
        };
      };
      employer_analytics: {
        Row: {
          id: string;
          company_id: string;
          period_start: string;
          period_end: string;
          total_budget_allocated: number;
          total_budget_spent: number;
          active_employee_count: number;
          utilization_rate: number;
          category_counts: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          period_start: string;
          period_end: string;
          total_budget_allocated?: number;
          total_budget_spent?: number;
          active_employee_count?: number;
          utilization_rate?: number;
          category_counts?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          period_start?: string;
          period_end?: string;
          total_budget_allocated?: number;
          total_budget_spent?: number;
          active_employee_count?: number;
          utilization_rate?: number;
          category_counts?: Json;
          created_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          company_id: string;
          employee_id: string | null;
          event_type: string;
          event_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          employee_id?: string | null;
          event_type: string;
          event_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          employee_id?: string | null;
          event_type?: string;
          event_data?: Json | null;
          created_at?: string;
        };
      };
      platform_settings: {
        Row: {
          id: string;
          key: string;
          value: Json | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value?: Json | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json | null;
          updated_at?: string;
        };
      };
    };
    Functions: {
      calculate_budget: {
        Args: { p_employee_id: string; p_period_start: string };
        Returns: number;
      };
      get_remaining_budget: {
        Args: { p_budget_id: string };
        Returns: number;
      };
      auto_create_budget_periods: {
        Args: Record<string, never>;
        Returns: void;
      };
      get_offering_locale: {
        Args: { p_offering_id: string; p_locale: string };
        Returns: { name: string; description: string }[];
      };
      get_provider_locale: {
        Args: { p_provider_id: string; p_locale: string };
        Returns: { name: string; description: string }[];
      };
      refresh_employer_analytics: {
        Args: { p_company_id: string; p_period_start: string; p_period_end: string };
        Returns: void;
      };
    };
  };
};
