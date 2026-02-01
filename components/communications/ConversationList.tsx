'use client';

import React, { useState, useEffect } from 'react';

interface Participant {
    id: string | number;
    email: string;
    name: string;
    avatar?: string;
}

interface Conversation {
    id: string;
    name: string;
    conversation_type: 'direct' | 'group';
    participants: (string | number)[];
    participants_details: Participant[];
    last_message?: {
        content: string;
        created_at: string;
    };
    unread_count?: number;
}

interface ConversationListProps {
    onSelect: (id: string) => void;
    selectedId: string | null;
    targetUserId?: string | null;
    refreshTrigger: number;
    onConversationCreated: (id: string) => void;
    onConversationDeleted?: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelect, selectedId, targetUserId, refreshTrigger, onConversationCreated, onConversationDeleted }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchConversations = async () => {
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch('/api/conversations/', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            const list = data.results || data;
            setConversations(list);
            return list;
        } catch (err) {
            console.error('Failed to fetch conversations', err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) return;

        setDeletingId(convId);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch(`/api/conversations/${convId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok || res.status === 204) {
                setConversations(prev => prev.filter(c => c.id !== convId));
                if (selectedId === convId) {
                    onConversationDeleted?.();
                }
            }
        } catch (err) {
            console.error('Failed to delete conversation', err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleTargetUser = async (list: Conversation[]) => {
        if (!targetUserId) return;

        // Check if direct conversation already exists
        const existing = list.find(c =>
            c.conversation_type === 'direct' &&
            c.participants_details.some(p => p.id.toString() === targetUserId.toString())
        );

        if (existing) {
            onSelect(existing.id);
        } else {
            // Create new direct conversation
            try {
                const accessToken = localStorage.getItem('suAccessToken');
                const res = await fetch('/api/conversations/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        conversation_type: 'direct',
                        participant_ids: [targetUserId],
                        initial_message: ''
                    })
                });
                if (res.ok) {
                    const newConv = await res.json();
                    setConversations(prev => [newConv, ...prev]);
                    onConversationCreated(newConv.id);
                }
            } catch (err) {
                console.error('Failed to create conversation', err);
            }
        }
    };

    useEffect(() => {
        const init = async () => {
            const list = await fetchConversations();
            if (targetUserId) {
                handleTargetUser(list);
            }
        };
        init();
    }, [refreshTrigger, targetUserId]);

    return (
        <div className="flex-1 overflow-y-auto">
            {loading ? (
                <div className="p-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500 inline-block"></div></div>
            ) : conversations.length === 0 ? (
                <div className="p-10 text-center text-slate-500">No conversations yet</div>
            ) : (
                <div className="divide-y divide-slate-800">
                    {conversations.map((conv) => {
                        let currentUserEmail = '';
                        try {
                            const suUserStr = localStorage.getItem('suUser');
                            if (suUserStr) {
                                const suUser = JSON.parse(suUserStr);
                                currentUserEmail = suUser.email;
                            }
                        } catch (e) {
                            console.error('Failed to parse suUser', e);
                        }

                        const otherParticipant = conv.participants_details.find(p => p.email !== currentUserEmail);
                        // In a real app we'd compare IDs or use authenticated user info

                        return (
                            <div key={conv.id} className="relative group">
                                <button
                                    onClick={() => onSelect(conv.id)}
                                    className={`w-full p-4 flex items-center gap-3 hover:bg-slate-800/50 transition-colors text-left ${selectedId === conv.id ? 'bg-slate-800' : ''}`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-white overflow-hidden">
                                        {otherParticipant?.avatar ? (
                                            <img src={otherParticipant.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            conv.name?.[0] || otherParticipant?.name?.[0] || '?'
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-semibold text-white truncate">
                                                {conv.conversation_type === 'direct' ? (otherParticipant?.name || 'Unknown') : conv.name}
                                            </h3>
                                            <span className="text-[10px] text-slate-500">
                                                {conv.last_message ? new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 truncate mt-0.5">
                                            {conv.last_message ? conv.last_message.content : 'No messages yet'}
                                        </p>
                                    </div>
                                    {conv.unread_count ? (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    ) : null}
                                </button>
                                {/* Delete button on hover */}
                                <button
                                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                                    disabled={deletingId === conv.id}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-lg"
                                    title="Delete conversation"
                                >
                                    {deletingId === conv.id ? (
                                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ConversationList;
