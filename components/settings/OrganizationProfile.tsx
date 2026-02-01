import React, { useState, useEffect } from 'react';

interface OrganizationProfileData {
    name: string;
    legal_name: string;
    tagline: string;
    description: string;
    email: string;
    phone: string;
    website: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    registration_number: string;
    tax_id: string;
    facebook_url: string;
    twitter_url: string;
    linkedin_url: string;
    instagram_url: string;
    youtube_url: string;
    timezone: string;
    default_currency: string;
    primary_color: string;
    secondary_color: string;
}

const OrganizationProfile = () => {
    const [data, setData] = useState<OrganizationProfileData>({
        name: '',
        legal_name: '',
        tagline: '',
        description: '',
        email: '',
        phone: '',
        website: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        registration_number: '',
        tax_id: '',
        facebook_url: '',
        twitter_url: '',
        linkedin_url: '',
        instagram_url: '',
        youtube_url: '',
        timezone: 'Asia/Dhaka',
        default_currency: 'BDT',
        primary_color: '#3b82f6',
        secondary_color: '#1e40af',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch('/api/organization/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!res.ok) throw new Error('Failed to fetch profile');

            const profileData = await res.json();
            // Filter out fields we don't handle nicely yet (like images) or ensure defaults
            setData(prev => ({ ...prev, ...profileData }));
        } catch (err) {
            console.error(err);
            setError('Failed to load organization profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const accessToken = localStorage.getItem('suAccessToken');
            const res = await fetch('/api/organization/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Failed to update profile');

            setSuccess('Organization profile updated successfully');
            // Hide success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error(err);
            setError('Failed to update organization profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-8 text-slate-400">Loading profile...</div>;

    const SectionHeader = ({ title }: { title: string }) => (
        <h3 className="text-lg font-semibold text-white mt-6 mb-4 border-b border-slate-700 pb-2">{title}</h3>
    );

    const InputGroup = ({ label, name, type = 'text', placeholder = '', colSpan = 1 }: any) => (
        <div className={`col-span-1 ${colSpan > 1 ? `sm:col-span-${colSpan}` : ''}`}>
            <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            <input
                type={type}
                name={name}
                value={(data as any)[name] || ''}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500 transition-colors"
                disabled={saving}
            />
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-500 text-sm">
                    {success}
                </div>
            )}

            <div>
                <SectionHeader title="Basic Information" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputGroup label="Organization Name" name="name" colSpan={2} />
                    <InputGroup label="Legal Name" name="legal_name" />
                    <InputGroup label="Tagline" name="tagline" />
                    <div className="col-span-1 sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={data.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500 transition-colors"
                            disabled={saving}
                        />
                    </div>
                </div>
            </div>

            <div>
                <SectionHeader title="Contact Information" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputGroup label="Email Address" name="email" type="email" />
                    <InputGroup label="Phone Number" name="phone" />
                    <InputGroup label="Website" name="website" type="url" colSpan={2} />
                </div>
            </div>

            <div>
                <SectionHeader title="Address" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputGroup label="Address Line 1" name="address_line_1" colSpan={2} />
                    <InputGroup label="Address Line 2" name="address_line_2" colSpan={2} />
                    <InputGroup label="City" name="city" />
                    <InputGroup label="State / Province" name="state" />
                    <InputGroup label="Postal Code" name="postal_code" />
                    <InputGroup label="Country" name="country" />
                </div>
            </div>

            <div>
                <SectionHeader title="Business Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputGroup label="Registration Number" name="registration_number" />
                    <InputGroup label="Tax ID / VAT" name="tax_id" />
                    <InputGroup label="Default Currency" name="default_currency" />
                    <InputGroup label="Timezone" name="timezone" />
                </div>
            </div>

            <div>
                <SectionHeader title="Branding" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                        <InputGroup label="Primary Color" name="primary_color" />
                        <div
                            className="w-10 h-10 rounded-lg border border-slate-600 mt-6 shadow-lg"
                            style={{ backgroundColor: data.primary_color }}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <InputGroup label="Secondary Color" name="secondary_color" />
                        <div
                            className="w-10 h-10 rounded-lg border border-slate-600 mt-6 shadow-lg"
                            style={{ backgroundColor: data.secondary_color }}
                        />
                    </div>
                </div>
            </div>

            <div>
                <SectionHeader title="Social Media" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputGroup label="Facebook URL" name="facebook_url" type="url" />
                    <InputGroup label="Twitter URL" name="twitter_url" type="url" />
                    <InputGroup label="LinkedIn URL" name="linkedin_url" type="url" />
                    <InputGroup label="Instagram URL" name="instagram_url" type="url" />
                    <InputGroup label="YouTube URL" name="youtube_url" type="url" />
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-700">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Saving...
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </button>
            </div>
        </form>
    );
};

export default OrganizationProfile;
