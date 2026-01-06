'use client';

/**
 * Auth Provider
 * 
 * Provides authentication context to the application.
 * Listens to Firebase auth state changes and updates the auth store.
 * 
 * @see docs/frontend_api_integration_guide.md Section 2
 */

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import type { User, UserRole } from '@/lib/store';

interface AuthProviderProps {
    children: React.ReactNode;
}

/**
 * Extract user role from Firebase token claims
 * 
 * Per API docs: "Role is stored as Firebase Custom Claim (role: 'student' | 'admin')"
 */
async function extractRoleFromToken(user: FirebaseUser): Promise<UserRole> {
    try {
        const tokenResult = await user.getIdTokenResult(true);
        const role = tokenResult.claims.role as string;

        if (role === 'admin') {
            return 'admin';
        }

        // Default to student if no role or unrecognized role
        return 'student';
    } catch (error) {
        console.error('Error extracting role from token:', error);
        return 'student';
    }
}

/**
 * Convert Firebase User to our User type
 */
function mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
    };
}

/**
 * AuthProvider Component
 * 
 * Wrap your app with this provider to enable authentication.
 * Automatically syncs Firebase auth state with the Zustand store.
 * 
 * @example
 * // In your root layout.tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const { setUser, setRole, setLoading, logout } = useAuthStore();

    useEffect(() => {
        const auth = getFirebaseAuth();

        if (!auth) {
            // Firebase not available (likely SSR)
            setLoading(false);
            setIsInitialized(true);
            return;
        }

        // Start loading
        setLoading(true);

        // Subscribe to auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                const user = mapFirebaseUser(firebaseUser);
                const role = await extractRoleFromToken(firebaseUser);

                setUser(user);
                setRole(role);
            } else {
                // User is signed out
                logout();
            }

            setLoading(false);
            setIsInitialized(true);
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, [setUser, setRole, setLoading, logout]);

    // Don't render children until auth is initialized
    // This prevents flash of unauthenticated content
    if (!isInitialized) {
        return <LoadingScreen />;
    }

    return <>{children}</>;
}

export default AuthProvider;
