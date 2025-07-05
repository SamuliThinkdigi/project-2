# Thinkdigi Invoice Hub API Documentation

## Overview

Thinkdigi Invoice Hub provides a comprehensive REST API for e-invoicing integration. The API follows RESTful principles and uses JSON for data exchange.

**Base URL:** `https://api.thinkdigi.fi/v1`

## Authentication

### OAuth 2.0 Client Credentials

```http
POST /oauth/token
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "scope": "invoices:read invoices:write companies:read"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "invoices:read invoices:write companies:read"
}
```

### Using Access Token

Include the access token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Rate Limiting

- **Rate Limit:** 1000 requests per hour per API key
- **Headers:** Rate limit information is included in response headers:
  - `X-RateLimit-Limit`: Maximum requests per hour
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid invoice data",
    "details": [
      {
        "field": "recipient.email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Invoices

### Create Invoice

```http
POST /invoices
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoice_number": "INV-2024-001",
  "recipient": {
    "name": "Example Company Oy",
    "business_id": "1234567-8",
    "email": "billing@example.com",
    "address": {
      "street": "Testikatu 1",
      "city": "Helsinki",
      "postal_code": "00100",
      "country": "FI"
    }
  },
  "issue_date": "2024-01-15",
  "due_date": "2024-02-14",
  "currency": "EUR",
  "items": [
    {
      "description": "Consulting Services",
      "quantity": 10,
      "unit_price": 150.00,
      "vat_rate": 24
    }
  ],
  "notes": "Payment terms: 30 days"
}
```

**Response:**
```json
{
  "id": "inv_1234567890",
  "invoice_number": "INV-2024-001",
  "status": "draft",
  "type": "outgoing",
  "recipient": {
    "id": "comp_0987654321",
    "name": "Example Company Oy",
    "business_id": "1234567-8",
    "email": "billing@example.com"
  },
  "issue_date": "2024-01-15",
  "due_date": "2024-02-14",
  "subtotal": 1500.00,
  "vat_amount": 360.00,
  "total": 1860.00,
  "currency": "EUR",
  "items": [
    {
      "id": "item_1111111111",
      "description": "Consulting Services",
      "quantity": 10,
      "unit_price": 150.00,
      "vat_rate": 24,
      "total": 1860.00
    }
  ],
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Get Invoices

```http
GET /invoices?status=draft&type=outgoing&limit=50&offset=0
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` - Filter by status: `draft`, `sent`, `delivered`, `paid`, `overdue`, `cancelled`
- `type` - Filter by type: `outgoing`, `incoming`
- `limit` - Number of results (max 100, default 50)
- `offset` - Pagination offset (default 0)
- `sort` - Sort field: `created_at`, `due_date`, `total` (default `created_at`)
- `order` - Sort order: `asc`, `desc` (default `desc`)

**Response:**
```json
{
  "data": [
    {
      "id": "inv_1234567890",
      "invoice_number": "INV-2024-001",
      "status": "draft",
      "recipient": {
        "name": "Example Company Oy"
      },
      "total": 1860.00,
      "currency": "EUR",
      "due_date": "2024-02-14",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

### Get Invoice by ID

```http
GET /invoices/{invoice_id}
Authorization: Bearer {token}
```

### Update Invoice

```http
PUT /invoices/{invoice_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "notes": "Updated payment terms: 14 days",
  "due_date": "2024-01-29"
}
```

### Send Invoice

```http
POST /invoices/{invoice_id}/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "method": "email", // or "maventa" or "both"
  "send_copy_to": ["admin@yourcompany.com"]
}
```

### Cancel Invoice

```http
POST /invoices/{invoice_id}/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Customer request"
}
```

## Companies

### Create Company

```http
POST /companies
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Customer Oy",
  "business_id": "9876543-2",
  "vat_id": "FI98765432",
  "email": "contact@newcustomer.fi",
  "phone": "+358 50 123 4567",
  "address": {
    "street": "Asiakaskatu 5",
    "city": "Tampere",
    "postal_code": "33100",
    "country": "FI"
  },
  "is_customer": true,
  "is_supplier": false,
  "tags": ["vip", "enterprise"]
}
```

### Get Companies

```http
GET /companies?is_customer=true&limit=50
Authorization: Bearer {token}
```

**Query Parameters:**
- `is_customer` - Filter customers: `true`, `false`
- `is_supplier` - Filter suppliers: `true`, `false`
- `search` - Search by name or business ID
- `tags` - Filter by tags (comma-separated)

### Update Company

```http
PUT /companies/{company_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newemail@customer.fi",
  "tags": ["vip", "enterprise", "priority"]
}
```

## Shopify Integration

### Sync Orders

```http
POST /shopify/sync/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "shop_domain": "your-shop.myshopify.com",
  "since_date": "2024-01-01",
  "auto_create_invoices": true
}
```

### Get Shopify Products

```http
GET /shopify/products?shop_domain=your-shop.myshopify.com
Authorization: Bearer {token}
```

### Create Invoice from Order

```http
POST /shopify/orders/{order_id}/invoice
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoice_prefix": "SHOP",
  "payment_terms": 30,
  "auto_send": false
}
```

## Webhooks

### Register Webhook

```http
POST /webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/invoices",
  "events": [
    "invoice.created",
    "invoice.sent",
    "invoice.paid",
    "invoice.overdue"
  ],
  "secret": "your-webhook-secret"
}
```

### Webhook Events

#### Invoice Events
- `invoice.created` - New invoice created
- `invoice.sent` - Invoice sent to recipient
- `invoice.delivered` - Invoice delivered via Maventa
- `invoice.paid` - Invoice marked as paid
- `invoice.overdue` - Invoice is overdue
- `invoice.cancelled` - Invoice cancelled

#### Company Events
- `company.created` - New company added
- `company.updated` - Company information updated

#### Shopify Events
- `shopify.order.synced` - Order synced from Shopify
- `shopify.product.synced` - Product synced from Shopify

### Webhook Payload Example

```json
{
  "id": "evt_1234567890",
  "type": "invoice.sent",
  "created_at": "2024-01-15T10:00:00Z",
  "data": {
    "invoice": {
      "id": "inv_1234567890",
      "invoice_number": "INV-2024-001",
      "status": "sent",
      "total": 1860.00,
      "recipient": {
        "name": "Example Company Oy",
        "email": "billing@example.com"
      }
    }
  }
}
```

### Webhook Verification

Verify webhook signatures using HMAC-SHA256:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(digest, 'hex')
  );
}
```

## Reports

### Invoice Summary

```http
GET /reports/invoices/summary?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {token}
```

**Response:**
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "summary": {
    "total_invoices": 45,
    "total_amount": 125000.00,
    "paid_amount": 98000.00,
    "outstanding_amount": 27000.00,
    "overdue_amount": 5000.00
  },
  "by_status": {
    "draft": 2,
    "sent": 8,
    "delivered": 15,
    "paid": 18,
    "overdue": 2
  },
  "vat_summary": {
    "vat_0": 2000.00,
    "vat_10": 1500.00,
    "vat_14": 3000.00,
    "vat_24": 18500.00
  }
}
```

### Export Data

```http
GET /reports/invoices/export?format=csv&start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {token}
```

**Formats:** `csv`, `xlsx`, `pdf`

## SDK Examples

### JavaScript/Node.js

```javascript
const ThinkdigiAPI = require('@thinkdigi/invoice-hub-sdk');

const client = new ThinkdigiAPI({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  environment: 'production' // or 'sandbox'
});

// Create invoice
const invoice = await client.invoices.create({
  invoice_number: 'INV-2024-001',
  recipient: {
    name: 'Customer Oy',
    business_id: '1234567-8',
    email: 'billing@customer.fi'
  },
  items: [
    {
      description: 'Service',
      quantity: 1,
      unit_price: 1000.00,
      vat_rate: 24
    }
  ]
});

// Send invoice
await client.invoices.send(invoice.id);
```

### Python

```python
from thinkdigi_invoice_hub import Client

client = Client(
    client_id='your_client_id',
    client_secret='your_client_secret',
    environment='production'
)

# Create invoice
invoice = client.invoices.create({
    'invoice_number': 'INV-2024-001',
    'recipient': {
        'name': 'Customer Oy',
        'business_id': '1234567-8',
        'email': 'billing@customer.fi'
    },
    'items': [{
        'description': 'Service',
        'quantity': 1,
        'unit_price': 1000.00,
        'vat_rate': 24
    }]
})

# Send invoice
client.invoices.send(invoice['id'])
```

### PHP

```php
<?php
use Thinkdigi\InvoiceHub\Client;

$client = new Client([
    'client_id' => 'your_client_id',
    'client_secret' => 'your_client_secret',
    'environment' => 'production'
]);

// Create invoice
$invoice = $client->invoices->create([
    'invoice_number' => 'INV-2024-001',
    'recipient' => [
        'name' => 'Customer Oy',
        'business_id' => '1234567-8',
        'email' => 'billing@customer.fi'
    ],
    'items' => [[
        'description' => 'Service',
        'quantity' => 1,
        'unit_price' => 1000.00,
        'vat_rate' => 24
    ]]
]);

// Send invoice
$client->invoices->send($invoice['id']);
?>
```

## Testing

### Sandbox Environment

Use the sandbox environment for testing:

**Base URL:** `https://api-sandbox.thinkdigi.fi/v1`

### Test Data

The sandbox includes test companies and sample data:

```json
{
  "test_companies": [
    {
      "name": "Test Customer Oy",
      "business_id": "1234567-8",
      "email": "test@customer.fi"
    },
    {
      "name": "Test Supplier Oy", 
      "business_id": "8765432-1",
      "email": "test@supplier.fi"
    }
  ]
}
```

### Test Cards (for payment testing)

- **Success:** `4242424242424242`
- **Decline:** `4000000000000002`
- **Insufficient funds:** `4000000000009995`

## Support

### Documentation
- **API Reference:** https://docs.thinkdigi.fi/api
- **Guides:** https://docs.thinkdigi.fi/guides
- **SDKs:** https://docs.thinkdigi.fi/sdks

### Contact
- **Technical Support:** api-support@thinkdigi.fi
- **Sales:** sales@thinkdigi.fi
- **Status Page:** https://status.thinkdigi.fi

### Community
- **GitHub:** https://github.com/thinkdigi/invoice-hub
- **Discord:** https://discord.gg/thinkdigi
- **Stack Overflow:** Tag questions with `thinkdigi-invoice-hub`