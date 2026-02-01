'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSuperUser } from '../layout';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    href: string;
    trend?: string;
}

const StatsCard = ({ title, value, icon, color, href, trend }: StatsCardProps) => (
    <Link href={href} className="block">
        <div className={`${color} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-white/70 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    {trend && (
                        <p className="text-xs text-white/60 mt-1">{trend}</p>
                    )}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                    {icon}
                </div>
            </div>
        </div>
    </Link>
);

interface QuickActionProps {
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
}

const QuickAction = ({ title, description, href, icon }: QuickActionProps) => (
    <Link href={href}>
        <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-red-500/50 hover:bg-slate-800 transition-all duration-300 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                {icon}
            </div>
            <div>
                <p className="font-semibold text-white">{title}</p>
                <p className="text-sm text-slate-400">{description}</p>
            </div>
        </div>
    </Link>
);

const SuperUserDashboardPage = () => {
    const { user, loading } = useSuperUser();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStaff: 0,
        totalClients: 0,
        totalApplications: 0,
        pendingApplications: 0,
        totalUniversities: 0,
        totalPayments: 0,
        totalRevenue: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const accessToken = localStorage.getItem('suAccessToken');
                const headers = {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                };

                const getCount = async (res: Response) => {
                    if (!res.ok) return 0;
                    try {
                        const data = await res.json();
                        return Array.isArray(data) ? data.length : data.count || data.results?.length || 0;
                    } catch (e) {
                        return 0;
                    }
                };

                const [usersRes, staffRes, clientsRes, appsRes, univRes] = await Promise.allSettled([
                    fetch('/api/users/', { headers }),
                    fetch('/api/staff/', { headers }),
                    fetch('/api/clients/', { headers }),
                    fetch('/api/applications/', { headers }),
                    fetch('/api/universities/', { headers }),
                ]);

                setStats({
                    totalUsers: usersRes.status === 'fulfilled' ? await getCount(usersRes.value) : 0,
                    totalStaff: staffRes.status === 'fulfilled' ? await getCount(staffRes.value) : 0,
                    totalClients: clientsRes.status === 'fulfilled' ? await getCount(clientsRes.value) : 0,
                    totalApplications: appsRes.status === 'fulfilled' ? await getCount(appsRes.value) : 0,
                    pendingApplications: 0,
                    totalUniversities: univRes.status === 'fulfilled' ? await getCount(univRes.value) : 0,
                    totalPayments: 0,
                    totalRevenue: 0,
                });
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-slate-800 via-red-900/50 to-slate-800 rounded-2xl p-8 border border-red-500/20 shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {getGreeting()}, {user?.first_name || 'Superuser'}! 🛡️
                        </h1>
                        <p className="text-slate-300 text-lg">
                            Welcome to the Superuser Control Panel. You have full system access.
                        </p>
                        <div className="flex items-center gap-2 mt-4">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            <span className="text-sm text-red-400 font-medium">Full Administrative Access</span>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Users"
                    value={statsLoading ? '...' : stats.totalUsers}
                    color="bg-gradient-to-br from-blue-600 to-blue-800"
                    href="/su/users"
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    }
                />
                <StatsCard
                    title="Staff Members"
                    value={statsLoading ? '...' : stats.totalStaff}
                    color="bg-gradient-to-br from-green-600 to-green-800"
                    href="/su/staff"
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    }
                />
                <StatsCard
                    title="Clients"
                    value={statsLoading ? '...' : stats.totalClients}
                    color="bg-gradient-to-br from-purple-600 to-purple-800"
                    href="/su/clients"
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                />
                <StatsCard
                    title="Applications"
                    value={statsLoading ? '...' : stats.totalApplications}
                    color="bg-gradient-to-br from-amber-600 to-amber-800"
                    href="/su/applications"
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    }
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCard
                    title="Universities"
                    value={statsLoading ? '...' : stats.totalUniversities}
                    color="bg-gradient-to-br from-cyan-600 to-cyan-800"
                    href="/su/universities"
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    }
                />
                <StatsCard
                    title="Payments This Month"
                    value={statsLoading ? '...' : stats.totalPayments}
                    color="bg-gradient-to-br from-pink-600 to-pink-800"
                    href="/su/payments"
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                />
                <StatsCard
                    title="Total Revenue"
                    value={statsLoading ? '...' : `৳${stats.totalRevenue.toLocaleString()}`}
                    color="bg-gradient-to-br from-emerald-600 to-emerald-800"
                    href="/su/reports"
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <QuickAction
                        title="Create User"
                        description="Add a new user to the system"
                        href="/su/users"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        }
                    />
                    <QuickAction
                        title="Manage Staff"
                        description="Configure staff roles and permissions"
                        href="/su/staff"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                    />
                    <QuickAction
                        title="View Applications"
                        description="Review all submitted applications"
                        href="/su/applications"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        }
                    />
                    <QuickAction
                        title="Manage Universities"
                        description="Add or update university records"
                        href="/su/universities"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        }
                    />
                    <QuickAction
                        title="View Reports"
                        description="Access analytics and reports"
                        href="/su/reports"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        }
                    />
                    <QuickAction
                        title="System Settings"
                        description="Configure system-wide settings"
                        href="/su/settings"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                    />
                </div>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                <span className="text-slate-300">Database</span>
                            </div>
                            <span className="text-green-400 text-sm font-medium">Operational</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                <span className="text-slate-300">API Server</span>
                            </div>
                            <span className="text-green-400 text-sm font-medium">Operational</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                <span className="text-slate-300">Email Service</span>
                            </div>
                            <span className="text-green-400 text-sm font-medium">Operational</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Your Access Level</h3>
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                                Superuser
                            </span>
                            <span className="px-3 py-1.5 text-sm bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                                Full Admin
                            </span>
                            <span className="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                                System Config
                            </span>
                            <span className="px-3 py-1.5 text-sm bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                                User Management
                            </span>
                            <span className="px-3 py-1.5 text-sm bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                                Financial Access
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm mt-2">
                            You have unrestricted access to all system functions and data.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperUserDashboardPage;
