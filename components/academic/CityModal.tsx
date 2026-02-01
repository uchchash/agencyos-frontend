'use client';

import React, { useState, useEffect } from 'react';

interface Country {
    id: number;
    name: string;
}

interface State {
    id: number;
    name: string;
    country: number;
}

interface CityData {
    id?: number;
    name: string;
    country: string | number;
    state: string | number;
    is_active: boolean;
}

interface CityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    cityData?: CityData | null;
}

const CityModal: React.FC<CityModalProps> = ({ isOpen, onClose, onSaved, cityData }) => {
    const [formData, setFormData] = useState<CityData>({
        name: '',
        country: '',
        state: '',
        is_active: true,
    });
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [filteredStates, setFilteredStates] = useState<State[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accessToken = localStorage.getItem('suAccessToken');
                const [cRes, sRes] = await Promise.all([
                    fetch('/api/countries/', { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                    fetch('/api/states/', { headers: { 'Authorization': `Bearer ${accessToken}` } })
                ]);
                const [cData, sData] = await Promise.all([cRes.json(), sRes.json()]);
                setCountries(cData.results || cData);
                setStates(sData.results || sData);
            } catch (err) {
                console.error('Failed to fetch locations', err);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (cityData) {
            setFormData({
                ...cityData,
                country: cityData.country.toString(),
                state: cityData.state ? cityData.state.toString() : ''
            });
        } else {
            setFormData({
                name: '',
                country: '',
                state: '',
                is_active: true,
            });
        }
    }, [cityData, isOpen]);

    useEffect(() => {
        if (formData.country) {
            setFilteredStates(states.filter(s => s.country.toString() === formData.country.toString()));
        } else {
            setFilteredStates([]);
        }
    }, [formData.country, states]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const url = cityData?.id ? `/api/cities/${cityData.id}/` : '/api/cities/';
            const method = cityData?.id ? 'PATCH' : 'POST';

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
                throw new Error(JSON.stringify(data) || 'Failed to save city');
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
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">{cityData ? 'Edit City' : 'Add City'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm truncate">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4 text-left">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">City Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="San Francisco"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Country</label>
                            <select
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                value={formData.country}
                                onChange={e => setFormData({ ...formData, country: e.target.value, state: '' })}
                            >
                                <option value="">Select Country</option>
                                {countries.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">State/Province</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                value={formData.state}
                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                                disabled={!formData.country}
                            >
                                <option value="">Select State (Optional)</option>
                                {filteredStates.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
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
                            ) : cityData ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CityModal;
