'use client';

import React, { useState } from 'react';
import ProgramList from '@/components/academic/ProgramList';
import ProgramModal from '@/components/academic/ProgramModal';

interface Program {
    id: number;
    name: string;
    level_name: string;
    subject_name: string;
    university_name: string;
    duration: number;
    application_fee: number;
    tuition_fee: number;
    academic: number;
    course_module: string;
    level: number;
    subject: number;
    university: number;
    is_active: boolean;
}

const ProgramsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSaved = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEdit = (prog: Program) => {
        setSelectedProgram(prog);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedProgram(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-purple-900 to-slate-900 rounded-2xl p-8 border border-purple-500/20 shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Programs & Courses 📚</h1>
                        <p className="text-slate-300">Manage academic programs, levels, and requirements.</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Program
                    </button>
                </div>
            </div>

            <ProgramList refreshTrigger={refreshTrigger} onEdit={handleEdit} />

            <ProgramModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={handleSaved}
                programData={selectedProgram}
            />
        </div>
    );
};

export default ProgramsPage;
