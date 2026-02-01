'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import EditUserModal from '@/components/users/EditUserModal';

const StaffProfilePage = () => {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchUser = async () => {
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch(`/api/users/${params.id}/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!res.ok) throw new Error('Failed to fetch staff details');

            const data = await res.json();
            setUser(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchUser();
        }
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this staff member?')) return;

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch(`/api/users/${params.id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!res.ok) throw new Error('Failed to delete staff');

            router.push('/su/staff');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? '-' : format(date, 'PPP');
        } catch (e) {
            return '-';
        }
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
    if (!user) return <div className="p-8 text-white">Staff not found</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/su/staff" className="text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Staff Profile 👔</h1>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Edit Profile
                    </button>
                    <button
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Delete Staff
                    </button>
                </div>
            </div>

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUserUpdated={fetchUser}
                user={user}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center">
                        <div className="w-32 h-32 mx-auto bg-slate-800 rounded-full flex items-center justify-center text-4xl text-white font-bold mb-4">
                            {user.first_name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-white">{user.first_name} {user.last_name}</h2>
                        <p className="text-slate-400 mb-4">{user.email}</p>
                        <span className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-sm font-medium uppercase">
                            {user.role_display}
                        </span>
                        {user.staff_id && (
                            <div className="mt-4 text-sm text-slate-500">
                                Staff ID: <span className="text-white font-mono">{user.staff_id}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Account Information</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-slate-500 mb-1">First Name</label>
                                <div className="text-white">{user.first_name || '-'}</div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-500 mb-1">Last Name</label>
                                <div className="text-white">{user.last_name || '-'}</div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm text-slate-500 mb-1">Email</label>
                                <div className="text-white">{user.email}</div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-500 mb-1">Joined</label>
                                <div className="text-white">{formatDate(user.date_joined)}</div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-500 mb-1">Status</label>
                                <div className={user.is_active ? "text-green-400" : "text-red-400"}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffProfilePage;
