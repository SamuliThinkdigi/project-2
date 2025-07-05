export interface ShopifyApp {
  shop: string;
  accessToken: string;
  scope: string;
  installedAt: string;
  isActive: boolean;
}

export interface ShopifyOAuthState {
  shop: string;
  state: string;
  timestamp: number;
}

export interface ShopifyWebhookPayload {
  id: string;
  topic: string;
  shop_domain: string;
  payload: any;
  created_at: string;
}

export interface ShopifyAppConfig {
  apiKey: string;
  apiSecret: string;
  scopes: string[];
  redirectUri: string;
  webhookSecret: string;
}

export interface ShopifySession {
  shop: string;
  accessToken: string;
  scope: string;
  expires?: string;
  isOnline: boolean;
}