/**
 * Application Constants
 * 
 * Centralized configuration values used across the application.
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
    // Deprecated: Usage should specify LEARNING or EXAM
    BASE_URL: process.env.NEXT_PUBLIC_LEARNING_API_URL || 'http://localhost:8000',
    LEARNING_BASE_URL: process.env.NEXT_PUBLIC_LEARNING_API_URL || 'http://localhost:8000',
    EXAM_BASE_URL: process.env.NEXT_PUBLIC_EXAM_API_URL || 'http://localhost:8000',
    TIMEOUT_MS: 10000,
    RETRY_COUNT: 1,
    RETRY_DELAY_MS: 2000,
} as const;

/**
 * Application Routes
 */
export const ROUTES = {
    // Public routes
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',

    // Dashboard routes
    DASHBOARD: '/dashboard',
    LEARN: '/learn',
    EXAM_GENERATOR: '/exam-generator',
    PROGRESS: '/progress',
    SETTINGS: '/settings',

    // Dynamic routes (use with template literals)
    SUBJECT: (subjectId: string) => `/learn/${subjectId}`,
    LESSON: (subjectId: string, lessonId: string) => `/learn/${subjectId}/${lessonId}`,
    CONCEPT: (subjectId: string, lessonId: string, conceptId: string) =>
        `/learn/${subjectId}/${lessonId}/${conceptId}`,
} as const;

/**
 * Learning Flow Configuration
 */
export const LEARNING_CONFIG = {
    STEPS: ['hook', 'dose', 'experiment', 'why', 'exit_challenge'] as const,
    MAX_RETRY_BEFORE_RESTART: 3,
    XP_PER_CONCEPT: 10,
    BONUS_XP_FOR_RESILIENCE: 5,
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
    TOAST_DURATION_MS: 4000,
    DEBOUNCE_DELAY_MS: 300,
    ANIMATION_DURATION_MS: 200,
    SKELETON_SHIMMER_DURATION_MS: 1500,
} as const;

/**
 * Pagination Defaults
 */
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
} as const;

/**
 * LocalStorage Keys
 */
export const STORAGE_KEYS = {
    THEME: 'alp-theme',
    SIDEBAR_COLLAPSED: 'alp-sidebar-collapsed',
    RECENT_SUBJECTS: 'alp-recent-subjects',
} as const;

/**
 * Validation Limits
 */
export const VALIDATION = {
    CONCEPT_ID_MAX_LENGTH: 200,
    CONCEPT_ID_PATTERN: /^[a-zA-Z0-9_\-\.]+$/,
} as const;

/**
 * Error Messages (User-Friendly)
 */
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Connection lost. Check your internet and try again.',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
    PERMISSION_DENIED: "You don't have permission to access this feature.",
    CONTENT_NOT_AVAILABLE: "This lesson isn't ready yet. Try another!",
    RATE_LIMITED: 'Slow down! Take a moment before continuing.',
    UNKNOWN_ERROR: 'Something went wrong. Please try again.',
} as const;
