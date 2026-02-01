'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Invoice {
    id: string;
    invoice_number: string;
    total_amount: string;
    paid_amount: string;
    status: string;
    due_date: string;
    created_at: string;
    description?: string;
}

const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-500',
    partially_paid: 'bg-blue-100 text-blue-700',
};

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch('/api/invoices/me/', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch invoices');

            const data = await response.json();
            setInvoices(Array.isArray(data) ? data : data.results || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getTotalPending = () => {
        return invoices
            .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
            .reduce((sum, inv) => sum + parseFloat(inv.total_amount) - parseFloat(inv.paid_amount || '0'), 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {error}
                </div>
            )}

            {/* Summary Card */}
            {invoices.length > 0 && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 mb-1">Total Outstanding</p>
                            <p className="text-3xl font-bold">৳{getTotalPending().toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-purple-100 mb-1">Total Invoices</p>
                            <p className="text-2xl font-bold">{invoices.length}</p>
                        </div>
                    </div>
                </div>
            )}

            {invoices.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No invoices yet</h3>
                    <p className="text-slate-500">You don't have any invoices at the moment</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Invoice</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Amount</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Due Date</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">#{invoice.invoice_number}</div>
                                            {invoice.description && (
                                                <div className="text-sm text-slate-500 truncate max-w-xs">{invoice.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">৳{parseFloat(invoice.total_amount).toLocaleString()}</div>
                                            {parseFloat(invoice.paid_amount || '0') > 0 && (
                                                <div className="text-sm text-green-600">Paid: ৳{parseFloat(invoice.paid_amount).toLocaleString()}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[invoice.status] || 'bg-slate-100 text-slate-700'}`}>
                                                {invoice.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(invoice.due_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/client/invoices/${invoice.id}`}
                                                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoicesPage;
