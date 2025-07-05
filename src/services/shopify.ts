import { ShopifyOrder, ShopifyCustomer, ShopifyIntegrationSettings, ShopifyWebhook, ShopifyProduct } from '../types/shopify';
import { Company, Invoice, InvoiceItem } from '../types/invoice';
import { ApiResponse } from '../types/invoice';

class ShopifyService {
  private settings: ShopifyIntegrationSettings | null = null;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    const settings = localStorage.getItem('thinkdigi_shopify_settings');
    if (settings) {
      this.settings = JSON.parse(settings);
    }
  }

  private saveSettings(settings: ShopifyIntegrationSettings) {
    localStorage.setItem('thinkdigi_shopify_settings', JSON.stringify(settings));
    this.settings = settings;
  }

  private async makeShopifyRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (!this.settings) {
      return { success: false, error: 'Shopify integration not configured' };
    }

    try {
      const url = `https://${this.settings.shopUrl}/admin/api/2024-01/${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.settings.accessToken,
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.errors || `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async configureIntegration(settings: ShopifyIntegrationSettings): Promise<ApiResponse<boolean>> {
    // Validate connection by testing API access
    const testResponse = await this.makeShopifyRequest<{ shop: any }>('shop.json');
    
    if (!testResponse.success) {
      return { success: false, error: 'Failed to connect to Shopify: ' + testResponse.error };
    }

    this.saveSettings(settings);
    return { success: true, data: true };
  }

  async getOrders(limit: number = 50, since_id?: string): Promise<ApiResponse<ShopifyOrder[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      status: 'any',
      ...(since_id && { since_id }),
    });

    const response = await this.makeShopifyRequest<{ orders: ShopifyOrder[] }>(`orders.json?${params}`);
    
    if (response.success && response.data) {
      return { success: true, data: response.data.orders };
    }
    
    return response as ApiResponse<ShopifyOrder[]>;
  }

  async getCustomers(limit: number = 50, since_id?: string): Promise<ApiResponse<ShopifyCustomer[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(since_id && { since_id }),
    });

    const response = await this.makeShopifyRequest<{ customers: ShopifyCustomer[] }>(`customers.json?${params}`);
    
    if (response.success && response.data) {
      return { success: true, data: response.data.customers };
    }
    
    return response as ApiResponse<ShopifyCustomer[]>;
  }

  async getProducts(limit: number = 250, since_id?: string): Promise<ApiResponse<ShopifyProduct[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      status: 'active',
      ...(since_id && { since_id }),
    });

    const response = await this.makeShopifyRequest<{ products: ShopifyProduct[] }>(`products.json?${params}`);
    
    if (response.success && response.data) {
      return { success: true, data: response.data.products };
    }
    
    return response as ApiResponse<ShopifyProduct[]>;
  }

  async getProductById(productId: string): Promise<ApiResponse<ShopifyProduct>> {
    const response = await this.makeShopifyRequest<{ product: ShopifyProduct }>(`products/${productId}.json`);
    
    if (response.success && response.data) {
      return { success: true, data: response.data.product };
    }
    
    return response as ApiResponse<ShopifyProduct>;
  }

  async getOrderById(orderId: string): Promise<ApiResponse<ShopifyOrder>> {
    const response = await this.makeShopifyRequest<{ order: ShopifyOrder }>(`orders/${orderId}.json`);
    
    if (response.success && response.data) {
      return { success: true, data: response.data.order };
    }
    
    return response as ApiResponse<ShopifyOrder>;
  }

  convertShopifyCustomerToCompany(customer: ShopifyCustomer): Company {
    const address = customer.default_address;
    
    return {
      id: `shopify_customer_${customer.id}`,
      name: address?.company || `${customer.first_name} ${customer.last_name}`,
      businessId: customer.id, // In production, you'd want to map this to actual business ID
      address: {
        street: `${address?.address1 || ''} ${address?.address2 || ''}`.trim(),
        city: address?.city || '',
        postalCode: address?.zip || '',
        country: address?.country || 'Finland',
      },
      email: customer.email,
      phone: customer.phone || address?.phone || undefined,
    };
  }

  convertShopifyOrderToInvoice(order: ShopifyOrder, senderCompany: Company): Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> {
    const recipient = this.convertShopifyCustomerToCompany(order.customer);
    
    const items: InvoiceItem[] = order.line_items.map((lineItem, index) => {
      const unitPrice = parseFloat(lineItem.price);
      const quantity = lineItem.quantity;
      const subtotal = unitPrice * quantity;
      
      // Calculate VAT rate from tax lines
      const vatRate = lineItem.tax_lines.length > 0 
        ? lineItem.tax_lines[0].rate * 100 
        : 24; // Default Finnish VAT rate
      
      const vatAmount = subtotal * (vatRate / 100);
      const total = subtotal + vatAmount;

      return {
        id: `shopify_item_${lineItem.id}`,
        description: lineItem.title,
        quantity,
        unitPrice,
        vatRate,
        total,
      };
    });

    const subtotal = parseFloat(order.subtotal_price);
    const vatAmount = parseFloat(order.total_tax);
    const total = parseFloat(order.total_price);

    // Calculate due date based on settings
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (this.settings?.defaultPaymentTerms || 30));

    return {
      invoiceNumber: `${this.settings?.invoicePrefix || 'TD-SHOP'}-${order.order_number}`,
      status: order.financial_status === 'paid' ? 'paid' : 'sent',
      type: 'outgoing',
      sender: senderCompany,
      recipient,
      issueDate: new Date(order.created_at).toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      items,
      subtotal,
      vatAmount,
      total,
      currency: order.currency,
      notes: order.note || `Shopify Order #${order.name}`,
    };
  }

  async syncOrdersToInvoices(senderCompany: Company): Promise<ApiResponse<{ synced: number; errors: string[] }>> {
    if (!this.settings?.syncOrders) {
      return { success: false, error: 'Order sync is disabled' };
    }

    const ordersResponse = await this.getOrders();
    if (!ordersResponse.success || !ordersResponse.data) {
      return { success: false, error: 'Failed to fetch orders from Shopify' };
    }

    const results = { synced: 0, errors: [] as string[] };

    for (const order of ordersResponse.data) {
      try {
        // Only sync paid orders or orders that should be invoiced
        if (order.financial_status === 'paid' || this.settings.autoCreateInvoices) {
          const invoice = this.convertShopifyOrderToInvoice(order, senderCompany);
          
          // Here you would typically save to your database or send via API
          // For demo purposes, we'll just count successful conversions
          results.synced++;
        }
      } catch (error) {
        results.errors.push(`Order ${order.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update last sync date
    if (this.settings) {
      this.settings.lastSyncDate = new Date().toISOString();
      this.saveSettings(this.settings);
    }

    return { success: true, data: results };
  }

  async syncProducts(): Promise<ApiResponse<{ synced: number; errors: string[] }>> {
    if (!this.settings?.syncProducts) {
      return { success: false, error: 'Product sync is disabled' };
    }

    const productsResponse = await this.getProducts();
    if (!productsResponse.success || !productsResponse.data) {
      return { success: false, error: 'Failed to fetch products from Shopify' };
    }

    const results = { synced: 0, errors: [] as string[] };

    try {
      // Store products in localStorage for the product picker
      const products = productsResponse.data;
      localStorage.setItem('thinkdigi_shopify_products', JSON.stringify(products));
      results.synced = products.length;

      // Update last product sync date
      if (this.settings) {
        this.settings.lastProductSyncDate = new Date().toISOString();
        this.saveSettings(this.settings);
      }
    } catch (error) {
      results.errors.push(`Product sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { success: true, data: results };
  }

  getStoredProducts(): ShopifyProduct[] {
    const products = localStorage.getItem('thinkdigi_shopify_products');
    return products ? JSON.parse(products) : [];
  }

  searchProducts(query: string): ShopifyProduct[] {
    const products = this.getStoredProducts();
    if (!query.trim()) return products;

    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.title.toLowerCase().includes(searchTerm) ||
      product.vendor.toLowerCase().includes(searchTerm) ||
      product.product_type.toLowerCase().includes(searchTerm) ||
      product.tags.toLowerCase().includes(searchTerm) ||
      product.variants.some(variant => 
        variant.sku?.toLowerCase().includes(searchTerm) ||
        variant.title.toLowerCase().includes(searchTerm)
      )
    );
  }

  async setupWebhooks(): Promise<ApiResponse<ShopifyWebhook[]>> {
    if (!this.settings) {
      return { success: false, error: 'Shopify integration not configured' };
    }

    const webhooks = [
      {
        topic: 'orders/create',
        address: `${window.location.origin}/api/webhooks/shopify/orders/create`,
        format: 'json' as const,
      },
      {
        topic: 'orders/updated',
        address: `${window.location.origin}/api/webhooks/shopify/orders/updated`,
        format: 'json' as const,
      },
      {
        topic: 'orders/paid',
        address: `${window.location.origin}/api/webhooks/shopify/orders/paid`,
        format: 'json' as const,
      },
      {
        topic: 'products/create',
        address: `${window.location.origin}/api/webhooks/shopify/products/create`,
        format: 'json' as const,
      },
      {
        topic: 'products/update',
        address: `${window.location.origin}/api/webhooks/shopify/products/update`,
        format: 'json' as const,
      },
    ];

    const createdWebhooks: ShopifyWebhook[] = [];

    for (const webhook of webhooks) {
      const response = await this.makeShopifyRequest<{ webhook: ShopifyWebhook }>('webhooks.json', {
        method: 'POST',
        body: JSON.stringify({ webhook }),
      });

      if (response.success && response.data) {
        createdWebhooks.push(response.data.webhook);
      }
    }

    return { success: true, data: createdWebhooks };
  }

  isConfigured(): boolean {
    return !!(this.settings?.shopUrl && this.settings?.accessToken);
  }

  getSettings(): ShopifyIntegrationSettings | null {
    return this.settings;
  }
}

export const shopifyService = new ShopifyService();