'use client';

import React, { useState } from 'react';

interface ReportSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ReportSettingsModal: React.FC<ReportSettingsModalProps> = ({ isOpen, onClose }) => {
    const [generating, setGenerating] = useState(false);

    const handleGenerate = () => {
        setGenerating(true);
        setTimeout(() => {
            setGenerating(false);
            alert('This feature is currently under final development. Your report request has been logged.');
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <h2 className="text-xl font-bold text-white">Generate New Report 📊</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Report Type</label>
                        <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500">
                            <option>Monthly Revenue Report</option>
                            <option>Application Success Metrics</option>
                            <option>Staff Performance Overview</option>
                            <option>Client Onboarding Trends</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Start Date</label>
                            <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">End Date</label>
                            <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Format</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-white cursor-pointer hover:text-purple-400 transition-colors">
                                <input type="radio" name="format" defaultChecked className="text-purple-600 focus:ring-purple-500 bg-slate-800 border-slate-700" />
                                <span className="text-sm">PDF Document</span>
                            </label>
                            <label className="flex items-center gap-2 text-white cursor-pointer hover:text-purple-400 transition-colors">
                                <input type="radio" name="format" className="text-purple-600 focus:ring-purple-500 bg-slate-800 border-slate-700" />
                                <span className="text-sm">Excel Spreadsheet</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/20 disabled:opacity-50"
                        >
                            {generating ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportSettingsModal;
