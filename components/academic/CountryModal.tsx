'use client';

import React, { useState, useEffect } from 'react';

interface Country {
    id?: number;
    name: string;
    iso_code: string;
    flag?: any;
}

interface CountryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    country?: Country | null;
}

const CountryModal: React.FC<CountryModalProps> = ({ isOpen, onClose, onSaved, country }) => {
    const [formData, setFormData] = useState<Country>({
        name: '',
        iso_code: '',
    });
    const [flagFile, setFlagFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (country) {
            setFormData({
                id: country.id,
                name: country.name || '',
                iso_code: country.iso_code || '',
            });
            setFlagFile(null);
        } else {
            setFormData({
                name: '',
                iso_code: '',
            });
            setFlagFile(null);
        }
    }, [country, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const url = country?.id ? `/api/countries/${country.id}/` : '/api/countries/';
            const method = country?.id ? 'PATCH' : 'POST';

            // Use FormData for file upload
            const data = new FormData();
            data.append('name', formData.name);
            data.append('iso_code', formData.iso_code);
            if (flagFile) {
                data.append('flag', flagFile);
            }

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: data,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(JSON.stringify(errorData) || 'Failed to save country');
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
                    <h2 className="text-xl font-bold text-white">{country ? 'Edit Country' : 'Add Country'}</h2>
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
                            <label className="block text-sm font-medium text-slate-400 mb-1">Country Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="United States"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">ISO Code</label>
                            <input
                                type="text"
                                required
                                maxLength={10}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 uppercase"
                                value={formData.iso_code}
                                onChange={e => setFormData({ ...formData, iso_code: e.target.value })}
                                placeholder="US"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Short code used for system mapping.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Flag Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 file:bg-blue-600 file:border-none file:rounded file:text-white file:px-2 file:py-1 file:mr-4 file:cursor-pointer"
                                onChange={e => setFlagFile(e.target.files?.[0] || null)}
                            />
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
                            ) : country ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CountryModal;
