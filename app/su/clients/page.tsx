'use client';

import React, { useState } from 'react';
import UserList from '@/components/users/UserList';
import AddUserModal from '@/components/users/AddUserModal';

const ClientsPage = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUserAdded = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-cyan-900 to-slate-900 rounded-2xl p-8 border border-cyan-500/20 shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Client Management 👨‍🎓</h1>
                        <p className="text-slate-300">Manage student clients and profiles.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Client
                    </button>
                </div>
            </div>

            <UserList refreshTrigger={refreshTrigger} fixedRole="client" />

            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onUserAdded={handleUserAdded}
                defaultRole="client"
            />
        </div>
    );
};

export default ClientsPage;
