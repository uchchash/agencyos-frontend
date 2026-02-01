'use client';

import React, { useState, useEffect } from 'react';
import VisaList, { Visa } from '@/components/operations/VisaList';
import VisaModal, { VisaData } from '@/components/operations/VisaModal';

type VisaApplication = Visa;

export default function VisaPage() {
    const [visas, setVisas] = useState<VisaApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVisa, setSelectedVisa] = useState<VisaApplication | null>(null);
    const [search, setSearch] = useState('');

    const fetchVisas = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            let url = '/api/visa-applications-all/?';
            if (search) url += `search=${search}&`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            setVisas(data.results || data);
        } catch (err) {
            console.error('Failed to fetch visas', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisas();
    }, [search]);

    const handleEdit = (visa: VisaApplication) => {
        setSelectedVisa(visa);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedVisa(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this visa application?')) return;
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            await fetch(`/api/visa-applications-all/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            fetchVisas();
        } catch (err) {
            console.error('Failed to delete visa', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Visa Management</h1>
                    <p className="text-slate-400">Track and manage client visa applications</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Application
                </button>
            </div>

            <VisaList
                visas={visas}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSearch={setSearch}
            />

            <VisaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={fetchVisas}
                visaData={selectedVisa}
            />
        </div>
    );
}
