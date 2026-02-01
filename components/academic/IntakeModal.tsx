'use client';

import React, { useState, useEffect } from 'react';

interface University {
    id: number;
    name: string;
}

export interface IntakeData {
    id?: number;
    university: string | number;
    name: string;
    season: string;
    year: number;
    start_month: string;
    application_start_date: string;
    application_deadline: string;
    classes_start_date: string;
    is_active: boolean;
}

interface IntakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    intakeData?: IntakeData | null;
}

const IntakeModal: React.FC<IntakeModalProps> = ({ isOpen, onClose, onSaved, intakeData }) => {
    const [formData, setFormData] = useState<IntakeData>({
        university: '',
        name: '',
        season: 'fall',
        year: new Date().getFullYear(),
        start_month: 'SEP',
        application_start_date: '',
        application_deadline: '',
        classes_start_date: '',
        is_active: true,
    });
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const MONTHS = [
        { val: 'JAN', label: 'January' }, { val: 'FEB', label: 'February' }, { val: 'MAR', label: 'March' },
        { val: 'APR', label: 'April' }, { val: 'MAY', label: 'May' }, { val: 'JUN', label: 'June' },
        { val: 'JUL', label: 'July' }, { val: 'AUG', label: 'August' }, { val: 'SEP', label: 'September' },
        { val: 'OCT', label: 'October' }, { val: 'NOV', label: 'November' }, { val: 'DEC', label: 'December' }
    ];

    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const accessToken = localStorage.getItem('suAccessToken');
                const res = await fetch('/api/universities-all/', {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                const data = await res.json();
                setUniversities(data.results || data);
            } catch (err) {
                console.error('Failed to fetch universities', err);
            }
        };

        if (isOpen) {
            fetchUniversities();
        }
    }, [isOpen]);

    useEffect(() => {
        if (intakeData) {
            setFormData({
                ...intakeData,
                university: intakeData.university.toString()
            });
        } else {
            setFormData({
                university: '',
                name: '',
                season: 'fall',
                year: new Date().getFullYear(),
                start_month: 'SEP',
                application_start_date: '',
                application_deadline: '',
                classes_start_date: '',
                is_active: true,
            });
        }
    }, [intakeData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const url = intakeData?.id ? `/api/university-intakes/${intakeData.id}/` : '/api/university-intakes/';
            const method = intakeData?.id ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(JSON.stringify(data) || 'Failed to save intake');
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
                    <h2 className="text-xl font-bold text-white">{intakeData ? 'Edit Intake' : 'Add Intake'}</h2>
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
                            <label className="block text-sm font-medium text-slate-400 mb-1">Intake Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Fall 2025 Regular Intake"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">University</label>
                            <select
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                value={formData.university}
                                onChange={e => setFormData({ ...formData, university: e.target.value })}
                            >
                                <option value="">Select University</option>
                                {universities.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Start Month</label>
                            <select
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                value={formData.start_month}
                                onChange={e => setFormData({ ...formData, start_month: e.target.value })}
                            >
                                {MONTHS.map(m => (
                                    <option key={m.val} value={m.val}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Season</label>
                            <select
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                value={formData.season}
                                onChange={e => setFormData({ ...formData, season: e.target.value })}
                            >
                                <option value="spring">Spring</option>
                                <option value="summer">Summer</option>
                                <option value="fall">Fall</option>
                                <option value="winter">Winter</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Year</label>
                            <input
                                type="number"
                                required
                                min={2000}
                                max={2100}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">App Start Date</label>
                            <input
                                type="date"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                value={formData.application_start_date}
                                onChange={e => setFormData({ ...formData, application_start_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">App Deadline</label>
                            <input
                                type="date"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                value={formData.application_deadline}
                                onChange={e => setFormData({ ...formData, application_deadline: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Classes Start Date</label>
                            <input
                                type="date"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                value={formData.classes_start_date}
                                onChange={e => setFormData({ ...formData, classes_start_date: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-slate-300">Active</label>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : intakeData ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IntakeModal;
