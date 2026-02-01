'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from '../jwt';

interface DecodedToken {
    role: string;
    exp: number;
    user_id: number;
    email: string;
}

const withStaffAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const AuthComponent = (props: P) => {
        const router = useRouter();
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [isLoading, setIsLoading] = useState(true);

        const refreshToken = async (): Promise<boolean> => {
            const refreshTokenValue = localStorage.getItem('staffRefreshToken');

            if (!refreshTokenValue) {
                return false;
            }

            try {
                const response = await fetch('/api/token/refresh/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh: refreshTokenValue }),
                });

                if (!response.ok) {
                    return false;
                }

                const data = await response.json();
                localStorage.setItem('staffAccessToken', data.access);

                if (data.refresh) {
                    localStorage.setItem('staffRefreshToken', data.refresh);
                }

                return true;
            } catch (error) {
                console.error('Token refresh failed:', error);
                return false;
            }
        };

        const isTokenExpired = (token: string): boolean => {
            try {
                const decoded = jwtDecode(token, {}) as DecodedToken;
                const currentTime = Date.now() / 1000;
                return decoded.exp < currentTime + 60;
            } catch {
                return true;
            }
        };

        useEffect(() => {
            const checkAuth = async () => {
                const accessToken = localStorage.getItem('staffAccessToken');

                if (!accessToken) {
                    router.push('/staff/login');
                    return;
                }

                try {
                    if (isTokenExpired(accessToken)) {
                        const refreshed = await refreshToken();
                        if (!refreshed) {
                            localStorage.removeItem('staffAccessToken');
                            localStorage.removeItem('staffRefreshToken');
                            localStorage.removeItem('staffUser');
                            router.push('/staff/login');
                            return;
                        }
                    }

                    const currentToken = localStorage.getItem('staffAccessToken');
                    if (!currentToken) {
                        router.push('/staff/login');
                        return;
                    }

                    const decodedToken = jwtDecode(currentToken, {}) as DecodedToken;

                    // Verify staff or admin role
                    if (!['staff', 'admin'].includes(decodedToken.role)) {
                        console.error('Access denied: Not a staff or admin user');
                        localStorage.removeItem('staffAccessToken');
                        localStorage.removeItem('staffRefreshToken');
                        localStorage.removeItem('staffUser');
                        router.push('/staff/login');
                        return;
                    }

                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Authentication check failed:', error);
                    localStorage.removeItem('staffAccessToken');
                    localStorage.removeItem('staffRefreshToken');
                    localStorage.removeItem('staffUser');
                    router.push('/staff/login');
                } finally {
                    setIsLoading(false);
                }
            };

            checkAuth();
        }, [router]);

        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-900">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-300 font-medium">Loading...</p>
                    </div>
                </div>
            );
        }

        if (!isAuthenticated) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };

    AuthComponent.displayName = `withStaffAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return AuthComponent;
};

export default withStaffAuth;
