/**
 * UI Store
 * 
 * Manages UI state including theme, sidebar, and modal states.
 * Persists theme preference to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface UIState {
    // Theme
    theme: Theme;
    setTheme: (theme: Theme) => void;

    // Sidebar
    isSidebarCollapsed: boolean;
    isSidebarOpen: boolean; // For mobile
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setSidebarOpen: (open: boolean) => void;

    // Global loading
    isGlobalLoading: boolean;
    globalLoadingMessage: string | null;
    setGlobalLoading: (loading: boolean, message?: string | null) => void;

    // Confirmation dialog
    confirmDialog: {
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: (() => void) | null;
        onCancel: (() => void) | null;
    };
    showConfirmDialog: (
        title: string,
        message: string,
        onConfirm: () => void,
        onCancel?: () => void
    ) => void;
    hideConfirmDialog: () => void;
}

const initialConfirmDialog = {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
};

/**
 * UI Store
 * 
 * Manages global UI state like theme, sidebar, and loading states.
 * Theme preference persists to localStorage.
 * 
 * @example
 * const { theme, setTheme, isSidebarCollapsed, toggleSidebar } = useUIStore();
 */
export const useUIStore = create<UIState>()(
    persist(
        (set, get) => ({
            // Theme - defaults to system preference
            theme: 'system',
            setTheme: (theme) => {
                set({ theme });
                // Apply theme to document
                applyTheme(theme);
            },

            // Sidebar
            isSidebarCollapsed: false,
            isSidebarOpen: false,
            toggleSidebar: () =>
                set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
            setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
            setSidebarOpen: (open) => set({ isSidebarOpen: open }),

            // Global loading
            isGlobalLoading: false,
            globalLoadingMessage: null,
            setGlobalLoading: (loading, message = null) =>
                set({
                    isGlobalLoading: loading,
                    globalLoadingMessage: loading ? message : null,
                }),

            // Confirmation dialog
            confirmDialog: initialConfirmDialog,
            showConfirmDialog: (title, message, onConfirm, onCancel) =>
                set({
                    confirmDialog: {
                        isOpen: true,
                        title,
                        message,
                        onConfirm,
                        onCancel: onCancel || null,
                    },
                }),
            hideConfirmDialog: () =>
                set({
                    confirmDialog: initialConfirmDialog,
                }),
        }),
        {
            name: 'alp-ui',
            // Only persist user preferences
            partialize: (state) => ({
                theme: state.theme,
                isSidebarCollapsed: state.isSidebarCollapsed,
            }),
            onRehydrateStorage: () => (state) => {
                // Apply theme on rehydration
                if (state) {
                    applyTheme(state.theme);
                }
            },
        }
    )
);

/**
 * Apply theme to document element
 */
function applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        root.setAttribute('data-theme', theme);
    }
}

/**
 * Selector hooks for common use cases
 */
export const useTheme = () => useUIStore((state) => state.theme);
export const useIsSidebarCollapsed = () => useUIStore((state) => state.isSidebarCollapsed);

export default useUIStore;
