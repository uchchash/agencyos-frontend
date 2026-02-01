'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from './jwt';

interface DecodedToken {
  role: string;
  exp: number;
  user_id: number;
  email: string;
}

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const refreshToken = async (): Promise<boolean> => {
      const refreshTokenValue = localStorage.getItem('refreshToken');

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
        localStorage.setItem('accessToken', data.access);

        // If a new refresh token is provided, update it too
        if (data.refresh) {
          localStorage.setItem('refreshToken', data.refresh);
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
        // Consider token expired 60 seconds before actual expiry
        return decoded.exp < currentTime + 60;
      } catch {
        return true;
      }
    };

    useEffect(() => {
      const checkAuth = async () => {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
          router.push('/client/login');
          return;
        }

        try {
          // Check if token is expired or about to expire
          if (isTokenExpired(accessToken)) {
            const refreshed = await refreshToken();
            if (!refreshed) {
              // Clear tokens and redirect to login
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              router.push('/client/login');
              return;
            }
          }

          // Decode the (possibly new) access token
          const currentToken = localStorage.getItem('accessToken');
          if (!currentToken) {
            router.push('/client/login');
            return;
          }

          const decodedToken = jwtDecode(currentToken, {}) as DecodedToken;

          // Verify client role
          if (decodedToken.role !== 'client') {
            console.error('Access denied: Not a client user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            router.push('/client/login');
            return;
          }

          setIsAuthenticated(true);
        } catch (error) {
          console.error('Authentication check failed:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          router.push('/client/login');
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthComponent;
};

export default withAuth;
