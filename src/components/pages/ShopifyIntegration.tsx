import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, Settings, FolderSync as Sync, CheckCircle, AlertCircle, Zap, ExternalLink, RefreshCw, Download, Package, Globe } from 'lucide-react';
import { shopifyService } from '../../services/shopify';
import { shopifyAppService } from '../../services/shopify-app';
import { ShopifyIntegrationSettings, ShopifyOrder, ShopifyCustomer, ShopifyProduct } from '../../types/shopify';
import LoadingSpinner from '../LoadingSpinner';

const ShopifyIntegration: React.FC = () => {
  const [settings, setSettings] = useState<ShopifyIntegrationSettings>({
    shopUrl: '',
    accessToken: '',
    webhookSecret: '',
    autoCreateInvoices: true,
    invoicePrefix: 'TD-SHOP',
    defaultPaymentTerms: 30,
    syncCustomers: true,
    syncOrders: true,
    syncProducts: true,
    lastSyncDate: null,
    lastProductSyncDate: null,
  });

  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [customers, setCustomers] = useState<ShopifyCustomer[]>([]);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'settings' | 'orders' | 'customers' | 'products'>('settings');
  const [appInstallUrl, setAppInstallUrl] = useState<string>('');

  useEffect(() => {
    loadCurrentSettings();
    generateAppInstallUrl();
  }, []);

  const loadCurrentSettings = () => {
    const currentSettings = shopifyService.getSettings();
    if (currentSettings) {
      setSettings(currentSettings);
      setIsConfigured(shopifyService.isConfigured());
    }
  };

  const generateAppInstallUrl = () => {
    const baseUrl = window.location.origin;
    const installUrl = `${baseUrl}/?shop=SHOP_DOMAIN.myshopify.com`;
    setAppInstallUrl(installUrl);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await shopifyService.configureIntegration(settings);
      if (response.success) {
        setIsConfigured(true);
        setSuccess('Shopify integration configured successfully!');
      } else {
        setError(response.error || 'Failed to configure integration');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncOrders = async () => {
    setSyncing(true);
    setError(null);

    try {
      const ordersResponse = await shopifyService.getOrders(20);
      if (ordersResponse.success && ordersResponse.data) {
        setOrders(ordersResponse.data);
        setSuccess(`Loaded ${ordersResponse.data.length} orders from Shopify`);
      } else {
        setError(ordersResponse.error || 'Failed to sync orders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncCustomers = async () => {
    setSyncing(true);
    setError(null);

    try {
      const customersResponse = await shopifyService.getCustomers(20);
      if (customersResponse.success && customersResponse.data) {
        setCustomers(customersResponse.data);
        setSuccess(`Loaded ${customersResponse.data.length} customers from Shopify`);
      } else {
        setError(customersResponse.error || 'Failed to sync customers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncProducts = async () => {
    setSyncing(true);
    setError(null);

    try {
      const response = await shopifyService.syncProducts();
      if (response.success && response.data) {
        const storedProducts = shopifyService.getStoredProducts();
        setProducts(storedProducts);
        setSuccess(`Synced ${response.data.synced} products from Shopify`);
      } else {
        setError(response.error || 'Failed to sync products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateInvoicesFromOrders = async () => {
    setSyncing(true);
    setError(null);

    try {
      const senderCompany = {
        id: 'thinkdigi_comp_001',
        name: 'Thinkdigi Oy',
        businessId: '2847123-4',
        address: {
          street: 'Teknologiantie 15',
          city: 'Helsinki',
          postalCode: '00150',
          country: 'Finland'
        },
        email: 'billing@thinkdigi.fi'
      };

      const response = await shopifyService.syncOrdersToInvoices(senderCompany);
      if (response.success && response.data) {
        setSuccess(`Successfully processed ${response.data.synced} orders. ${response.data.errors.length} errors.`);
        if (response.data.errors.length > 0) {
          console.error('Sync errors:', response.data.errors);
        }
      } else {
        setError(response.error || 'Failed to create invoices from orders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <ShoppingBag className="w-8 h-8 mr-3" />
              Shopify Integration
            </h1>
            <p className="text-green-100 text-lg">Sync orders, customers, and products from your Shopify store</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
            <div className={`w-4 h-4 rounded-full ${isConfigured ? 'bg-green-400' : 'bg-red-400'}`}></div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
          <p className="text-emerald-600">{success}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-8">
            {[
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'orders', label: 'Orders', icon: ShoppingBag },
              { id: 'customers', label: 'Customers', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Shopify App Installation */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-lg mr-4">
                    <Globe className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      Shopify App Store -integraatio
                    </h3>
                    <p className="text-green-700 mb-4">
                      Asenna sovellus suoraan Shopify App Storesta saumattomaan integraatioon.
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-800 mb-2 font-medium">
                        Asennuslinkki:
                      </p>
                      <code className="text-xs bg-green-100 text-green-800 p-2 rounded block break-all">
                        {appInstallUrl}
                      </code>
                      <p className="text-xs text-green-600 mt-2">
                        Korvaa SHOP_DOMAIN kauppasi nimellä (esim. minun-kauppa.myshopify.com)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Integration Settings</h2>
                <p className="text-slate-600 mb-6">
                  Määritä Shopify-kauppasi yhteys ja synkronointiasetukset. 
                  Suosittelemme käyttämään Shopify App Store -integraatiota.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Shop URL
                  </label>
                  <input
                    type="text"
                    value={settings.shopUrl}
                    onChange={(e) => setSettings({ ...settings, shopUrl: e.target.value })}
                    placeholder="your-shop.myshopify.com"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <p className="text-xs text-slate-500 mt-1">Your Shopify store domain</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Access Token
                  </label>
                  <input
                    type="password"
                    value={settings.accessToken}
                    onChange={(e) => setSettings({ ...settings, accessToken: e.target.value })}
                    placeholder="shpat_..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <p className="text-xs text-slate-500 mt-1">Private app access token</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.invoicePrefix}
                    onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Terms (Days)
                  </label>
                  <input
                    type="number"
                    value={settings.defaultPaymentTerms}
                    onChange={(e) => setSettings({ ...settings, defaultPaymentTerms: parseInt(e.target.value) || 30 })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Sync Options</h3>
                
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-medium text-slate-900">Auto-create Invoices</span>
                    <p className="text-sm text-slate-600">Automatically create invoices from new orders</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoCreateInvoices}
                    onChange={(e) => setSettings({ ...settings, autoCreateInvoices: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-medium text-slate-900">Sync Products</span>
                    <p className="text-sm text-slate-600">Import product catalog for easy invoice creation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.syncProducts}
                    onChange={(e) => setSettings({ ...settings, syncProducts: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-medium text-slate-900">Sync Customers</span>
                    <p className="text-sm text-slate-600">Import customer data as companies</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.syncCustomers}
                    onChange={(e) => setSettings({ ...settings, syncCustomers: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-medium text-slate-900">Sync Orders</span>
                    <p className="text-sm text-slate-600">Import order data for invoice creation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.syncOrders}
                    onChange={(e) => setSettings({ ...settings, syncOrders: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Settings className="w-4 h-4 mr-2" />
                  )}
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Product Catalog</h2>
                  <p className="text-slate-600 mt-1">Sync and manage your Shopify product catalog</p>
                </div>
                <button
                  onClick={handleSyncProducts}
                  disabled={!isConfigured || syncing}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {syncing ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Sync Products
                </button>
              </div>

              {!isConfigured && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-amber-600">Please configure your Shopify integration in the Settings tab first.</p>
                </div>
              )}

              {settings.lastProductSyncDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-blue-600 text-sm">
                    Last synced: {new Date(settings.lastProductSyncDate).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No products found</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {isConfigured ? 'Click "Sync Products" to load your catalog.' : 'Configure integration to view products.'}
                    </p>
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      {product.image && (
                        <img
                          src={product.image.src}
                          alt={product.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                          {product.title}
                        </h3>
                        <div className="space-y-2 text-sm text-slate-600 mb-4">
                          <div>Vendor: {product.vendor}</div>
                          <div>Type: {product.product_type}</div>
                          <div>Variants: {product.variants.length}</div>
                          <div className="font-semibold text-slate-900">
                            €{parseFloat(product.variants[0]?.price || '0').toFixed(2)}
                            {product.variants.length > 1 && 
                              ' - €' + Math.max(...product.variants.map(v => parseFloat(v.price))).toFixed(2)
                            }
                          </div>
                        </div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Shopify Orders</h2>
                  <p className="text-slate-600 mt-1">Manage and sync orders from your Shopify store</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSyncOrders}
                    disabled={!isConfigured || syncing}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {syncing ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Sync Orders
                  </button>
                  <button
                    onClick={handleCreateInvoicesFromOrders}
                    disabled={!isConfigured || syncing || orders.length === 0}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Create Invoices
                  </button>
                </div>
              </div>

              {!isConfigured && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-amber-600">Please configure your Shopify integration in the Settings tab first.</p>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                            {isConfigured ? 'No orders found. Click "Sync Orders" to load data.' : 'Configure integration to view orders.'}
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-slate-900">{order.name}</div>
                                <div className="text-sm text-slate-500">#{order.order_number}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-slate-900">
                                  {order.customer.first_name} {order.customer.last_name}
                                </div>
                                <div className="text-sm text-slate-500">{order.customer.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              {order.currency} {parseFloat(order.total_price).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.financial_status === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.financial_status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              <button className="text-blue-600 hover:text-blue-800 flex items-center">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Shopify Customers</h2>
                  <p className="text-slate-600 mt-1">Import customers as companies for invoicing</p>
                </div>
                <button
                  onClick={handleSyncCustomers}
                  disabled={!isConfigured || syncing}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {syncing ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Sync Customers
                </button>
              </div>

              {!isConfigured && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-amber-600">Please configure your Shopify integration in the Settings tab first.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No customers found</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {isConfigured ? 'Click "Sync Customers" to load data.' : 'Configure integration to view customers.'}
                    </p>
                  </div>
                ) : (
                  customers.map((customer) => (
                    <div key={customer.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {customer.first_name} {customer.last_name}
                            </h3>
                            <p className="text-sm text-slate-500">{customer.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-slate-600">
                        <div>Orders: {customer.orders_count}</div>
                        <div>Total Spent: ${parseFloat(customer.total_spent).toFixed(2)}</div>
                        <div>Joined: {new Date(customer.created_at).toLocaleDateString()}</div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <button className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                          Import as Company
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopifyIntegration;