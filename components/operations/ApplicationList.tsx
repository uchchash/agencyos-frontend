'use client';

import React from 'react';
import { ApplicationData } from './ApplicationModal';

export interface Application extends ApplicationData {
    id: string;
    application_number: string;
    client_name: string;
    university_name: string;
    program_name: string;
    intake_name: string;
    status_display: string;
    created_at: string;
}

interface ApplicationListProps {
    applications: Application[];
    loading: boolean;
    onEdit: (app: Application) => void;
    onDelete: (id: string) => void;
    onSearch: (query: string) => void;
}

const ApplicationList: React.FC<ApplicationListProps> = ({ applications, loading, onEdit, onDelete, onSearch }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800">
                <input
                    type="text"
                    placeholder="Search by app number, client, university or program..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto text-left">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-800/50 text-left">
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase">App #</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Client</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase">University & Program</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Intake</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">Loading applications...</td></tr>
                        ) : applications.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">No applications found</td></tr>
                        ) : (
                            applications.map((app) => (
                                <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-pink-400">{app.application_number}</td>
                                    <td className="px-6 py-4 font-medium text-white">{app.client_name}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-white text-sm">{app.university_name}</div>
                                        <div className="text-slate-400 text-xs">{app.program_name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">{app.intake_name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${app.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                                                app.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                                    app.status === 'submitted' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-slate-500/10 text-slate-400'
                                            }`}>
                                            {app.status_display}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => onEdit(app)} className="text-slate-400 hover:text-white transition-colors">Edit</button>
                                        <button onClick={() => onDelete(app.id)} className="text-slate-400 hover:text-red-400 transition-colors">Delete</button>
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

export default ApplicationList;
