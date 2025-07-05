import React from 'react';
import { 
  LayoutDashboard, 
  Send, 
  Inbox, 
  Users, 
  Settings, 
  LogOut,
  Receipt,
  Bolt,
  ShoppingBag,
  Bell,
  User
} from 'lucide-react';
import { useAuth, AuthUser } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  user: AuthUser;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange, user }) => {
  const { signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'send', label: 'Send Invoice', icon: Send },
    { id: 'outgoing', label: 'Sent Invoices', icon: Receipt },
    { id: 'incoming', label: 'Received', icon: Inbox },
    { id: 'companies', label: 'Companies', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'shopify', label: 'Shopify Sync', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-fuchsia-50 to-indigo-50 flex">
      {/* Sidebar */}
      <div className="w-72 bg-white/90 backdrop-blur-md shadow-xl border-r border-slate-200 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-50 to-indigo-50 opacity-50"></div>
        <div className="p-8 border-b border-slate-200 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-fuchsia-600 via-violet-600 to-indigo-600 p-2.5 rounded-xl shadow-lg relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-fuchsia-600 via-violet-600 to-indigo-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <Bolt className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                e-Invoice Hub
              </h1>
              <p className="text-sm text-slate-500 font-medium">by Thinkdigi</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-8 px-4 relative z-10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center px-4 py-3.5 mb-2 text-left rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-fuchsia-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 w-72 p-6 border-t border-slate-200 bg-white/80 backdrop-blur-sm relative z-10">
          {/* User Profile Section */}
          <div className="mb-4 p-3 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-600 p-2 rounded-lg shadow-md shadow-fuchsia-500/10">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user.profile.full_name || user.email}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user.profile.organizations?.name || 'No Organization'}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-fuchsia-100 to-indigo-100 text-indigo-800 mt-1 border border-indigo-200/50">
                  {user.profile.role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-fuchsia-50/30 to-indigo-50/30 pointer-events-none"></div>
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-8 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-700 via-violet-700 to-indigo-700 bg-clip-text text-transparent">
                {menuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
              </h2>
              <p className="text-slate-600 mt-1">Streamline your e-invoicing workflow</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-fuchsia-500/10 border border-white/10">
                {user.profile.organizations?.name || 'Thinkdigi Platform'}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;