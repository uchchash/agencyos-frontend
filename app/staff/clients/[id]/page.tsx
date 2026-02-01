'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStaff } from '../../layout';

interface Client {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    client_id: string;
    phone_number?: string;
    address?: string;
    date_of_birth?: string;
    last_education?: string;
    profile_picture?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
    is_active: boolean;
    created_at: string;
}

interface Document {
    id: string;
    document_type: string;
    status: string;
    created_at: string;
    document_details?: {
        title: string;
        file_name: string;
        file: string;
    };
}

interface Application {
    id: string;
    application_id: string;
    program_name: string;
    status: string;
    intake: string;
    university?: { name: string };
    created_at: string;
}

interface Invoice {
    id: string;
    invoice_number: string;
    total_amount: number;
    currency: string;
    status: string;
    issue_date: string;
    due_date: string;
}

type TabType = 'profile' | 'documents' | 'applications' | 'invoices';

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    draft: 'bg-slate-100 text-slate-700',
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-amber-100 text-amber-700',
    enrolled: 'bg-purple-100 text-purple-700',
    paid: 'bg-green-100 text-green-700',
    sent: 'bg-blue-100 text-blue-700',
    overdue: 'bg-red-100 text-red-700',
};

const ClientDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const { user } = useStaff();
    const clientId = params.id as string;

    const [client, setClient] = useState<Client | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClientData = async () => {
            const accessToken = localStorage.getItem('staffAccessToken');
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            };

            try {
                // Fetch client profile
                const clientRes = await fetch(`/api/clients/${clientId}/`, { headers });
                if (clientRes.ok) {
                    const clientData = await clientRes.json();
                    setClient(clientData);
                }

                // Fetch client documents
                const docsRes = await fetch(`/api/clients/${clientId}/documents/`, { headers });
                if (docsRes.ok) {
                    const docsData = await docsRes.json();
                    setDocuments(Array.isArray(docsData) ? docsData : docsData.results || []);
                }

                // Fetch client applications
                const appsRes = await fetch(`/api/clients/${clientId}/applications/`, { headers });
                if (appsRes.ok) {
                    const appsData = await appsRes.json();
                    setApplications(Array.isArray(appsData) ? appsData : appsData.results || []);
                }

                // Fetch client invoices
                const invRes = await fetch(`/api/clients/${clientId}/invoices/`, { headers });
                if (invRes.ok) {
                    const invData = await invRes.json();
                    setInvoices(Array.isArray(invData) ? invData : invData.results || []);
                }
            } catch (err) {
                console.error('Failed to fetch client data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (clientId) {
            fetchClientData();
        }
    }, [clientId]);

    const tabs = [
        { id: 'profile' as TabType, label: 'Profile', icon: '👤' },
        { id: 'documents' as TabType, label: 'Documents', icon: '📄', count: documents.length },
        { id: 'applications' as TabType, label: 'Applications', icon: '📋', count: applications.length },
        { id: 'invoices' as TabType, label: 'Invoices', icon: '💰', count: invoices.length },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">Client not found</p>
                <Link href="/staff/clients" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to Clients
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link href="/staff/clients" className="text-blue-600 hover:underline">Clients</Link>
                <span className="text-slate-400">/</span>
                <span className="text-slate-600">{client.first_name} {client.last_name}</span>
            </div>

            {/* Header */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {client.first_name?.[0]?.toUpperCase() || 'C'}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-slate-900">{client.first_name} {client.last_name}</h1>
                        <p className="text-blue-600 font-mono text-sm">{client.client_id}</p>
                        <p className="text-slate-500 text-sm mt-1">{client.email}</p>
                    </div>
                    <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${client.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {client.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-1">Phone</p>
                                        <p className="text-slate-900">{client.phone_number || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-1">Date of Birth</p>
                                        <p className="text-slate-900">
                                            {client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-slate-500 uppercase mb-1">Address</p>
                                        <p className="text-slate-900">{client.address || '-'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-slate-500 uppercase mb-1">Last Education</p>
                                        <p className="text-slate-900">{client.last_education || '-'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-900">Emergency Contact</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-1">Name</p>
                                        <p className="text-slate-900">{client.emergency_contact_name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-1">Relation</p>
                                        <p className="text-slate-900">{client.emergency_contact_relation || '-'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-slate-500 uppercase mb-1">Phone</p>
                                        <p className="text-slate-900">{client.emergency_contact_phone || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <div>
                            {documents.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No documents found</p>
                            ) : (
                                <div className="space-y-3">
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {doc.document_details?.title || doc.document_type?.replace('_', ' ')}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {new Date(doc.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[doc.status] || 'bg-slate-100 text-slate-700'}`}>
                                                {doc.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Applications Tab */}
                    {activeTab === 'applications' && (
                        <div>
                            {applications.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No applications found</p>
                            ) : (
                                <div className="space-y-3">
                                    {applications.map((app) => (
                                        <div key={app.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <p className="font-medium text-slate-900">{app.program_name}</p>
                                                <p className="text-sm text-slate-500">
                                                    {app.university?.name} • {app.intake}
                                                </p>
                                                <p className="text-xs text-blue-600 font-mono mt-1">{app.application_id}</p>
                                            </div>
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[app.status] || 'bg-slate-100 text-slate-700'}`}>
                                                {app.status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Invoices Tab */}
                    {activeTab === 'invoices' && (
                        <div>
                            {invoices.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No invoices found</p>
                            ) : (
                                <div className="space-y-3">
                                    {invoices.map((inv) => (
                                        <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <p className="font-medium text-slate-900 font-mono">{inv.invoice_number}</p>
                                                <p className="text-sm text-slate-500">
                                                    Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-slate-900">
                                                    {inv.currency || '$'}{inv.total_amount?.toLocaleString()}
                                                </p>
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[inv.status] || 'bg-slate-100 text-slate-700'}`}>
                                                    {inv.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDetailPage;
