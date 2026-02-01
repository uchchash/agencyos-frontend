'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useClient } from '../layout';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  href: string;
}

const StatsCard = ({ title, value, icon, color, href }: StatsCardProps) => (
  <Link href={href} className="block">
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300">
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
  href: string;
  icon: React.ReactNode;
}

const QuickAction = ({ title, description, href, icon }: QuickActionProps) => (
  <Link href={href}>
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  </Link>
);

const ClientDashboardPage = () => {
  const { client, loading, error } = useClient();
  const [stats, setStats] = useState({
    documents: 0,
    applications: 0,
    pendingInvoices: 0,
    notifications: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        };

        const getItems = async (res: Response) => {
          if (!res.ok) return [];
          try {
            const data = await res.json();
            return Array.isArray(data) ? data : data.results || [];
          } catch (e) {
            return [];
          }
        };

        const [docsRes, appsRes, invoicesRes, notifRes] = await Promise.allSettled([
          fetch('/api/clients/me/documents/', { headers }),
          fetch('/api/visas/me/', { headers }),
          fetch('/api/invoices/me/', { headers }),
          fetch('/api/notifications/', { headers }),
        ]);

        const docs = docsRes.status === 'fulfilled' ? await getItems(docsRes.value) : [];
        const apps = appsRes.status === 'fulfilled' ? await getItems(appsRes.value) : [];
        const invoices = invoicesRes.status === 'fulfilled' ? await getItems(invoicesRes.value) : [];
        const notifs = notifRes.status === 'fulfilled' ? await getItems(notifRes.value) : [];

        setStats({
          documents: docs.length,
          applications: apps.length,
          pendingInvoices: invoices.filter((i: any) => i.status === 'pending').length,
          notifications: notifs.filter((n: any) => !n.is_read).length,
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
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {client?.first_name || 'there'}! 👋
        </h1>
        <p className="text-purple-100 text-lg">
          Welcome to your client dashboard. Here's what's happening with your applications.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Documents"
          value={statsLoading ? '...' : stats.documents}
          color="bg-blue-100 text-blue-600"
          href="/client/documents"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatsCard
          title="Applications"
          value={statsLoading ? '...' : stats.applications}
          color="bg-green-100 text-green-600"
          href="/client/applications"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
        <StatsCard
          title="Pending Invoices"
          value={statsLoading ? '...' : stats.pendingInvoices}
          color="bg-amber-100 text-amber-600"
          href="/client/invoices"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Notifications"
          value={statsLoading ? '...' : stats.notifications}
          color="bg-purple-100 text-purple-600"
          href="/client/notifications"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            title="Upload Document"
            description="Add a new document to your profile"
            href="/client/documents"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            }
          />
          <QuickAction
            title="View Applications"
            description="Check your application status"
            href="/client/applications"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
          <QuickAction
            title="Book Appointment"
            description="Schedule a meeting with our team"
            href="/client/bookings"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Need Help?</h3>
          <p className="text-slate-600 mb-4">
            Our support team is here to help you with any questions about your applications or documents.
          </p>
          <Link
            href="/client/bookings"
            className="inline-flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700"
          >
            Schedule a call
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Profile Completion</h3>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Progress</span>
              <span className="font-medium text-slate-900">75%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                style={{ width: '75%' }}
              />
            </div>
          </div>
          <Link
            href="/client/profile"
            className="inline-flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700"
          >
            Complete your profile
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardPage;
