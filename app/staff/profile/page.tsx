'use client';

import React, { useState, useEffect } from 'react';
import { useStaff } from '../layout';
import Image from 'next/image';

export default function StaffProfilePage() {
    const { user, refreshData } = useStaff();
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        address: '',
        new_password: '',
        confirm_password: '',
    });

    // Profile picture state
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone_number: user.phone_number || '',
                address: user.address || '',
            }));
            if (user.profile_picture) {
                setPreviewUrl(user.profile_picture);
            }
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.new_password && formData.new_password !== formData.confirm_password) {
            alert("Passwords do not match!");
            return;
        }

        setSubmitting(true);
        const submitData = new FormData();
        submitData.append('first_name', formData.first_name);
        submitData.append('last_name', formData.last_name);
        submitData.append('phone_number', formData.phone_number);
        submitData.append('address', formData.address);

        if (selectedFile) {
            submitData.append('profile_picture', selectedFile);
        }

        if (formData.new_password) {
            submitData.append('new_password', formData.new_password);
            submitData.append('confirm_password', formData.confirm_password);
        }

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch('/api/staff/profile/', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: submitData
            });

            if (res.ok) {
                alert('Profile updated successfully!');
                setFormData(prev => ({ ...prev, new_password: '', confirm_password: '' })); // Clear password fields
                refreshData(); // Update context
            } else {
                const err = await res.json();
                alert(`Error: ${JSON.stringify(err)}`);
            }
        } catch (err) {
            console.error('Update failed', err);
            alert('An unexpected error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return <div className="p-8 text-center text-slate-400">Loading profile...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">My Profile 👤</h1>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                {/* Banner/Header */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden">
                                {previewUrl ? (
                                    <Image
                                        src={previewUrl}
                                        alt="Profile"
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                                )}
                            </div>
                            <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-white text-xs font-bold">CHANGE</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-16 px-8 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">Email <span className="text-slate-600">(Read-only)</span></label>
                                <input
                                    type="email"
                                    value={user.email}
                                    readOnly
                                    className="w-full bg-slate-800/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-400 text-sm cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm"
                            />
                        </div>

                        <hr className="border-slate-800" />

                        {/* Security */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-white">Security 🔐</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">New Password</label>
                                    <input
                                        type="password"
                                        name="new_password"
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        placeholder="Leave blank to keep current"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        placeholder="Confirm new password"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
