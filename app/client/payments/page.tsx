'use client';

import React, { useEffect, useState } from 'react';

interface Payment {
    id: string;
    amount: string;
    currency: string;
    status: string;
    payment_method: string;
    transaction_id?: string;
    created_at: string;
    invoice?: {
        invoice_number: string;
    };
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    success: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-500',
    refunded: 'bg-blue-100 text-blue-700',
};

const PaymentsPage = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch('/api/payments/me/', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch payments');

            const data = await response.json();
            setPayments(Array.isArray(data) ? data : data.results || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
            <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {error}
                </div>
            )}

            {payments.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No payments yet</h3>
                    <p className="text-slate-500">Your payment history will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {payments.map((payment) => (
                        <div key={payment.id} className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${payment.status === 'completed' || payment.status === 'success'
                                            ? 'bg-green-100'
                                            : payment.status === 'failed'
                                                ? 'bg-red-100'
                                                : 'bg-amber-100'
                                        }`}>
                                        {payment.status === 'completed' || payment.status === 'success' ? (
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : payment.status === 'failed' ? (
                                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        ) : (
                                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">
                                            ৳{parseFloat(payment.amount).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            {payment.invoice?.invoice_number && `Invoice #${payment.invoice.invoice_number} • `}
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[payment.status] || 'bg-slate-100 text-slate-700'}`}>
                                        {payment.status}
                                    </span>
                                    {payment.transaction_id && (
                                        <div className="text-xs text-slate-400 mt-1">TXN: {payment.transaction_id.slice(0, 12)}...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaymentsPage;
