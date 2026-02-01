'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PaymentList, { PaymentTransaction } from '@/components/finance/PaymentList';
import RecordPaymentModal from '@/components/finance/RecordPaymentModal';

const PaymentsPage = () => {
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch('/api/payments/', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            setPayments(data.results || data);
        } catch (err) {
            console.error('Failed to fetch payments', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const filteredPayments = payments.filter(pay =>
        pay.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
        pay.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        pay.client_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-green-900 to-slate-900 rounded-2xl p-8 border border-green-500/20 shadow-xl flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Payments 💳</h1>
                    <p className="text-slate-300">Track incoming and outgoing payments.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-green-500/20"
                    >
                        Record Cash Payment
                    </button>
                </div>
            </div>

            <PaymentList
                payments={filteredPayments}
                loading={loading}
                onSearch={setSearch}
            />

            <RecordPaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchPayments}
            />
        </div>
    );
};

export default PaymentsPage;
