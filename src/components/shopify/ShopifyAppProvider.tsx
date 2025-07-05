import React, { createContext, useContext, useEffect, useState } from 'react';
import { shopifyAppService } from '../../services/shopify-app';
import { ShopifySession } from '../../types/shopify-app';
import { createApp, AppBridgeState } from '@shopify/app-bridge';

interface ShopifyAppContextType {
  session: ShopifySession | null;
  shop: string | null;
  isInstalled: boolean;
  isLoading: boolean;
  installApp: (shop: string) => void;
  appBridge: any;
  uninstallApp: () => Promise<void>;
}

const ShopifyAppContext = createContext<ShopifyAppContextType | undefined>(undefined);

export const useShopifyApp = () => {
  const context = useContext(ShopifyAppContext);
  if (context === undefined) {
    throw new Error('useShopifyApp must be used within a ShopifyAppProvider');
  }
  return context;
};

interface ShopifyAppProviderProps {
  children: React.ReactNode;
}

export const ShopifyAppProvider: React.FC<ShopifyAppProviderProps> = ({ children }) => {
  const [session, setSession] = useState<ShopifySession | null>(null);
  const [shop, setShop] = useState<string | null>(null);
  const [appBridge, setAppBridge] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if we're in an embedded context (iframe)
      const urlParams = new URLSearchParams(window.location.search || window.location.hash.substring(1));
      const shopParam = urlParams.get('shop');
      
      if (shopParam && shopifyAppService.isValidShop(shopParam)) {
        setShop(shopParam);
        
        // Check if shop is already installed
        const existingSession = shopifyAppService.getSession(shopParam);
        if (existingSession) {
          setSession(existingSession);
        } else {
          // Check for OAuth callback
          const code = urlParams.get('code');
          const state = urlParams.get('state');
          
          if (code && state && !urlParams.get('embedded')) {
            await handleOAuthCallback(shopParam, code, state);
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize Shopify app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthCallback = async (shop: string, code: string, state: string) => {
    const result = await shopifyAppService.handleOAuthCallback(shop, code, state, true);
    if (result.success && result.data) {
      setSession(result.data);
      // Redirect to clean URL
      window.history.replaceState({}, '', `/?shop=${shop}`);
    } else {
      console.error('OAuth callback failed:', result.error);
    }
  };

  const installApp = (shopDomain: string) => {
    if (!shopifyAppService.isValidShop(shopDomain)) {
      throw new Error('Invalid shop domain');
    }
    
    const installUrl = shopifyAppService.generateInstallUrl(shopDomain);
    window.location.href = installUrl;
  };

  const uninstallApp = async () => {
    if (shop) {
      try {
        await shopifyAppService.uninstall(shop);
      } catch (error) {
        console.error('Failed to uninstall app:', error);
      }
      setSession(null); 
      setShop(null);
    }
  };

  const isInstalled = session !== null;

  const value = {
    session,
    shop,
    isInstalled,
    isLoading,
    installApp,
    appBridge,
    uninstallApp
  };

  // Initialize App Bridge if we have a session
  useEffect(() => {
    if (session && shop) {
      const apiKey = shopifyAppService.getConfig().apiKey;
      if (!apiKey) {
        console.error('Shopify API key not configured');
        return;
      }

      let config;
      try {
        const host = window.btoa(`${shop}/admin`);
        config = {
          apiKey,
          host: host,
          forceRedirect: false
        };
      } catch (error) {
        console.error('Failed to create App Bridge config:', error);
        return;
      }
      const app = createApp(config);
      // Store app instance globally for components that need it
      setAppBridge(app);
      (window as any).__SHOPIFY_APP_BRIDGE__ = app;
    }
  }, [session, shop]);


  return (
    <ShopifyAppContext.Provider value={value}>
      {children}
    </ShopifyAppContext.Provider>
  );
};