'use client';

import React from 'react';

const ProgramsPage = () => {
    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-purple-900 to-slate-900 rounded-2xl p-8 border border-purple-500/20 shadow-xl">
                <h1 className="text-3xl font-bold text-white mb-2">Programs & Courses 📚</h1>
                <p className="text-slate-300">Manage academic programs, levels, and requirements.</p>
            </div>
            <div className="bg-slate-900/50 rounded-2xl border border-slate-700 p-12 text-center">
                <h2 className="text-xl text-white font-medium">Programs Management Coming Soon</h2>
                <p className="text-slate-400 mt-2">This module is under development.</p>
            </div>
        </div>
    );
};

export default ProgramsPage;
