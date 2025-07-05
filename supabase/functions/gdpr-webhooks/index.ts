import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-topic, x-shopify-hmac-sha256, x-shopify-shop-domain',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ShopifyGDPRPayload {
  shop_id: string;
  shop_domain: string;
  customer?: {
    id: string;
    email: string;
    phone?: string;
  };
  orders_requested?: string[];
  data_request?: {
    id: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get webhook headers
    const topic = req.headers.get('x-shopify-topic')
    const hmac = req.headers.get('x-shopify-hmac-sha256')
    const shop = req.headers.get('x-shopify-shop-domain')

    if (!topic || !hmac || !shop) {
      return new Response(
        JSON.stringify({ error: 'Missing required headers' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get request body
    const body = await req.text()
    const payload: ShopifyGDPRPayload = JSON.parse(body)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log(`Processing GDPR webhook: ${topic} from ${shop}`)

    // Process webhook based on topic
    switch (topic) {
      case 'customers/data_request':
        await handleCustomerDataRequest(supabase, shop, payload)
        break
      
      case 'customers/redact':
        await handleCustomerRedact(supabase, shop, payload)
        break
      
      case 'shop/redact':
        await handleShopRedact(supabase, shop, payload)
        break
      
      default:
        console.log(`Unhandled GDPR webhook topic: ${topic}`)
    }

    return new Response(
      JSON.stringify({ success: true, topic, shop }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('GDPR webhook processing error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleCustomerDataRequest(supabase: any, shop: string, payload: ShopifyGDPRPayload) {
  console.log(`Customer data request for: ${payload.customer?.email} in ${shop}`)
  
  if (!payload.customer?.id) {
    console.error('Missing customer ID in data request')
    return
  }

  try {
    // Find customer in our database
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('shopify_customer_id', payload.customer.id.toString())
      .single()

    if (!company) {
      console.log('Customer not found in our database')
      return
    }

    // Find all invoices for this customer
    const { data: invoices } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items(*),
        attachments(*)
      `)
      .eq('recipient_id', company.id)

    // Create a data export package
    const dataPackage = {
      customer: company,
      invoices: invoices || [],
      exported_at: new Date().toISOString()
    }

    // In a real implementation, you would:
    // 1. Store this data package securely
    // 2. Make it available for download via a secure URL
    // 3. Notify the customer that their data is ready
    
    // For this demo, we'll just log that we processed the request
    console.log(`Processed data request for customer ${payload.customer.id}`)
    
    // Create an audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: company.organization_id,
        action: 'GDPR_DATA_REQUEST',
        resource_type: 'customer',
        resource_id: company.id,
        new_values: {
          request_id: payload.data_request?.id,
          shop_domain: shop,
          customer_id: payload.customer.id,
          customer_email: payload.customer.email
        }
      })

  } catch (error) {
    console.error('Error processing customer data request:', error)
  }
}

async function handleCustomerRedact(supabase: any, shop: string, payload: ShopifyGDPRPayload) {
  console.log(`Customer redact request for: ${payload.customer?.email} in ${shop}`)
  
  if (!payload.customer?.id) {
    console.error('Missing customer ID in redact request')
    return
  }

  try {
    // Find customer in our database
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('shopify_customer_id', payload.customer.id.toString())
      .single()

    if (!company) {
      console.log('Customer not found in our database')
      return
    }

    // Anonymize customer data
    await supabase
      .from('companies')
      .update({
        name: `Redacted Customer ${Date.now()}`,
        email: null,
        phone: null,
        address: {},
        business_id: null,
        vat_id: null,
        contact_person: null,
        notes: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', company.id)

    // Create an audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: company.organization_id,
        action: 'GDPR_CUSTOMER_REDACT',
        resource_type: 'customer',
        resource_id: company.id,
        old_values: {
          customer_id: payload.customer.id,
          customer_email: payload.customer.email
        }
      })

    console.log(`Redacted customer data for ${payload.customer.id}`)

  } catch (error) {
    console.error('Error processing customer redact request:', error)
  }
}

async function handleShopRedact(supabase: any, shop: string, payload: ShopifyGDPRPayload) {
  console.log(`Shop redact request for: ${shop}`)

  try {
    // Find integration settings for this shop
    const { data: integration } = await supabase
      .from('integration_settings')
      .select('organization_id, id')
      .eq('provider', 'shopify')
      .like('settings->shop_url', `%${shop}%`)
      .single()

    if (!integration) {
      console.log('Shop not found in our database')
      return
    }

    // Anonymize shop data
    await supabase
      .from('integration_settings')
      .update({
        settings: {
          shop_url: `redacted-${Date.now()}`,
          accessToken: null,
          webhookSecret: null,
          autoCreateInvoices: false,
          syncCustomers: false,
          syncOrders: false,
          syncProducts: false
        },
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', integration.id)

    // Create an audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: integration.organization_id,
        action: 'GDPR_SHOP_REDACT',
        resource_type: 'integration',
        resource_id: integration.id,
        new_values: {
          shop_domain: shop,
          shop_id: payload.shop_id
        }
      })

    console.log(`Redacted shop data for ${shop}`)

  } catch (error) {
    console.error('Error processing shop redact request:', error)
  }
}