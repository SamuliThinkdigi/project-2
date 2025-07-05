import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle, Euro, Calendar, Zap, ArrowUpRight } from 'lucide-react';
import { apiService } from '../../services/api';
import { Invoice } from '../../types/invoice';
import LoadingSpinner from '../LoadingSpinner';
import StatusBadge from '../StatusBadge';

const Dashboard: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getInvoices();
      if (response.success && response.data) {
        setInvoices(response.data);
      } else {
        setError(response.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalOutgoing: invoices.filter(inv => inv.type === 'outgoing').length,
    totalIncoming: invoices.filter(inv => inv.type === 'incoming').length,
    pendingPayments: invoices.filter(inv => inv.status === 'delivered' || inv.status === 'sent').length,
    paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
    totalRevenue: invoices
      .filter(inv => inv.type === 'outgoing' && inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0),
    overdueInvoices: invoices.filter(inv => inv.status === 'overdue').length,
  };

  const recentInvoices = invoices
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23ffffff%27 fill-opacity=%270.05%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-fuchsia-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDuration: '15s'}}></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDuration: '20s', animationDelay: '5s'}}></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome to e-Invoice Hub</h1>
            <p className="text-fuchsia-100 text-lg">Streamline your e-invoicing workflow with Thinkdigi's powerful platform</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg relative z-10">
            <Bolt className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Sent Invoices</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalOutgoing}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="bg-gradient-to-br from-fuchsia-500 to-indigo-600 p-3 rounded-xl shadow-lg shadow-fuchsia-500/25 group-hover:shadow-fuchsia-500/40 transition-all duration-300 relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-fuchsia-500 to-indigo-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <TrendingUp className="w-6 h-6 text-white relative z-10" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Received</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalIncoming}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +8% from last month
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg shadow-emerald-500/25">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.pendingPayments}</p>
              <p className="text-xs text-amber-600 mt-2 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Awaiting payment
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-xl shadow-lg shadow-amber-500/25">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Revenue</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">€{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +24% from last month
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-500/25">
              <Euro className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="p-8 border-b border-slate-200 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-700 to-indigo-700 bg-clip-text text-transparent">Recent Invoices</h2>
              <p className="text-slate-600 mt-1">Latest invoice activity across your platform</p>
            </div>
            <button className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all duration-200 border border-white/10">
              View All
            </button>
          </div>
        </div>
        <div className="p-8 relative z-10">
          {recentInvoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-fuchsia-100 to-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 shadow-md">
                <TrendingUp className="w-8 h-8 text-indigo-500" />
              </div>
              <p className="text-slate-500 text-lg">No invoices found</p>
              <p className="text-slate-400 text-sm mt-1">Start by creating your first invoice</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-xl hover:bg-gradient-to-r hover:from-fuchsia-50 hover:to-indigo-50 hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        invoice.type === 'outgoing' 
                          ? 'bg-gradient-to-br from-fuchsia-500 to-indigo-600 shadow-lg shadow-fuchsia-500/25 group-hover:shadow-fuchsia-500/40' 
                          : 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25'
                      }`}>
                        {invoice.type === 'outgoing' ? (
                          <TrendingUp className="w-6 h-6 text-white" />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-lg">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-slate-600">
                        {invoice.type === 'outgoing' ? 'To' : 'From'}: {invoice.type === 'outgoing' ? invoice.recipient.name : invoice.sender.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-lg">€{invoice.total.toLocaleString()}</p>
                      <p className="text-sm text-slate-600 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={invoice.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;