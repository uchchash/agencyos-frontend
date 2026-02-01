'use client';

import React, { useState } from 'react';
import UserList from '@/components/users/UserList';
import AddUserModal from '@/components/users/AddUserModal';

const UsersPage = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUserAdded = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-8 border border-blue-500/20 shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">User Management 👥</h1>
                        <p className="text-slate-300">Manage all system users, clients, and staff.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add User
                    </button>
                </div>
            </div>

            <UserList refreshTrigger={refreshTrigger} />

            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onUserAdded={handleUserAdded}
            />
        </div>
    );
};

export default UsersPage;
