'use client';

import React, { useState, useEffect } from 'react';

interface Country {
    id: number;
    name: string;
    slug: string;
    iso_code: string;
    flag: string | null;
}

interface CountryListProps {
    refreshTrigger: number;
    onEdit: (country: Country) => void;
}

const CountryList: React.FC<CountryListProps> = ({ refreshTrigger, onEdit }) => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchCountries = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            let url = '/api/countries/?';
            if (search) url += `search=${search}`;

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!res.ok) throw new Error('Failed to fetch countries');

            const data = await res.json();
            setCountries(data.results || data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCountries();
    }, [refreshTrigger]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCountries();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this country?')) return;

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch(`/api/countries/${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (res.ok) {
                fetchCountries();
            } else {
                alert('Failed to delete country');
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
                    placeholder="Search countries..."
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
                                <th className="px-6 py-4">Country</th>
                                <th className="px-6 py-4">ISO Code</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </td>
                                </tr>
                            ) : countries.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                        No countries found.
                                    </td>
                                </tr>
                            ) : (
                                countries.map((country) => (
                                    <tr key={country.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-lg overflow-hidden border border-slate-700">
                                                    {country.flag ? (
                                                        <img src={country.flag} alt={country.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        '🏳️'
                                                    )}
                                                </div>
                                                <div className="font-medium text-white">{country.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs uppercase">{country.iso_code}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => onEdit(country)}
                                                    className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(country.id)}
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

export default CountryList;
