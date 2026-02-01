'use client';

import React from 'react';
import ReportDashboard from '@/components/reports/ReportDashboard';
import ReportSettingsModal from '@/components/reports/ReportSettingsModal';
import { useState } from 'react';

const ReportsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 to-slate-900 rounded-2xl p-8 border border-purple-500/20 shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Reports & Analytics 📊
                        </h1>
                        <p className="text-slate-300 text-lg">
                            Monitor system performance and business metrics.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Generate New Report
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <ReportDashboard />

            <ReportSettingsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default ReportsPage;
