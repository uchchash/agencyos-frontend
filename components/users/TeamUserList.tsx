'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
    id: number | string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    role_display: string;
    is_active: boolean;
    date_joined: string;
    staff_id?: string;
}

interface TeamUserListProps {
    refreshTrigger: number;
    onRefresh: () => void;
}

const TeamUserList: React.FC<TeamUserListProps> = ({ refreshTrigger, onRefresh }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('staff,admin,superuser');
    const [changingRole, setChangingRole] = useState<string | null>(null);
    const router = useRouter();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            let url = `/api/users/?role=${roleFilter}`;
            if (search) url += `&search=${search}`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });

            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data.results || data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [refreshTrigger, roleFilter]);

    useEffect(() => {
        const timeoutId = setTimeout(fetchUsers, 500);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const handleRoleChange = async (userId: string | number, newRole: string) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        setChangingRole(userId.toString());
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch(`/api/users/${userId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (res.ok) onRefresh();
            else alert('Failed to change role');
        } catch (err) {
            console.error(err);
        } finally {
            setChangingRole(null);
        }
    };

    const handleDelete = async (userId: string | number) => {
        if (!confirm('Are you sure you want to delete this user profile? This action cannot be undone.')) return;

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch(`/api/users/${userId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });

            if (res.ok) onRefresh();
            else alert('Failed to delete user');
        } catch (err) {
            console.error(err);
        }
    };

    const handleMessage = (user: User) => {
        router.push(`/su/communications?user=${user.id}`);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search team members..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <svg className="w-5 h-5 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <div className="flex bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setRoleFilter('staff,admin,superuser')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${roleFilter.includes(',') ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setRoleFilter('admin')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${roleFilter === 'admin' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Admins
                    </button>
                    <button
                        onClick={() => setRoleFilter('staff')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${roleFilter === 'staff' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Staff
                    </button>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto text-left">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-800/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Staff ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={5} className="py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 inline-block"></div></td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="py-20 text-center text-slate-500">No team members found</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
                                                    {user.first_name?.[0] || user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white">{user.first_name} {user.last_name}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-orange-400">{user.staff_id || '-'}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.role}
                                                disabled={changingRole === user.id.toString()}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="staff">Staff</option>
                                                <option value="agent">Agent</option>
                                                <option value="client">Client</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {new Date(user.date_joined).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleMessage(user)}
                                                className="p-2 text-slate-400 hover:text-orange-500 transition-colors tooltip"
                                                title="Message"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                </svg>
                                            </button>
                                            <Link
                                                href={`/su/staff/${user.id}`}
                                                className="p-2 text-slate-400 hover:text-white transition-colors"
                                                title="View Profile"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeamUserList;
