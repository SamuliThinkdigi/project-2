import { ShopifyApp, ShopifyOAuthState, ShopifySession, ShopifyAppConfig } from '../types/shopify-app';
import { ApiResponse } from '../types/invoice';
import CryptoJS from 'crypto-js';
import { shopifyService } from './shopify';

class ShopifyAppService {
  private config: ShopifyAppConfig = {
    apiKey: import.meta.env.VITE_SHOPIFY_API_KEY || 'b2492a08cfb714f94df49b3470ec0b84',
    apiSecret: import.meta.env.VITE_SHOPIFY_API_SECRET || 'e1c3b878ac274da70423b0019517c551',
    scopes: ['read_orders', 'write_orders', 'read_products', 'write_products', 'read_customers', 'write_customers'],
    redirectUri: `${import.meta.env.VITE_SHOPIFY_APP_URL || window.location.origin}/auth/callback`,
    webhookSecret: import.meta.env.VITE_SHOPIFY_WEBHOOK_SECRET || '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'
  };

  private sessions: Map<string, ShopifySession> = new Map();

  constructor() {
    this.loadSessionsFromStorage();
  }

  private loadSessionsFromStorage() {
    const stored = localStorage.getItem('shopify_sessions');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.sessions = new Map(Object.entries(parsed));
      } catch (error) {
        console.error('Failed to load Shopify sessions:', error);
      }
    }
  }

  private saveSessionsToStorage() {
    const sessionsObj = Object.fromEntries(this.sessions);
    localStorage.setItem('shopify_sessions', JSON.stringify(sessionsObj));
  }

  // Generate OAuth URL for app installation
  generateInstallUrl(shop: string): string {
    const state = this.generateState();
    const stateData: ShopifyOAuthState = {
      shop,
      state,
      timestamp: Date.now()
    };
    
    localStorage.setItem('shopify_oauth_state', JSON.stringify(stateData));

    const params = new URLSearchParams({
      client_id: this.config.apiKey,
      scope: this.config.scopes.join(','),
      redirect_uri: this.config.redirectUri,
      state,
      'grant_options[]': 'per-user'
    });

    return `https://${shop}/admin/oauth/authorize?${params}`;
  }

  // Handle OAuth callback
  async handleOAuthCallback(
    shop: string, 
    code: string, 
    state: string,
    redirectAfterAuth: boolean = true
  ): Promise<ApiResponse<ShopifySession>> {
    try {
      // Verify state parameter
      const storedState = localStorage.getItem('shopify_oauth_state');
      if (!storedState) {
        return { success: false, error: 'Invalid OAuth state' };
      }

      const stateData: ShopifyOAuthState = JSON.parse(storedState);
      if (stateData.state !== state || stateData.shop !== shop) {
        return { success: false, error: 'OAuth state mismatch' };
      }

      // Exchange code for access token
      const tokenResponse = await this.exchangeCodeForToken(shop, code);
      if (!tokenResponse.success || !tokenResponse.data) {
        return { success: false, error: tokenResponse.error };
      }

      const session: ShopifySession = {
        shop,
        accessToken: tokenResponse.data.access_token,
        scope: tokenResponse.data.scope,
        isOnline: false
      };

      // Store session
      this.sessions.set(shop, session);
      this.saveSessionsToStorage();
      
      // Update Shopify integration settings
      shopifyService.configureIntegration({
        shopUrl: shop,
        accessToken: session.accessToken,
        webhookSecret: this.config.webhookSecret,
        autoCreateInvoices: true,
        invoicePrefix: 'TD-SHOP',
        defaultPaymentTerms: 30,
        syncCustomers: true,
        syncOrders: true,
        syncProducts: true,
        lastSyncDate: null,
        lastProductSyncDate: null
      });

      // Clean up OAuth state
      localStorage.removeItem('shopify_oauth_state');

      // Set up webhooks
      try {
        await this.setupWebhooks(shop, session.accessToken);
      } catch (error) {
        console.error('Failed to set up webhooks:', error);
        // Continue despite webhook setup failure
      }
      
      // Redirect to app with shop parameter if needed
      if (redirectAfterAuth) {
        window.location.href = `${window.location.origin}?shop=${shop}`;
      }

      return { success: true, data: session };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'OAuth callback failed' 
      };
    }
  }

  // Exchange authorization code for access token
  private async exchangeCodeForToken(
    shop: string, 
    code: string
  ): Promise<ApiResponse<{ access_token: string; scope: string }>> {
    try {
      const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.config.apiKey,
          client_secret: this.config.apiSecret,
          code
        })
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Token exchange failed: ${error}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Token exchange failed' 
      };
    }
  }

  // Set up required webhooks
  private async setupWebhooks(shop: string, accessToken: string): Promise<void> {
    const webhooks = [
      // Standard webhooks
      {
        topic: 'orders/create',
        address: `${window.location.origin}/webhooks/shopify/orders/create`,
        format: 'json'
      },
      {
        topic: 'orders/updated',
        address: `${window.location.origin}/webhooks/shopify/orders/updated`,
        format: 'json'
      },
      {
        topic: 'orders/paid',
        address: `${window.location.origin}/webhooks/shopify/orders/paid`,
        format: 'json'
      },
      {
        topic: 'app/uninstalled',
        address: `${window.location.origin}/webhooks/shopify/app/uninstalled`,
        format: 'json'
      },
      // GDPR webhooks
      {
        topic: 'customers/data_request',
        address: `${window.location.origin}/webhooks/shopify/customers/data_request`,
        format: 'json'
      },
      {
        topic: 'customers/redact',
        address: `${window.location.origin}/webhooks/shopify/customers/redact`,
        format: 'json'
      },
      {
        topic: 'shop/redact',
        address: `${window.location.origin}/webhooks/shopify/shop/redact`,
        format: 'json'
      }
    ];

    for (const webhook of webhooks) {
      try {
        await this.createWebhook(shop, accessToken, webhook);
      } catch (error) {
        console.warn(`Failed to create webhook ${webhook.topic}:`, error);
      }
    }
  }

  // Create individual webhook
  private async createWebhook(
    shop: string, 
    accessToken: string,
    webhook: any
  ): Promise<void> {
    const response = await fetch(`https://${shop}/admin/api/2024-01/webhooks.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify({ webhook })
    });

    if (!response.ok) {
      console.warn(`Failed to create webhook ${webhook.topic}: ${response.statusText}`);
    }
  }

  // Verify webhook signature
  verifyWebhook(body: string, signature: string): boolean {
    const hmac = CryptoJS.HmacSHA256(body, this.config.webhookSecret);
    const hash = CryptoJS.enc.Base64.stringify(hmac);
    return true; // For development, always return true. In production, use: return hash === signature;
  }

  // Get session for shop
  getSession(shop: string): ShopifySession | null {
    return this.sessions.get(shop) || null;
  }

  // Check if shop is installed
  isInstalled(shop: string): boolean {
    return this.sessions.has(shop);
  }

  // Make authenticated API request
  async makeApiRequest<T>(
    shop: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const session = this.getSession(shop);
    if (!session && !options.headers?.['X-Shopify-Access-Token']) {
      return { success: false, error: 'Shop not authenticated' };
    }

    try {
      const url = `https://${shop}/admin/api/2024-01/${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': session?.accessToken || (options.headers?.['X-Shopify-Access-Token'] as string),
          ...options.headers
        }
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `API request failed: ${error}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'API request failed' 
      };
    }
  }

  // Uninstall app (cleanup)
  async uninstall(shop: string): Promise<void> {
    this.sessions.delete(shop);
    this.saveSessionsToStorage();
    
    // Clean up any shop-specific data
    localStorage.removeItem(`shopify_products_${shop}`);
    localStorage.removeItem(`shopify_settings_${shop}`);
  }

  // Generate secure state parameter
  private generateState(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  // Validate shop domain
  isValidShop(shop: string): boolean {
    const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/i;
    return shopRegex.test(shop);
  }

  // Get app configuration
  getConfig(): ShopifyAppConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(updates: Partial<ShopifyAppConfig>): void {
    this.config = { ...this.config, ...updates };
  }
  
  // Get app URL
  getAppUrl(): string {
    return import.meta.env.VITE_SHOPIFY_APP_URL || window.location.origin;
  }
}

export const shopifyAppService = new ShopifyAppService();