export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          organization_id: string | null;
          role: 'admin' | 'accountant' | 'user' | 'viewer';
          preferences: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          organization_id?: string | null;
          role?: 'admin' | 'accountant' | 'user' | 'viewer';
          preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          organization_id?: string | null;
          role?: 'admin' | 'accountant' | 'user' | 'viewer';
          preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          business_id: string | null;
          vat_id: string | null;
          address: Record<string, any>;
          email: string | null;
          phone: string | null;
          logo_url: string | null;
          settings: Record<string, any>;
          subscription_plan: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          business_id?: string | null;
          vat_id?: string | null;
          address?: Record<string, any>;
          email?: string | null;
          phone?: string | null;
          logo_url?: string | null;
          settings?: Record<string, any>;
          subscription_plan?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          business_id?: string | null;
          vat_id?: string | null;
          address?: Record<string, any>;
          email?: string | null;
          phone?: string | null;
          logo_url?: string | null;
          settings?: Record<string, any>;
          subscription_plan?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          business_id: string | null;
          vat_id: string | null;
          address: Record<string, any>;
          email: string | null;
          phone: string | null;
          contact_person: string | null;
          notes: string | null;
          tags: string[];
          is_customer: boolean;
          is_supplier: boolean;
          maventa_uuid: string | null;
          shopify_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          business_id?: string | null;
          vat_id?: string | null;
          address?: Record<string, any>;
          email?: string | null;
          phone?: string | null;
          contact_person?: string | null;
          notes?: string | null;
          tags?: string[];
          is_customer?: boolean;
          is_supplier?: boolean;
          maventa_uuid?: string | null;
          shopify_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          business_id?: string | null;
          vat_id?: string | null;
          address?: Record<string, any>;
          email?: string | null;
          phone?: string | null;
          contact_person?: string | null;
          notes?: string | null;
          tags?: string[];
          is_customer?: boolean;
          is_supplier?: boolean;
          maventa_uuid?: string | null;
          shopify_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          organization_id: string;
          invoice_number: string;
          status: 'draft' | 'sent' | 'delivered' | 'paid' | 'overdue' | 'cancelled';
          type: 'outgoing' | 'incoming';
          sender_id: string | null;
          recipient_id: string | null;
          issue_date: string;
          due_date: string;
          subtotal: number;
          vat_amount: number;
          total: number;
          currency: string;
          notes: string | null;
          reference_number: string | null;
          payment_terms: number;
          maventa_uuid: string | null;
          shopify_order_id: string | null;
          pdf_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          invoice_number: string;
          status?: 'draft' | 'sent' | 'delivered' | 'paid' | 'overdue' | 'cancelled';
          type?: 'outgoing' | 'incoming';
          sender_id?: string | null;
          recipient_id?: string | null;
          issue_date: string;
          due_date: string;
          subtotal?: number;
          vat_amount?: number;
          total?: number;
          currency?: string;
          notes?: string | null;
          reference_number?: string | null;
          payment_terms?: number;
          maventa_uuid?: string | null;
          shopify_order_id?: string | null;
          pdf_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          invoice_number?: string;
          status?: 'draft' | 'sent' | 'delivered' | 'paid' | 'overdue' | 'cancelled';
          type?: 'outgoing' | 'incoming';
          sender_id?: string | null;
          recipient_id?: string | null;
          issue_date?: string;
          due_date?: string;
          subtotal?: number;
          vat_amount?: number;
          total?: number;
          currency?: string;
          notes?: string | null;
          reference_number?: string | null;
          payment_terms?: number;
          maventa_uuid?: string | null;
          shopify_order_id?: string | null;
          pdf_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          vat_rate: number;
          total: number;
          product_id: string | null;
          sku: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price?: number;
          vat_rate?: number;
          total?: number;
          product_id?: string | null;
          sku?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          vat_rate?: number;
          total?: number;
          product_id?: string | null;
          sku?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      attachments: {
        Row: {
          id: string;
          invoice_id: string;
          filename: string;
          file_size: number | null;
          mime_type: string | null;
          storage_path: string;
          description: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          filename: string;
          file_size?: number | null;
          mime_type?: string | null;
          storage_path: string;
          description?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          filename?: string;
          file_size?: number | null;
          mime_type?: string | null;
          storage_path?: string;
          description?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data: Record<string, any>;
          read: boolean;
          invoice_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data?: Record<string, any>;
          read?: boolean;
          invoice_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          data?: Record<string, any>;
          read?: boolean;
          invoice_id?: string | null;
          created_at?: string;
        };
      };
      integration_settings: {
        Row: {
          id: string;
          organization_id: string;
          provider: 'maventa' | 'shopify' | 'stripe' | 'quickbooks';
          settings: Record<string, any>;
          is_active: boolean;
          last_sync_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          provider: 'maventa' | 'shopify' | 'stripe' | 'quickbooks';
          settings?: Record<string, any>;
          is_active?: boolean;
          last_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          provider?: 'maventa' | 'shopify' | 'stripe' | 'quickbooks';
          settings?: Record<string, any>;
          is_active?: boolean;
          last_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      shopify_products: {
        Row: {
          id: string;
          organization_id: string;
          shopify_id: string;
          title: string;
          vendor: string | null;
          product_type: string | null;
          status: string;
          tags: string | null;
          variants: Record<string, any>[];
          images: Record<string, any>[];
          synced_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          shopify_id: string;
          title: string;
          vendor?: string | null;
          product_type?: string | null;
          status?: string;
          tags?: string | null;
          variants?: Record<string, any>[];
          images?: Record<string, any>[];
          synced_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          shopify_id?: string;
          title?: string;
          vendor?: string | null;
          product_type?: string | null;
          status?: string;
          tags?: string | null;
          variants?: Record<string, any>[];
          images?: Record<string, any>[];
          synced_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          old_values: Record<string, any> | null;
          new_values: Record<string, any> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          old_values?: Record<string, any> | null;
          new_values?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          old_values?: Record<string, any> | null;
          new_values?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}