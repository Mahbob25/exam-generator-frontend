/**
 * Curriculum API Module
 * 
 * API functions for browsing curriculum content (subjects, lessons, concepts).
 * 
 * @see docs/frontend_api_integration_guide.md Section 5
 */

import { apiClient, LEARNING_API_URL } from './client';
import type { Subject, Lesson, Concept } from '@/lib/types/api';

/**
 * Curriculum API Endpoints
 */
const ENDPOINTS = {
    subjects: '/curriculum/subjects',
    lessons: (subjectId: string) => `/curriculum/subjects/${subjectId}/lessons`,
    concepts: (lessonId: string) => `/curriculum/lessons/${lessonId}/concepts`,
} as const;

/**
 * Get All Subjects
 * 
 * Retrieves the list of all available subjects for students to browse.
 * 
 * @returns Promise<Subject[]> - Array of subjects
 * 
 * @example
 * const subjects = await curriculumApi.getSubjects();
 * // [{ id: "7_science", name: "science", grade: 7, display_name: "العلوم", ... }]
 */
async function getSubjects(): Promise<Subject[]> {
    return apiClient<Subject[]>(ENDPOINTS.subjects, { baseUrl: LEARNING_API_URL });
}

/**
 * Get Lessons for a Subject
 * 
 * Retrieves all lessons within a specific subject, ordered by sequence.
 * 
 * @param subjectId - The subject identifier (e.g., "7_science")
 * @returns Promise<Lesson[]> - Array of lessons, sorted by order
 * 
 * @example
 * const lessons = await curriculumApi.getLessons("7_science");
 */
async function getLessons(subjectId: string): Promise<Lesson[]> {
    return apiClient<Lesson[]>(ENDPOINTS.lessons(subjectId), { baseUrl: LEARNING_API_URL });
}

/**
 * Get Concepts for a Lesson
 * 
 * Retrieves all concepts within a specific lesson, ordered by sequence.
 * 
 * @param lessonId - The lesson identifier (e.g., "7_science_lesson1")
 * @returns Promise<Concept[]> - Array of concepts, sorted by order
 * 
 * @example
 * const concepts = await curriculumApi.getConcepts("7_science_lesson1");
 */
async function getConcepts(lessonId: string): Promise<Concept[]> {
    return apiClient<Concept[]>(ENDPOINTS.concepts(lessonId), { baseUrl: LEARNING_API_URL });
}

/**
 * Curriculum API object with all endpoints
 * 
 * @example
 * import { curriculumApi } from '@/lib/api';
 * 
 * const subjects = await curriculumApi.getSubjects();
 * const lessons = await curriculumApi.getLessons(subjectId);
 * const concepts = await curriculumApi.getConcepts(lessonId);
 */
export const curriculumApi = {
    getSubjects,
    getLessons,
    getConcepts,
} as const;

export default curriculumApi;
