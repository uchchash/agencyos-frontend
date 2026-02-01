'use client';

import React, { useState } from 'react';
import StateList from '@/components/academic/StateList';
import StateModal from '@/components/academic/StateModal';

interface State {
    id: number;
    name: string;
    slug: string;
    country: number;
    country_name: string;
    is_active: boolean;
}

const StatesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedState, setSelectedState] = useState<State | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSaved = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEdit = (state: State) => {
        setSelectedState(state);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedState(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-8 border border-indigo-500/20 shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">States/Provinces 📍</h1>
                        <p className="text-slate-300">Manage states or provinces within countries.</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add State
                    </button>
                </div>
            </div>

            <StateList refreshTrigger={refreshTrigger} onEdit={handleEdit} />

            <StateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={handleSaved}
                stateData={selectedState}
            />
        </div>
    );
};

export default StatesPage;
