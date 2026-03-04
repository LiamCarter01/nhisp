/**
 * Notifications Page
 * ==================
 * View and manage user notifications.
 */

import React, { useEffect, useState } from 'react';
import { notificationsApi } from '../../api/services';
import type { Notification } from '../../api/types';
import { LoadingSpinner } from '../../components';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.list();
      setNotifications(res.data.results);
    } catch {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      toast.error('Failed to mark as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark all as read.');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return <LoadingSpinner message="Loading notifications..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-sm">
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`card flex items-start gap-3 transition-colors ${
                !n.read ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div
                className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  n.read ? 'bg-gray-300' : 'bg-blue-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                  {n.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {dayjs(n.created_at).fromNow()}
                </p>
              </div>
              {!n.read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
