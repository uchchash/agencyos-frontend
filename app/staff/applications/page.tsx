'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStaff } from '../layout';

interface Application {
    id: string;
    application_id: string;
    client: {
        first_name: string;
        last_name: string;
    };
    university?: {
        name: string;
    };
    program_name: string;
    status: string;
    intake: string;
    created_at: string;
}

const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-amber-100 text-amber-700',
    documents_required: 'bg-orange-100 text-orange-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    enrolled: 'bg-purple-100 text-purple-700',
};

const StaffApplicationsPage = () => {
    const { user } = useStaff();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const accessToken = localStorage.getItem('staffAccessToken');
                const response = await fetch('/api/applications/', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setApplications(Array.isArray(data) ? data : data.results || []);
                }
            } catch (err) {
                console.error('Failed to fetch applications:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const filteredApplications = applications.filter(app => {
        const matchesSearch = searchTerm === '' ||
            app.application_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.program_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.client?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.client?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
                    <p className="text-slate-600 mt-1">Manage and review all applications</p>
                </div>
                <Link
                    href="/staff/applications/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/25"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Application
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="documents_required">Documents Required</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="enrolled">Enrolled</option>
                </select>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">App ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Client</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">University</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Program</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Intake</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        {searchTerm || statusFilter !== 'all' ? 'No applications found matching your filters.' : 'No applications found.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredApplications.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                                            {app.application_id || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            {app.client?.first_name} {app.client?.last_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {app.university?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {app.program_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {app.intake || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[app.status] || 'bg-slate-100 text-slate-700'}`}>
                                                {app.status?.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                View
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

export default StaffApplicationsPage;
