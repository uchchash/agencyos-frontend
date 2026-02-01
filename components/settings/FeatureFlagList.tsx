import React, { useState, useEffect } from 'react';

interface FeatureFlag {
    key: string;
    name: string;
    description: string;
    is_enabled: boolean;
    rollout_percentage: number;
    enabled_for_roles: string[];
}

const FeatureFlagList = () => {
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFlags();
    }, []);

    const fetchFlags = async () => {
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch('/api/feature-flags/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!res.ok) throw new Error('Failed to fetch feature flags');

            const data = await res.json();
            setFlags(data.results || data);
        } catch (err) {
            console.error(err);
            setError('Failed to load feature flags');
        } finally {
            setLoading(false);
        }
    };

    const toggleFlag = async (key: string, currentStatus: boolean, index: number) => {
        // Optimistic update
        const updatedFlags = [...flags];
        updatedFlags[index].is_enabled = !currentStatus;
        setFlags(updatedFlags);

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            // Assuming the API supports partial updates on the list or individual endpoints
            // But usually FeatureFlag is a model, might need detail view.
            // Check api/urls.py... path('feature-flags/', FeatureFlagListView.as_view())
            // Wait, Standard ListAPIView often doesn't support bulk update, and there's no detail view in the URL list I saw earlier (lines 330-331).
            // Line 331 is `feature-flags/<str:key>/check/`.
            // I might need to double check if there's a manage/update endpoint.
            // Looking at `api/urls.py` in Step 23:
            // 330: path('feature-flags/', FeatureFlagListView.as_view(), name='feature-flag-list'),
            // 331: path('feature-flags/<str:key>/check/', FeatureFlagCheckView.as_view(), name='feature-flag-check'),
            // There is NO detail view or update view for feature flags exposed in URLs yet! 
            // I probably need to Add one or checks `settings_config/views.py` again?
            // Actually, I should probably implement the backend view for updating it if it's missing.
            // But the plan says "Implement Feature Flags management".
            // Let's assume for now I will need to ADD the endpoint.
            // But wait, step 7 says "Implement backend API for settings if needed".
            // I see `SystemSettingDetailView` but no `FeatureFlagDetailView` in `api/urls.py`.

            // I'll write the component assuming the backend exists, but I'll likely need to add the backend view in the next step.
            // I'll use `/api/feature-flags/<key>/` as the target endpoint.

            const res = await fetch(`/api/feature-flags/${key}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ is_enabled: !currentStatus }),
            });

            if (!res.ok) throw new Error('Failed to update flag');

        } catch (err) {
            console.error(err);
            // Revert on error
            updatedFlags[index].is_enabled = currentStatus;
            setFlags([...updatedFlags]);
            alert('Failed to update feature flag');
        }
    };

    if (loading) return <div className="text-center py-8 text-slate-400">Loading feature flags...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

    if (flags.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700">
                <p className="text-slate-400">No feature flags defined.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {flags.map((flag, index) => (
                <div key={flag.key} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center justify-between hover:border-slate-600 transition-colors">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-white">{flag.name}</h3>
                            <span className="px-2 py-0.5 bg-slate-900 rounded text-xs text-slate-500 font-mono">
                                {flag.key}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{flag.description}</p>

                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                                <span className={flag.rollout_percentage === 100 ? 'text-green-500' : 'text-amber-500'}>
                                    ●
                                </span>
                                Rollout: {flag.rollout_percentage}%
                            </div>
                            {flag.enabled_for_roles.length > 0 && (
                                <div>
                                    Roles: {flag.enabled_for_roles.join(', ')}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={flag.is_enabled}
                                onChange={() => toggleFlag(flag.key, flag.is_enabled, index)}
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FeatureFlagList;
