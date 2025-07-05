import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, Shield, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useShopifyApp } from './ShopifyAppProvider';
import LoadingSpinner from '../LoadingSpinner';

const ShopifyInstallation: React.FC = () => {
  const { installApp, isLoading } = useShopifyApp();
  const [shopDomain, setShopDomain] = useState('');
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleInstall = async () => {
    if (!shopDomain.trim()) {
      setError('Please enter your shop domain');
      return;
    }

    setInstalling(true);
    setError(null);

    try {
      // Normalize shop domain
      let normalizedDomain = shopDomain.trim().toLowerCase();
      
      // Remove protocol and www if present
      normalizedDomain = normalizedDomain.replace(/^https?:\/\//, '');
      normalizedDomain = normalizedDomain.replace(/^www\./, '');
      
      // Add .myshopify.com if not present
      if (!normalizedDomain.includes('.myshopify.com')) {
        normalizedDomain = `${normalizedDomain}.myshopify.com`;
      }

      setDebugInfo(`Attempting to install for shop: ${normalizedDomain}`);
      installApp(normalizedDomain);
    } catch (err) {
      console.error('Installation error:', err);
      setDebugInfo(
        `Installation error: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
      setError(err instanceof Error ? err.message : 'Installation failed');
      setInstalling(false);
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'Automaattinen laskutus',
      description: 'Luo laskuja automaattisesti Shopify-tilauksista'
    },
    {
      icon: Shield,
      title: 'Turvallinen integraatio',
      description: 'Suojattu yhteys Maventa e-laskutuspalveluun'
    },
    {
      icon: CheckCircle,
      title: 'Reaaliaikainen synkronointi',
      description: 'Tuotteet, asiakkaat ja tilaukset synkronoidaan automaattisesti'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="absolute top-4 right-4 text-xs text-gray-500">Debug: Loading Shopify App Provider</div>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-600">Ladataan Shopify-integraatiota...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="absolute top-4 right-4 text-xs text-gray-500">Debug: ShopifyInstallation Component</div>
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="absolute top-4 right-4 text-xs text-gray-500">
          <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mr-4">Tietosuojaseloste</a>
          <a href="/support.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Tuki</a>
        </div>
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/25 mb-8">
            <ShoppingBag className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Thinkdigi Invoice Hub
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            Shopify-integraatio e-laskutukseen
          </p>
          <p className="text-slate-500">
            Yhdistä Shopify-kauppasi Maventa e-laskutuspalveluun
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl w-fit mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Installation Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Asenna sovellus
            </h2>
            <p className="text-slate-600">
              Syötä Shopify-kauppasi domain-nimi aloittaaksesi
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}
          
          {debugInfo && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Shopify-kaupan domain
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={shopDomain}
                  onChange={(e) => setShopDomain(e.target.value)}
                  placeholder="esimerkki-kauppa"
                  className="w-full px-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pr-32"
                  disabled={installing}
                />
                <div className="absolute right-4 top-4 text-slate-500 text-sm">
                  .myshopify.com
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Syötä vain kaupan nimi ilman .myshopify.com -päätettä
              </p>
            </div>

            <button
              onClick={handleInstall}
              disabled={installing || !shopDomain.trim()}
              className="w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
            >
              {installing ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 mr-2" />
                </>
              )}
              {installing ? 'Asennetaan...' : 'Asenna sovellus'}
              {!installing && <ArrowRight className="w-5 h-5 ml-2" />}
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500">App URL: {window.location.origin}</div>
          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-4">
                Klikkaamalla "Asenna sovellus" hyväksyt sovelluksen käyttöehdot
              </p>
              <div className="flex items-center justify-center space-x-6 text-xs text-slate-400">
                <span>🔒 Turvallinen yhteys</span>
                <span>✅ GDPR-yhteensopiva</span>
                <span>🇫🇮 Suomalainen palvelu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center mt-12">
          <p className="text-slate-500 text-sm mb-4">
            Tarvitsetko apua asennuksessa?
          </p>
          <div className="flex items-center justify-center space-x-6">
            <a 
              href="mailto:support@thinkdigi.fi" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              📧 support@thinkdigi.fi
            </a>
            <a 
              href="tel:+358501234567" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              📞 +358 50 123 4567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopifyInstallation;