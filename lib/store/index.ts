/**
 * Store Module - Barrel Export
 * 
 * This file exports all Zustand stores for easy imports.
 * Usage: import { useAuthStore, useUIStore, useLearningStore } from '@/lib/store';
 */

// Auth Store
export {
    useAuthStore,
    useUser,
    useRole,
    useIsAuthenticated,
    useIsAdmin,
} from './useAuthStore';
export type { User, UserRole } from './useAuthStore';

// UI Store
export {
    useUIStore,
    useTheme,
    useIsSidebarCollapsed,
} from './useUIStore';
export type { Theme } from './useUIStore';

// Learning Store
export {
    useLearningStore,
    useLearningFlow,
    useLearningProgress,
    useAdaptiveRecommendation,
    useCurrentHook,
    useHasFailedAttempts,
    useFailedAttempts,
    useCurrentStepIndex,
    useIsLastStep,
    useIsFirstStep,
} from './useLearningStore';
