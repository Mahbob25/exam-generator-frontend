/**
 * Learning Store
 * 
 * Manages the current learning session state including flow data,
 * progress, and adaptive recommendations.
 * 
 * Based on the Learning Runtime APIs from the API Integration Guide.
 * 
 * @see docs/frontend_api_integration_guide.md Section 6 & 7
 */

import { create } from 'zustand';
import type {
    LearningSession,
    LearningFlow,
    Progress,
    AdaptiveRecommendation,
    Hook,
} from '@/lib/types/api';
import type { LearningStep } from '@/lib/types/common';

interface LearningState {
    // Session data from API
    session: LearningSession | null;

    // Current step in the learning flow
    currentStep: LearningStep;

    // Loading and error states
    isLoading: boolean;
    error: string | null;

    // Actions
    setSession: (session: LearningSession) => void;
    updateSession: (session: Partial<LearningSession>) => void;
    setCurrentStep: (step: LearningStep) => void;
    nextStep: () => void;
    previousStep: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearSession: () => void;
    reset: () => void;
}

const STEP_ORDER: LearningStep[] = ['hook', 'dose', 'experiment', 'why', 'exit_challenge'];

const initialState = {
    session: null,
    currentStep: 'hook' as LearningStep,
    isLoading: false,
    error: null,
};

/**
 * Learning Store
 * 
 * Manages the current learning session.
 * The backend is the single source of truth for adaptive logic.
 * 
 * @example
 * const { session, currentStep, setSession, nextStep } = useLearningStore();
 * 
 * // Display current hook from adaptive recommendations
 * const currentHook = session?.adaptive.current_hook;
 */
export const useLearningStore = create<LearningState>()((set, get) => ({
    ...initialState,

    setSession: (session) =>
        set({
            session,
            currentStep: 'hook',
            isLoading: false,
            error: null,
        }),

    updateSession: (partial) =>
        set((state) => ({
            session: state.session ? { ...state.session, ...partial } : null,
        })),

    setCurrentStep: (step) => set({ currentStep: step }),

    nextStep: () => {
        const { currentStep } = get();
        const currentIndex = STEP_ORDER.indexOf(currentStep);
        if (currentIndex < STEP_ORDER.length - 1) {
            set({ currentStep: STEP_ORDER[currentIndex + 1] });
        }
    },

    previousStep: () => {
        const { currentStep } = get();
        const currentIndex = STEP_ORDER.indexOf(currentStep);
        if (currentIndex > 0) {
            set({ currentStep: STEP_ORDER[currentIndex - 1] });
        }
    },

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error, isLoading: false }),

    clearSession: () =>
        set({
            session: null,
            currentStep: 'hook',
            error: null,
        }),

    reset: () => set(initialState),
}));

/**
 * Selector hooks for common use cases
 */

// Get the current learning flow
export const useLearningFlow = () =>
    useLearningStore((state) => state.session?.flow ?? null);

// Get the current progress
export const useLearningProgress = () =>
    useLearningStore((state) => state.session?.progress ?? null);

// Get the adaptive recommendation
export const useAdaptiveRecommendation = () =>
    useLearningStore((state) => state.session?.adaptive ?? null);

// Get the current hook to display (from adaptive)
export const useCurrentHook = () =>
    useLearningStore((state) => state.session?.adaptive.current_hook ?? null);

// Check if student has failed attempts
export const useHasFailedAttempts = () =>
    useLearningStore((state) => (state.session?.progress.failed_attempts ?? 0) > 0);

// Get failed attempts count
export const useFailedAttempts = () =>
    useLearningStore((state) => state.session?.progress.failed_attempts ?? 0);

// Get current step index (0-4)
export const useCurrentStepIndex = () =>
    useLearningStore((state) => STEP_ORDER.indexOf(state.currentStep));

// Check if on last step
export const useIsLastStep = () =>
    useLearningStore((state) => state.currentStep === 'exit_challenge');

// Check if on first step
export const useIsFirstStep = () =>
    useLearningStore((state) => state.currentStep === 'hook');

export default useLearningStore;
