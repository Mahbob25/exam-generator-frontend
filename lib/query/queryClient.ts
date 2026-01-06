/**
 * React Query Client Configuration
 * 
 * Configures TanStack Query with sensible defaults for the ALP.
 * 
 * @see https://tanstack.com/query/latest/docs/react/overview
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Default stale time for queries (5 minutes)
 * Curriculum data doesn't change frequently, so we can cache it longer.
 */
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Default cache time for inactive queries (30 minutes)
 */
const GC_TIME = 30 * 60 * 1000; // 30 minutes

/**
 * Create and configure the React Query client
 */
export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Time before data is considered stale
                staleTime: STALE_TIME,

                // Time before inactive query data is garbage collected
                gcTime: GC_TIME,

                // Retry failed requests up to 3 times with exponential backoff
                retry: 3,
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

                // Don't refetch on window focus by default (can override per query)
                refetchOnWindowFocus: false,

                // Don't refetch on reconnect by default
                refetchOnReconnect: 'always',
            },
            mutations: {
                // Retry mutations once
                retry: 1,
            },
        },
    });
}

/**
 * Singleton query client instance
 * In SSR, we need to ensure each request gets its own client
 */
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
    if (typeof window === 'undefined') {
        // Server: always create a new query client
        return createQueryClient();
    }

    // Browser: use a singleton
    if (!browserQueryClient) {
        browserQueryClient = createQueryClient();
    }

    return browserQueryClient;
}

/**
 * Query key factories for consistent key management
 * 
 * @example
 * // Use in useQuery
 * useQuery({
 *   queryKey: queryKeys.curriculum.subjects(),
 *   queryFn: () => curriculumApi.getSubjects(),
 * });
 */
export const queryKeys = {
    // Curriculum queries
    curriculum: {
        all: ['curriculum'] as const,
        subjects: () => [...queryKeys.curriculum.all, 'subjects'] as const,
        lessons: (subjectId: string) =>
            [...queryKeys.curriculum.all, 'lessons', subjectId] as const,
        concepts: (lessonId: string) =>
            [...queryKeys.curriculum.all, 'concepts', lessonId] as const,
    },

    // Learning queries
    learning: {
        all: ['learning'] as const,
        session: (conceptId: string) =>
            [...queryKeys.learning.all, 'session', conceptId] as const,
        progress: (conceptId: string) =>
            [...queryKeys.learning.all, 'progress', conceptId] as const,
    },

    // User queries
    user: {
        all: ['user'] as const,
        profile: () => [...queryKeys.user.all, 'profile'] as const,
        progress: () => [...queryKeys.user.all, 'progress'] as const,
    },
} as const;

export default getQueryClient;
