'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStaff } from '../layout';

interface University {
    id: number;
    name: string;
    slug: string;
    country: { id: number; name: string };
    city: { id: number; name: string };
    university_type: string;
    global_rank?: number;
    is_active: boolean;
}

interface Country {
    id: number;
    name: string;
    iso_code: string;
}

interface Subject {
    id: number;
    name: string;
}

interface Intake {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

interface City {
    id: number;
    name: string;
    country?: { id: number; name: string };
}

interface State {
    id: number;
    name: string;
    country?: { id: number; name: string };
}

type TabType = 'universities' | 'countries' | 'subjects' | 'intakes' | 'cities' | 'states';

const DataPage = () => {
    const { isAdmin } = useStaff();
    const [activeTab, setActiveTab] = useState<TabType>('universities');
    const [universities, setUniversities] = useState<University[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [intakes, setIntakes] = useState<Intake[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const accessToken = localStorage.getItem('staffAccessToken');
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        };

        try {
            const [uniRes, countryRes, subjectRes, intakeRes, cityRes, stateRes] = await Promise.all([
                fetch('/api/universities/', { headers }),
                fetch('/api/countries/', { headers }),
                fetch('/api/subjects/', { headers }),
                fetch('/api/intakes/', { headers }),
                fetch('/api/cities/', { headers }),
                fetch('/api/states/', { headers }),
            ]);

            if (uniRes.ok) {
                const data = await uniRes.json();
                setUniversities(Array.isArray(data) ? data : data.results || []);
            }
            if (countryRes.ok) {
                const data = await countryRes.json();
                setCountries(Array.isArray(data) ? data : data.results || []);
            }
            if (subjectRes.ok) {
                const data = await subjectRes.json();
                setSubjects(Array.isArray(data) ? data : data.results || []);
            }
            if (intakeRes.ok) {
                const data = await intakeRes.json();
                setIntakes(Array.isArray(data) ? data : data.results || []);
            }
            if (cityRes.ok) {
                const data = await cityRes.json();
                setCities(Array.isArray(data) ? data : data.results || []);
            }
            if (stateRes.ok) {
                const data = await stateRes.json();
                setStates(Array.isArray(data) ? data : data.results || []);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getEndpoint = () => {
        switch (activeTab) {
            case 'universities': return '/api/universities/';
            case 'countries': return '/api/countries/';
            case 'subjects': return '/api/subjects/';
            case 'intakes': return '/api/intakes/';
            case 'cities': return '/api/cities/';
            case 'states': return '/api/states/';
        }
    };

    const handleAdd = () => {
        setEditItem(null);
        setFormData({});
        setShowAddModal(true);
        setError('');
    };

    const handleEdit = (item: any) => {
        setEditItem(item);
        setFormData(item);
        setShowAddModal(true);
        setError('');
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const accessToken = localStorage.getItem('staffAccessToken');
            const response = await fetch(`${getEndpoint()}${id}/`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok || response.status === 204) {
                fetchData();
            }
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const accessToken = localStorage.getItem('staffAccessToken');
            const url = editItem ? `${getEndpoint()}${editItem.id}/` : getEndpoint();
            const method = editItem ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || JSON.stringify(data));
            }

            setShowAddModal(false);
            fetchData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filterItems = (items: any[], fields: string[]) => {
        if (!searchTerm) return items;
        const lower = searchTerm.toLowerCase();
        return items.filter(item =>
            fields.some(field => {
                const value = field.includes('.')
                    ? field.split('.').reduce((o, k) => o?.[k], item)
                    : item[field];
                return value?.toString().toLowerCase().includes(lower);
            })
        );
    };

    const tabs = [
        { id: 'universities' as TabType, label: 'Universities', count: universities.length },
        { id: 'countries' as TabType, label: 'Countries', count: countries.length },
        { id: 'cities' as TabType, label: 'Cities', count: cities.length },
        { id: 'states' as TabType, label: 'States', count: states.length },
        { id: 'intakes' as TabType, label: 'Intakes', count: intakes.length },
        { id: 'subjects' as TabType, label: 'Subjects', count: subjects.length },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Academic</h1>
                    <p className="text-slate-600 mt-1">
                        {isAdmin ? 'Manage universities, countries, intakes, and more' : 'View academic data'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {isAdmin && (
                        <button
                            onClick={handleAdd}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/25"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add {activeTab.slice(0, -1)}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            {tab.label}
                            <span className="ml-2 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            {/* Universities Tab */}
                            {activeTab === 'universities' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Country</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">City</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Rank</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                                {isAdmin && <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filterItems(universities, ['name', 'country.name', 'city.name']).map((uni) => (
                                                <tr key={uni.id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{uni.name}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{uni.country?.name || '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{uni.city?.name || '-'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${uni.university_type === 'public'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-purple-100 text-purple-700'
                                                            }`}>
                                                            {uni.university_type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{uni.global_rank || '-'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${uni.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {uni.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleEdit(uni)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                                                <button onClick={() => handleDelete(uni.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Countries Tab */}
                            {activeTab === 'countries' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filterItems(countries, ['name', 'iso_code']).map((country) => (
                                        <div key={country.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-900">{country.name}</p>
                                                <p className="text-sm text-slate-500">{country.iso_code}</p>
                                            </div>
                                            {isAdmin && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEdit(country)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                                    <button onClick={() => handleDelete(country.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Subjects Tab */}
                            {activeTab === 'subjects' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filterItems(subjects, ['name']).map((subject) => (
                                        <div key={subject.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                                            <p className="font-medium text-slate-900">{subject.name}</p>
                                            {isAdmin && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEdit(subject)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                                    <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Cities Tab */}
                            {activeTab === 'cities' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filterItems(cities, ['name', 'country.name']).map((city) => (
                                        <div key={city.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-900">{city.name}</p>
                                                <p className="text-sm text-slate-500">{city.country?.name || 'No country'}</p>
                                            </div>
                                            {isAdmin && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEdit(city)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                                    <button onClick={() => handleDelete(city.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* States Tab */}
                            {activeTab === 'states' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filterItems(states, ['name', 'country.name']).map((state) => (
                                        <div key={state.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-900">{state.name}</p>
                                                <p className="text-sm text-slate-500">{state.country?.name || 'No country'}</p>
                                            </div>
                                            {isAdmin && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEdit(state)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                                    <button onClick={() => handleDelete(state.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Intakes Tab */}
                            {activeTab === 'intakes' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Start Date</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">End Date</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                                {isAdmin && <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filterItems(intakes, ['name']).map((intake) => (
                                                <tr key={intake.id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{intake.name}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">
                                                        {intake.start_date ? new Date(intake.start_date).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">
                                                        {intake.end_date ? new Date(intake.end_date).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${intake.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {intake.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleEdit(intake)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                                                <button onClick={() => handleDelete(intake.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
                                </h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
                            )}

                            {activeTab === 'universities' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                            <select
                                                value={formData.university_type || 'public'}
                                                onChange={(e) => setFormData({ ...formData, university_type: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            >
                                                <option value="public">Public</option>
                                                <option value="private">Private</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                                            <select
                                                value={formData.country || ''}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            >
                                                <option value="">Select country...</option>
                                                {countries.map((c) => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                                        <input
                                            type="url"
                                            value={formData.website || ''}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'countries' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">ISO Code *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.iso_code || ''}
                                            onChange={(e) => setFormData({ ...formData, iso_code: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'subjects' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataPage;
