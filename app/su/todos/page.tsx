'use client';

import React, { useEffect, useState } from 'react';
import { useSuperUser } from '../layout';

interface Todo {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string;
    is_completed: boolean;
    is_overdue: boolean;
    assigned_to?: {
        email: string;
        first_name: string;
        last_name: string;
    };
    client?: {
        first_name: string;
        last_name: string;
    };
}

const priorityColors: Record<string, string> = {
    low: 'bg-slate-700 text-slate-300',
    medium: 'bg-blue-900 text-blue-300',
    high: 'bg-orange-900 text-orange-300',
    urgent: 'bg-red-900 text-red-300',
};

const SuperUserTodosPage = () => {
    const { user } = useSuperUser();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('pending');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTodo, setNewTodo] = useState({ title: '', description: '', priority: 'medium', due_date: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const response = await fetch('/api/todos/', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTodos(Array.isArray(data) ? data : data.results || []);
            }
        } catch (err) {
            console.error('Failed to fetch todos:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleComplete = async (todoId: string, isCompleted: boolean) => {
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const response = await fetch(`/api/todos/${todoId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ is_completed: !isCompleted }),
            });

            if (response.ok) {
                setTodos(prev => prev.map(t =>
                    t.id === todoId ? { ...t, is_completed: !isCompleted } : t
                ));
            }
        } catch (err) {
            console.error('Failed to update todo:', err);
        }
    };

    const filteredTodos = todos.filter(todo => {
        switch (filter) {
            case 'pending':
                return !todo.is_completed;
            case 'completed':
                return todo.is_completed;
            case 'overdue':
                return !todo.is_completed && todo.is_overdue;
            default:
                return true;
        }
    });

    const stats = {
        total: todos.length,
        pending: todos.filter(t => !t.is_completed).length,
        overdue: todos.filter(t => !t.is_completed && t.is_overdue).length,
        completed: todos.filter(t => t.is_completed).length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-900 to-slate-900 rounded-2xl p-8 border border-amber-500/20 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Todos ✅</h1>
                        <p className="text-slate-300 text-lg">Manage and track all tasks</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-medium rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all shadow-lg shadow-yellow-500/25"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Todo
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`p-4 rounded-xl border transition-all ${filter === 'all' ? 'bg-yellow-900/30 border-yellow-500/50' : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                        }`}
                >
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-sm text-slate-400">Total</p>
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`p-4 rounded-xl border transition-all ${filter === 'pending' ? 'bg-amber-900/30 border-amber-500/50' : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                        }`}
                >
                    <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                    <p className="text-sm text-slate-400">Pending</p>
                </button>
                <button
                    onClick={() => setFilter('overdue')}
                    className={`p-4 rounded-xl border transition-all ${filter === 'overdue' ? 'bg-red-900/30 border-red-500/50' : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                        }`}
                >
                    <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
                    <p className="text-sm text-slate-400">Overdue</p>
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`p-4 rounded-xl border transition-all ${filter === 'completed' ? 'bg-green-900/30 border-green-500/50' : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                        }`}
                >
                    <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                    <p className="text-sm text-slate-400">Completed</p>
                </button>
            </div>

            {/* Todos List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="bg-slate-900/50 rounded-2xl p-12 border border-slate-700">
                        <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </div>
                ) : filteredTodos.length === 0 ? (
                    <div className="bg-slate-900/50 rounded-2xl p-12 border border-slate-700 text-center">
                        <p className="text-slate-500">No todos found in this category.</p>
                    </div>
                ) : (
                    filteredTodos.map((todo) => (
                        <div
                            key={todo.id}
                            className={`bg-slate-900/50 rounded-xl p-4 border transition-all ${todo.is_overdue && !todo.is_completed
                                ? 'border-red-500/50 bg-red-900/20'
                                : todo.is_completed
                                    ? 'border-green-500/30 bg-green-900/10'
                                    : 'border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <button
                                    onClick={() => handleToggleComplete(todo.id, todo.is_completed)}
                                    className={`mt-1 w-5 h-5 rounded border-2 flex-shrink-0 transition-all ${todo.is_completed
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-slate-500 hover:border-yellow-500'
                                        }`}
                                >
                                    {todo.is_completed && (
                                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className={`font-medium ${todo.is_completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                                                {todo.title}
                                            </h3>
                                            {todo.description && (
                                                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{todo.description}</p>
                                            )}
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${priorityColors[todo.priority] || 'bg-slate-700 text-slate-300'}`}>
                                            {todo.priority?.charAt(0).toUpperCase() + todo.priority?.slice(1)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                        {todo.due_date && (
                                            <span className={`flex items-center gap-1 ${todo.is_overdue && !todo.is_completed ? 'text-red-400 font-medium' : ''}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Due: {new Date(todo.due_date).toLocaleDateString()}
                                            </span>
                                        )}
                                        {todo.assigned_to && (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                {todo.assigned_to.first_name} {todo.assigned_to.last_name}
                                            </span>
                                        )}
                                        {todo.client && (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Client: {todo.client.first_name} {todo.client.last_name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Todo Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-700">
                        <div className="p-6 border-b border-slate-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">Add New Todo</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setSubmitting(true);
                            try {
                                const accessToken = localStorage.getItem('suAccessToken');
                                const response = await fetch('/api/todos/', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${accessToken}`,
                                    },
                                    body: JSON.stringify(newTodo),
                                });
                                if (response.ok) {
                                    setShowAddModal(false);
                                    setNewTodo({ title: '', description: '', priority: 'medium', due_date: '' });
                                    fetchTodos();
                                }
                            } catch (err) {
                                console.error('Failed to create todo:', err);
                            } finally {
                                setSubmitting(false);
                            }
                        }} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newTodo.title}
                                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                                <textarea
                                    value={newTodo.description}
                                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                                    <select
                                        value={newTodo.priority}
                                        onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={newTodo.due_date}
                                        onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-600 text-slate-300 font-medium rounded-xl hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 bg-yellow-600 text-white font-medium rounded-xl hover:bg-yellow-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Adding...' : 'Add Todo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperUserTodosPage;
