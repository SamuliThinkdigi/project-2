/*
  # Create payment records table

  1. New Tables
    - `payment_records`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key to invoices)
      - `organization_id` (uuid, foreign key to organizations)
      - `amount` (numeric(12,2))
      - `payment_date` (date)
      - `payment_method` (text)
      - `reference_number` (text)
      - `transaction_id` (text)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `payment_records` table
    - Add policies for authenticated users to manage and read payment records
  3. Triggers
    - Add trigger to update invoice status when payment is recorded
    - Add audit logging for payment records
*/

-- Create payment_records table
CREATE TABLE IF NOT EXISTS payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  payment_date date NOT NULL,
  payment_method text NOT NULL,
  reference_number text,
  transaction_id text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_records_invoice_id ON payment_records USING btree (invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_organization_id ON payment_records USING btree (organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_date ON payment_records USING btree (payment_date);

-- Enable Row Level Security
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage organization payment records"
  ON payment_records
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT profiles.organization_id
      FROM profiles
      WHERE profiles.user_id = auth.uid() AND profiles.role IN ('admin', 'accountant')
    )
  );

CREATE POLICY "Users can read organization payment records"
  ON payment_records
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT profiles.organization_id
      FROM profiles
      WHERE profiles.user_id = auth.uid()
    )
  );

-- Create trigger for updating invoice status when payment is recorded
CREATE OR REPLACE FUNCTION update_invoice_status_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  invoice_total numeric;
  total_payments numeric;
BEGIN
  -- Get invoice total
  SELECT total INTO invoice_total
  FROM invoices
  WHERE id = NEW.invoice_id;
  
  -- Get sum of all payments for this invoice
  SELECT COALESCE(SUM(amount), 0) INTO total_payments
  FROM payment_records
  WHERE invoice_id = NEW.invoice_id;
  
  -- Update invoice status based on payment amount
  IF total_payments >= invoice_total THEN
    UPDATE invoices
    SET status = 'paid', updated_at = now()
    WHERE id = NEW.invoice_id AND status != 'paid';
  ELSIF total_payments > 0 THEN
    UPDATE invoices
    SET status = 'delivered', updated_at = now()
    WHERE id = NEW.invoice_id AND status IN ('draft', 'sent');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_status_on_payment_trigger
AFTER INSERT OR UPDATE ON payment_records
FOR EACH ROW
EXECUTE FUNCTION update_invoice_status_on_payment();

-- Create trigger for updating payment_records.updated_at
CREATE TRIGGER update_payment_records_updated_at
BEFORE UPDATE ON payment_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create audit logging for payment records
CREATE TRIGGER audit_payment_records_trigger
AFTER INSERT OR DELETE OR UPDATE ON payment_records
FOR EACH ROW
EXECUTE FUNCTION create_audit_log();

-- Add payment_method check constraint
ALTER TABLE payment_records
ADD CONSTRAINT payment_records_payment_method_check
CHECK (payment_method = ANY (ARRAY['bank_transfer', 'credit_card', 'paypal', 'stripe', 'cash', 'other']));