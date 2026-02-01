'use client';

import React, { useState } from 'react';
import UserList from '@/components/users/UserList';
import AddUserModal from '@/components/users/AddUserModal';

const StaffPage = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUserAdded = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-8 border border-teal-500/20 shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Staff Management 👔</h1>
                        <p className="text-slate-300">Manage agency staff members.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Staff
                    </button>
                </div>
            </div>

            <UserList refreshTrigger={refreshTrigger} fixedRole={['admin', 'staff']} />

            {/* Note: AddUserModal defaults to 'client', logic inside might need adjustment to Force Role if opened from here. 
                But for now, user can select Staff in the modal. */}
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onUserAdded={handleUserAdded}
                defaultRole="staff"
            />
        </div>
    );
};

export default StaffPage;
