/**
 * Common Types
 * 
 * Shared types used across multiple features.
 */

/**
 * User roles in the system
 */
export type UserRole = 'student' | 'admin';

/**
 * Learning step names
 */
export type LearningStep = 'hook' | 'dose' | 'experiment' | 'why' | 'exit_challenge';

/**
 * Theme preference
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Generic loading state
 */
export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
    page: number;
    limit: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
