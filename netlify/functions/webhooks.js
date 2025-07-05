const crypto = require('crypto');

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-Topic, X-Shopify-Hmac-SHA256, X-Shopify-Shop-Domain',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get webhook headers
    const topic = event.headers['x-shopify-topic'] || event.headers['X-Shopify-Topic'];
    const hmac = event.headers['x-shopify-hmac-sha256'] || event.headers['X-Shopify-Hmac-Sha256'];
    const shop = event.headers['x-shopify-shop-domain'] || event.headers['X-Shopify-Shop-Domain'];

    if (!topic || !hmac || !shop) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required headers' }),
      };
    }

    // Get request body
    const body = event.body;
    
    // Verify webhook (commented out for development)
    // const isValid = verifyWebhook(body, hmac, process.env.SHOPIFY_WEBHOOK_SECRET);
    // if (!isValid) {
    //   return {
    //     statusCode: 401,
    //     body: JSON.stringify({ error: 'Invalid webhook signature' }),
    //   };
    // }

    console.log(`Processing webhook: ${topic} from ${shop}`);

    // Process webhook based on topic
    let response;
    
    switch (topic) {
      case 'orders/create':
        response = await handleOrderCreate(shop, JSON.parse(body));
        break;
      
      case 'orders/updated':
        response = await handleOrderUpdate(shop, JSON.parse(body));
        break;
      
      case 'orders/paid':
        response = await handleOrderPaid(shop, JSON.parse(body));
        break;
      
      case 'app/uninstalled':
        response = await handleAppUninstall(shop);
        break;
      
      case 'customers/data_request':
        response = await handleCustomerDataRequest(shop, JSON.parse(body));
        break;
      
      case 'customers/redact':
        response = await handleCustomerRedact(shop, JSON.parse(body));
        break;
      
      case 'shop/redact':
        response = await handleShopRedact(shop, JSON.parse(body));
        break;
      
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
        response = { success: true, message: 'Webhook received but not processed' };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, topic, shop, ...response }),
    };

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// Verify webhook signature
function verifyWebhook(body, hmac, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');
  
  return hash === hmac;
}

// Webhook handlers
async function handleOrderCreate(shop, order) {
  console.log(`New order created: ${order.name} in ${shop}`);
  return { message: 'Order received' };
}

async function handleOrderUpdate(shop, order) {
  console.log(`Order updated: ${order.name} in ${shop}`);
  return { message: 'Order update received' };
}

async function handleOrderPaid(shop, order) {
  console.log(`Order paid: ${order.name} in ${shop}`);
  return { message: 'Order payment received' };
}

async function handleAppUninstall(shop) {
  console.log(`App uninstalled from ${shop}`);
  return { message: 'App uninstall received' };
}

async function handleCustomerDataRequest(shop, payload) {
  console.log(`Customer data request for: ${payload.customer?.email} in ${shop}`);
  
  // In a real implementation, you would:
  // 1. Gather all data for this customer
  // 2. Create a secure download package
  // 3. Notify the customer
  
  return { 
    message: 'Data request received',
    customer_id: payload.customer?.id
  };
}

async function handleCustomerRedact(shop, payload) {
  console.log(`Customer redact request for: ${payload.customer?.email} in ${shop}`);
  
  // In a real implementation, you would:
  // 1. Find the customer in your database
  // 2. Anonymize or delete their personal data
  // 3. Keep only what's required by law
  
  return { 
    message: 'Redact request received',
    customer_id: payload.customer?.id
  };
}

async function handleShopRedact(shop, payload) {
  console.log(`Shop redact request for: ${shop}`);
  
  // In a real implementation, you would:
  // 1. Find all data related to this shop
  // 2. Anonymize or delete shop data
  // 3. Keep only what's required by law
  
  return { 
    message: 'Shop redact request received',
    shop_id: payload.shop_id
  };
}