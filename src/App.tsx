import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ShopifyAppProvider, useShopifyApp } from './components/shopify/ShopifyAppProvider';
import LandingPage from './components/LandingPage';
import { PolarisProvider } from './components/shopify/PolarisProvider';
import ShopifyInstallation from './components/shopify/ShopifyInstallation';
import ShopifyAppDashboard from './components/shopify/ShopifyAppDashboard';
import Layout from './components/Layout';
import Dashboard from './components/pages/Dashboard';
import SendInvoice from './components/pages/SendInvoice';
import InvoiceList from './components/pages/InvoiceList';
import Companies from './components/pages/Companies';
import Settings from './components/pages/Settings';
import ShopifyIntegration from './components/pages/ShopifyIntegration';
import Notifications from './components/pages/Notifications';
import LoadingSpinner from './components/LoadingSpinner';

// Component to handle Shopify app routing
const ShopifyAppContent: React.FC = () => {
  const { isInstalled, isLoading, shop } = useShopifyApp();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-600">Ladataan Shopify-sovellusta...</p>
        </div>
      </div>
    );
  }

  if (!isInstalled) {
    return <ShopifyInstallation />;
  }

  return <ShopifyAppDashboard />;
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  
  // Check if we're in Shopify app context
  const urlParams = new URLSearchParams(window.location.search);
  const isShopifyApp = urlParams.has('shop') || window.location.pathname.includes('/shopify');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'send':
        return <SendInvoice />;
      case 'outgoing':
        return <InvoiceList type="outgoing" title="Sent Invoices" />;
      case 'incoming':
        return <InvoiceList type="incoming" title="Received Invoices" />;
      case 'companies':
        return <Companies />;
      case 'notifications':
        return <Notifications />;
      case 'shopify':
        return <ShopifyIntegration />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-600">Loading Invoice Hub...</p>
        </div>
      </div>
    );
  }

  // If we're in Shopify app context, render Shopify app
  if (isShopifyApp) {
    return (
      <ShopifyAppProvider>
        <ShopifyAppContent />
      </ShopifyAppProvider>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      user={user}
    >
      {renderCurrentPage()}
    </Layout>
  );
};

function App() {
  // Check if we're in Shopify embedded context
  const urlParams = new URLSearchParams(window.location.search);
  const isShopifyApp = urlParams.has('shop') || window.location.pathname.includes('/shopify');
  
  // If Shopify app, don't wrap with AuthProvider
  if (isShopifyApp) {
    return (
      <PolarisProvider>
        <ShopifyAppProvider>
          <ShopifyAppContent />
        </ShopifyAppProvider>
      </PolarisProvider>
    );
  }
  
  return (
    <AuthProvider>
      <AppContent /> 
    </AuthProvider>
  );
}

export default App;