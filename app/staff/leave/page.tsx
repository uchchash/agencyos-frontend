'use client';

import React, { useEffect, useState } from 'react';
import { useStaff } from '../layout';

interface LeaveRequest {
    id: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
    requested_by?: {
        user: {
            email: string;
            first_name: string;
            last_name: string;
        };
    };
    created_at: string;
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

const leaveTypeLabels: Record<string, string> = {
    annual: 'Annual Leave',
    sick: 'Sick Leave',
    personal: 'Personal Leave',
    unpaid: 'Unpaid Leave',
    maternity: 'Maternity Leave',
    paternity: 'Paternity Leave',
};

const StaffLeavePage = () => {
    const { user, isAdmin } = useStaff();
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        leave_type: 'annual',
        start_date: '',
        end_date: '',
        reason: '',
    });

    const fetchLeaveRequests = async () => {
        try {
            const accessToken = localStorage.getItem('staffAccessToken');
            const endpoint = isAdmin ? '/api/leave-requests/' : '/api/leave-requests/me/';
            const response = await fetch(endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setLeaveRequests(Array.isArray(data) ? data : data.results || []);
            }
        } catch (err) {
            console.error('Failed to fetch leave requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, [isAdmin]);

    const calculateDays = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const accessToken = localStorage.getItem('staffAccessToken');
            const response = await fetch('/api/leave-requests/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setShowRequestModal(false);
                setFormData({
                    leave_type: 'annual',
                    start_date: '',
                    end_date: '',
                    reason: '',
                });
                fetchLeaveRequests();
            }
        } catch (err) {
            console.error('Failed to submit leave request:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const accessToken = localStorage.getItem('staffAccessToken');
            const response = await fetch(`/api/leave-requests/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                fetchLeaveRequests();
            }
        } catch (err) {
            console.error('Failed to update leave request:', err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Leave Requests</h1>
                    <p className="text-slate-600 mt-1">
                        {isAdmin ? 'Manage all staff leave requests' : 'View and submit leave requests'}
                    </p>
                </div>
                <button
                    onClick={() => setShowRequestModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/25"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Request Leave
                </button>
            </div>

            {/* Leave Requests */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-white rounded-2xl p-12 border border-slate-200">
                        <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </div>
                ) : leaveRequests.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
                        <p className="text-slate-500">No leave requests found.</p>
                    </div>
                ) : (
                    leaveRequests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md transition-all"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                                            {leaveTypeLabels[request.leave_type] || request.leave_type}
                                        </span>
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[request.status] || 'bg-slate-100 text-slate-700'}`}>
                                            {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                                        </span>
                                    </div>
                                    {isAdmin && request.requested_by && (
                                        <p className="text-sm text-slate-900 font-medium mb-1">
                                            {request.requested_by.user.first_name} {request.requested_by.user.last_name}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                        </span>
                                        <span className="text-slate-400">•</span>
                                        <span>{calculateDays(request.start_date, request.end_date)} days</span>
                                    </div>
                                    {request.reason && (
                                        <p className="text-sm text-slate-500 mt-2">{request.reason}</p>
                                    )}
                                </div>
                                {isAdmin && request.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleStatusUpdate(request.id, 'approved')}
                                            className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Request Leave Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">Request Leave</h2>
                                <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type *</label>
                                <select
                                    value={formData.leave_type}
                                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="annual">Annual Leave</option>
                                    <option value="sick">Sick Leave</option>
                                    <option value="personal">Personal Leave</option>
                                    <option value="unpaid">Unpaid Leave</option>
                                    <option value="maternity">Maternity Leave</option>
                                    <option value="paternity">Paternity Leave</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            {formData.start_date && formData.end_date && (
                                <p className="text-sm text-blue-600 font-medium">
                                    Duration: {calculateDays(formData.start_date, formData.end_date)} day(s)
                                </p>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    rows={3}
                                    placeholder="Briefly explain the reason for your leave request..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowRequestModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffLeavePage;

