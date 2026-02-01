'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import withStaffAuth from './withStaffAuth';

// Icons
const DashboardIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const ClientsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const ApplicationsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

const DocumentsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const TodosIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
);

const TeamsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const LeaveIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const StaffManageIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
);

const InvoicesIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const LogoutIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const MenuIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface StaffUser {
    id: number;
    email: string;
    role: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    address?: string;
    profile_picture?: string;
    staff_id?: string;
    is_admin?: boolean;
    is_superuser?: boolean;
}

interface StaffProfile {
    id: string;
    staff_role: string;
    department: string;
    can_manage_staff: boolean;
    can_approve_documents: boolean;
}

interface StaffContextType {
    user: StaffUser | null;
    profile: StaffProfile | null;
    loading: boolean;
    error: string | null;
    isAdmin: boolean;
    refreshData: () => void;
}

const StaffContext = createContext<StaffContextType>({
    user: null,
    profile: null,
    loading: true,
    error: null,
    isAdmin: false,
    refreshData: () => { },
});

export const useStaff = () => useContext(StaffContext);

const publicRoutes = ['/staff/login'];

const CommunicationsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const AcademicIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
);

const NotificationsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const staffNavItems = [
    { href: '/staff/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { href: '/staff/clients', label: 'Clients', icon: ClientsIcon },
    { href: '/staff/applications', label: 'Applications', icon: ApplicationsIcon },
    { href: '/staff/documents', label: 'Documents', icon: DocumentsIcon },
    { href: '/staff/data', label: 'Academic', icon: AcademicIcon },
    { href: '/staff/notifications', label: 'Notifications', icon: NotificationsIcon },
    { href: '/staff/todos', label: 'My Todos', icon: TodosIcon },
    { href: '/staff/team', label: 'Team', icon: TeamsIcon },
    { href: '/staff/communications', label: 'Communications', icon: CommunicationsIcon },
    { href: '/staff/invoices', label: 'Invoices', icon: InvoicesIcon },
    { href: '/staff/leave', label: 'Leave Requests', icon: LeaveIcon },
];

const adminOnlyItems = [
    { href: '/staff/manage', label: 'Staff Management', icon: StaffManageIcon },
];

const StaffLayoutContent = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<StaffUser | null>(null);
    const [profile, setProfile] = useState<StaffProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    const isAdmin = user?.role === 'admin' || user?.is_superuser || profile?.can_manage_staff || false;

    const fetchData = async () => {
        if (isPublicRoute) {
            setLoading(false);
            return;
        }

        try {
            const storedUser = localStorage.getItem('staffUser');
            const storedProfile = localStorage.getItem('staffProfile');

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            if (storedProfile) {
                setProfile(JSON.parse(storedProfile));
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isPublicRoute) {
            setLoading(false);
            return;
        }
        fetchData();
    }, [pathname, isPublicRoute]);

    const handleLogout = () => {
        localStorage.removeItem('staffAccessToken');
        localStorage.removeItem('staffRefreshToken');
        localStorage.removeItem('staffUser');
        localStorage.removeItem('staffProfile');
        router.push('/staff/login');
    };

    const value: StaffContextType = {
        user,
        profile,
        loading,
        error,
        isAdmin,
        refreshData: fetchData,
    };

    if (isPublicRoute) {
        return <>{children}</>;
    }

    const navItems = [...staffNavItems, ...(isAdmin ? adminOnlyItems : [])];

    return (
        <StaffContext.Provider value={value}>
            <div className="min-h-screen bg-slate-100">
                {/* Mobile header */}
                <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 z-40">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-slate-800 text-white transition-colors"
                    >
                        <MenuIcon />
                    </button>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        AgencyOS Staff
                    </h1>
                    <div className="w-10" />
                </div>

                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`
            fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-700 z-50
            transform transition-transform duration-300 ease-in-out
            lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
                >
                    {/* Sidebar Header */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            AgencyOS Staff
                        </h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-white transition-colors"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    {/* User Profile Section */}
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'S'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {user?.first_name && user?.last_name
                                        ? `${user.first_name} ${user.last_name}`
                                        : user?.email || 'Loading...'}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                    {profile?.staff_role ? profile.staff_role.replace('_', ' ').toUpperCase() : user?.role?.toUpperCase()}
                                </p>
                                {user?.staff_id && (
                                    <p className="text-xs text-slate-500 truncate">ID: {user.staff_id}</p>
                                )}
                            </div>
                        </div>
                        {isAdmin && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                                Admin Access
                            </span>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }
                  `}
                                >
                                    <Icon />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-slate-700">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
                        >
                            <LogoutIcon />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="lg:ml-64 min-h-screen">
                    <div className="pt-16 lg:pt-0">
                        <div className="p-6 lg:p-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </StaffContext.Provider>
    );
};

const StaffLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (isPublicRoute) {
        return <>{children}</>;
    }

    const AuthenticatedLayout = withStaffAuth(StaffLayoutContent);
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
};

export default StaffLayout;
