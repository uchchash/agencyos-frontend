'use client';

import React, { useEffect, useState, useRef } from 'react';

interface ClientProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    date_of_birth?: string;
    nationality?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    client_id?: string;
    profile_picture?: string;
}

const ProfilePage = () => {
    const [profile, setProfile] = useState<ClientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<ClientProfile>>({});
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch('/api/clients/me/profile/', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch profile');

            const data = await response.json();
            setProfile(data);
            setFormData(data);
            if (data.profile_picture) {
                setImagePreview(data.profile_picture);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const accessToken = localStorage.getItem('accessToken');

            // Use FormData for file upload
            const data = new FormData();

            // Append regular fields
            Object.keys(formData).forEach(key => {
                const value = formData[key as keyof ClientProfile];
                if (value !== undefined && value !== null && key !== 'profile_picture') {
                    data.append(key, value as string);
                }
            });

            // Append image if selected
            if (selectedImage) {
                data.append('profile_picture', selectedImage);
            }

            const response = await fetch('/api/clients/me/profile/', {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    // Content-Type is irrelevant for FormData (browser sets boundary)
                },
                body: data,
            });

            if (!response.ok) throw new Error('Failed to update profile');

            const updatedProfile = await response.json();
            setProfile(updatedProfile);
            setFormData(updatedProfile);
            if (updatedProfile.profile_picture) {
                setImagePreview(updatedProfile.profile_picture);
            }

            setEditing(false);
            setSuccess('Profile updated successfully');
            setSelectedImage(null);

            // Update stored user info (localStorage is typically JSON only, so skip image)
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                user.first_name = updatedProfile.first_name;
                user.last_name = updatedProfile.last_name;
                localStorage.setItem('user', JSON.stringify(user));
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
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
                <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                {!editing ? (
                    <button
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setEditing(false);
                                setFormData(profile || {});
                                setImagePreview(profile?.profile_picture || null);
                                setSelectedImage(null);
                            }}
                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                    {success}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Header with avatar */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-white/30">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{profile?.first_name?.[0]}{profile?.last_name?.[0]}</span>
                                )}
                            </div>

                            {editing && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    title="Change Profile Picture"
                                >
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        <div className="text-white">
                            <h2 className="text-2xl font-bold">{profile?.first_name} {profile?.last_name}</h2>
                            <p className="text-purple-100">{profile?.email}</p>
                            {profile?.client_id && (
                                <p className="text-purple-200 text-sm mt-1">Client ID: {profile.client_id}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form fields */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name || ''}
                                onChange={handleChange}
                                disabled={!editing}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name || ''}
                                onChange={handleChange}
                                disabled={!editing}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email || ''}
                                disabled
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number || ''}
                                onChange={handleChange}
                                disabled={!editing}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth || ''}
                                onChange={handleChange}
                                disabled={!editing}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nationality</label>
                            <input
                                type="text"
                                name="nationality"
                                value={formData.nationality || ''}
                                onChange={handleChange}
                                disabled={!editing}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                disabled={!editing}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city || ''}
                                onChange={handleChange}
                                disabled={!editing}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country || ''}
                                onChange={handleChange}
                                disabled={!editing}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
