'use client';

import React, { useEffect, useState } from 'react';
import { useStaff } from '../layout';
import DocumentUploadModal from '@/components/documents/DocumentUploadModal';

interface Document {
    id: string;
    name: string;
    document_type: string;
    status: string;
    client_info?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    document_details?: {
        title: string;
        file_name: string;
        file: string;
        uploaded_by_info?: {
            id: string;
            role: string;
            full_name: string;
            email: string;
        };
    };
    created_at: string;
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    requires_resubmission: 'bg-orange-100 text-orange-700',
};

const StaffDocumentsPage = () => {
    const { user, profile, isAdmin } = useStaff();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [internalDocuments, setInternalDocuments] = useState<any[]>([]); // New state for internal docs
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'client' | 'internal'>('client');
    const [showUploadModal, setShowUploadModal] = useState(false);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('staffAccessToken');

            if (activeTab === 'client') {
                const clientDocsRes = await fetch('/api/documents/', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                if (clientDocsRes.ok) {
                    const data = await clientDocsRes.json();
                    setDocuments(Array.isArray(data) ? data : data.results || []);
                }
            } else {
                // Fetch new internal documents
                const internalDocsRes = await fetch('/api/internal-docs/', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                if (internalDocsRes.ok) {
                    const data = await internalDocsRes.json();
                    setInternalDocuments(Array.isArray(data) ? data : data.results || []);
                }
            }
        } catch (err) {
            console.error('Failed to fetch documents:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [activeTab]);

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = searchTerm === '' ||
            doc.document_details?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.document_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.client_info?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === 'client_only') {
            matchesStatus = doc.document_details?.uploaded_by_info?.role === 'client';
        } else if (statusFilter === 'staff_only') {
            matchesStatus = doc.document_details?.uploaded_by_info?.role === 'staff' || doc.document_details?.uploaded_by_info?.role === 'admin' || doc.document_details?.uploaded_by_info?.role === 'superuser';
        } else if (statusFilter !== 'all') {
            matchesStatus = doc.status === statusFilter;
        }

        return matchesSearch && matchesStatus;
    });

    const filteredInternalDocuments = internalDocuments.filter(doc => {
        return searchTerm === '' ||
            doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.uploaded_by_info?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const canApprove = isAdmin || profile?.can_approve_documents;

    const handleViewDocument = (doc: Document) => {
        if (doc.document_details?.file) {
            window.open(doc.document_details.file, '_blank');
        }
    };

    const handleReviewDocument = async (docId: string, clientId: string, action: 'approved' | 'rejected') => {
        try {
            const accessToken = localStorage.getItem('staffAccessToken');
            const response = await fetch(`/api/clients/${clientId}/documents/${docId}/review/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ status: action }),
            });

            if (response.ok) {
                // Refresh documents
                fetchDocuments();
            }
        } catch (err) {
            console.error('Failed to review document:', err);
        }
    };

    const handleDeleteInternalDocument = async (docId: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        try {
            const accessToken = localStorage.getItem('staffAccessToken');
            const res = await fetch(`/api/internal-docs/${docId}/`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (res.ok) {
                fetchDocuments();
            } else {
                alert('Failed to delete document');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
                    <p className="text-slate-600 mt-1">Review and manage documents</p>
                </div>
                <div className="flex items-center gap-3">
                    {canApprove && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Can Approve Documents
                        </span>
                    )}
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Document
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('client')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'client' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Client Documents
                    {activeTab === 'client' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('internal')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'internal' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Internal Documents
                    {activeTab === 'internal' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="all">All Documents</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="client_only">Client Uploads Only</option>
                    <option value="staff_only">Staff Uploads</option>
                </select>
            </div>

            {/* Documents Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        {activeTab === 'client' ? (
                            <>
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Document Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Type</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Uploaded By</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex justify-center">
                                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredDocuments.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                {searchTerm || statusFilter !== 'all' ? 'No documents found matching your filters.' : 'No documents found.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDocuments.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-900">{doc.document_details?.title || doc.document_type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {doc.document_type?.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-900">
                                                        {doc.client_info?.email || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[doc.status] || 'bg-slate-100 text-slate-700'}`}>
                                                        {doc.status?.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleViewDocument(doc)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        >
                                                            View
                                                        </button>
                                                        {canApprove && doc.status === 'pending' && doc.client_info && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleReviewDocument(doc.id, doc.client_info!.id, 'approved')}
                                                                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReviewDocument(doc.id, doc.client_info!.id, 'rejected')}
                                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </>
                        ) : (
                            <>
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Title</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Uploaded By</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">For</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Size</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex justify-center">
                                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredInternalDocuments.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                No internal documents found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredInternalDocuments.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-900">{doc.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {doc.uploaded_by_info?.full_name || doc.uploaded_by_info?.email || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${doc.for_all_staff ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {doc.for_all_staff ? 'All Staff' : (doc.recipient_info?.full_name || 'Specific Staff')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {doc.file_size_mb ? `${doc.file_size_mb} MB` : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => window.open(doc.file, '_blank')}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        >
                                                            View
                                                        </button>
                                                        {doc.uploaded_by_info?.id === user?.id && (
                                                            <button
                                                                onClick={() => handleDeleteInternalDocument(doc.id)}
                                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </>
                        )}
                    </table>
                </div>
            </div>

            <DocumentUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={() => {
                    setShowUploadModal(false);
                    fetchDocuments();
                }}
                initialTab={activeTab}
            />
        </div>
    );
};

export default StaffDocumentsPage;
