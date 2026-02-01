'use client';

import React from 'react';

export interface PaymentTransaction {
    id: string;
    transaction_id: string;
    invoice_number: string;
    client_name: string;
    amount: number;
    currency: string;
    payment_method_display: string;
    status: string;
    status_display: string;
    completed_at: string;
    created_at: string;
}

interface PaymentListProps {
    payments: PaymentTransaction[];
    loading: boolean;
    onSearch: (query: string) => void;
}

const PaymentList: React.FC<PaymentListProps> = ({ payments, loading, onSearch }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800">
                <input
                    type="text"
                    placeholder="Search by txn ID, invoice # or client..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto text-left">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-800/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Transaction ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Invoice & Client</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Amount</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Method</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={6} className="py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 inline-block"></div></td></tr>
                        ) : payments.length === 0 ? (
                            <tr><td colSpan={6} className="py-20 text-center text-slate-500">No payments found</td></tr>
                        ) : (
                            payments.map((pay) => (
                                <tr key={pay.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-green-400">{pay.transaction_id}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium">{pay.invoice_number}</div>
                                        <div className="text-slate-400 text-xs">{pay.client_name}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white">৳{Number(pay.amount).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-slate-300 text-sm">{pay.payment_method_display}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${pay.status === 'completed' || pay.status === 'success' ? 'bg-green-500/10 text-green-500' :
                                                pay.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {pay.status_display}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {new Date(pay.created_at).toLocaleDateString()}
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

export default PaymentList;
