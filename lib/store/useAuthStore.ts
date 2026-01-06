/**
 * Auth Store
 * 
 * Manages authentication state including user, role, and loading state.
 * Based on Firebase Authentication as per the API Integration Guide Section 2.
 * 
 * @see docs/frontend_api_integration_guide.md Section 2 & 3
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'student' | 'admin';

export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

interface AuthState {
    // State
    user: User | null;
    role: UserRole | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setRole: (role: UserRole | null) => void;
    setLoading: (isLoading: boolean) => void;
    login: (user: User, role?: UserRole) => void;
    logout: () => void;
    reset: () => void;
}

const initialState = {
    user: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
};

/**
 * Auth Store
 * 
 * Stores user authentication state.
 * Role is extracted from Firebase Custom Claims by the backend.
 * 
 * @example
 * const { user, role, isAuthenticated, logout } = useAuthStore();
 * 
 * if (isAuthenticated) {
 *   console.log(`Logged in as ${user.email} with role ${role}`);
 * }
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            ...initialState,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: user !== null,
                    isLoading: false,
                }),

            setRole: (role) => set({ role }),

            setLoading: (isLoading) => set({ isLoading }),

            login: (user, role = 'student') =>
                set({
                    user,
                    role,
                    isAuthenticated: true,
                    isLoading: false,
                }),

            logout: () =>
                set({
                    ...initialState,
                    isLoading: false,
                }),

            reset: () => set(initialState),
        }),
        {
            name: 'alp-auth',
            // Only persist essential data, not loading states
            partialize: (state) => ({
                user: state.user,
                role: state.role,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

/**
 * Selector hooks for common use cases
 */
export const useUser = () => useAuthStore((state) => state.user);
export const useRole = () => useAuthStore((state) => state.role);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsAdmin = () => useAuthStore((state) => state.role === 'admin');

export default useAuthStore;
