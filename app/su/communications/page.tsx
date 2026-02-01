'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Participant {
    id: number;
    email: string;
    name: string;
    avatar?: string;
}

interface Message {
    id: number;
    sender: number;
    sender_name: string;
    sender_email: string;
    content: string;
    created_at: string;
    is_read: boolean;
    read_at?: string;
}

interface Conversation {
    id: string;
    conversation_type: string;
    name?: string;
    participants: number[];
    participants_details: Participant[];
    last_message?: Message;
    last_message_at: string;
    unread_count: number;
    display_name: string;
}

const CommunicationsPage = () => {
    const [user, setUser] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [showNewConversation, setShowNewConversation] = useState(false);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
    const [deletingConversation, setDeletingConversation] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const initialConversationId = searchParams.get('conversation_id');

    useEffect(() => {
        // Load user from localStorage
        try {
            const suUserStr = localStorage.getItem('suUser');
            if (suUserStr) {
                setUser(JSON.parse(suUserStr));
            }
        } catch (e) {
            console.error('Failed to parse suUser', e);
        }
        fetchConversations();
        fetchStaffList();
    }, []);

    // Effect to select conversation from URL once conversations are loaded
    useEffect(() => {
        if (initialConversationId && conversations.length > 0 && !selectedConversation) {
            const convo = conversations.find(c => String(c.id) === String(initialConversationId));
            if (convo) {
                handleSelectConversation(convo);
            }
        }
    }, [conversations, initialConversationId]);

    const fetchConversations = async () => {
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const response = await fetch('/api/conversations/', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setConversations(Array.isArray(data) ? data : data.results || []);
            }
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaffList = async () => {
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const response = await fetch('/api/staff/', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStaffList(Array.isArray(data) ? data : data.results || []);
            }
        } catch (err) {
            console.error('Failed to fetch staff:', err);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        setMessagesLoading(true);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const response = await fetch(`/api/conversations/${conversationId}/messages/`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const msgList = Array.isArray(data) ? data : data.results || [];
                setMessages(msgList);

                // Mark as read if there are unread messages
                const hasUnread = msgList.some((m: Message) => !m.is_read && m.sender_email !== user?.email);
                if (hasUnread) {
                    markAsRead(conversationId);
                }
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setMessagesLoading(false);
        }
    };

    const markAsRead = async (conversationId: string) => {
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            await fetch(`/api/conversations/${conversationId}/mark-read/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        fetchMessages(conversation.id);
    };

    // Polling for messages to refresh read status
    useEffect(() => {
        if (!selectedConversation) return;

        const interval = setInterval(() => {
            fetchMessagesQuietly(selectedConversation.id);
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedConversation?.id]);

    const fetchMessagesQuietly = async (conversationId: string) => {
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const response = await fetch(`/api/conversations/${conversationId}/messages/`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const msgList = Array.isArray(data) ? data : data.results || [];
                setMessages(msgList);
            }
        } catch (err) {
            // Silent fail for polling
        }
    };

    const handleSendMessage = async () => {
        if (!selectedConversation || !newMessage.trim()) return;

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const response = await fetch(`/api/conversations/${selectedConversation.id}/messages/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ content: newMessage }),
            });

            if (response.ok) {
                setNewMessage('');
                fetchMessages(selectedConversation.id);
                fetchConversations(); // Refresh to update last message
            }
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleCreateConversation = async () => {
        if (!selectedStaff) return;

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const response = await fetch('/api/conversations/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    conversation_type: 'direct',
                    participant_ids: [selectedStaff],
                }),
            });

            if (response.ok) {
                const newConvo = await response.json();
                fetchConversations();
                setSelectedConversation(newConvo);
                fetchMessages(newConvo.id);
                setShowNewConversation(false);
                setSelectedStaff(null);
            }
        } catch (err) {
            console.error('Failed to create conversation:', err);
        }
    };

    const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this conversation?')) return;

        setDeletingConversation(convId);
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch(`/api/conversations/${convId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok || res.status === 204) {
                setConversations(prev => prev.filter(c => c.id !== convId));
                if (selectedConversation?.id === convId) {
                    setSelectedConversation(null);
                    setMessages([]);
                }
            }
        } catch (err) {
            console.error('Failed to delete conversation', err);
        } finally {
            setDeletingConversation(null);
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatReadTime = (dateStr?: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return `Read at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Communications</h1>
                    <p className="text-slate-400">Chat with team members</p>
                </div>
                <button
                    onClick={() => setShowNewConversation(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-medium rounded-xl hover:from-yellow-500 hover:to-orange-500 transition-all shadow-lg shadow-yellow-500/25"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Conversation
                </button>
            </div>

            {/* Chat Container */}
            <div className="flex-1 flex rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
                {/* Conversations List */}
                <div className="w-80 border-r border-slate-800 flex flex-col">
                    <div className="p-4 border-b border-slate-800">
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                No conversations yet
                            </div>
                        ) : (
                            conversations.map((convo) => {
                                // Find the other participant (not the current user) for direct conversations
                                const otherParticipant = convo.participants_details?.find(
                                    p => p.email !== user?.email && p.id !== user?.id
                                );
                                const displayName = convo.conversation_type === 'direct'
                                    ? (otherParticipant?.name || 'Unknown')
                                    : convo.display_name;
                                const initial = displayName?.[0]?.toUpperCase() || 'C';

                                return (
                                    <div key={convo.id} className="relative group">
                                        <button
                                            onClick={() => handleSelectConversation(convo)}
                                            className={`w-full p-4 flex items-start gap-3 hover:bg-slate-800/50 transition-colors text-left ${selectedConversation?.id === convo.id ? 'bg-slate-800' : ''
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-medium shrink-0">
                                                {initial}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-white truncate">{displayName}</p>
                                                    {convo.last_message_at && (
                                                        <span className="text-xs text-slate-500">{formatTime(convo.last_message_at)}</span>
                                                    )}
                                                </div>
                                                {convo.last_message && (
                                                    <p className="text-sm text-slate-400 truncate mt-0.5">{convo.last_message.content}</p>
                                                )}
                                            </div>
                                            {convo.unread_count > 0 && (
                                                <span className="w-5 h-5 bg-yellow-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                                                    {convo.unread_count}
                                                </span>
                                            )}
                                        </button>
                                        {/* Delete button on hover */}
                                        <button
                                            onClick={(e) => handleDeleteConversation(convo.id, e)}
                                            disabled={deletingConversation === convo.id}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-lg"
                                            title="Delete conversation"
                                        >
                                            {deletingConversation === convo.id ? (
                                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-slate-800 bg-slate-800/30">
                                {(() => {
                                    // Find the other participant (not the current user)
                                    const otherParticipant = selectedConversation.participants_details?.find(
                                        p => p.email !== user?.email && p.id !== user?.id
                                    );
                                    const headerName = selectedConversation.conversation_type === 'direct'
                                        ? (otherParticipant?.name || 'Unknown')
                                        : selectedConversation.display_name;
                                    return (
                                        <>
                                            <h2 className="font-semibold text-white">{headerName}</h2>
                                            <p className="text-sm text-slate-400">
                                                {selectedConversation.conversation_type === 'direct' ? 'Direct message' : `${selectedConversation.participants_details?.length || 0} participants`}
                                            </p>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messagesLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        No messages yet. Start the conversation!
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isOwn = msg.sender_email === user?.email || msg.sender === user?.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                                                    {!isOwn && (
                                                        <p className="text-xs text-slate-500 mb-1">{msg.sender_name}</p>
                                                    )}
                                                    <div className={`px-4 py-2 rounded-2xl ${isOwn
                                                        ? 'bg-yellow-600 text-white'
                                                        : 'bg-slate-800 text-slate-100 border border-slate-700'
                                                        }`}>
                                                        <p className="text-sm">{msg.content}</p>
                                                    </div>
                                                    <div className={`text-xs mt-1 flex items-center gap-1 ${isOwn ? 'text-right justify-end' : ''} text-slate-500`}>
                                                        {formatTime(msg.created_at)}
                                                        {isOwn && (
                                                            <span className="flex items-center ml-1">
                                                                {msg.is_read ? (
                                                                    // Double checkmark for read
                                                                    <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12l5 5L17 7" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l5 5L22 7" />
                                                                    </svg>
                                                                ) : (
                                                                    // Single checkmark for sent
                                                                    <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
                                                                    </svg>
                                                                )}
                                                            </span>
                                                        )}
                                                        {isOwn && msg.is_read && msg.read_at && (
                                                            <span className="text-[10px] text-slate-600 ml-1">
                                                                • {formatReadTime(msg.read_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-slate-800">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <div className="text-xl font-medium text-slate-300">Select a conversation</div>
                                <p className="max-w-xs">Pick someone to chat with from the list or start a new conversation.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Conversation Modal */}
            {showNewConversation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-800">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">New Conversation</h2>
                                <button
                                    onClick={() => setShowNewConversation(false)}
                                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Select team member</label>
                            <select
                                value={selectedStaff || ''}
                                onChange={(e) => setSelectedStaff(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            >
                                <option value="">Choose a team member...</option>
                                {staffList.map((staff) => (
                                    <option key={staff.id} value={staff.user_id}>
                                        {staff.full_name || staff.email}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowNewConversation(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-400 font-medium rounded-xl hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateConversation}
                                    disabled={!selectedStaff}
                                    className="flex-1 px-4 py-2.5 bg-yellow-600 text-white font-medium rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50"
                                >
                                    Start Chat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunicationsPage;
