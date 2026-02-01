'use client';

import React, { useState, useEffect } from 'react';

export interface Intake {
    id: number;
    university: number;
    university_name: string;
    name: string;
    season: string;
    year: number;
    start_month: string;
    application_start_date: string;
    application_deadline: string;
    classes_start_date: string;
    is_active: boolean;
}

interface IntakeListProps {
    refreshTrigger: number;
    onEdit: (intake: Intake) => void;
}

const IntakeList: React.FC<IntakeListProps> = ({ refreshTrigger, onEdit }) => {
    const [intakes, setIntakes] = useState<Intake[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchIntakes = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            let url = '/api/university-intakes/?';
            if (search) url += `search=${search}`;

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!res.ok) throw new Error('Failed to fetch intakes');

            const data = await res.json();
            setIntakes(data.results || data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIntakes();
    }, [refreshTrigger]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchIntakes();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this intake?')) return;

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch(`/api/university-intakes/${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (res.ok) {
                fetchIntakes();
            } else {
                alert('Failed to delete intake');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative max-w-md">
                <input
                    type="text"
                    placeholder="Search intakes (uni or season)..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <svg className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <div className="bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-800/50 text-slate-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">University</th>
                                <th className="px-6 py-4">Intake</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </td>
                                </tr>
                            ) : intakes.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No intakes found.
                                    </td>
                                </tr>
                            ) : (
                                intakes.map((intake) => (
                                    <tr key={intake.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">
                                            <div>{intake.university_name}</div>
                                            <div className="text-xs text-slate-500">{intake.name}</div>
                                        </td>
                                        <td className="px-6 py-4 capitalize">
                                            {intake.season} {intake.year}
                                        </td>
                                        <td className="px-6 py-4">
                                            {intake.is_active ? (
                                                <span className="flex items-center gap-1.5 text-green-400 text-xs">
                                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => onEdit(intake)}
                                                    className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(intake.id)}
                                                    className="text-red-400 hover:text-red-300 font-medium text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
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

export default IntakeList;
