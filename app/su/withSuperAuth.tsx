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

const withSuperAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const AuthComponent = (props: P) => {
        const router = useRouter();
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [isLoading, setIsLoading] = useState(true);

        const refreshToken = async (): Promise<boolean> => {
            const refreshTokenValue = localStorage.getItem('suRefreshToken');

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
                localStorage.setItem('suAccessToken', data.access);

                if (data.refresh) {
                    localStorage.setItem('suRefreshToken', data.refresh);
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
                const accessToken = localStorage.getItem('suAccessToken');

                if (!accessToken) {
                    router.push('/su/login');
                    return;
                }

                try {
                    if (isTokenExpired(accessToken)) {
                        const refreshed = await refreshToken();
                        if (!refreshed) {
                            localStorage.removeItem('suAccessToken');
                            localStorage.removeItem('suRefreshToken');
                            localStorage.removeItem('suUser');
                            router.push('/su/login');
                            return;
                        }
                    }

                    const currentToken = localStorage.getItem('suAccessToken');
                    if (!currentToken) {
                        router.push('/su/login');
                        return;
                    }

                    // Verify from stored user data that they are superuser
                    const storedUser = localStorage.getItem('suUser');
                    if (storedUser) {
                        const userData = JSON.parse(storedUser);
                        if (!userData.is_superuser) {
                            console.error('Access denied: Not a superuser');
                            localStorage.removeItem('suAccessToken');
                            localStorage.removeItem('suRefreshToken');
                            localStorage.removeItem('suUser');
                            router.push('/su/login');
                            return;
                        }
                    }

                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Authentication check failed:', error);
                    localStorage.removeItem('suAccessToken');
                    localStorage.removeItem('suRefreshToken');
                    localStorage.removeItem('suUser');
                    router.push('/su/login');
                } finally {
                    setIsLoading(false);
                }
            };

            checkAuth();
        }, [router]);

        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-950">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-300 font-medium">Verifying access...</p>
                    </div>
                </div>
            );
        }

        if (!isAuthenticated) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };

    AuthComponent.displayName = `withSuperAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return AuthComponent;
};

export default withSuperAuth;
