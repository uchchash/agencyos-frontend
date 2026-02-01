'use client';

import React, { useState, useEffect } from 'react';

export interface ApplicationData {
    id?: string;
    client: string | number;
    university: string | number; // Added
    program: string | number;    // Added
    program_intake: string | number;
    status: string;
    priority: string;
    assigned_to?: string | number | null;
    application_type: string;
    application_fee_amount?: number;
    application_fee_paid?: boolean;
    tuition_fee_amount?: number;
    tuition_fee_currency?: string;
    tuition_fee_paid_amount?: number;
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
    const initialFormState: ApplicationData = {
        client: '',
        university: '',
        program: '',
        program_intake: '',
        status: 'draft',
        priority: 'normal',
        application_type: 'paid',
        tuition_fee_currency: 'BDT',
        application_fee_paid: false,
        application_fee_amount: 0,
        tuition_fee_amount: 0,
        tuition_fee_paid_amount: 0,
    };

    const [formData, setFormData] = useState<ApplicationData>(initialFormState);
    const [clients, setClients] = useState<any[]>([]);
    const [universities, setUniversities] = useState<any[]>([]); // Added
    const [programs, setPrograms] = useState<any[]>([]);         // Added
    const [intakes, setIntakes] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accessToken = localStorage.getItem('suAccessToken');
                const headers = { 'Authorization': `Bearer ${accessToken}` };
                
                const [clientsRes, uniRes, staffRes] = await Promise.all([
                    fetch('/api/clients/', { headers }),
                    fetch('/api/universities/', { headers }),
                    fetch('/api/staff/', { headers })
                ]);
                
                const clientsData = await clientsRes.json();
                const uniData = await uniRes.json();
                const staffData = await staffRes.json();

                setClients(clientsData.results || clientsData);
                setUniversities(uniData.results || uniData);
                setStaff(staffData.results || staffData);
            } catch (err) {
                console.error('Failed to fetch initial data', err);
            }
        };

        if (isOpen) fetchData();
    }, [isOpen]);

    // Fetch Programs when University changes
    useEffect(() => {
        if (formData.university) {
            const fetchPrograms = async () => {
                const accessToken = localStorage.getItem('suAccessToken');
                const res = await fetch(`/api/programs/?university=${formData.university}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                const data = await res.json();
                setPrograms(data.results || data);
            };
            fetchPrograms();
        }
    }, [formData.university]);

    // Fetch Intakes when Program changes
    useEffect(() => {
        if (formData.program) {
            const fetchIntakes = async () => {
                const accessToken = localStorage.getItem('suAccessToken');
                const res = await fetch(`/api/university-intakes/?program=${formData.program}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                const data = await res.json();
                setIntakes(data.results || data);
            };
            fetchIntakes();
        }
    }, [formData.program]);

    useEffect(() => {
        if (applicationData) {
            setFormData({ ...applicationData });
        } else {
            setFormData(initialFormState);
        }
    }, [applicationData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const url = applicationData?.id ? `/api/applications/${applicationData.id}/` : '/api/applications/';
            const method = applicationData?.id ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to save application');
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
                    <h2 className="text-xl font-bold text-white">{applicationData ? 'Edit' : 'New'} Application</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-left">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Client Selector */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Client</label>
                            <select 
                                required 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                value={formData.client}
                                onChange={e => setFormData({...formData, client: e.target.value})}
                            >
                                <option value="">Select Client</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.user_full_name}</option>)}
                            </select>
                        </div>

                        {/* University Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">University</label>
                            <select 
                                required 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                value={formData.university}
                                onChange={e => setFormData({...formData, university: e.target.value, program: '', program_intake: ''})}
                            >
                                <option value="">Select University</option>
                                {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>

                        {/* Program Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Program</label>
                            <select 
                                required 
                                disabled={!formData.university}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                                value={formData.program}
                                onChange={e => setFormData({...formData, program: e.target.value, program_intake: ''})}
                            >
                                <option value="">Select Program</option>
                                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        {/* Intake Selector */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Intake</label>
                            <select 
                                required 
                                disabled={!formData.program}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                                value={formData.program_intake}
                                onChange={e => setFormData({...formData, program_intake: e.target.value})}
                            >
                                <option value="">Select Intake</option>
                                {intakes.map(i => <option key={i.id} value={i.id}>{i.intake_name}</option>)}
                            </select>
                        </div>

                        {/* Application Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Application Type</label>
                            <select 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                value={formData.application_type}
                                onChange={e => setFormData({...formData, application_type: e.target.value})}
                            >
                                <option value="paid">Paid</option>
                                <option value="free">Free</option>
                            </select>
                        </div>

                        {/* CONDITIONAL: Application Fee Amount */}
                        {formData.application_type === 'paid' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Application Fee (Amount)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                    value={formData.application_fee_amount}
                                    onChange={e => setFormData({...formData, application_fee_amount: Number(e.target.value)})}
                                />
                            </div>
                        )}

                        {/* Tuition Fields */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Tuition Fee</label>
                            <input 
                                type="number" 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                value={formData.tuition_fee_amount}
                                onChange={e => setFormData({...formData, tuition_fee_amount: Number(e.target.value)})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                            <select 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="draft">Draft</option>
                                <option value="submitted">Submitted</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg">
                            {loading ? 'Saving...' : 'Save Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationModal;