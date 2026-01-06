'use client';

/**
 * Curriculum Hooks
 * 
 * React Query hooks for fetching curriculum data (subjects, lessons, concepts).
 * 
 * @see docs/frontend_api_integration_guide.md Section 5
 */

import { useQuery } from '@tanstack/react-query';
import { curriculumApi } from '@/lib/api/curriculum';
import { queryKeys } from '@/lib/query';
import type { Subject, Lesson, Concept } from '../types';

/**
 * Fetch all subjects
 * 
 * @example
 * const { data: subjects, isLoading, error } = useSubjects();
 */
export function useSubjects() {
    return useQuery<Subject[], Error>({
        queryKey: queryKeys.curriculum.subjects(),
        queryFn: () => curriculumApi.getSubjects(),
        staleTime: 10 * 60 * 1000, // 10 minutes - subjects rarely change
    });
}

/**
 * Fetch lessons for a specific subject
 * 
 * @param subjectId - The subject identifier
 * @example
 * const { data: lessons, isLoading } = useLessons('7_science');
 */
export function useLessons(subjectId: string | undefined) {
    return useQuery<Lesson[], Error>({
        queryKey: queryKeys.curriculum.lessons(subjectId || ''),
        queryFn: () => curriculumApi.getLessons(subjectId!),
        enabled: !!subjectId, // Only fetch when subjectId is provided
        staleTime: 10 * 60 * 1000,
    });
}

/**
 * Fetch concepts for a specific lesson
 * 
 * @param lessonId - The lesson identifier
 * @example
 * const { data: concepts, isLoading } = useConcepts('7_science_lesson1');
 */
export function useConcepts(lessonId: string | undefined) {
    return useQuery<Concept[], Error>({
        queryKey: queryKeys.curriculum.concepts(lessonId || ''),
        queryFn: () => curriculumApi.getConcepts(lessonId!),
        enabled: !!lessonId, // Only fetch when lessonId is provided
        staleTime: 10 * 60 * 1000,
    });
}

/**
 * Prefetch lessons for a subject (useful for hover prefetching)
 */
export function usePrefetchLessons() {
    // Placeholder for prefetch hook
    // Will be implemented when needed for performance optimization
}
