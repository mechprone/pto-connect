import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationsAPI } from '@/utils/api';
import { handleError, handleSuccess } from '@/utils/errorHandling';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await notificationsAPI.getNotifications();
      if (error) {
        setError('Failed to fetch notifications');
        handleError(new Error(error), 'Failed to fetch notifications');
      } else {
        setNotifications(data || []);
        setError(null);
      }
    } catch (error) {
      setError('Failed to fetch notifications');
      handleError(error, 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      setLoading(true);
      const { error } = await notificationsAPI.markAsRead(notificationId);
      if (error) {
        handleError(new Error(error), 'Failed to update notification');
      } else {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ));
        handleSuccess('Notification marked as read');
      }
    } catch (error) {
      handleError(error, 'Failed to update notification');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setLoading(true);
      const { error } = await notificationsAPI.markAllAsRead();
      if (error) {
        handleError(new Error(error), 'Failed to clear notifications');
      } else {
        setNotifications([]);
        handleSuccess('All notifications cleared');
      }
    } catch (error) {
      handleError(error, 'Failed to clear notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return <LoadingSpinner size="sm" />;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
