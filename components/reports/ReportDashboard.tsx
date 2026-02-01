import React, { useState, useEffect } from 'react';
import KPIWidget, { KPI } from './KPIWidget';

const ReportDashboard = () => {
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch KPIs from API
        // For now, using mock data as backend might need seeding
        const mockKpis: KPI[] = [
            {
                id: '1',
                name: 'Total Revenue (Monthly)',
                description: 'Revenue for current month',
                value: 1250000,
                target: 1500000,
                unit: 'currency',
                trend: 12.5,
                status: 'good'
            },
            {
                id: '2',
                name: 'Active Visa Applications',
                description: 'Applications in progress',
                value: 45,
                target: 50,
                unit: 'applications',
                trend: 5,
                status: 'neutral'
            },
            {
                id: '3',
                name: 'Pending Invoices',
                description: 'Unpaid invoices',
                value: 8,
                target: 5,
                unit: 'invoices',
                trend: -2,
                status: 'warning'
            },
            {
                id: '4',
                name: 'Client Satisfaction',
                description: 'Average rating',
                value: 4.8,
                target: 5.0,
                unit: 'stars',
                status: 'good'
            }
        ];

        setTimeout(() => {
            setKpis(mockKpis);
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-40 bg-slate-800/50 rounded-2xl animate-pulse border border-slate-700/50"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-white">Key Performance Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map(kpi => (
                    <KPIWidget key={kpi.id} kpi={kpi} />
                ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 h-80 flex items-center justify-center">
                    <p className="text-slate-500">Revenue Trend Chart (Coming Soon)</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 h-80 flex items-center justify-center">
                    <p className="text-slate-500">Application Status Distribution (Coming Soon)</p>
                </div>
            </div>
        </div>
    );
};

export default ReportDashboard;
