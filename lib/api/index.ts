/**
 * API Module - Barrel Export
 * 
 * This file exports all API modules for easy imports.
 * Usage: import { apiClient, curriculumApi, learningApi } from '@/lib/api';
 * For exam functions: import { fetchMetadata, fetchTopics } from '@/lib/api/exam';
 */

// Base client and utilities
export { apiClient, ApiError, API_BASE_URL } from './client';

// Feature-specific API modules
export { curriculumApi } from './curriculum';
export { learningApi } from './learning';

// Exam API functions are Server Actions - import directly from './exam'
// Example: import { fetchMetadata, fetchTopics, generateQuestions } from '@/lib/api/exam';

// Re-export types for convenience
export type {
    KnowledgeIndexingRequest,
    KnowledgeIndexingResponse
} from './exam';

