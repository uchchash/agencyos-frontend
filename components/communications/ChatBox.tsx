'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Message {
    id: string;
    sender_name: string;
    sender_email: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

interface ChatBoxProps {
    conversationId: string;
    onNewMessage: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ conversationId, onNewMessage }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const markAsRead = async () => {
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

    const fetchMessages = async () => {
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch(`/api/conversations/${conversationId}/messages/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            const list = data.results || data;
            setMessages(list);
            scrollToBottom();

            // If there are unread messages from others, mark them as read
            const hasUnread = list.some((m: Message) => !m.is_read && m.sender_email !== localStorage.getItem('suEmail'));
            if (hasUnread) {
                markAsRead();
            }
        } catch (err) {
            console.error('Failed to fetch messages', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // Setup polling if needed, but for now simple refresh on select
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [conversationId]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch(`/api/conversations/${conversationId}/messages/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ content: newMessage }),
            });

            if (res.ok) {
                const sentMsg = await res.json();
                setMessages(prev => [...prev, sentMsg]);
                setNewMessage('');
                onNewMessage();
            }
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-900">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500"></div></div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender_email === localStorage.getItem('suEmail');
                        return (
                            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 rounded-2xl ${isMe
                                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10'
                                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                    }`}>
                                    {!isMe && <div className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tight">{msg.sender_name}</div>}
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    <div className={`text-[9px] mt-1 flex items-center gap-1 ${isMe ? 'text-blue-200 justify-end' : 'text-slate-500'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && (
                                            <span className="flex items-center">
                                                {msg.is_read ? (
                                                    <svg className="w-3 h-3 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3 h-3 text-blue-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-800/20">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl flex items-end gap-2 p-2">
                    <textarea
                        rows={1}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none text-white focus:ring-0 resize-none py-2 px-3 text-sm placeholder:text-slate-500"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:grayscale"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatBox;
