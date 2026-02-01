'use client';

import React, { useState } from 'react';
import CountryList from '@/components/academic/CountryList';
import CountryModal from '@/components/academic/CountryModal';

interface Country {
    id: number;
    name: string;
    slug: string;
    iso_code: string;
    flag: string | null;
}

const CountriesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSaved = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEdit = (country: Country) => {
        setSelectedCountry(country);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedCountry(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-8 border border-blue-500/20 shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Countries 🌍</h1>
                        <p className="text-slate-300">Manage countries where partner universities are located.</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Country
                    </button>
                </div>
            </div>

            <CountryList refreshTrigger={refreshTrigger} onEdit={handleEdit} />

            <CountryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={handleSaved}
                country={selectedCountry}
            />
        </div>
    );
};

export default CountriesPage;
