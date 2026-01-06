/**
 * API Client - Base Configuration
 * 
 * This module provides a type-safe, authenticated API client
 * for all backend communication.
 * 
 * @see docs/frontend_api_integration_guide.md for API documentation
 */

import { getFirebaseAuth } from '@/lib/firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Custom API Error class for handling backend errors
 */
export class ApiError extends Error {
    constructor(
        public status: number,
        public detail: string,
        public retryAfter?: string
    ) {
        super(detail);
        this.name = 'ApiError';
    }
}

type RequestOptions = RequestInit & {
    skipAuth?: boolean;
};

/**
 * Get the current user's Firebase ID token
 * Returns null if not authenticated
 */
async function getAuthToken(): Promise<string | null> {
    const auth = getFirebaseAuth();
    if (!auth?.currentUser) {
        return null;
    }

    try {
        // Force refresh to ensure token is valid
        const token = await auth.currentUser.getIdToken(true);
        return token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}

/**
 * Generic API client with authentication support
 * 
 * @param endpoint - API endpoint (e.g., '/curriculum/subjects')
 * @param options - Fetch options with optional skipAuth flag
 * @returns Promise resolving to typed response data
 * 
 * @example
 * const subjects = await apiClient<Subject[]>('/curriculum/subjects');
 */
export async function apiClient<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { skipAuth, ...fetchOptions } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
    };

    // Add auth token if not skipped
    if (!skipAuth) {
        const token = await getAuthToken();
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));

        // Handle specific error codes per API docs
        switch (response.status) {
            case 401:
                // Token expired or invalid - user should re-authenticate
                throw new ApiError(401, error.detail || 'Session expired. Please sign in again.');
            case 403:
                throw new ApiError(403, error.detail || 'You do not have permission to access this resource.');
            case 404:
                throw new ApiError(404, error.detail || 'Resource not found.');
            case 422:
                // Validation error
                const validationMsg = Array.isArray(error.detail)
                    ? error.detail.map((e: any) => e.msg).join(', ')
                    : error.detail;
                throw new ApiError(422, validationMsg || 'Invalid request data.');
            case 429:
                throw new ApiError(429, error.message || 'Rate limit exceeded. Please slow down.', error.retry_after);
            case 503:
                throw new ApiError(503, error.detail || 'Service temporarily unavailable. Please try again later.');
            default:
                throw new ApiError(response.status, error.detail || 'Request failed');
        }
    }

    return response.json();
}

/**
 * Re-export for backwards compatibility with existing code
 */
export { API_BASE_URL };
