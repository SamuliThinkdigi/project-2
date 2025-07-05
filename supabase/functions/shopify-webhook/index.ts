import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-topic, x-shopify-hmac-sha256, x-shopify-shop-domain',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ShopifyWebhookPayload {
  id: string
  name?: string
  order_number?: string
  customer?: any
  line_items?: any[]
  total_price?: string
  financial_status?: string
  created_at?: string
  updated_at?: string
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
    const payload: ShopifyWebhookPayload = JSON.parse(body)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify webhook (in production, verify HMAC signature)
    // const isValid = await verifyWebhook(body, hmac, shop)
    // if (!isValid) {
    //   return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    // }

    console.log(`Processing webhook: ${topic} from ${shop}`)

    // Process webhook based on topic
    switch (topic) {
      case 'orders/create':
        await handleOrderCreate(supabase, shop, payload)
        break
      
      case 'orders/updated':
        await handleOrderUpdate(supabase, shop, payload)
        break
      
      case 'orders/paid':
        await handleOrderPaid(supabase, shop, payload)
        break
      
      case 'app/uninstalled':
        await handleAppUninstall(supabase, shop)
        break
      
      default:
        console.log(`Unhandled webhook topic: ${topic}`)
    }

    return new Response(
      JSON.stringify({ success: true, topic, shop }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleOrderCreate(supabase: any, shop: string, order: ShopifyWebhookPayload) {
  console.log(`New order created: ${order.name} in ${shop}`)
  
  // Check if auto-invoice creation is enabled for this shop
  const { data: settings } = await supabase
    .from('integration_settings')
    .select('settings')
    .eq('provider', 'shopify')
    .like('settings->shop_url', `%${shop}%`)
    .single()

  if (!settings?.settings?.autoCreateInvoices) {
    console.log('Auto-invoice creation disabled for this shop')
    return
  }

  // Create invoice from order
  await createInvoiceFromOrder(supabase, shop, order)
}

async function handleOrderUpdate(supabase: any, shop: string, order: ShopifyWebhookPayload) {
  console.log(`Order updated: ${order.name} in ${shop}`)
  
  // Find existing invoice for this order
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('shopify_order_id', order.id)
    .single()

  if (invoice) {
    // Update invoice based on order changes
    await updateInvoiceFromOrder(supabase, invoice.id, order)
  }
}

async function handleOrderPaid(supabase: any, shop: string, order: ShopifyWebhookPayload) {
  console.log(`Order paid: ${order.name} in ${shop}`)
  
  // Find existing invoice for this order
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('shopify_order_id', order.id)
    .single()

  if (invoice) {
    // Mark invoice as paid
    await supabase
      .from('invoices')
      .update({ 
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', invoice.id)

    console.log(`Invoice ${invoice.id} marked as paid`)
  }
}

async function handleAppUninstall(supabase: any, shop: string) {
  console.log(`App uninstalled from ${shop}`)
  
  // Deactivate integration settings
  await supabase
    .from('integration_settings')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('provider', 'shopify')
    .like('settings->shop_url', `%${shop}%`)

  // Create notification for admin
  const { data: organizations } = await supabase
    .from('integration_settings')
    .select('organization_id')
    .eq('provider', 'shopify')
    .like('settings->shop_url', `%${shop}%`)

  if (organizations && organizations.length > 0) {
    await supabase
      .from('notifications')
      .insert({
        organization_id: organizations[0].organization_id,
        type: 'APP_UNINSTALLED',
        title: 'Shopify App Uninstalled',
        message: `Shopify app has been uninstalled from ${shop}`,
        data: { shop },
        read: false
      })
  }
}

async function createInvoiceFromOrder(supabase: any, shop: string, order: ShopifyWebhookPayload) {
  try {
    // Get organization for this shop
    const { data: integration } = await supabase
      .from('integration_settings')
      .select('organization_id, settings')
      .eq('provider', 'shopify')
      .like('settings->shop_url', `%${shop}%`)
      .single()

    if (!integration) {
      console.error('No integration found for shop:', shop)
      return
    }

    // Create or get customer company
    const customer = order.customer
    const companyData = {
      organization_id: integration.organization_id,
      name: customer?.first_name && customer?.last_name 
        ? `${customer.first_name} ${customer.last_name}`
        : `Customer ${customer?.id}`,
      business_id: customer?.id?.toString(),
      email: customer?.email,
      phone: customer?.phone,
      is_customer: true,
      shopify_customer_id: customer?.id?.toString(),
      address: {
        street: customer?.default_address?.address1 || '',
        city: customer?.default_address?.city || '',
        postalCode: customer?.default_address?.zip || '',
        country: customer?.default_address?.country || 'Finland'
      }
    }

    // Insert or update company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert(companyData, { 
        onConflict: 'organization_id,shopify_customer_id',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (companyError) {
      console.error('Error creating company:', companyError)
      return
    }

    // Create invoice
    const invoiceData = {
      organization_id: integration.organization_id,
      invoice_number: `${integration.settings.invoicePrefix || 'SHOP'}-${order.order_number}`,
      status: 'draft',
      type: 'outgoing',
      recipient_id: company.id,
      issue_date: new Date(order.created_at!).toISOString().split('T')[0],
      due_date: new Date(Date.now() + (integration.settings.paymentTerms || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'EUR',
      notes: `Shopify Order #${order.name}`,
      shopify_order_id: order.id,
      payment_terms: integration.settings.paymentTerms || 30
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single()

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError)
      return
    }

    // Create invoice items
    if (order.line_items && order.line_items.length > 0) {
      const items = order.line_items.map((item: any, index: number) => ({
        invoice_id: invoice.id,
        description: item.title,
        quantity: item.quantity,
        unit_price: parseFloat(item.price),
        vat_rate: integration.settings.defaultVatRate || 24,
        sort_order: index + 1
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(items)

      if (itemsError) {
        console.error('Error creating invoice items:', itemsError)
      }
    }

    console.log(`Invoice created: ${invoice.invoice_number} for order ${order.name}`)

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        organization_id: integration.organization_id,
        type: 'INVOICE_CREATED',
        title: 'New Invoice Created',
        message: `Invoice ${invoice.invoice_number} created from Shopify order ${order.name}`,
        data: { 
          invoice_id: invoice.id,
          order_id: order.id,
          shop 
        },
        read: false
      })

  } catch (error) {
    console.error('Error in createInvoiceFromOrder:', error)
  }
}

async function updateInvoiceFromOrder(supabase: any, invoiceId: string, order: ShopifyWebhookPayload) {
  // Update invoice based on order changes
  const updateData: any = {
    updated_at: new Date().toISOString()
  }

  // Update status based on financial status
  if (order.financial_status === 'paid') {
    updateData.status = 'paid'
  } else if (order.financial_status === 'pending') {
    updateData.status = 'sent'
  }

  await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', invoiceId)

  console.log(`Invoice ${invoiceId} updated from order ${order.name}`)
}