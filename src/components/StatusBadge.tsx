import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, Send, Zap } from 'lucide-react';

interface StatusBadgeProps {
  status: 'draft' | 'sent' | 'delivered' | 'paid' | 'overdue' | 'cancelled';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          color: 'bg-slate-100 text-slate-700 border border-slate-200 shadow-sm',
          icon: Clock,
          label: 'Draft'
        };
      case 'sent':
        return {
          color: 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm',
          icon: Send,
          label: 'Sent'
        };
      case 'delivered':
        return {
          color: 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm',
          icon: Zap,
          label: 'Delivered'
        };
      case 'paid':
        return {
          color: 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm',
          icon: CheckCircle,
          label: 'Paid'
        };
      case 'overdue':
        return {
          color: 'bg-red-100 text-red-700 border border-red-200 shadow-sm',
          icon: AlertCircle,
          label: 'Overdue'
        };
      case 'cancelled':
        return {
          color: 'bg-slate-100 text-slate-700 border border-slate-200 shadow-sm',
          icon: XCircle,
          label: 'Cancelled'
        };
      default:
        return {
          color: 'bg-slate-100 text-slate-700 border border-slate-200 shadow-sm',
          icon: Clock,
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${config.color} ${className}`}>
      <Icon className="w-3 h-3 mr-1.5" />
      {config.label}
    </span>
  );
};

export default StatusBadge;