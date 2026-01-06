/**
 * API Module - Barrel Export
 * 
 * This file exports all API modules for easy imports.
 * Usage: import { apiClient, curriculumApi, learningApi, examApi } from '@/lib/api';
 */

// Base client and utilities
export { apiClient, ApiError, API_BASE_URL } from './client';

// Feature-specific API modules
export { curriculumApi } from './curriculum';
export { learningApi } from './learning';
export { examApi } from './exam';

// Re-export types for convenience
export type {
    KnowledgeIndexingRequest,
    KnowledgeIndexingResponse
} from './exam';
