'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStaff } from '../layout';

interface StaffMember {
    id: number;
    email: string;
    staff_id: string;
    staff_role: string;
    staff_role_display?: string;
    department: string;
    full_name: string;
    is_active: boolean;
}

const StaffTeamPage = () => {
    const { user, isAdmin } = useStaff();
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const accessToken = localStorage.getItem('staffAccessToken');
                const response = await fetch('/api/staff/', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setStaffMembers(Array.isArray(data) ? data : data.results || []);
                }
            } catch (err) {
                console.error('Failed to fetch staff:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, []);

    const filteredMembers = staffMembers.filter(member => {
        const searchLower = searchTerm.toLowerCase();
        return (
            member.full_name?.toLowerCase().includes(searchLower) ||
            member.email?.toLowerCase().includes(searchLower) ||
            member.department?.toLowerCase().includes(searchLower) ||
            member.staff_role?.toLowerCase().includes(searchLower)
        );
    });

    const handleStartConversation = (member: StaffMember) => {
        setSelectedMember(member);
        setShowMessageModal(true);
    };

    const handleSendMessage = async () => {
        if (!selectedMember || !message.trim()) return;

        try {
            const accessToken = localStorage.getItem('staffAccessToken');
            // Create a new conversation with the selected member
            const response = await fetch('/api/conversations/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    conversation_type: 'direct',
                    participant_ids: [selectedMember.id],
                    initial_message: message,
                }),
            });

            if (response.ok) {
                const newConversation = await response.json();

                setShowMessageModal(false);
                setMessage('');
                setSelectedMember(null);
                // Redirect to communications page with conversation ID
                window.location.href = `/staff/communications?conversation_id=${newConversation.id}`;
            }
        } catch (err) {
            console.error('Failed to start conversation:', err);
        }
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-purple-100 text-purple-700',
            manager: 'bg-blue-100 text-blue-700',
            senior_consultant: 'bg-cyan-100 text-cyan-700',
            consultant: 'bg-green-100 text-green-700',
            application_manager: 'bg-amber-100 text-amber-700',
            document_specialist: 'bg-rose-100 text-rose-700',
            visa_officer: 'bg-indigo-100 text-indigo-700',
        };
        return colors[role] || 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Team</h1>
                    <p className="text-slate-600 mt-1">View all staff and admin members</p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search team members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Link
                        href="/staff/communications"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        View Conversations
                    </Link>
                </div>
            </div>

            {/* Team Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <p className="text-slate-500">No team members found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMembers.map((member) => (
                        <div
                            key={member.id}
                            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                    {member.full_name?.[0]?.toUpperCase() || 'S'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 truncate">{member.full_name || 'Staff Member'}</h3>
                                    <p className="text-sm text-slate-500 truncate">{member.email}</p>
                                    <p className="text-xs text-blue-600 font-mono mt-1">{member.staff_id}</p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Role</span>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleColor(member.staff_role)}`}>
                                        {member.staff_role_display || member.staff_role?.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Department</span>
                                    <span className="text-sm text-slate-700">{member.department || '-'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Status</span>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${member.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {member.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleStartConversation(member)}
                                className="w-full mt-4 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Message
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Message Modal */}
            {showMessageModal && selectedMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">
                                    Message {selectedMember.full_name}
                                </h2>
                                <button
                                    onClick={() => setShowMessageModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message..."
                                rows={4}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setShowMessageModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim()}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffTeamPage;
