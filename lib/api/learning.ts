/**
 * Learning Runtime API Module
 * 
 * API functions for the adaptive learning runtime.
 * Handles starting concepts, recording failures, and completing concepts.
 * 
 * IMPORTANT: The backend is the single source of truth for adaptive logic.
 * The frontend only displays what the backend provides.
 * 
 * @see docs/frontend_api_integration_guide.md Section 6 & 7
 */

import { apiClient, LEARNING_API_URL } from './client';
import type { LearningSession } from '@/lib/types/api';
import type { LearningStep } from '@/lib/types/common';

/**
 * Learning API Endpoints
 */
const ENDPOINTS = {
    start: '/runtime/learn/start',
    fail: '/runtime/learn/fail',
    complete: '/runtime/learn/complete',
} as const;

/**
 * Request body for starting a concept
 */
interface StartConceptRequest {
    concept_id: string;
}

/**
 * Request body for recording a failure
 */
interface RecordFailureRequest {
    concept_id: string;
    step: LearningStep;
}

/**
 * Request body for completing a concept
 */
interface CompleteConceptRequest {
    concept_id: string;
}

/**
 * Response from recording a failure
 */
interface FailureResponse {
    status: 'recorded';
}

/**
 * Response from completing a concept
 */
interface CompleteResponse {
    status: 'completed';
    total_xp: number;
    bonus_xp: number;
}

/**
 * Start Learning a Concept
 * 
 * Initializes or resumes a learning session for a concept.
 * Returns the full learning flow, progress, and adaptive recommendations.
 * 
 * @param conceptId - The concept identifier to start learning
 * @returns Promise<LearningSession> - Full session data with flow, progress, and adaptive info
 * 
 * @example
 * const session = await learningApi.startConcept("7_science_lesson1_001");
 * console.log(session.adaptive.current_hook); // Hook to display
 */
async function startConcept(conceptId: string): Promise<LearningSession> {
    const request: StartConceptRequest = { concept_id: conceptId };

    return apiClient<LearningSession>(ENDPOINTS.start, {
        method: 'POST',
        body: JSON.stringify(request),
        baseUrl: LEARNING_API_URL,
    });
}

/**
 * Record a Failed Attempt
 * 
 * Reports that the student failed a step.
 * After recording, call startConcept again to get updated adaptive content.
 * 
 * @param conceptId - The concept identifier
 * @param step - The step where failure occurred (hook, dose, experiment, why, exit_challenge)
 * @returns Promise<FailureResponse> - Confirmation that failure was recorded
 * 
 * @example
 * await learningApi.recordFailure("7_science_lesson1_001", "experiment");
 * // Then re-fetch adaptive content:
 * const updatedSession = await learningApi.startConcept("7_science_lesson1_001");
 */
async function recordFailure(conceptId: string, step: LearningStep): Promise<FailureResponse> {
    const request: RecordFailureRequest = { concept_id: conceptId, step };

    return apiClient<FailureResponse>(ENDPOINTS.fail, {
        method: 'POST',
        body: JSON.stringify(request),
        baseUrl: LEARNING_API_URL,
    });
}

/**
 * Complete a Concept
 * 
 * Marks a concept as successfully completed after the student passes the exit challenge.
 * Returns XP earned including any bonus for resilience.
 * 
 * @param conceptId - The concept identifier to mark as complete
 * @returns Promise<CompleteResponse> - Completion status with XP earned
 * 
 * @example
 * const result = await learningApi.completeConcept("7_science_lesson1_001");
 * console.log(`Earned ${result.total_xp} XP!`);
 */
async function completeConcept(conceptId: string): Promise<CompleteResponse> {
    const request: CompleteConceptRequest = { concept_id: conceptId };

    return apiClient<CompleteResponse>(ENDPOINTS.complete, {
        method: 'POST',
        body: JSON.stringify(request),
        baseUrl: LEARNING_API_URL,
    });
}

/**
 * Helper: Handle failure and get updated session
 * 
 * Convenience function that records a failure and fetches updated adaptive content.
 * 
 * @param conceptId - The concept identifier
 * @param step - The step where failure occurred
 * @returns Promise<LearningSession> - Updated session with new adaptive recommendations
 */
async function handleFailureAndRefresh(
    conceptId: string,
    step: LearningStep
): Promise<LearningSession> {
    await recordFailure(conceptId, step);
    return startConcept(conceptId);
}

/**
 * Learning Runtime API object with all endpoints
 * 
 * @example
 * import { learningApi } from '@/lib/api';
 * 
 * // Start learning
 * const session = await learningApi.startConcept(conceptId);
 * 
 * // On wrong answer
 * const updated = await learningApi.handleFailureAndRefresh(conceptId, 'experiment');
 * 
 * // On completion
 * const result = await learningApi.completeConcept(conceptId);
 */
export const learningApi = {
    startConcept,
    recordFailure,
    completeConcept,
    handleFailureAndRefresh,
} as const;

export default learningApi;
