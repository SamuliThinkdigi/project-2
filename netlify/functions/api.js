exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  // Parse the path from the URL
  const path = event.path.replace(/^\/api\//, '');
  
  try {
    // Route the request to the appropriate handler
    if (path.startsWith('shopify/')) {
      return handleShopifyRequest(event, path.replace('shopify/', ''));
    } else if (path.startsWith('maventa/')) {
      return handleMaventaRequest(event, path.replace('maventa/', ''));
    } else if (path.startsWith('invoices')) {
      return handleInvoiceRequest(event, path);
    } else if (path.startsWith('companies')) {
      return handleCompanyRequest(event, path);
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Not found' }),
      };
    }
  } catch (error) {
    console.error('API error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// Shopify API handlers
async function handleShopifyRequest(event, path) {
  const method = event.httpMethod;
  
  // Example: Handle Shopify product sync
  if (path === 'sync/products' && method === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const shopDomain = body.shop_domain;
    
    if (!shopDomain) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing shop_domain parameter' }),
      };
    }
    
    // In a real implementation, you would:
    // 1. Authenticate with Shopify
    // 2. Fetch products
    // 3. Store them in your database
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Products synced successfully',
        count: 42 // Mock data
      }),
    };
  }
  
  // Example: Handle Shopify order to invoice conversion
  if (path.startsWith('orders/') && path.endsWith('/invoice') && method === 'POST') {
    const orderId = path.split('/')[1];
    const body = JSON.parse(event.body || '{}');
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: `Invoice created for order ${orderId}`,
        invoice: {
          id: `invoice-${Date.now()}`,
          order_id: orderId,
          number: `INV-${orderId}`,
          status: 'draft'
        }
      }),
    };
  }
  
  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Shopify endpoint not found' }),
  };
}

// Maventa API handlers
async function handleMaventaRequest(event, path) {
  const method = event.httpMethod;
  
  // Example: Handle Maventa authentication
  if (path === 'auth' && method === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { client_id, client_secret } = body;
    
    if (!client_id || !client_secret) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing credentials' }),
      };
    }
    
    // In a real implementation, you would authenticate with Maventa
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        access_token: 'mock_access_token',
        expires_in: 3600,
        token_type: 'Bearer'
      }),
    };
  }
  
  // Example: Handle Maventa invoice sending
  if (path.startsWith('invoices/') && method === 'POST') {
    const invoiceId = path.split('/')[1];
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: `Invoice ${invoiceId} sent successfully`,
        status: 'sent'
      }),
    };
  }
  
  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Maventa endpoint not found' }),
  };
}

// Invoice API handlers
async function handleInvoiceRequest(event, path) {
  const method = event.httpMethod;
  
  // Example: Get invoices
  if (path === 'invoices' && method === 'GET') {
    // In a real implementation, you would fetch from your database
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        data: [
          {
            id: 'mock-invoice-1',
            number: 'INV-2024-001',
            status: 'paid',
            total: 1250.00,
            customer: { name: 'Test Customer' },
            date: '2024-01-15'
          },
          {
            id: 'mock-invoice-2',
            number: 'INV-2024-002',
            status: 'sent',
            total: 750.00,
            customer: { name: 'Another Customer' },
            date: '2024-01-20'
          }
        ]
      }),
    };
  }
  
  // Example: Create invoice
  if (path === 'invoices' && method === 'POST') {
    const body = JSON.parse(event.body || '{}');
    
    return {
      statusCode: 201,
      body: JSON.stringify({ 
        success: true, 
        message: 'Invoice created successfully',
        data: {
          id: `invoice-${Date.now()}`,
          number: body.number || `INV-${Date.now()}`,
          status: 'draft',
          ...body
        }
      }),
    };
  }
  
  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Invoice endpoint not found' }),
  };
}

// Company API handlers
async function handleCompanyRequest(event, path) {
  const method = event.httpMethod;
  
  // Example: Get companies
  if (path === 'companies' && method === 'GET') {
    // In a real implementation, you would fetch from your database
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        data: [
          {
            id: 'mock-company-1',
            name: 'Test Company Oy',
            business_id: '1234567-8',
            email: 'info@testcompany.fi'
          },
          {
            id: 'mock-company-2',
            name: 'Another Business Ltd',
            business_id: '8765432-1',
            email: 'contact@anotherbusiness.com'
          }
        ]
      }),
    };
  }
  
  // Example: Create company
  if (path === 'companies' && method === 'POST') {
    const body = JSON.parse(event.body || '{}');
    
    return {
      statusCode: 201,
      body: JSON.stringify({ 
        success: true, 
        message: 'Company created successfully',
        data: {
          id: `company-${Date.now()}`,
          ...body
        }
      }),
    };
  }
  
  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Company endpoint not found' }),
  };
}