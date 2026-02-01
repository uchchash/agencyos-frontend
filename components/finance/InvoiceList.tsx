'use client';

import React from 'react';

export interface Invoice {
    id: string;
    invoice_number: string;
    title: string;
    client_name: string;
    total_amount: number;
    amount_paid: number;
    balance_due: number;
    status: string;
    status_display: string;
    due_date: string;
    currency: string;
}

interface InvoiceListProps {
    invoices: Invoice[];
    loading: boolean;
    onView: (invoice: Invoice) => void;
    onSearch: (query: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, loading, onView, onSearch }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800">
                <input
                    type="text"
                    placeholder="Search by invoice #, client or title..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto text-left">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-800/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Invoice #</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Client</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Total</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Balance</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={6} className="py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 inline-block"></div></td></tr>
                        ) : invoices.length === 0 ? (
                            <tr><td colSpan={6} className="py-20 text-center text-slate-500">No invoices found</td></tr>
                        ) : (
                            invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-violet-400">{inv.invoice_number}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-white">{inv.client_name}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{inv.title}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">৳{Number(inv.total_amount).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-red-400 font-medium">৳{Number(inv.balance_due).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${inv.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                                                inv.status === 'partially_paid' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    inv.status === 'overdue' ? 'bg-red-500/10 text-red-500' :
                                                        'bg-slate-500/10 text-slate-400'
                                            }`}>
                                            {inv.status_display}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onView(inv)}
                                            className="text-violet-400 hover:text-white transition-colors text-sm font-medium"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoiceList;
