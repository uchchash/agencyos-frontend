'use client';

import React, { useEffect, useState } from 'react';

interface BookingSlot {
    date: string;
    time: string;
    staff_id: string;
    staff_name: string;
    duration: number;
}

interface Booking {
    id: string;
    purpose: string;
    requested_date: string;
    requested_time: string;
    status: string;
    notes?: string;
    created_at: string;
    staff?: {
        name: string;
    };
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
};

const BookingsPage = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [slots, setSlots] = useState<BookingSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [formData, setFormData] = useState({
        purpose: '',
        requested_date: '',
        requested_time: '',
        notes: '',
    });

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchSlots(selectedDate);
        }
    }, [selectedDate]);

    const fetchBookings = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch('/api/bookings/', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch bookings');

            const data = await response.json();
            setBookings(Array.isArray(data) ? data : data.results || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSlots = async (date: string) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(`/api/scheduling/slots/available/?date=${date}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSlots(data);
            }
        } catch (err) {
            console.error('Failed to fetch slots:', err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError(null);

        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch('/api/bookings/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to create booking');

            await fetchBookings();
            setShowCreate(false);
            setFormData({ purpose: '', requested_date: '', requested_time: '', notes: '' });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(`/api/bookings/${id}/cancel/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) throw new Error('Failed to cancel booking');

            await fetchBookings();
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Book Appointment
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {error}
                </div>
            )}

            {/* Create Booking Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Book an Appointment</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Purpose</label>
                                <select
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Select purpose</option>
                                    <option value="consultation">Consultation</option>
                                    <option value="document_review">Document Review</option>
                                    <option value="application_update">Application Update</option>
                                    <option value="general">General Inquiry</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Date</label>
                                <input
                                    type="date"
                                    value={formData.requested_date}
                                    onChange={(e) => {
                                        setFormData({ ...formData, requested_date: e.target.value });
                                        setSelectedDate(e.target.value);
                                    }}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Time</label>
                                <input
                                    type="time"
                                    value={formData.requested_time}
                                    onChange={(e) => setFormData({ ...formData, requested_time: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="Any additional information..."
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {creating ? 'Booking...' : 'Book Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {bookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No bookings yet</h3>
                    <p className="text-slate-500 mb-4">Schedule your first appointment with our team</p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    >
                        Book Appointment
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 capitalize">{booking.purpose.replace('_', ' ')}</div>
                                        <div className="text-sm text-slate-500">
                                            {new Date(booking.requested_date).toLocaleDateString()} at {booking.requested_time}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[booking.status] || 'bg-slate-100 text-slate-700'}`}>
                                        {booking.status}
                                    </span>
                                    {booking.status === 'pending' && (
                                        <button
                                            onClick={() => handleCancel(booking.id)}
                                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                            {booking.notes && (
                                <p className="mt-3 text-sm text-slate-600 pl-16">{booking.notes}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookingsPage;
