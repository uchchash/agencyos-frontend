'use client';

import React, { useState } from 'react';
import IntakeList from '@/components/academic/IntakeList';
import IntakeModal from '@/components/academic/IntakeModal';

import { Intake } from '@/components/academic/IntakeList';
import { IntakeData } from '@/components/academic/IntakeModal';

const IntakesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIntake, setSelectedIntake] = useState<Intake | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSaved = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEdit = (intake: Intake) => {
        setSelectedIntake(intake);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedIntake(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-orange-900 to-slate-900 rounded-2xl p-8 border border-orange-500/20 shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Intakes 📅</h1>
                        <p className="text-slate-300">Manage university intake sessions (Fall, Spring, etc.).</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Intake
                    </button>
                </div>
            </div>

            <IntakeList refreshTrigger={refreshTrigger} onEdit={handleEdit} />

            <IntakeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={handleSaved}
                intakeData={selectedIntake as unknown as IntakeData}
            />
        </div>
    );
};

export default IntakesPage;
