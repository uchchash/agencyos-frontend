import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
    id: number | string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    role_display: string;
    is_active: boolean;
    date_joined: string;
    client_id?: string;
    staff_id?: string;
}

interface UserListProps {
    refreshTrigger: number;
    fixedRole?: 'client' | 'staff' | 'admin' | 'superuser' | string | string[];
}

const UserList: React.FC<UserListProps> = ({ refreshTrigger, fixedRole }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState(fixedRole || '');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            let url = '/api/users/?';
            if (search) url += `search=${search}&`;
            // Use fixedRole if present, otherwise use roleFilter
            const role = fixedRole || roleFilter;
            if (role) {
                const roleValue = Array.isArray(role) ? role.join(',') : role;
                url += `role=${roleValue}&`;
            }

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
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
    }, [refreshTrigger, roleFilter]); // Re-fetch when trigger or filter changes

    // Debounced search could be better, but simple effect for now
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const getProfileLink = (user: User) => {
        switch (user.role) {
            case 'client': return `/su/clients/${user.id}`; // Wait, likely need client_id or use User ID and redirect? Backend routes use PK mostly.
            // ClientDetailView uses client ID (pk).
            case 'staff': return `/su/staff/${user.id}`;
            default: return `/su/users/${user.id}`;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-500/20 text-purple-400';
            case 'superuser': return 'bg-red-500/20 text-red-400';
            case 'staff': return 'bg-teal-500/20 text-teal-400';
            case 'client': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
        } catch (e) {
            return 'N/A';
        }
    };

    const getIdHeader = () => {
        if (fixedRole === 'staff' || (Array.isArray(fixedRole) && fixedRole.includes('staff'))) return 'Staff ID';
        if (fixedRole === 'client') return 'Client ID';
        return 'Entity ID';
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <svg className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {!fixedRole && (
                    <select
                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="client">Clients</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admins</option>
                        <option value="superuser">Superusers</option>
                    </select>
                )}
            </div>

            {/* Table */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-800/50 text-slate-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">{getIdHeader()}</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
                                                    {user.first_name?.[0] || user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            {user.role === 'staff' || user.role === 'admin' ? user.staff_id : user.client_id || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                                {user.role_display}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.is_active ? (
                                                <span className="flex items-center gap-1.5 text-green-400 text-xs">
                                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {formatDate(user.date_joined)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={getProfileLink(user)}
                                                className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                                            >
                                                View Profile
                                            </Link>
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

export default UserList;
