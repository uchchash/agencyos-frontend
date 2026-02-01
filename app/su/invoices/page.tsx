'use client';

import React, { useState, useEffect, useCallback } from 'react';
import InvoiceList, { Invoice } from '@/components/finance/InvoiceList';
import InvoiceModal from '@/components/finance/InvoiceModal';

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch('/api/invoices/', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            // Data might be paginated
            setInvoices(data.results || data);
        } catch (err) {
            console.error('Failed to fetch invoices', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleView = (inv: Invoice) => {
        // Future: Open detail modal or navigate to detail page
        alert(`Viewing invoice: ${inv.invoice_number}`);
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        inv.client_name.toLowerCase().includes(search.toLowerCase()) ||
        inv.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-violet-900 to-slate-900 rounded-2xl p-8 border border-violet-500/20 shadow-xl flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Invoices 🧾</h1>
                    <p className="text-slate-300">Manage billing and invoices.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-violet-500/20"
                >
                    Create Invoice +
                </button>
            </div>

            <InvoiceList
                invoices={filteredInvoices}
                loading={loading}
                onView={handleView}
                onSearch={setSearch}
            />

            <InvoiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchInvoices}
            />
        </div>
    );
};

export default InvoicesPage;
