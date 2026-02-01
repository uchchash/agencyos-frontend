'use client';

import React, { useState } from 'react';
import TeamUserList from '@/components/users/TeamUserList';

const TeamsPage = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-orange-900 to-slate-900 rounded-2xl p-8 border border-orange-500/20 shadow-xl flex justify-between items-center">
                <div className="text-left">
                    <h1 className="text-3xl font-bold text-white mb-2">Internal Teams 👥</h1>
                    <p className="text-slate-300">Manage admins, managers, and agency staff members.</p>
                </div>
                <div className="flex gap-3">
                    {/* Add buttons if needed */}
                </div>
            </div>

            <TeamUserList refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
        </div>
    );
};

export default TeamsPage;
