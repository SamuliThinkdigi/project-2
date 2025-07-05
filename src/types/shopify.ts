export interface ShopifyOrder {
  id: string;
  order_number: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  financial_status: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided';
  fulfillment_status: 'fulfilled' | 'partial' | 'unfulfilled' | null;
  customer: ShopifyCustomer;
  billing_address: ShopifyAddress;
  shipping_address: ShopifyAddress;
  line_items: ShopifyLineItem[];
  tags: string;
  note: string | null;
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  orders_count: number;
  total_spent: string;
  tags: string;
  default_address: ShopifyAddress;
}

export interface ShopifyAddress {
  id?: string;
  first_name: string;
  last_name: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string | null;
}

export interface ShopifyLineItem {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  quantity: number;
  price: string;
  total_discount: string;
  tax_lines: ShopifyTaxLine[];
  sku: string | null;
}

export interface ShopifyTaxLine {
  title: string;
  price: string;
  rate: number;
}

export interface ShopifyWebhook {
  id: string;
  topic: string;
  address: string;
  created_at: string;
  updated_at: string;
  format: 'json' | 'xml';
  fields: string[];
}

export interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  template_suffix: string | null;
  status: 'active' | 'archived' | 'draft';
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: ShopifyVariant[];
  options: ShopifyOption[];
  images: ShopifyImage[];
  image: ShopifyImage | null;
}

export interface ShopifyVariant {
  id: string;
  product_id: string;
  title: string;
  price: string;
  sku: string | null;
  position: number;
  inventory_policy: string;
  compare_at_price: string | null;
  fulfillment_service: string;
  inventory_management: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string | null;
  grams: number;
  image_id: string | null;
  weight: number;
  weight_unit: string;
  inventory_item_id: string;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
  admin_graphql_api_id: string;
}

export interface ShopifyOption {
  id: string;
  product_id: string;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyImage {
  id: string;
  product_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
  variant_ids: string[];
  admin_graphql_api_id: string;
}

export interface ShopifyIntegrationSettings {
  shopUrl: string;
  accessToken: string;
  webhookSecret: string;
  autoCreateInvoices: boolean;
  invoicePrefix: string;
  defaultPaymentTerms: number;
  syncCustomers: boolean;
  syncOrders: boolean;
  syncProducts: boolean;
  lastSyncDate: string | null;
  lastProductSyncDate: string | null;
}