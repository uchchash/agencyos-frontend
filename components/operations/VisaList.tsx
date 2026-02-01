'use client';

import React from 'react';

import { VisaData } from './VisaModal';

export interface Visa extends VisaData {
    id: string;
    visa_reference: string;
    client_name: string;
    visa_type_display: string;
    status_display: string;
    created_at: string;
}

interface VisaListProps {
    visas: Visa[];
    loading: boolean;
    onEdit: (visa: Visa) => void;
    onDelete: (id: string) => void;
    onSearch: (query: string) => void;
}

const VisaList: React.FC<VisaListProps> = ({ visas, loading, onEdit, onDelete, onSearch }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800">
                <input
                    type="text"
                    placeholder="Search by reference, client or country..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto text-left">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-800/50">
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Reference</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Client</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Destination</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Type</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">Loading visa applications...</td></tr>
                        ) : visas.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">No visa applications found</td></tr>
                        ) : (
                            visas.map((visa) => (
                                <tr key={visa.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-red-400">{visa.visa_reference}</td>
                                    <td className="px-6 py-4 font-medium text-white">{visa.client_name}</td>
                                    <td className="px-6 py-4 text-slate-300">{visa.destination_country}</td>
                                    <td className="px-6 py-4 text-slate-300">{visa.visa_type_display}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${visa.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                            visa.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                                'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {visa.status_display}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => onEdit(visa)} className="text-slate-400 hover:text-white transition-colors">Edit</button>
                                        <button onClick={() => onDelete(visa.id)} className="text-slate-400 hover:text-red-400 transition-colors">Delete</button>
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

export default VisaList;
