'use client';

import React, { useState, useEffect } from 'react';

interface Client {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface StaffMember {
    id: string;
    user_id: number;
    email: string;
    full_name: string;
    staff_role: string;
    staff_role_display: string;
}

interface DocumentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialTab?: 'client' | 'internal';
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ isOpen, onClose, onSuccess, initialTab = 'client' }) => {
    const [activeTab, setActiveTab] = useState<'client' | 'internal'>(initialTab);

    // Client tab state
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);
    const [searchClient, setSearchClient] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Staff tab state
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [searchStaff, setSearchStaff] = useState('');
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

    // Common form state
    const [docType, setDocType] = useState('passport');
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Internal document state
    const [internalTitle, setInternalTitle] = useState('');
    const [internalFile, setInternalFile] = useState<File | null>(null);
    const [forAllStaff, setForAllStaff] = useState(true);
    const [selectedRecipient, setSelectedRecipient] = useState<StaffMember | null>(null);

    // Reset form when modal closes or opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            if (initialTab === 'client') {
                fetchClients();
            } else if (initialTab === 'internal') {
                fetchStaff();
            }
        } else {
            resetForm();
        }
    }, [isOpen, initialTab]);

    const fetchClients = async () => {
        setLoadingClients(true);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch('/api/clients/', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            setClients(data.results || data);
        } catch (err) {
            console.error('Failed to fetch clients', err);
        } finally {
            setLoadingClients(false);
        }
    };

    const fetchStaff = async () => {
        setLoadingStaff(true);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch('/api/staff/', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            setStaffMembers(data.results || data);
        } catch (err) {
            console.error('Failed to fetch staff', err);
        } finally {
            setLoadingStaff(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab === 'client') {
            if (!selectedClient || !file) {
                alert('Please select a client and a file.');
                return;
            }
        } else if (activeTab === 'internal') {
            if (!internalFile || !internalTitle.trim()) {
                alert('Please provide a title and select a file.');
                return;
            }
            if (!forAllStaff && !selectedRecipient) {
                alert('Please select a recipient or choose "For All Staff".');
                return;
            }
        }

        setSubmitting(true);

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            let endpoint = '/api/documents/';
            const formData = new FormData();

            if (activeTab === 'internal') {
                // Internal document upload
                endpoint = '/api/internal-docs/';
                formData.append('file', internalFile!);
                formData.append('title', internalTitle);
                formData.append('for_all_staff', forAllStaff ? 'true' : 'false');
                if (!forAllStaff && selectedRecipient) {
                    formData.append('recipient_id', String(selectedRecipient.user_id));
                }
            } else {
                formData.append('file', file!);
                formData.append('document_type', docType);
                if (title) formData.append('title', title);
                if (description) formData.append('description', description);
                if (issueDate) formData.append('issue_date', issueDate);
                if (expiryDate) formData.append('expiry_date', expiryDate);

                // Must be client tab here
                formData.append('client', selectedClient!.id);
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formData
            });

            if (res.ok) {
                onSuccess();
                onClose();
                resetForm();
            } else {
                const err = await res.json();
                alert(`Error: ${JSON.stringify(err)}`);
            }
        } catch (err) {
            console.error('Upload failed', err);
            alert('An unexpected error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedClient(null);
        setSelectedStaff(null);
        setFile(null);
        setTitle('');
        setDescription('');
        setIssueDate('');
        setExpiryDate('');
        setInternalTitle('');
        setInternalFile(null);
        setForAllStaff(true);
        setSelectedRecipient(null);
    };

    const filteredClients = clients.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchClient.toLowerCase()) ||
        c.email.toLowerCase().includes(searchClient.toLowerCase())
    );

    const filteredStaff = staffMembers.filter(s =>
        (s.full_name || '').toLowerCase().includes(searchStaff.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(searchStaff.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-800/50">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Upload Document 📤</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setActiveTab('client')}
                            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === 'client'
                                ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/20'
                                : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            👤 For Client
                        </button>
                        <button
                            onClick={() => setActiveTab('internal')}
                            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === 'internal'
                                ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                                : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            📁 Internal Document
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                    {/* Recipient Selection - Client/Staff Tabs */}
                    {activeTab !== 'internal' && (
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">
                                Select {activeTab === 'client' ? 'Client' : 'Staff Member'}
                            </label>

                            {activeTab === 'client' ? (
                                // Client Selection
                                !selectedClient ? (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search for a client..."
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 text-sm"
                                                value={searchClient}
                                                onChange={(e) => setSearchClient(e.target.value)}
                                            />
                                            <svg className="w-5 h-5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <div className="max-h-40 overflow-y-auto bg-slate-800/50 rounded-xl border border-slate-700 divide-y divide-slate-700">
                                            {loadingClients ? (
                                                <div className="p-4 text-center text-slate-500 text-sm italic">Loading clients...</div>
                                            ) : filteredClients.length === 0 ? (
                                                <div className="p-4 text-center text-slate-500 text-sm">No clients found.</div>
                                            ) : (
                                                filteredClients.map(c => (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => setSelectedClient(c)}
                                                        className="w-full text-left p-3 hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                                                    >
                                                        <div>
                                                            <div className="text-white font-medium text-sm group-hover:text-yellow-500 transition-colors">{c.first_name} {c.last_name}</div>
                                                            <div className="text-slate-500 text-xs">{c.email}</div>
                                                        </div>
                                                        <div className="text-slate-600 group-hover:text-yellow-500/50 italic text-[10px] uppercase font-bold tracking-widest">Select</div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                        <div>
                                            <div className="text-white font-bold">{selectedClient.first_name} {selectedClient.last_name}</div>
                                            <div className="text-yellow-500/70 text-xs">{selectedClient.email}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedClient(null)}
                                            className="text-[10px] font-bold text-yellow-500 underline uppercase tracking-widest hover:text-yellow-400"
                                        >
                                            Change
                                        </button>
                                    </div>
                                )
                            ) : (
                                // Staff Selection
                                !selectedStaff ? (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search for a staff member..."
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm"
                                                value={searchStaff}
                                                onChange={(e) => setSearchStaff(e.target.value)}
                                            />
                                            <svg className="w-5 h-5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <div className="max-h-40 overflow-y-auto bg-slate-800/50 rounded-xl border border-slate-700 divide-y divide-slate-700">
                                            {loadingStaff ? (
                                                <div className="p-4 text-center text-slate-500 text-sm italic">Loading staff...</div>
                                            ) : filteredStaff.length === 0 ? (
                                                <div className="p-4 text-center text-slate-500 text-sm">No staff found.</div>
                                            ) : (
                                                filteredStaff.map(s => (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        onClick={() => setSelectedStaff(s)}
                                                        className="w-full text-left p-3 hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                                                    >
                                                        <div>
                                                            <div className="text-white font-medium text-sm group-hover:text-blue-500 transition-colors">{s.full_name}</div>
                                                            <div className="text-slate-500 text-xs">{s.email} • {s.staff_role_display || s.staff_role?.replace('_', ' ')}</div>
                                                        </div>
                                                        <div className="text-slate-600 group-hover:text-blue-500/50 italic text-[10px] uppercase font-bold tracking-widest">Select</div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                        <div>
                                            <div className="text-white font-bold">{selectedStaff.full_name}</div>
                                            <div className="text-blue-500/70 text-xs">{selectedStaff.email} • {selectedStaff.staff_role_display || selectedStaff.staff_role?.replace('_', ' ')}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedStaff(null)}
                                            className="text-[10px] font-bold text-blue-500 underline uppercase tracking-widest hover:text-blue-400"
                                        >
                                            Change
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {/* Internal Document Settings */}
                    {activeTab === 'internal' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">Document Title *</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 text-sm"
                                    placeholder="e.g. Employee Handbook 2024"
                                    value={internalTitle}
                                    onChange={(e) => setInternalTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">Visibility</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${forAllStaff ? 'border-green-500 bg-green-500' : 'border-slate-600 bg-slate-800'}`}>
                                            {forAllStaff && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <input type="radio" className="hidden" checked={forAllStaff} onChange={() => setForAllStaff(true)} />
                                        <span className={`text-sm font-medium transition-colors ${forAllStaff ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>For All Staff</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${!forAllStaff ? 'border-green-500 bg-green-500' : 'border-slate-600 bg-slate-800'}`}>
                                            {!forAllStaff && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <input type="radio" className="hidden" checked={!forAllStaff} onChange={() => setForAllStaff(false)} />
                                        <span className={`text-sm font-medium transition-colors ${!forAllStaff ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>Specific Staff Member</span>
                                    </label>
                                </div>

                                {!forAllStaff && (
                                    <div className="mt-3">
                                        {!selectedRecipient ? (
                                            <div className="space-y-2">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Search custom recipient..."
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 text-sm"
                                                        value={searchStaff}
                                                        onChange={(e) => setSearchStaff(e.target.value)}
                                                    />
                                                    <svg className="w-5 h-5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                </div>
                                                <div className="max-h-40 overflow-y-auto bg-slate-800/50 rounded-xl border border-slate-700 divide-y divide-slate-700">
                                                    {loadingStaff ? (
                                                        <div className="p-4 text-center text-slate-500 text-sm italic">Loading staff...</div>
                                                    ) : filteredStaff.length === 0 ? (
                                                        <div className="p-4 text-center text-slate-500 text-sm">No staff found.</div>
                                                    ) : (
                                                        filteredStaff.map(s => (
                                                            <button
                                                                key={s.id}
                                                                type="button"
                                                                onClick={() => setSelectedRecipient(s)}
                                                                className="w-full text-left p-3 hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                                                            >
                                                                <div>
                                                                    <div className="text-white font-medium text-sm group-hover:text-green-500 transition-colors">{s.full_name}</div>
                                                                    <div className="text-slate-500 text-xs">{s.email}</div>
                                                                </div>
                                                                <div className="text-slate-600 group-hover:text-green-500/50 italic text-[10px] uppercase font-bold tracking-widest">Select</div>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                                <div>
                                                    <div className="text-white font-bold">{selectedRecipient.full_name}</div>
                                                    <div className="text-green-500/70 text-xs">{selectedRecipient.email}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedRecipient(null)}
                                                    className="text-[10px] font-bold text-green-500 underline uppercase tracking-widest hover:text-green-400"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab !== 'internal' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">Document Type</label>
                                <select
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 text-sm"
                                    value={docType}
                                    onChange={(e) => setDocType(e.target.value)}
                                >
                                    <option value="passport">Passport</option>
                                    <option value="national_id">National ID</option>
                                    <option value="transcript">Transcript</option>
                                    <option value="certificate">Degree Certificate</option>
                                    <option value="marksheet">Marksheet</option>
                                    <option value="language">Language Proficiency (IELTS)</option>
                                    <option value="bank">Bank Statement</option>
                                    <option value="photo">Photo</option>
                                    <option value="sop">SOP</option>
                                    <option value="cv">CV</option>
                                    <option value="offer_letter">Offer Letter</option>
                                    <option value="cas_letter">CAS Letter</option>
                                    <option value="invoice">Invoice</option>
                                    <option value="others">Other Documents</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">Title (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 text-sm"
                                    placeholder="e.g. Passport - Scanned"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">Select File</label>
                        <div className="relative group">
                            <input
                                type="file"
                                className="hidden"
                                id="upload-file-input"
                                onChange={(e) => activeTab === 'internal' ? setInternalFile(e.target.files?.[0] || null) : setFile(e.target.files?.[0] || null)}
                            />
                            <label
                                htmlFor="upload-file-input"
                                className={`w-full flex items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${file ? 'bg-green-500/5 border-green-500/30' : 'bg-slate-800/30 border-slate-700 hover:border-yellow-500/50 hover:bg-slate-800/50'
                                    }`}
                            >
                                <div className="text-center">
                                    {(activeTab === 'internal' ? internalFile : file) ? (
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div className="text-green-400 font-medium">{(activeTab === 'internal' ? internalFile : file)?.name}</div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                            </div>
                                            <div className="text-slate-400 font-medium">Click to upload or drag & drop</div>
                                            <div className="text-slate-600 text-xs">PDF, JPG, PNG (Max 10MB)</div>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {activeTab !== 'internal' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">Issue Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 text-sm"
                                    value={issueDate}
                                    onChange={(e) => setIssueDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">Expiry Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 text-sm"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                />
                            </div>
                        </div>
                    )}


                    <div className="space-y-2 text-right pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 transition-all mr-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || (activeTab === 'client' ? !selectedClient : (!internalFile || !internalTitle.trim())) || (activeTab === 'internal' ? !internalFile : !file)}
                            className={`px-8 py-3 rounded-xl text-white font-bold transition-all shadow-lg disabled:opacity-50 disabled:grayscale ${activeTab === 'client'
                                ? 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-600/20'
                                : 'bg-green-600 hover:bg-green-500 shadow-green-600/20'
                                }`}
                        >
                            {submitting ? 'Uploading...' : 'Confirm Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DocumentUploadModal;
