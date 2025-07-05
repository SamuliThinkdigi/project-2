/*
  # Initial Database Schema for Thinkdigi Invoice Hub

  1. New Tables
    - `profiles` - User profiles and authentication
    - `organizations` - Companies/organizations using the platform
    - `companies` - Business partners and clients
    - `invoices` - Invoice records
    - `invoice_items` - Line items for invoices
    - `attachments` - File attachments for invoices
    - `notifications` - System notifications
    - `integration_settings` - API and integration configurations
    - `shopify_products` - Cached Shopify product data
    - `audit_logs` - Activity tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for multi-tenant access
    - Secure file storage policies

  3. Indexes
    - Performance indexes for common queries
    - Full-text search capabilities
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Profiles table for user authentication
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  organization_id uuid,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'accountant', 'user', 'viewer')),
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  business_id text UNIQUE,
  vat_id text,
  address jsonb DEFAULT '{}',
  email text,
  phone text,
  logo_url text,
  settings jsonb DEFAULT '{}',
  subscription_plan text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Companies table (business partners/clients)
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  business_id text,
  vat_id text,
  address jsonb DEFAULT '{}',
  email text,
  phone text,
  contact_person text,
  notes text,
  tags text[] DEFAULT '{}',
  is_customer boolean DEFAULT true,
  is_supplier boolean DEFAULT false,
  maventa_uuid text,
  shopify_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'delivered', 'paid', 'overdue', 'cancelled')),
  type text DEFAULT 'outgoing' CHECK (type IN ('outgoing', 'incoming')),
  sender_id uuid REFERENCES companies(id),
  recipient_id uuid REFERENCES companies(id),
  issue_date date NOT NULL,
  due_date date NOT NULL,
  subtotal decimal(12,2) DEFAULT 0,
  vat_amount decimal(12,2) DEFAULT 0,
  total decimal(12,2) DEFAULT 0,
  currency text DEFAULT 'EUR',
  notes text,
  reference_number text,
  payment_terms integer DEFAULT 30,
  maventa_uuid text,
  shopify_order_id text,
  pdf_url text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(organization_id, invoice_number)
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity decimal(10,3) DEFAULT 1,
  unit_price decimal(12,2) DEFAULT 0,
  vat_rate decimal(5,2) DEFAULT 0,
  total decimal(12,2) DEFAULT 0,
  product_id text,
  sku text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_size bigint,
  mime_type text,
  storage_path text NOT NULL,
  description text,
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Integration settings table
CREATE TABLE IF NOT EXISTS integration_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('maventa', 'shopify', 'stripe', 'quickbooks')),
  settings jsonb DEFAULT '{}',
  is_active boolean DEFAULT false,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(organization_id, provider)
);

-- Shopify products cache table
CREATE TABLE IF NOT EXISTS shopify_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  shopify_id text NOT NULL,
  title text NOT NULL,
  vendor text,
  product_type text,
  status text DEFAULT 'active',
  tags text,
  variants jsonb DEFAULT '[]',
  images jsonb DEFAULT '[]',
  synced_at timestamptz DEFAULT now(),
  
  UNIQUE(organization_id, shopify_id)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for organizations
CREATE POLICY "Users can read own organization"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can update organization"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (id IN (
    SELECT organization_id FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin')
  ));

-- RLS Policies for companies
CREATE POLICY "Users can read organization companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage organization companies"
  ON companies
  FOR ALL
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'accountant')
  ));

-- RLS Policies for invoices
CREATE POLICY "Users can read organization invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage organization invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'accountant')
  ));

-- RLS Policies for invoice_items
CREATE POLICY "Users can read organization invoice items"
  ON invoice_items
  FOR SELECT
  TO authenticated
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage organization invoice items"
  ON invoice_items
  FOR ALL
  TO authenticated
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'accountant')
    )
  ));

-- RLS Policies for attachments
CREATE POLICY "Users can read organization attachments"
  ON attachments
  FOR SELECT
  TO authenticated
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage organization attachments"
  ON attachments
  FOR ALL
  TO authenticated
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'accountant')
    )
  ));

-- RLS Policies for notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- RLS Policies for integration_settings
CREATE POLICY "Users can read organization integrations"
  ON integration_settings
  FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage organization integrations"
  ON integration_settings
  FOR ALL
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin')
  ));

-- RLS Policies for shopify_products
CREATE POLICY "Users can read organization products"
  ON shopify_products
  FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage organization products"
  ON shopify_products
  FOR ALL
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'accountant')
  ));

-- RLS Policies for audit_logs
CREATE POLICY "Users can read organization audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin')
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_companies_organization_id ON companies(organization_id);
CREATE INDEX IF NOT EXISTS idx_companies_business_id ON companies(business_id);
CREATE INDEX IF NOT EXISTS idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(type);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_attachments_invoice_id ON attachments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_integration_settings_organization_id ON integration_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_shopify_products_organization_id ON shopify_products(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_companies_search ON companies USING gin(to_tsvector('english', name || ' ' || COALESCE(business_id, '')));
CREATE INDEX IF NOT EXISTS idx_invoices_search ON invoices USING gin(to_tsvector('english', invoice_number || ' ' || COALESCE(notes, '')));

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integration_settings_updated_at BEFORE UPDATE ON integration_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices 
  SET 
    subtotal = (
      SELECT COALESCE(SUM(quantity * unit_price), 0)
      FROM invoice_items 
      WHERE invoice_id = NEW.invoice_id
    ),
    vat_amount = (
      SELECT COALESCE(SUM(quantity * unit_price * vat_rate / 100), 0)
      FROM invoice_items 
      WHERE invoice_id = NEW.invoice_id
    ),
    total = (
      SELECT COALESCE(SUM(quantity * unit_price * (1 + vat_rate / 100)), 0)
      FROM invoice_items 
      WHERE invoice_id = NEW.invoice_id
    ),
    updated_at = now()
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to recalculate totals when items change
CREATE TRIGGER calculate_invoice_totals_trigger 
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items 
  FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    COALESCE(NEW.organization_id, OLD.organization_id),
    (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Audit triggers for important tables
CREATE TRIGGER audit_companies_trigger AFTER INSERT OR UPDATE OR DELETE ON companies FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_invoices_trigger AFTER INSERT OR UPDATE OR DELETE ON invoices FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_integration_settings_trigger AFTER INSERT OR UPDATE OR DELETE ON integration_settings FOR EACH ROW EXECUTE FUNCTION create_audit_log();