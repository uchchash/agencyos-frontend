'use client';

import React, { useState, useEffect } from 'react';

interface University {
    id: number;
    name: string;
}

interface ProgramLevel {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    name: string;
}

interface ProgramData {
    id?: number;
    name: string;
    level: string | number;
    subject: string | number;
    university: string | number;
    duration: number;
    application_fee: number;
    tuition_fee: number;
    academic: string | number;
    course_module: string;
    is_active: boolean;
}

interface ProgramModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    programData?: ProgramData | null;
}

const ProgramModal: React.FC<ProgramModalProps> = ({ isOpen, onClose, onSaved, programData }) => {
    const [formData, setFormData] = useState<ProgramData>({
        name: '',
        level: '',
        subject: '',
        university: '',
        duration: 4,
        application_fee: 0,
        tuition_fee: 0,
        academic: '',
        course_module: '',
        is_active: true,
    });
    const [universities, setUniversities] = useState<University[]>([]);
    const [levels, setLevels] = useState<ProgramLevel[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [academics, setAcademics] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accessToken = localStorage.getItem('suAccessToken');
                const [uRes, lRes, sRes] = await Promise.all([
                    fetch('/api/universities-all/', { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                    fetch('/api/program-levels/', { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                    fetch('/api/subjects/', { headers: { 'Authorization': `Bearer ${accessToken}` } })
                ]);
                const [uData, lData, sData] = await Promise.all([uRes.json(), lRes.json(), sRes.json()]);
                setUniversities(uData.results || uData);
                setLevels(lData.results || lData);
                setSubjects(sData.results || sData);
            } catch (err) {
                console.error('Failed to fetch criteria', err);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (programData) {
            setFormData({
                ...programData,
                level: programData.level?.toString() || '',
                subject: programData.subject?.toString() || '',
                university: programData.university?.toString() || '',
                academic: (programData as any).academic?.toString() || '',
            });
        } else {
            setFormData({
                name: '',
                level: '',
                subject: '',
                university: '',
                duration: 4,
                application_fee: 0,
                tuition_fee: 0,
                academic: '',
                course_module: '',
                is_active: true,
            });
        }
    }, [programData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const url = programData?.id ? `/api/programs-all/${programData.id}/` : '/api/programs-all/';
            const method = programData?.id ? 'PATCH' : 'POST';

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
                throw new Error(JSON.stringify(data) || 'Failed to save program');
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
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">{programData ? 'Edit Program' : 'Add Program'}</h2>
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

                    <div className="space-y-4 text-left">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Program Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="B.Sc. in Computer Science"
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Level</label>
                                <select
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                    value={formData.level}
                                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                                >
                                    <option value="">Select Level</option>
                                    {levels.map(l => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                                <select
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Duration (Years)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Tuition Fee ($)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                    value={formData.tuition_fee}
                                    onChange={e => setFormData({ ...formData, tuition_fee: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 text-left">
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

                    <div className="pt-4 flex gap-3 sticky bottom-0 bg-slate-900 pb-2">
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
                            ) : programData ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProgramModal;
