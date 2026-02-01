import React from 'react';
import { format } from 'date-fns';

export interface Notification {
    id: string;
    notification_type: string;
    title: string;
    message: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    link: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationItemProps {
    notification: Notification;
    onMarkRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead }) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
            case 'payment_received':
            case 'leave_approved':
            case 'application_created':
                return (
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'warning':
            case 'payment_due':
            case 'todo_due':
                return (
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'error':
            case 'leave_rejected':
            case 'todo_overdue':
                return (
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className={`p-4 rounded-xl border transition-all ${notification.is_read
                ? 'bg-slate-900/30 border-slate-800'
                : 'bg-slate-800/50 border-blue-500/30 shadow-lg shadow-blue-500/5'
            }`}>
            <div className="flex gap-4">
                {getIcon(notification.notification_type)}

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h4 className={`font-semibold ${notification.is_read ? 'text-slate-300' : 'text-white'}`}>
                                {notification.title}
                            </h4>
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                {notification.message}
                            </p>
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                            {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                        </span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                            {notification.priority === 'urgent' && (
                                <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-xs font-medium">
                                    Urgent
                                </span>
                            )}
                            {notification.link && (
                                <a
                                    href={notification.link}
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                >
                                    View Details
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>
                            )}
                        </div>

                        {!notification.is_read && (
                            <button
                                onClick={() => onMarkRead(notification.id)}
                                className="text-xs text-slate-400 hover:text-white transition-colors"
                            >
                                Mark as read
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;
