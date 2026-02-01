'use client';

import React, { useState, useEffect } from 'react';
import DocumentReviewModal from './DocumentReviewModal';

interface ClientInfo {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface DocumentDetails {
    file: string;
    title: string;
    description: string;
    file_name: string;
}

export interface ClientDocument {
    id: string;
    client: string;
    client_info: ClientInfo;
    document_type: string;
    document_type_display: string;
    status: string;
    status_display: string;
    admin_comment: string;
    created_at: string;
    document_details: DocumentDetails;
}

interface DocumentListProps {
    refreshTrigger?: number;
}

const DocumentList: React.FC<DocumentListProps> = ({ refreshTrigger = 0 }) => {
    const [documents, setDocuments] = useState<ClientDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    // Modal state
    const [selectedDoc, setSelectedDoc] = useState<ClientDocument | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            let url = '/api/documents/';
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (typeFilter) params.append('document_type', typeFilter);

            if (params.toString()) url += `?${params.toString()}`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            setDocuments(data.results || data);
        } catch (err) {
            console.error('Failed to fetch documents', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [statusFilter, typeFilter, refreshTrigger]);

    const handleReview = (doc: ClientDocument) => {
        setSelectedDoc(doc);
        setIsReviewModalOpen(true);
    };

    const filteredDocuments = documents.filter(doc => {
        const fullName = `${doc.client_info?.first_name} ${doc.client_info?.last_name}`.toLowerCase();
        const email = doc.client_info?.email?.toLowerCase() || '';
        const searchLower = search.toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower);
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap gap-4 items-end shadow-lg">
                <div className="flex-1 min-w-[300px] space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Search Client</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Name or email..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <svg className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="w-48 space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Status</label>
                    <select
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition-all"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div className="w-48 space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Doc Type</label>
                    <select
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition-all"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="passport">Passport</option>
                        <option value="national_id">National ID</option>
                        <option value="transcript">Transcript</option>
                        <option value="certificate">Certificate</option>
                        <option value="bank">Bank Statement</option>
                        <option value="photo">Photo</option>
                        <option value="others">Others</option>
                    </select>
                </div>

                <button
                    onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); }}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-400 transition-all hover:text-white"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Document Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Uploaded</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={5} className="px-6 py-4"><div className="h-10 bg-slate-800/50 rounded-xl w-full"></div></td>
                                </tr>
                            ))
                        ) : filteredDocuments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                                    No documents found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredDocuments.map((doc) => (
                                <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors group text-sm">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-semibold">{doc.client_info?.first_name} {doc.client_info?.last_name}</span>
                                            <span className="text-slate-500 text-xs">{doc.client_info?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-slate-200">{doc.document_type_display}</span>
                                            <span className="text-[10px] text-slate-500 italic truncate max-w-[150px]">
                                                {doc.document_details?.file_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(doc.status)}`}>
                                            {doc.status_display}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <a
                                                href={doc.document_details?.file}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 bg-slate-800 hover:bg-slate-700 text-yellow-500 rounded-lg transition-all border border-slate-700 shadow-sm"
                                                title="View/Download"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </a>
                                            <button
                                                onClick={() => handleReview(doc)}
                                                className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-all border border-slate-700 shadow-sm"
                                                title="Review"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedDoc && (
                <DocumentReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    onSuccess={fetchDocuments}
                    documentId={selectedDoc.id}
                    clientId={selectedDoc.client_info?.id}
                    documentTitle={selectedDoc.document_type_display}
                    currentStatus={selectedDoc.status}
                />
            )}
        </div>
    );
};

export default DocumentList;
