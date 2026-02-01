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
            const url = applicationData?.id ? `/api/applications-all/${applicationData.id}/` : '/api/applications-all/';
            const method = applicationData?.id ? 'PATCH' : 'POST';

            const payload = {
                ...formData,
                assigned_to: formData.assigned_to === '' ? null : formData.assigned_to,
                client: formData.client === '' ? null : formData.client,
                program_intake: formData.program_intake === '' ? null : formData.program_intake,
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
                                <option value="ready">Ready to Submit</option>
                                <option value="submitted">Submitted</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
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
