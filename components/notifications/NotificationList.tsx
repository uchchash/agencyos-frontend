import React, { useState, useEffect } from 'react';
import NotificationItem, { Notification } from './NotificationItem';

interface NotificationListProps {
    tokenKey?: string;
}

const NotificationList = ({ tokenKey = 'suAccessToken' }: NotificationListProps) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const fetchNotifications = async () => {
        try {
            const accessToken = localStorage.getItem(tokenKey);
            const res = await fetch('/api/notifications/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!res.ok) throw new Error('Failed to fetch notifications');

            const data = await res.json();
            setNotifications(data.results || data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        ));

        try {
            const accessToken = localStorage.getItem(tokenKey);
            await fetch(`/api/notifications/${id}/read/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

        try {
            const accessToken = localStorage.getItem(tokenKey);
            await fetch('/api/notifications/mark-all-read/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        return true;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-white">No notifications</h3>
                <p className="text-slate-400 mt-1">You're all caught up!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'unread'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        Unread
                    </button>
                </div>

                {filter === 'all' && notifications.some(n => !n.is_read) && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-sm text-blue-400 hover:text-blue-300"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map(notification => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkRead={handleMarkRead}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        No {filter} notifications found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationList;
