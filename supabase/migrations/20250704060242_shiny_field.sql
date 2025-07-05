/*
  # Create Demo Data for Thinkdigi Invoice Hub

  1. Demo Data
    - Demo organization (Thinkdigi Demo Oy)
    - Sample companies (customers and suppliers)
    - Sample invoices with different statuses
    - Invoice line items
    - Notifications
    - Integration settings
    - Shopify products

  2. Data Integrity
    - Proper UUID generation
    - Foreign key relationships
    - Conflict handling for existing data
*/

-- Create demo organization
INSERT INTO organizations (
  id,
  name,
  business_id,
  vat_id,
  address,
  email,
  phone,
  subscription_plan
) VALUES (
  gen_random_uuid(),
  'Thinkdigi Demo Oy',
  '2847123-4',
  'FI28471234',
  '{"street": "Teknologiantie 15", "city": "Helsinki", "postalCode": "00150", "country": "Finland"}',
  'demo@thinkdigi.fi',
  '+358 50 123 4567',
  'premium'
) ON CONFLICT (business_id) DO NOTHING;

-- Create demo data using PL/pgSQL block
DO $$
DECLARE
  demo_org_id uuid;
  demo_company_1_id uuid := gen_random_uuid();
  demo_company_2_id uuid := gen_random_uuid();
  demo_company_3_id uuid := gen_random_uuid();
  demo_company_4_id uuid := gen_random_uuid();
  demo_invoice_1_id uuid := gen_random_uuid();
  demo_invoice_2_id uuid := gen_random_uuid();
  demo_invoice_3_id uuid := gen_random_uuid();
  demo_invoice_4_id uuid := gen_random_uuid();
BEGIN
  -- Get the demo organization ID
  SELECT id INTO demo_org_id FROM organizations WHERE business_id = '2847123-4' LIMIT 1;
  
  IF demo_org_id IS NOT NULL THEN
    -- Create demo companies (using individual INSERT statements to avoid conflict issues)
    INSERT INTO companies (
      id,
      organization_id,
      name,
      business_id,
      vat_id,
      address,
      email,
      phone,
      is_customer,
      is_supplier
    ) VALUES (
      demo_company_1_id,
      demo_org_id,
      'Digital Solutions Ltd',
      '8765432-1',
      'FI87654321',
      '{"street": "456 Innovation Street", "city": "Espoo", "postalCode": "02100", "country": "Finland"}',
      'accounts@digitalsolutions.com',
      '+358 50 123 4567',
      true,
      false
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO companies (
      id,
      organization_id,
      name,
      business_id,
      vat_id,
      address,
      email,
      phone,
      is_customer,
      is_supplier
    ) VALUES (
      demo_company_2_id,
      demo_org_id,
      'Tech Innovations Oy',
      '9876543-2',
      'FI98765432',
      '{"street": "789 Future Boulevard", "city": "Tampere", "postalCode": "33100", "country": "Finland"}',
      'finance@techinnovations.fi',
      '+358 40 987 6543',
      true,
      false
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO companies (
      id,
      organization_id,
      name,
      business_id,
      vat_id,
      address,
      email,
      phone,
      is_customer,
      is_supplier
    ) VALUES (
      demo_company_3_id,
      demo_org_id,
      'Nordic Software AB',
      '5566778-9',
      'FI55667789',
      '{"street": "321 Development Drive", "city": "Turku", "postalCode": "20100", "country": "Finland"}',
      'billing@nordicsoftware.se',
      '+358 45 555 1234',
      true,
      false
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO companies (
      id,
      organization_id,
      name,
      business_id,
      vat_id,
      address,
      email,
      phone,
      is_customer,
      is_supplier
    ) VALUES (
      demo_company_4_id,
      demo_org_id,
      'Cloud Services Oy',
      '1122334-5',
      'FI11223345',
      '{"street": "654 Server Street", "city": "Oulu", "postalCode": "90100", "country": "Finland"}',
      'invoices@cloudservices.fi',
      '+358 44 111 2233',
      false,
      true
    ) ON CONFLICT (id) DO NOTHING;

    -- Create sample invoices (using individual INSERT statements)
    INSERT INTO invoices (
      id,
      organization_id,
      invoice_number,
      status,
      type,
      sender_id,
      recipient_id,
      issue_date,
      due_date,
      subtotal,
      vat_amount,
      total,
      currency,
      notes,
      payment_terms
    ) VALUES (
      demo_invoice_1_id,
      demo_org_id,
      'TD-INV-2024-001',
      'paid',
      'outgoing',
      NULL,
      demo_company_1_id,
      '2024-01-15',
      '2024-02-14',
      5000.00,
      1200.00,
      6200.00,
      'EUR',
      'Digital transformation project - Phase 1',
      30
    ) ON CONFLICT (organization_id, invoice_number) DO NOTHING;

    INSERT INTO invoices (
      id,
      organization_id,
      invoice_number,
      status,
      type,
      sender_id,
      recipient_id,
      issue_date,
      due_date,
      subtotal,
      vat_amount,
      total,
      currency,
      notes,
      payment_terms
    ) VALUES (
      demo_invoice_2_id,
      demo_org_id,
      'TD-INV-2024-002',
      'delivered',
      'outgoing',
      NULL,
      demo_company_2_id,
      '2024-01-20',
      '2024-02-19',
      3500.00,
      840.00,
      4340.00,
      'EUR',
      'AWS cloud infrastructure deployment and configuration',
      30
    ) ON CONFLICT (organization_id, invoice_number) DO NOTHING;

    INSERT INTO invoices (
      id,
      organization_id,
      invoice_number,
      status,
      type,
      sender_id,
      recipient_id,
      issue_date,
      due_date,
      subtotal,
      vat_amount,
      total,
      currency,
      notes,
      payment_terms
    ) VALUES (
      demo_invoice_3_id,
      demo_org_id,
      'TD-INV-2024-003',
      'sent',
      'outgoing',
      NULL,
      demo_company_3_id,
      '2024-01-25',
      '2024-02-24',
      2800.00,
      672.00,
      3472.00,
      'EUR',
      'Software development consulting services',
      30
    ) ON CONFLICT (organization_id, invoice_number) DO NOTHING;

    INSERT INTO invoices (
      id,
      organization_id,
      invoice_number,
      status,
      type,
      sender_id,
      recipient_id,
      issue_date,
      due_date,
      subtotal,
      vat_amount,
      total,
      currency,
      notes,
      payment_terms
    ) VALUES (
      demo_invoice_4_id,
      demo_org_id,
      'SUP-2024-001',
      'delivered',
      'incoming',
      demo_company_4_id,
      NULL,
      '2024-01-10',
      '2024-02-09',
      1500.00,
      360.00,
      1860.00,
      'EUR',
      'Cloud hosting services for Q1 2024',
      30
    ) ON CONFLICT (organization_id, invoice_number) DO NOTHING;

    -- Create invoice items (using individual INSERT statements)
    INSERT INTO invoice_items (
      id,
      invoice_id,
      description,
      quantity,
      unit_price,
      vat_rate,
      total,
      sort_order
    ) VALUES (
      gen_random_uuid(),
      demo_invoice_1_id,
      'Digital Transformation Consulting',
      40.000,
      125.00,
      24.00,
      6200.00,
      1
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO invoice_items (
      id,
      invoice_id,
      description,
      quantity,
      unit_price,
      vat_rate,
      total,
      sort_order
    ) VALUES (
      gen_random_uuid(),
      demo_invoice_2_id,
      'Cloud Infrastructure Setup',
      1.000,
      3500.00,
      24.00,
      4340.00,
      1
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO invoice_items (
      id,
      invoice_id,
      description,
      quantity,
      unit_price,
      vat_rate,
      total,
      sort_order
    ) VALUES (
      gen_random_uuid(),
      demo_invoice_3_id,
      'Software Development Hours',
      35.000,
      80.00,
      24.00,
      3472.00,
      1
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO invoice_items (
      id,
      invoice_id,
      description,
      quantity,
      unit_price,
      vat_rate,
      total,
      sort_order
    ) VALUES (
      gen_random_uuid(),
      demo_invoice_4_id,
      'Cloud Hosting - Basic Plan',
      3.000,
      500.00,
      24.00,
      1860.00,
      1
    ) ON CONFLICT (id) DO NOTHING;

    -- Create sample notifications
    INSERT INTO notifications (
      id,
      organization_id,
      user_id,
      type,
      title,
      message,
      data,
      read,
      invoice_id
    ) VALUES (
      gen_random_uuid(),
      demo_org_id,
      NULL,
      'INVOICE_PAID',
      'Invoice Paid',
      'Invoice TD-INV-2024-001 has been paid by Digital Solutions Ltd',
      '{"amount": 6200.00, "currency": "EUR"}',
      false,
      demo_invoice_1_id
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO notifications (
      id,
      organization_id,
      user_id,
      type,
      title,
      message,
      data,
      read,
      invoice_id
    ) VALUES (
      gen_random_uuid(),
      demo_org_id,
      NULL,
      'INVOICE_DELIVERED',
      'Invoice Delivered',
      'Invoice TD-INV-2024-002 has been delivered to Tech Innovations Oy',
      '{"delivery_method": "email"}',
      false,
      demo_invoice_2_id
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO notifications (
      id,
      organization_id,
      user_id,
      type,
      title,
      message,
      data,
      read,
      invoice_id
    ) VALUES (
      gen_random_uuid(),
      demo_org_id,
      NULL,
      'INVOICE_RECEIVED',
      'New Invoice Received',
      'Received invoice SUP-2024-001 from Cloud Services Oy',
      '{"amount": 1860.00, "currency": "EUR"}',
      true,
      demo_invoice_4_id
    ) ON CONFLICT (id) DO NOTHING;

    -- Create integration settings
    INSERT INTO integration_settings (
      id,
      organization_id,
      provider,
      settings,
      is_active
    ) VALUES (
      gen_random_uuid(),
      demo_org_id,
      'maventa',
      '{"client_id": "demo_client_id", "test_mode": true, "auto_send": false}',
      true
    ) ON CONFLICT (organization_id, provider) DO NOTHING;

    INSERT INTO integration_settings (
      id,
      organization_id,
      provider,
      settings,
      is_active
    ) VALUES (
      gen_random_uuid(),
      demo_org_id,
      'shopify',
      '{"shop_url": "demo-store.myshopify.com", "auto_create_invoices": true, "invoice_prefix": "TD-SHOP"}',
      false
    ) ON CONFLICT (organization_id, provider) DO NOTHING;

    -- Create sample Shopify products
    INSERT INTO shopify_products (
      id,
      organization_id,
      shopify_id,
      title,
      vendor,
      product_type,
      status,
      tags,
      variants,
      images
    ) VALUES (
      gen_random_uuid(),
      demo_org_id,
      '12345678901',
      'Premium Consulting Package',
      'Thinkdigi',
      'Service',
      'active',
      'consulting, premium, digital',
      '[{"id": "var1", "title": "Standard", "price": "2500.00", "sku": "CONS-STD", "inventory_quantity": 999, "taxable": true}]',
      '[{"id": "img1", "src": "https://via.placeholder.com/300x300", "alt": "Consulting Package"}]'
    ) ON CONFLICT (organization_id, shopify_id) DO NOTHING;

    INSERT INTO shopify_products (
      id,
      organization_id,
      shopify_id,
      title,
      vendor,
      product_type,
      status,
      tags,
      variants,
      images
    ) VALUES (
      gen_random_uuid(),
      demo_org_id,
      '12345678902',
      'Cloud Migration Service',
      'Thinkdigi',
      'Service',
      'active',
      'cloud, migration, aws',
      '[{"id": "var2", "title": "Basic", "price": "1500.00", "sku": "CLOUD-BASIC", "inventory_quantity": 999, "taxable": true}, {"id": "var3", "title": "Enterprise", "price": "5000.00", "sku": "CLOUD-ENT", "inventory_quantity": 999, "taxable": true}]',
      '[{"id": "img2", "src": "https://via.placeholder.com/300x300", "alt": "Cloud Migration"}]'
    ) ON CONFLICT (organization_id, shopify_id) DO NOTHING;

  END IF;
END $$;