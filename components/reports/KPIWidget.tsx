import React from 'react';

export interface KPI {
    id: string;
    name: string;
    description: string;
    value: number;
    target: number;
    unit: string;
    trend?: number; // Percentage change
    status: 'good' | 'warning' | 'bad' | 'neutral';
}

interface KPIWidgetProps {
    kpi: KPI;
}

const KPIWidget: React.FC<KPIWidgetProps> = ({ kpi }) => {
    const formattedValue = kpi.unit === 'currency'
        ? new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(kpi.value)
        : kpi.value.toLocaleString();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good': return 'text-green-500';
            case 'warning': return 'text-amber-500';
            case 'bad': return 'text-red-500';
            default: return 'text-blue-500';
        }
    };

    const getBgColor = (status: string) => {
        switch (status) {
            case 'good': return 'bg-green-500/10 border-green-500/20';
            case 'warning': return 'bg-amber-500/10 border-amber-500/20';
            case 'bad': return 'bg-red-500/10 border-red-500/20';
            default: return 'bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <div className={`rounded-2xl border p-5 transition-all hover:shadow-lg ${getBgColor(kpi.status)}`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{kpi.name}</h3>
                {kpi.trend !== undefined && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.trend >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
                    </span>
                )}
            </div>

            <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-bold ${getStatusColor(kpi.status)}`}>
                    {formattedValue}
                </span>
                {kpi.unit !== 'currency' && kpi.unit !== 'number' && (
                    <span className="text-slate-500 text-sm">{kpi.unit}</span>
                )}
            </div>

            {kpi.target > 0 && (
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>{Math.round((kpi.value / kpi.target) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                        <div
                            className={`h-full rounded-full ${getStatusColor(kpi.status).replace('text-', 'bg-')}`}
                            style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default KPIWidget;
