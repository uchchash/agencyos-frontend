'use client';

import React, { useState } from 'react';
import DocumentList from '@/components/documents/DocumentList';
import DocumentUploadModal from '@/components/documents/DocumentUploadModal';

const DocumentsPage = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-yellow-900 to-slate-900 rounded-2xl p-8 border border-yellow-500/20 shadow-xl flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Documents 📂</h1>
                    <p className="text-slate-300">Centralized document management and verification.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-yellow-600/20 flex items-center gap-2"
                >
                    <span>Upload Document +</span>
                </button>
            </div>

            <DocumentList refreshTrigger={refreshTrigger} />

            <DocumentUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={handleRefresh}
            />
        </div>
    );
};

export default DocumentsPage;
