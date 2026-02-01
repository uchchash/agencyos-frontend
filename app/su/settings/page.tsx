'use client';

import React, { useEffect, useState } from 'react';
import { useSuperUser } from '../layout';
import SettingsList from '@/components/settings/SettingsList';
import OrganizationProfile from '@/components/settings/OrganizationProfile';
import FeatureFlagList from '@/components/settings/FeatureFlagList';
import { SystemSetting } from '@/components/settings/SettingItem';

const SettingsPage = () => {
    const { user } = useSuperUser();
    const [activeTab, setActiveTab] = useState<'settings' | 'organization' | 'features'>('settings');

    // Settings State
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSettings = async () => {
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch('/api/settings/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch settings');
            }

            const data = await res.json();
            setSettings(data.results || data);
        } catch (err) {
            console.error(err);
            setError('Failed to load settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleUpdateSetting = async (key: string, value: string) => {
        const accessToken = localStorage.getItem('suAccessToken');
        const res = await fetch(`/api/settings/${key}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ value }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || 'Failed to update setting');
        }

        // Update local state
        setSettings(prev => prev.map(s =>
            s.key === key ? { ...s, value } : s
        ));
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 via-blue-900/50 to-slate-800 rounded-2xl p-8 border border-blue-500/20 shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            System Settings ⚙️
                        </h1>
                        <p className="text-slate-300 text-lg">
                            Configure global system behavior and options.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Message for Settings Tab */}
            {activeTab === 'settings' && error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl">
                    {error}
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-700 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'settings'
                            ? 'border-blue-500 text-blue-500'
                            : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                >
                    General Configuration
                </button>
                <button
                    onClick={() => setActiveTab('organization')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'organization'
                            ? 'border-blue-500 text-blue-500'
                            : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                >
                    Organization Profile
                </button>
                <button
                    onClick={() => setActiveTab('features')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'features'
                            ? 'border-blue-500 text-blue-500'
                            : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                >
                    Feature Flags
                </button>
            </div>

            {/* Main Content */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-700 p-6 min-h-[400px]">
                {activeTab === 'settings' && (
                    loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <SettingsList
                            settings={settings}
                            onUpdateSetting={handleUpdateSetting}
                        />
                    )
                )}

                {activeTab === 'organization' && (
                    <OrganizationProfile />
                )}

                {activeTab === 'features' && (
                    <FeatureFlagList />
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
