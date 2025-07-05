import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Trash2, AreaChart as MarkAsUnread } from 'lucide-react';
import { maventaService } from '../../services/maventa';
import { MaventaNotification } from '../../types/maventa';
import LoadingSpinner from '../LoadingSpinner';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<MaventaNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await maventaService.getNotifications(filter === 'unread');
      if (response.success && response.data) {
        setNotifications(response.data);
      } else {
        setError(response.error?.message || 'Failed to load notifications');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (uuid: string) => {
    try {
      const response = await maventaService.markNotificationAsRead(uuid);
      if (response.success) {
        setNotifications(notifications.map(n => 
          n.uuid === uuid ? { ...n, read: true } : n
        ));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await maventaService.markAllNotificationsAsRead();
      if (response.success) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const getNotificationIcon = (type: MaventaNotification['type']) => {
    switch (type) {
      case 'INVOICE_RECEIVED':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'INVOICE_DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'INVOICE_PAID':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'INVOICE_REJECTED':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'COMPANY_VERIFIED':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: MaventaNotification['type']) => {
    switch (type) {
      case 'INVOICE_RECEIVED':
        return 'bg-blue-50 border-blue-200';
      case 'INVOICE_DELIVERED':
        return 'bg-green-50 border-green-200';
      case 'INVOICE_PAID':
        return 'bg-emerald-50 border-emerald-200';
      case 'INVOICE_REJECTED':
        return 'bg-red-50 border-red-200';
      case 'COMPANY_VERIFIED':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Bell className="w-8 h-8 mr-3" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 bg-red-500 text-white text-sm font-medium px-2.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-2">Stay updated with your e-invoicing activities</p>
        </div>
        
        <div className="flex space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
          </select>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadNotifications}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'unread' ? 'All caught up! No unread notifications.' : 'You have no notifications yet.'}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.uuid}
              className={`p-6 rounded-xl border transition-all duration-200 ${
                notification.read 
                  ? 'bg-white border-gray-200' 
                  : `${getNotificationColor(notification.type)} border-l-4`
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className={`text-lg font-semibold ${
                        notification.read ? 'text-gray-700' : 'text-gray-900'
                      }`}>
                        {notification.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      {!notification.read && (
                        <span className="bg-blue-500 w-2 h-2 rounded-full"></span>
                      )}
                    </div>
                    <p className={`text-sm ${
                      notification.read ? 'text-gray-500' : 'text-gray-700'
                    } mb-2`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{new Date(notification.created_at).toLocaleString()}</span>
                      {notification.invoice_uuid && (
                        <span>Invoice: {notification.invoice_uuid.slice(0, 8)}...</span>
                      )}
                      {notification.company_uuid && (
                        <span>Company: {notification.company_uuid.slice(0, 8)}...</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.uuid)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;