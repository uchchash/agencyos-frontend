'use client';

import React, { useState, useEffect } from 'react';

interface Country {
    id: number;
    name: string;
}

interface City {
    id: number;
    name: string;
    country: number;
}

interface UniversityData {
    id?: number;
    name: string;
    university_type: string;
    website: string;
    number: string;
    country: string | number;
    city: string | number;
    is_active: boolean;
}

interface UniversityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    universityData?: UniversityData | null;
}

const UniversityModal: React.FC<UniversityModalProps> = ({ isOpen, onClose, onSaved, universityData }) => {
    const [formData, setFormData] = useState<UniversityData>({
        name: '',
        university_type: 'public',
        website: '',
        number: '',
        country: '',
        city: '',
        is_active: true,
    });
    const [countries, setCountries] = useState<Country[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [filteredCities, setFilteredCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accessToken = localStorage.getItem('suAccessToken');
                const [cRes, cityRes] = await Promise.all([
                    fetch('/api/countries/', { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                    fetch('/api/cities/', { headers: { 'Authorization': `Bearer ${accessToken}` } })
                ]);
                const [cData, cityData] = await Promise.all([cRes.json(), cityRes.json()]);
                setCountries(cData.results || cData);
                setCities(cityData.results || cityData);
            } catch (err) {
                console.error('Failed to fetch locations', err);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (universityData) {
            setFormData({
                ...universityData,
                country: universityData.country.toString(),
                city: universityData.city.toString()
            });
        } else {
            setFormData({
                name: '',
                university_type: 'public',
                website: '',
                number: '',
                country: '',
                city: '',
                is_active: true,
            });
        }
    }, [universityData, isOpen]);

    useEffect(() => {
        if (formData.country) {
            setFilteredCities(cities.filter(c => c.country.toString() === formData.country.toString()));
        } else {
            setFilteredCities([]);
        }
    }, [formData.country, cities]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const url = universityData?.id ? `/api/universities/${universityData.id}/` : '/api/universities/';
            const method = universityData?.id ? 'PATCH' : 'POST';

            // Ensure price fields or logo fields are handled if needed, 
            // but for now only text fields as per model
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
                throw new Error(JSON.stringify(data) || 'Failed to save university');
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
                    <h2 className="text-xl font-bold text-white">{universityData ? 'Edit University' : 'Add University'}</h2>
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
                            <label className="block text-sm font-medium text-slate-400 mb-1">University Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Harvard University"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                                <select
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                    value={formData.university_type}
                                    onChange={e => setFormData({ ...formData, university_type: e.target.value })}
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Contact Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                    value={formData.number}
                                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                                    placeholder="+1234567890"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Website URL</label>
                            <input
                                type="url"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                value={formData.website}
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://www.harvard.edu"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Country</label>
                                <select
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                    value={formData.country}
                                    onChange={e => setFormData({ ...formData, country: e.target.value, city: '' })}
                                >
                                    <option value="">Select Country</option>
                                    {countries.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">City</label>
                                <select
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    disabled={!formData.country}
                                >
                                    <option value="">Select City</option>
                                    {filteredCities.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
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
                            ) : universityData ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UniversityModal;
