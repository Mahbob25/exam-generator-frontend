'use client';

/**
 * Learning API Hooks
 * 
 * React Query mutations for learning runtime API calls.
 * 
 * @see docs/frontend_api_integration_guide.md Section 6 & 7
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { learningApi } from '@/lib/api/learning';
import { queryKeys } from '@/lib/query';
import { useLearningStore } from '@/lib/store';
import type { LearningSession } from '../types';
import type { LearningStep } from '@/lib/types/common';

/**
 * Start or resume a learning session for a concept
 * 
 * @example
 * const { mutate: startLearning, isLoading } = useStartLearning();
 * startLearning('7_science_lesson1_001');
 */
export function useStartLearning() {
    const { setSession, setLoading, setError } = useLearningStore();

    return useMutation<LearningSession, Error, string>({
        mutationFn: (conceptId: string) => learningApi.startConcept(conceptId),
        onMutate: () => {
            setLoading(true);
            setError(null);
        },
        onSuccess: (session) => {
            setSession(session);
        },
        onError: (error) => {
            setError(error.message);
        },
    });
}

/**
 * Record a failed attempt on a step
 * 
 * @example
 * const { mutate: recordFailure } = useRecordFailure();
 * recordFailure({ conceptId: '...', step: 'experiment' });
 */
export function useRecordFailure() {
    return useMutation<{ status: string }, Error, { conceptId: string; step: LearningStep }>({
        mutationFn: ({ conceptId, step }) => learningApi.recordFailure(conceptId, step),
    });
}

/**
 * Handle failure and get updated adaptive content
 * 
 * @example
 * const { mutate: handleFailure } = useHandleFailure();
 * handleFailure({ conceptId: '...', step: 'experiment' });
 */
export function useHandleFailure() {
    const { setSession, setLoading, setError } = useLearningStore();

    return useMutation<LearningSession, Error, { conceptId: string; step: LearningStep }>({
        mutationFn: ({ conceptId, step }) => learningApi.handleFailureAndRefresh(conceptId, step),
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: (session) => {
            setSession(session);
        },
        onError: (error) => {
            setError(error.message);
        },
    });
}

/**
 * Complete a concept after passing exit challenge
 * 
 * @example
 * const { mutate: completeConcept } = useCompleteConcept();
 * completeConcept('7_science_lesson1_001');
 */
export function useCompleteConcept() {
    const queryClient = useQueryClient();
    const { clearSession } = useLearningStore();

    return useMutation<{ status: string; total_xp: number; bonus_xp: number }, Error, string>({
        mutationFn: (conceptId: string) => learningApi.completeConcept(conceptId),
        onSuccess: (_, conceptId) => {
            // Invalidate progress queries to refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.learning.progress(conceptId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.user.progress() });
        },
    });
}

/**
 * Get current learning session from store
 */
export function useLearningSession() {
    return useLearningStore((state) => ({
        session: state.session,
        currentStep: state.currentStep,
        isLoading: state.isLoading,
        error: state.error,
    }));
}
