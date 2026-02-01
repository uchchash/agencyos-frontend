'use client';

import React, { useState, useEffect, useRef } from 'react';

// Define Country and City interfaces used by the component
interface Country {
    id: number | string;
    name: string;
    code?: string;
}

interface City {
    id: number | string;
    name: string;
    country_id?: number | string;
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
    logo?: any; // Added for logo
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
        logo: null,
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [filteredCities, setFilteredCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ... (fetchData and universityData useEffects remain same)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const url = universityData?.id ? `/api/universities/${universityData.id}/` : '/api/universities/';
            const method = universityData?.id ? 'PATCH' : 'POST';

            // Use FormData for image upload
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'logo') {
                    if (value instanceof File) data.append(key, value);
                } else {
                    data.append(key, value.toString());
                }
            });

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    // Note: Browser automatically sets Content-Type to multipart/form-data
                },
                body: data,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(JSON.stringify(errData) || 'Failed to save university');
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
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    {error && <div className="text-red-500 text-sm bg-red-500/10 p-2 rounded">{error}</div>}

                    <div className="space-y-4 text-left">
                        {/* Logo Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">University Logo</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                                onChange={e => setFormData({ ...formData, logo: e.target.files?.[0] })}
                            />
                        </div>

                        {/* ... Existing Name, Type, Number, Website, Country, City fields go here ... */}

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
                        <button type="button" onClick={onClose} className="flex-1 bg-slate-800 text-white py-2 rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">
                            {loading ? 'Saving...' : universityData ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UniversityModal;