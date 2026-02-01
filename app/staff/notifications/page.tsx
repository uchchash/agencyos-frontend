'use client';

import React from 'react';
import { useStaff } from '../layout';
import NotificationList from '@/components/notifications/NotificationList';

const NotificationsPage = () => {
    const { user } = useStaff();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-8 border border-blue-500/20 shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Notifications 🔔
                        </h1>
                        <p className="text-slate-300 text-lg">
                            Stay updated with important messages and events.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-700 p-6">
                <NotificationList tokenKey="staffAccessToken" />
            </div>
        </div>
    );
};

export default NotificationsPage;
