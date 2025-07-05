import React, { useState, useEffect } from 'react';
import { Save, Key, Building, Bell, Shield, Database, Webhook, TestTube, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { maventaService } from '../../services/maventa';
import { MaventaWebhook, MaventaProfile } from '../../types/maventa';
import LoadingSpinner from '../LoadingSpinner';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    // API Settings
    apiEndpoint: 'https://api-test.maventa.com/v1',
    clientId: 'demo_client_id',
    clientSecret: 'demo_client_secret',
    testMode: true,
    
    // Company Settings
    companyName: 'Thinkdigi Oy',
    businessId: '2847123-4',
    vatId: 'FI28471234',
    country: 'FI',
    
    // Notification Settings
    emailNotifications: true,
    invoiceReminders: true,
    paymentNotifications: true,
    webhookNotifications: true,
    
    // Security Settings
    sessionTimeout: 30,
    requireTwoFactor: false,
    
    // Integration Settings
    autoSendInvoices: false,
    validateBeforeSending: true,
    enableAttachments: true,
    maxAttachmentSize: 10, // MB
  });

  const [webhooks, setWebhooks] = useState<MaventaWebhook[]>([]);
  const [profile, setProfile] = useState<MaventaProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [activeTab, setActiveTab] = useState<'api' | 'company' | 'notifications' | 'security' | 'webhooks'>('api');

  useEffect(() => {
    loadSettings();
    checkConnection();
  }, []);

  const loadSettings = async () => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('thinkdigi_settings');
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }

    // Load webhooks and profile if authenticated
    if (maventaService.isAuthenticated()) {
      await loadWebhooks();
      await loadProfile();
    }
  };

  const loadWebhooks = async () => {
    setLoading(true);
    try {
      const response = await maventaService.getWebhooks();
      if (response.success && response.data) {
        setWebhooks(response.data);
      }
    } catch (err) {
      console.error('Failed to load webhooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const response = await maventaService.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const checkConnection = () => {
    setConnectionStatus(maventaService.isAuthenticated() ? 'connected' : 'disconnected');
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Save settings to localStorage
      localStorage.setItem('thinkdigi_settings', JSON.stringify(settings));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateWebhook = async () => {
    if (!maventaService.isAuthenticated()) {
      setError('Please authenticate first');
      return;
    }

    try {
      const webhook = {
        url: `${window.location.origin}/api/webhooks/maventa`,
        events: [
          'invoice.sent',
          'invoice.delivered',
          'invoice.paid',
          'invoice.rejected',
          'company.verified'
        ],
        active: true
      };

      const response = await maventaService.createWebhook(webhook);
      if (response.success && response.data) {
        setWebhooks([...webhooks, response.data]);
      } else {
        setError(response.error?.message || 'Failed to create webhook');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create webhook');
    }
  };

  const handleDeleteWebhook = async (uuid: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const response = await maventaService.deleteWebhook(uuid);
      if (response.success) {
        setWebhooks(webhooks.filter(w => w.uuid !== uuid));
      } else {
        setError(response.error?.message || 'Failed to delete webhook');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete webhook');
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await maventaService.authenticate(
        settings.clientId,
        settings.clientSecret,
        settings.testMode
      );
      
      if (response.success) {
        setConnectionStatus('connected');
        alert('Connection successful! ✅');
        await loadProfile();
      } else {
        setConnectionStatus('disconnected');
        setError(response.error?.message || 'Connection failed');
      }
    } catch (err) {
      setConnectionStatus('disconnected');
      setError(err instanceof Error ? err.message : 'Connection test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure your Maventa e-invoicing platform</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
            connectionStatus === 'connected' 
              ? 'bg-green-100 text-green-800' 
              : connectionStatus === 'disconnected'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {connectionStatus === 'connected' ? (
              <CheckCircle className="w-4 h-4 mr-1.5" />
            ) : (
              <AlertCircle className="w-4 h-4 mr-1.5" />
            )}
            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600">Settings saved successfully!</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {profile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-blue-800 font-medium">Connected as: {profile.name}</p>
              <p className="text-blue-600 text-sm">{profile.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-8">
            {[
              { id: 'api', label: 'API Configuration', icon: Key },
              { id: 'company', label: 'Company Info', icon: Building },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'webhooks', label: 'Webhooks', icon: Webhook },
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
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Maventa API Configuration</h2>
                <p className="text-slate-600 mb-6">Configure your connection to the Maventa e-invoicing platform.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Environment
                  </label>
                  <select
                    value={settings.testMode ? 'test' : 'production'}
                    onChange={(e) => {
                      const isTest = e.target.value === 'test';
                      handleInputChange('testMode', isTest);
                      handleInputChange('apiEndpoint', isTest ? 'https://api-test.maventa.com/v1' : 'https://api.maventa.com/v1');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="test">Test Environment</option>
                    <option value="production">Production Environment</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {settings.testMode ? 'Safe testing environment' : 'Live production environment'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Endpoint
                  </label>
                  <input
                    type="url"
                    value={settings.apiEndpoint}
                    onChange={(e) => handleInputChange('apiEndpoint', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={settings.clientId}
                    onChange={(e) => handleInputChange('clientId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your Maventa client ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={settings.clientSecret}
                    onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your Maventa client secret"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={testConnection}
                  disabled={loading || !settings.clientId || !settings.clientSecret}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <TestTube className="w-4 h-4 mr-2" />
                  )}
                  Test Connection
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Integration Options</h3>
                
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-medium text-slate-900">Auto-send Invoices</span>
                    <p className="text-sm text-slate-600">Automatically send invoices after creation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoSendInvoices}
                    onChange={(e) => handleInputChange('autoSendInvoices', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-medium text-slate-900">Validate Before Sending</span>
                    <p className="text-sm text-slate-600">Validate invoice data before transmission</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.validateBeforeSending}
                    onChange={(e) => handleInputChange('validateBeforeSending', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-medium text-slate-900">Enable Attachments</span>
                    <p className="text-sm text-slate-600">Allow file attachments on invoices</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableAttachments}
                    onChange={(e) => handleInputChange('enableAttachments', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Company Information</h2>
                <p className="text-slate-600 mb-6">Your company details for e-invoicing.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business ID
                  </label>
                  <input
                    type="text"
                    value={settings.businessId}
                    onChange={(e) => handleInputChange('businessId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VAT ID
                  </label>
                  <input
                    type="text"
                    value={settings.vatId}
                    onChange={(e) => handleInputChange('vatId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={settings.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="FI">Finland</option>
                    <option value="SE">Sweden</option>
                    <option value="NO">Norway</option>
                    <option value="DK">Denmark</option>
                    <option value="DE">Germany</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Notification Settings</h2>
                <p className="text-slate-600 mb-6">Configure how you receive notifications about invoice activities.</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-medium text-slate-900">Email Notifications</span>
                    <p className="text-sm text-slate-600">Receive email alerts for invoice activities</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-medium text-slate-900">Invoice Reminders</span>
                    <p className="text-sm text-slate-600">Automatic reminders for overdue invoices</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.invoiceReminders}
                    onChange={(e) => handleInputChange('invoiceReminders', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-medium text-slate-900">Payment Notifications</span>
                    <p className="text-sm text-slate-600">Alerts when payments are received</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.paymentNotifications}
                    onChange={(e) => handleInputChange('paymentNotifications', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-medium text-slate-900">Webhook Notifications</span>
                    <p className="text-sm text-slate-600">Real-time webhook notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.webhookNotifications}
                    onChange={(e) => handleInputChange('webhookNotifications', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Security Settings</h2>
                <p className="text-slate-600 mb-6">Authentication and security configuration.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={settings.sessionTimeout}
                    onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="240">4 hours</option>
                  </select>
                </div>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-medium text-slate-900">Two-Factor Authentication</span>
                    <p className="text-sm text-slate-600">Require 2FA for enhanced security</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.requireTwoFactor}
                    onChange={(e) => handleInputChange('requireTwoFactor', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attachment Size (MB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={settings.maxAttachmentSize}
                    onChange={(e) => handleInputChange('maxAttachmentSize', parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Webhook Configuration</h2>
                  <p className="text-slate-600 mt-1">Manage real-time notifications via webhooks</p>
                </div>
                <button
                  onClick={handleCreateWebhook}
                  disabled={!maventaService.isAuthenticated()}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Webhook className="w-4 h-4 mr-2" />
                  Create Webhook
                </button>
              </div>

              {!maventaService.isAuthenticated() && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-amber-600">Please authenticate with Maventa API first to manage webhooks.</p>
                </div>
              )}

              <div className="space-y-4">
                {webhooks.length === 0 ? (
                  <div className="text-center py-12">
                    <Webhook className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No webhooks configured</p>
                    <p className="text-slate-400 text-sm mt-1">Create a webhook to receive real-time notifications</p>
                  </div>
                ) : (
                  webhooks.map((webhook) => (
                    <div key={webhook.uuid} className="bg-white border border-slate-200 rounded-xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Globe className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-slate-900">{webhook.url}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              webhook.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {webhook.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="text-sm text-slate-600 mb-2">
                            <strong>Events:</strong> {webhook.events.join(', ')}
                          </div>
                          <div className="text-xs text-slate-500">
                            Created: {new Date(webhook.created_at).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteWebhook(webhook.uuid)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
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

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;