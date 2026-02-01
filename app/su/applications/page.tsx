'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ApplicationList, { Application } from '@/components/operations/ApplicationList';
import ApplicationModal from '@/components/operations/ApplicationModal';

const ApplicationsPage = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [search, setSearch] = useState('');

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch('/api/applications-all/', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            setApplications(data.results || data);
        } catch (err) {
            console.error('Failed to fetch applications', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleEdit = (app: Application) => {
        setSelectedApp(app);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this application?')) return;

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch(`/api/applications-all/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) fetchApplications();
        } catch (err) {
            console.error('Failed to delete application', err);
        }
    };

    const handleAddNew = () => {
        setSelectedApp(null);
        setIsModalOpen(true);
    };

    const filteredApps = applications.filter(app =>
        app.application_number.toLowerCase().includes(search.toLowerCase()) ||
        app.client_name.toLowerCase().includes(search.toLowerCase()) ||
        app.university_name.toLowerCase().includes(search.toLowerCase()) ||
        app.program_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-pink-900 to-slate-900 rounded-2xl p-8 border border-pink-500/20 shadow-xl flex justify-between items-center">
                <div className="text-left">
                    <h1 className="text-3xl font-bold text-white mb-2">Applications 📄</h1>
                    <p className="text-slate-300">Track and manage student applications.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-pink-500/20 active:scale-95 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Application
                </button>
            </div>

            <ApplicationList
                applications={filteredApps}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSearch={setSearch}
            />

            <ApplicationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={fetchApplications}
                applicationData={selectedApp}
            />
        </div>
    );
};

export default ApplicationsPage;
