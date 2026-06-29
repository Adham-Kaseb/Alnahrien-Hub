/**
 * Placeholder for Supabase-generated types.
 * Run `npx supabase gen types typescript` to regenerate after schema changes.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: 'admin' | 'employee';
          phone: string | null;
          email: string | null;
          password: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: 'admin' | 'employee';
          phone?: string | null;
          email?: string | null;
          password?: string | null;
        };
        Update: {
          full_name?: string;
          role?: 'admin' | 'employee';
          phone?: string | null;
          email?: string | null;
          password?: string | null;
        };
      };
      tickets: {
        Row: {
          id: string;
          ticket_number: number;
          employee_name: string;
          issue_description: string;
          phone_number: string;
          status: 'pending' | 'in_progress' | 'resolved' | 'waiting_parts';
          submitted_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          employee_name: string;
          issue_description: string;
          phone_number: string;
          status?: 'pending' | 'in_progress' | 'resolved' | 'waiting_parts';
          submitted_by?: string | null;
        };
        Update: {
          employee_name?: string;
          issue_description?: string;
          phone_number?: string;
          status?: 'pending' | 'in_progress' | 'resolved' | 'waiting_parts';
        };
      };
      assets: {
        Row: {
          id: string;
          assigned_to: string;
          device_type: 'Laptop' | 'Tablet' | 'Mobile' | 'PC';
          serial_number: string | null;
          sim_card_number: string | null;
          device_condition: 'جديد' | 'مستعمل وشغال' | 'محتاج صيانة';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          assigned_to: string;
          device_type: 'Laptop' | 'Tablet' | 'Mobile' | 'PC';
          serial_number?: string | null;
          sim_card_number?: string | null;
          device_condition?: 'جديد' | 'مستعمل وشغال' | 'محتاج صيانة';
          notes?: string | null;
        };
        Update: {
          assigned_to?: string;
          device_type?: 'Laptop' | 'Tablet' | 'Mobile' | 'PC';
          serial_number?: string | null;
          sim_card_number?: string | null;
          device_condition?: 'جديد' | 'مستعمل وشغال' | 'محتاج صيانة';
          notes?: string | null;
        };
      };
      credentials: {
        Row: {
          id: string;
          credential_type: 'billing' | 'password';
          service_name: string;
          payment_method: string | null;
          renewal_date: string | null;
          platform_url: string | null;
          username_email: string | null;
          encrypted_password: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          credential_type: 'billing' | 'password';
          service_name: string;
          payment_method?: string | null;
          renewal_date?: string | null;
          platform_url?: string | null;
          username_email?: string | null;
          encrypted_password?: string | null;
        };
        Update: {
          credential_type?: 'billing' | 'password';
          service_name?: string;
          payment_method?: string | null;
          renewal_date?: string | null;
          platform_url?: string | null;
          username_email?: string | null;
          encrypted_password?: string | null;
        };
      };
      guides: {
        Row: {
          id: string;
          guide_title: string;
          media_type: 'video' | 'images' | null;
          target_problem: string | null;
          media_urls: string[];
          content: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          guide_title: string;
          media_type?: 'video' | 'images' | null;
          target_problem?: string | null;
          media_urls?: string[];
          content?: string | null;
          created_by?: string | null;
        };
        Update: {
          guide_title?: string;
          media_type?: 'video' | 'images' | null;
          target_problem?: string | null;
          media_urls?: string[];
          content?: string | null;
        };
      };
      emergency_contacts: {
        Row: {
          id: string;
          vendor_name: string;
          service_type: string | null;
          support_phone: string;
          account_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          vendor_name: string;
          service_type?: string | null;
          support_phone: string;
          account_notes?: string | null;
        };
        Update: {
          vendor_name?: string;
          service_type?: string | null;
          support_phone?: string;
          account_notes?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_dashboard_stats: {
        Args: Record<string, never>;
        Returns: {
          open_tickets: number;
          total_assets: number;
          total_guides: number;
          pending_renewals: number;
        };
      };
      login_user: {
        Args: {
          p_email: string;
          p_password: string;
        };
        Returns: Database['public']['Tables']['profiles']['Row'][];
      };
    };
    Enums: {
      app_role: 'admin' | 'employee';
    };
  };
};

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Ticket = Database['public']['Tables']['tickets']['Row'];
export type Asset = Database['public']['Tables']['assets']['Row'];
export type Credential = Database['public']['Tables']['credentials']['Row'];
export type Guide = Database['public']['Tables']['guides']['Row'];
export type EmergencyContact = Database['public']['Tables']['emergency_contacts']['Row'];
export type AppRole = Database['public']['Enums']['app_role'];
export type TicketStatus = Ticket['status'];
export type DeviceType = Asset['device_type'];
export type DeviceCondition = Asset['device_condition'];
