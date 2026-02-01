'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStaff } from '../layout';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    href: string;
}

const StatsCard = ({ title, value, icon, color, href }: StatsCardProps) => (
    <Link href={href} className="block">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
        </div>
    </Link>
);

interface QuickActionProps {
    title: string;
    description: string;
    href?: string;
    onClick?: () => void;
    icon: React.ReactNode;
}

const QuickAction = ({ title, description, href, onClick, icon }: QuickActionProps) => {
    const content = (
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-300 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                {icon}
            </div>
            <div>
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }
    return <div onClick={onClick}>{content}</div>;
};

const StaffDashboardPage = () => {
    const { user, profile, loading, isAdmin } = useStaff();
    const [stats, setStats] = useState({
        myTodos: 0,
        overdueTodos: 0,
        activeApplications: 0,
        pendingDocuments: 0,
        totalClients: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const accessToken = localStorage.getItem('staffAccessToken');
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

                const [todosRes, clientsRes, appsRes] = await Promise.allSettled([
                    fetch('/api/todos/me/', { headers }),
                    fetch('/api/clients/', { headers }),
                    fetch('/api/applications/', { headers }),
                ]);

                let myTodos = 0;
                let overdueTodos = 0;
                if (todosRes.status === 'fulfilled' && todosRes.value.ok) {
                    const todosData = await todosRes.value.json();
                    const todos = Array.isArray(todosData) ? todosData : todosData.results || [];
                    myTodos = todos.filter((t: any) => !t.is_completed).length;
                    overdueTodos = todos.filter((t: any) => !t.is_completed && t.is_overdue).length;
                }

                setStats({
                    myTodos,
                    overdueTodos,
                    activeApplications: appsRes.status === 'fulfilled' ? await getCount(appsRes.value) : 0,
                    pendingDocuments: 0,
                    totalClients: clientsRes.status === 'fulfilled' ? await getCount(clientsRes.value) : 0,
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
            <div className="bg-gradient-to-r from-slate-800 via-blue-800 to-slate-800 rounded-2xl p-8 text-white shadow-xl">
                <h1 className="text-3xl font-bold mb-2">
                    {getGreeting()}, {user?.first_name || 'Staff'}! 👋
                </h1>
                <p className="text-slate-300 text-lg">
                    Welcome to your staff dashboard. Here's an overview of your work.
                </p>
                {isAdmin && (
                    <span className="inline-block mt-3 px-3 py-1 text-sm font-medium bg-blue-500/30 text-blue-200 rounded-full">
                        🔐 Admin Access Enabled
                    </span>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="My Pending Todos"
                    value={statsLoading ? '...' : stats.myTodos}
                    color="bg-blue-100 text-blue-600"
                    href="/staff/todos"
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    }
                />
                <StatsCard
                    title="Overdue Tasks"
                    value={statsLoading ? '...' : stats.overdueTodos}
                    color={stats.overdueTodos > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}
                    href="/staff/todos"
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatsCard
                    title="Active Applications"
                    value={statsLoading ? '...' : stats.activeApplications}
                    color="bg-purple-100 text-purple-600"
                    href="/staff/applications"
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                />
                <StatsCard
                    title="Total Clients"
                    value={statsLoading ? '...' : stats.totalClients}
                    color="bg-amber-100 text-amber-600"
                    href="/staff/clients"
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <QuickAction
                        title="View My Todos"
                        description="Check your pending tasks"
                        href="/staff/todos"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        }
                    />
                    <QuickAction
                        title="Manage Applications"
                        description="Review and process applications"
                        href="/staff/applications"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                    />
                    <QuickAction
                        title="Browse Clients"
                        description="View and manage client profiles"
                        href="/staff/clients"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                    />
                </div>
            </div>

            {/* Admin Section */}
            {isAdmin && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                        <span className="mr-2">🔐</span>Admin Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <QuickAction
                            title="Create Staff Member"
                            description="Add a new staff to the team"
                            href="/staff/manage"
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            }
                        />
                        <QuickAction
                            title="Manage Teams"
                            description="Configure teams and assignments"
                            href="/staff/teams"
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            }
                        />
                        <QuickAction
                            title="View All Leave Requests"
                            description="Review and approve leave"
                            href="/staff/leave"
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            }
                        />
                    </div>
                </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Role</h3>
                    <div className="space-y-2">
                        <p className="text-slate-600">
                            <span className="font-medium text-slate-900">Role:</span>{' '}
                            {profile?.staff_role?.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || user?.role?.toUpperCase()}
                        </p>
                        {profile?.department && (
                            <p className="text-slate-600">
                                <span className="font-medium text-slate-900">Department:</span> {profile.department}
                            </p>
                        )}
                        <p className="text-slate-600">
                            <span className="font-medium text-slate-900">Staff ID:</span> {user?.staff_id || 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Permissions</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile?.can_approve_documents && (
                            <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                                Approve Documents
                            </span>
                        )}
                        {profile?.can_manage_staff && (
                            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                                Manage Staff
                            </span>
                        )}
                        {isAdmin && (
                            <span className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full">
                                Admin Access
                            </span>
                        )}
                        <span className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-full">
                            View Clients
                        </span>
                        <span className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-full">
                            Manage Applications
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboardPage;
