'use client';

import React, { useState } from 'react';
import CityList from '@/components/academic/CityList';
import CityModal from '@/components/academic/CityModal';

interface City {
    id: number;
    name: string;
    slug: string;
    state: number;
    state_name: string;
    country: number;
    country_name: string;
    is_active: boolean;
}

const CitiesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSaved = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEdit = (city: City) => {
        setSelectedCity(city);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedCity(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-cyan-900 to-slate-900 rounded-2xl p-8 border border-cyan-500/20 shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Cities 🏙️</h1>
                        <p className="text-slate-300">Manage cities where universities are based.</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add City
                    </button>
                </div>
            </div>

            <CityList refreshTrigger={refreshTrigger} onEdit={handleEdit} />

            <CityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={handleSaved}
                cityData={selectedCity}
            />
        </div>
    );
};

export default CitiesPage;
