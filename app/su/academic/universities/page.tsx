'use client';

import React, { useState } from 'react';
import UniversityList from '@/components/academic/UniversityList';
import UniversityModal from '@/components/academic/UniversityModal';

interface University {
    id: number;
    name: string;
    slug: string;
    university_type: string;
    website: string;
    number: string;
    country: number;
    city: number;
    country_name: string;
    city_name: string;
    is_active: boolean;
}

const UniversitiesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSaved = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEdit = (uni: University) => {
        setSelectedUniversity(uni);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedUniversity(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-2xl p-8 border border-emerald-500/20 shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Universities 🏛️</h1>
                        <p className="text-slate-300">Manage partner universities and their details.</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add University
                    </button>
                </div>
            </div>

            <UniversityList refreshTrigger={refreshTrigger} onEdit={handleEdit} />

            <UniversityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={handleSaved}
                universityData={selectedUniversity}
            />
        </div>
    );
};

export default UniversitiesPage;
