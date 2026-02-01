'use client';

import React, { useState, useEffect } from 'react';

export interface ApplicationData {
    id?: string;
    application_number?: string;
    client: string | number;
    program_intake: string | number;
    status: string;
    priority: string;
    assigned_to?: string | number;
    application_type: string;
    application_fee_amount?: number;
    tuition_fee_amount?: number;
    tuition_fee_currency?: string;
    university_application_id?: string;
    internal_notes?: string;
}

interface ApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    applicationData?: ApplicationData | null;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose, onSaved, applicationData }) => {
    const [formData, setFormData] = useState<ApplicationData>({
        client: '',
        program_intake: '',
        status: 'draft',
        priority: 'normal',
        application_type: 'paid',
        tuition_fee_currency: 'BDT',
        application_fee_paid: false,
        tuition_fee_paid_amount: 0,
    });
    const [clients, setClients] = useState<any[]>([]);
    const [intakes, setIntakes] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accessToken = localStorage.getItem('suAccessToken');
                const [clientsRes, intakesRes, staffRes] = await Promise.all([
                    fetch('/api/clients/', { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                    fetch('/api/university-intakes/', { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                    fetch('/api/staff/', { headers: { 'Authorization': `Bearer ${accessToken}` } })
                ]);
                const clientsData = await clientsRes.json();
                const intakesData = await intakesRes.json();
                const staffData = await staffRes.json();
                setClients(clientsData.results || clientsData);
                setIntakes(intakesData.results || intakesData);
                setStaff(staffData.results || staffData);
            } catch (err) {
                console.error('Failed to fetch data', err);
            }
        };

        if (isOpen) fetchData();
    }, [isOpen]);

    useEffect(() => {
        if (applicationData) {
            setFormData({
                ...applicationData,
            });
        } else {
            setFormData({
                client: '',
                program_intake: '',
                status: 'draft',
                priority: 'normal',
                application_type: 'paid',
            });
        }
    }, [applicationData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const url = applicationData?.id ? `/api/applications/${applicationData.id}/` : '/api/applications/';
            const method = applicationData?.id ? 'PATCH' : 'POST';

            const payload = {
                ...formData,
                assigned_to: formData.assigned_to === '' ? null : formData.assigned_to,
                client: formData.client === '' ? null : formData.client,
                program_intake: formData.program_intake === '' ? null : formData.program_intake,
                application_fee_amount: formData.application_fee_amount ? Number(formData.application_fee_amount) : 0,
                tuition_fee_amount: formData.tuition_fee_amount ? Number(formData.tuition_fee_amount) : 0,
                tuition_fee_paid_amount: formData.tuition_fee_paid_amount ? Number(formData.tuition_fee_paid_amount) : 0,
                application_fee_paid: !!formData.application_fee_paid,
                submission_date: formData.submission_date || null,
                decision_date: formData.decision_date || null,
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(JSON.stringify(errData) || 'Failed to save application');
            }

            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">{applicationData ? 'Edit Application' : 'Add Application'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm truncate">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Client</label>
                            <select
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.client}
                                onChange={e => setFormData({ ...formData, client: e.target.value })}
                            >
                                <option value="">Select Client</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.user_full_name} ({c.client_id})</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Program Intake</label>
                            <select
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.program_intake}
                                onChange={e => setFormData({ ...formData, program_intake: e.target.value })}
                            >
                                <option value="">Select Intake</option>
                                {intakes.map(i => (
                                    <option key={i.id} value={i.id}>
                                        {i.program_name} - {i.university_name} ({i.intake_name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                            <select
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="draft">Draft</option>
                                <option value="docs_pending">Pending Documents</option>
                                <option value="docs_reviewing">Reviewing Documents</option>
                                <option value="ready">Ready to Submit</option>
                                <option value="submitted">Submitted to University</option>
                                <option value="acknowledged">Acknowledged by University</option>
                                <option value="under_review">Under Review</option>
                                <option value="additional_info">Additional Info Required</option>
                                <option value="interview_scheduled">Interview Scheduled</option>
                                <option value="interview_completed">Interview Completed</option>
                                <option value="pending_decision">Pending Decision</option>
                                <option value="accepted">Accepted</option>
                                <option value="conditionally_accepted">Conditionally Accepted</option>
                                <option value="waitlisted">Waitlisted</option>
                                <option value="rejected">Rejected</option>
                                <option value="tuition_pending">Tuition Fee Pending</option>
                                <option value="tuition_paid">Tuition Fee Paid</option>
                                <option value="tuition_partial">Tuition Fee Partial</option>
                                <option value="tuition_refund_processing">Tuition Refund Processing</option>
                                <option value="tuition_refunded">Tuition Fee Refunded</option>
                                <option value="visa_processing">Visa Processing</option>
                                <option value="visa_approved">Visa Approved</option>
                                <option value="visa_rejected">Visa Rejected</option>
                                <option value="enrolled">Enrolled</option>
                                <option value="deferred">Deferred</option>
                                <option value="withdrawn">Withdrawn</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Application Type</label>
                            <select
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.application_type}
                                onChange={e => setFormData({ ...formData, application_type: e.target.value })}
                            >
                                <option value="paid">Paid Application</option>
                                <option value="free">Free Application</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Priority</label>
                            <select
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Assigned Staff</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.assigned_to || ''}
                                onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}
                            >
                                <option value="">Unassigned</option>
                                {staff.map(s => (
                                    <option key={s.id} value={s.id}>{s.user_full_name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">University App ID</label>
                            <input
                                type="text"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.university_application_id || ''}
                                onChange={e => setFormData({ ...formData, university_application_id: e.target.value })}
                                placeholder="Ref from Uni"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Internal Notes</label>
                            <textarea
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.internal_notes || ''}
                                onChange={e => setFormData({ ...formData, internal_notes: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Application Fee (৳)</label>
                            <input
                                type="number"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.application_fee_amount || ''}
                                onChange={e => setFormData({ ...formData, application_fee_amount: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Tuition Fee (৳)</label>
                            <input
                                type="number"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.tuition_fee_amount || ''}
                                onChange={e => setFormData({ ...formData, tuition_fee_amount: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Tuition Currency</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.tuition_fee_currency || 'BDT'}
                                onChange={e => setFormData({ ...formData, tuition_fee_currency: e.target.value })}
                            >
                                <option value="BDT">BDT</option>
                                <option value="USD">USD</option>
                                <option value="CAD">CAD</option>
                                <option value="GBP">GBP</option>
                                <option value="EUR">EUR</option>
                                <option value="AUD">AUD</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-slate-400">Application Fee Paid</label>
                            <input
                                type="checkbox"
                                checked={!!formData.application_fee_paid}
                                onChange={e => setFormData({ ...formData, application_fee_paid: e.target.checked })}
                                className="h-4 w-4"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Tuition Fee Paid Amount</label>
                            <input
                                type="number"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.tuition_fee_paid_amount || ''}
                                onChange={e => setFormData({ ...formData, tuition_fee_paid_amount: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Submission Date</label>
                            <input
                                type="date"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.submission_date || ''}
                                onChange={e => setFormData({ ...formData, submission_date: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Decision</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.decision || 'pending'}
                                onChange={e => setFormData({ ...formData, decision: e.target.value })}
                            >
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="conditional">Conditional</option>
                                <option value="rejected">Rejected</option>
                                <option value="waitlisted">Waitlisted</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Decision Date</label>
                            <input
                                type="date"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.decision_date || ''}
                                onChange={e => setFormData({ ...formData, decision_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors font-semibold shadow-lg shadow-pink-500/20"
                        >
                            {loading ? 'Saving...' : 'Save Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationModal;
