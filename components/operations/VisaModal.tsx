'use client';

import React, { useState, useEffect } from 'react';

export interface VisaData {
    id?: string;
    visa_reference?: string;
    client: string | number;
    visa_type: string;
    destination_country: string;
    status: string;
    assigned_to?: string | number;
    submission_date?: string;
    internal_notes?: string;
}

interface VisaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    visaData?: VisaData | null;
}

const VisaModal: React.FC<VisaModalProps> = ({ isOpen, onClose, onSaved, visaData }) => {
    const [formData, setFormData] = useState<VisaData>({
        client: '',
        visa_type: 'student',
        destination_country: '',
        status: 'not_started',
    });
    const [clients, setClients] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accessToken = localStorage.getItem('suAccessToken');
                const [clientsRes, staffRes] = await Promise.all([
                    fetch('/api/clients/', { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                    fetch('/api/staff/', { headers: { 'Authorization': `Bearer ${accessToken}` } })
                ]);
                const clientsData = await clientsRes.json();
                const staffData = await staffRes.json();
                setClients(clientsData.results || clientsData);
                setStaff(staffData.results || staffData);
            } catch (err) {
                console.error('Failed to fetch clients/staff', err);
            }
        };

        if (isOpen) fetchData();
    }, [isOpen]);

    useEffect(() => {
        if (visaData) {
            setFormData({
                ...visaData,
            });
        } else {
            setFormData({
                client: '',
                visa_type: 'student',
                destination_country: '',
                status: 'not_started',
            });
        }
    }, [visaData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const url = visaData?.id ? `/api/visa-applications-all/${visaData.id}/` : '/api/visa-applications-all/';
            const method = visaData?.id ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(JSON.stringify(errData) || 'Failed to save visa');
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
                    <h2 className="text-xl font-bold text-white">{visaData ? 'Edit Visa' : 'Add Visa'}</h2>
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

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Destination Country</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.destination_country}
                                onChange={e => setFormData({ ...formData, destination_country: e.target.value })}
                                placeholder="e.g. United Kingdom"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Visa Type</label>
                            <select
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.visa_type}
                                onChange={e => setFormData({ ...formData, visa_type: e.target.value })}
                            >
                                <option value="student">Student Visa</option>
                                <option value="tourist">Tourist Visa</option>
                                <option value="work">Work Visa</option>
                                <option value="visitor">Visitor Visa</option>
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
                            <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                            <select
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="not_started">Not Started</option>
                                <option value="docs_pending">Documents Pending</option>
                                <option value="submitted">Submitted</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
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
                            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
                        >
                            {loading ? 'Saving...' : 'Save Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VisaModal;
