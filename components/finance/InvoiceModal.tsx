'use client';

import React, { useState, useEffect } from 'react';

interface Client {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
}

interface Application {
    id: string;
    application_number: string;
}

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        client: '',
        application: '',
        due_date: '',
        currency: 'BDT',
        notes: '',
        terms: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchClients();
        }
    }, [isOpen]);

    useEffect(() => {
        if (formData.client) {
            fetchApplications(formData.client);
        } else {
            setApplications([]);
        }
    }, [formData.client]);

    const fetchClients = async () => {
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch('/api/clients/', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            setClients(data.results || data);
        } catch (err) {
            console.error('Failed to fetch clients', err);
        }
    };

    const fetchApplications = async (clientId: string) => {
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch(`/api/applications-all/?client=${clientId}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            setApplications(data.results || data);
        } catch (err) {
            console.error('Failed to fetch applications', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch('/api/invoices/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const errorData = await res.json();
                alert(`Error: ${JSON.stringify(errorData)}`);
            }
        } catch (err) {
            console.error('Failed to create invoice', err);
            alert('An unexpected error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <h2 className="text-xl font-bold text-white">Create New Invoice 🧾</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Invoice Title</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Service Fee"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Due Date</label>
                            <input
                                required
                                type="date"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Client</label>
                            <select
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500"
                                value={formData.client}
                                onChange={(e) => setFormData({ ...formData, client: e.target.value, application: '' })}
                            >
                                <option value="">Select a client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.first_name} {client.last_name} ({client.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Related Application (Optional)</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500"
                                value={formData.application}
                                onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                                disabled={!formData.client}
                            >
                                <option value="">Select an application</option>
                                {applications.map(app => (
                                    <option key={app.id} value={app.id}>{app.application_number}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                        <textarea
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 h-24"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the invoice..."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes</label>
                            <textarea
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 h-20 text-sm"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Terms</label>
                            <textarea
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 h-20 text-sm"
                                value={formData.terms}
                                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                            ></textarea>
                        </div>
                    </div>

                    <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                        <p className="text-xs text-violet-400">
                            Note: Invoice items can be added after creating the invoice from the detail view.
                        </p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-violet-500/20 disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : 'Create Invoice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvoiceModal;
