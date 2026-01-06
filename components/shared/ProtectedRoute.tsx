'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { LoadingScreen } from './LoadingScreen';
import styles from './ProtectedRoute.module.css';

export type UserRole = 'student' | 'admin';

interface ProtectedRouteProps {
    children: React.ReactNode;
    /** Required role to access this route */
    requiredRole?: UserRole;
    /** Custom loading component */
    loadingComponent?: React.ReactNode;
    /** Redirect path for unauthenticated users */
    loginPath?: string;
    /** Redirect path for unauthorized users */
    unauthorizedPath?: string;
}

/**
 * ProtectedRoute Component
 * 
 * Wraps content that requires authentication and/or specific roles.
 * Redirects unauthenticated users to login and unauthorized users to an error page.
 * 
 * @example
 * <ProtectedRoute requiredRole="admin">
 *   <AdminDashboard />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    loadingComponent,
    loginPath = '/login',
    unauthorizedPath = '/',
}) => {
    const router = useRouter();
    const pathname = usePathname();

    // Get auth state from Zustand store
    const { isLoading, isAuthenticated, role } = useAuthStore();

    useEffect(() => {
        // Wait for auth to finish loading
        if (isLoading) return;

        // Redirect to login if not authenticated
        if (!isAuthenticated) {
            const redirectUrl = `${loginPath}?redirect=${encodeURIComponent(pathname)}`;
            router.replace(redirectUrl);
            return;
        }

        // Check role requirements
        if (requiredRole && role !== requiredRole) {
            // Admin can access student routes, but not vice versa
            if (!(role === 'admin' && requiredRole === 'student')) {
                router.replace(unauthorizedPath);
            }
        }
    }, [
        isLoading,
        isAuthenticated,
        role,
        requiredRole,
        router,
        pathname,
        loginPath,
        unauthorizedPath,
    ]);

    // Show loading state
    if (isLoading) {
        if (loadingComponent) {
            return <>{loadingComponent}</>;
        }

        return <LoadingScreen />;
    }

    // Not authenticated - will redirect
    if (!isAuthenticated) {
        return <LoadingScreen />;
    }

    // Unauthorized role - will redirect
    if (requiredRole && role !== requiredRole) {
        if (!(role === 'admin' && requiredRole === 'student')) {
            return null;
        }
    }

    // Authorized - render children
    return <>{children}</>;
};

export default ProtectedRoute;
