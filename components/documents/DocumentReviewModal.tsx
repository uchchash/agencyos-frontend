'use client';

import React, { useState } from 'react';

interface DocumentReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    documentId: string;
    clientId: string;
    documentTitle: string;
    currentStatus: string;
}

const DocumentReviewModal: React.FC<DocumentReviewModalProps> = ({
    isOpen, onClose, onSuccess, documentId, clientId, documentTitle, currentStatus
}) => {
    const [status, setStatus] = useState(currentStatus === 'pending' ? 'approved' : currentStatus);
    const [adminComment, setAdminComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch(`/api/clients/${clientId}/documents/${documentId}/review/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    status: status,
                    admin_comment: adminComment
                })
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const errorData = await res.json();
                alert(`Error: ${JSON.stringify(errorData)}`);
            }
        } catch (err) {
            console.error('Failed to review document', err);
            alert('An unexpected error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <h2 className="text-xl font-bold text-white">Review Document 🔍</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Document</label>
                        <p className="text-white font-medium">{documentTitle}</p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Decision</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setStatus('approved')}
                                className={`py-3 rounded-xl border font-bold transition-all ${status === 'approved'
                                        ? 'bg-green-600/20 border-green-500 text-green-400'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                Approve ✅
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('rejected')}
                                className={`py-3 rounded-xl border font-bold transition-all ${status === 'rejected'
                                        ? 'bg-red-600/20 border-red-500 text-red-400'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                Reject ❌
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Admin Comment</label>
                        <textarea
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 h-32 resize-none text-sm"
                            placeholder="Provide feedback to the client..."
                            value={adminComment}
                            onChange={(e) => setAdminComment(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 ${status === 'approved'
                                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-500/20'
                                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20'
                                }`}
                        >
                            {submitting ? 'Updating...' : 'Submit Decision'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DocumentReviewModal;
