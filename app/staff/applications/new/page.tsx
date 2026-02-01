'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStaff } from '../../layout';

interface Client {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    client_id: string;
}

interface University {
    id: number;
    name: string;
    country?: { name: string };
}

interface Program {
    id: number;
    name: string;
    level?: { name: string };
    university?: University;
}

interface Intake {
    id: number;
    name: string;
    season: string;
    year: number;
}

const NewApplicationPage = () => {
    const router = useRouter();
    const { user } = useStaff();
    const [clients, setClients] = useState<Client[]>([]);
    const [universities, setUniversities] = useState<University[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [intakes, setIntakes] = useState<Intake[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        client: '',
        university: '',
        program: '',
        intake: '',
        notes: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            const accessToken = localStorage.getItem('staffAccessToken');
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            };

            try {
                const [clientsRes, universitiesRes] = await Promise.all([
                    fetch('/api/clients/', { headers }),
                    fetch('/api/universities/', { headers }),
                ]);

                if (clientsRes.ok) {
                    const data = await clientsRes.json();
                    setClients(Array.isArray(data) ? data : data.results || []);
                }
                if (universitiesRes.ok) {
                    const data = await universitiesRes.json();
                    setUniversities(Array.isArray(data) ? data : data.results || []);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch programs when university changes
    useEffect(() => {
        if (!formData.university) {
            setPrograms([]);
            setIntakes([]);
            return;
        }

        const fetchPrograms = async () => {
            const accessToken = localStorage.getItem('staffAccessToken');
            try {
                const response = await fetch(`/api/universities/${formData.university}/programs/`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setPrograms(Array.isArray(data) ? data : data.results || []);
                }
            } catch (err) {
                console.error('Failed to fetch programs:', err);
            }
        };

        const fetchIntakes = async () => {
            const accessToken = localStorage.getItem('staffAccessToken');
            try {
                const response = await fetch(`/api/universities/${formData.university}/intakes/`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setIntakes(Array.isArray(data) ? data : data.results || []);
                }
            } catch (err) {
                console.error('Failed to fetch intakes:', err);
            }
        };

        fetchPrograms();
        fetchIntakes();
    }, [formData.university]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const accessToken = localStorage.getItem('staffAccessToken');
            const response = await fetch('/api/applications/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    client: formData.client,
                    program: formData.program,
                    intake: formData.intake,
                    notes: formData.notes,
                    status: 'draft',
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || JSON.stringify(data));
            }

            router.push('/staff/applications');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link href="/staff/applications" className="text-blue-600 hover:underline">Applications</Link>
                <span className="text-slate-400">/</span>
                <span className="text-slate-600">New Application</span>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Create New Application</h1>
                <p className="text-slate-600 mt-1">Create a new application for a client</p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
                    )}

                    {/* Client Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Client *</label>
                        <select
                            required
                            value={formData.client}
                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a client...</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.first_name} {client.last_name} ({client.client_id})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* University Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">University *</label>
                        <select
                            required
                            value={formData.university}
                            onChange={(e) => setFormData({ ...formData, university: e.target.value, program: '', intake: '' })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a university...</option>
                            {universities.map((uni) => (
                                <option key={uni.id} value={uni.id}>
                                    {uni.name} {uni.country?.name ? `(${uni.country.name})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Program Selection */}
                    {formData.university && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Program *</label>
                            <select
                                required
                                value={formData.program}
                                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select a program...</option>
                                {programs.map((program) => (
                                    <option key={program.id} value={program.id}>
                                        {program.level?.name ? `[${program.level.name}] ` : ''}{program.name}
                                    </option>
                                ))}
                            </select>
                            {programs.length === 0 && (
                                <p className="text-sm text-slate-500 mt-1">No programs available for this university</p>
                            )}
                        </div>
                    )}

                    {/* Intake Selection */}
                    {formData.university && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Intake *</label>
                            <select
                                required
                                value={formData.intake}
                                onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select an intake...</option>
                                {intakes.map((intake) => (
                                    <option key={intake.id} value={intake.id}>
                                        {intake.name} ({intake.season} {intake.year})
                                    </option>
                                ))}
                            </select>
                            {intakes.length === 0 && (
                                <p className="text-sm text-slate-500 mt-1">No intakes available for this university</p>
                            )}
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Add any notes about this application..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <Link
                            href="/staff/applications"
                            className="flex-1 px-4 py-3 text-center border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : 'Create Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewApplicationPage;
