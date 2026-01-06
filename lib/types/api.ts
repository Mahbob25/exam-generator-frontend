/**
 * API Response Types
 * 
 * TypeScript interfaces for all backend API responses.
 * These types ensure type safety across the application.
 * 
 * @see docs/frontend_api_integration_guide.md for API documentation
 */

// ============================================
// Curriculum Browsing Types
// ============================================

/**
 * Subject - Top-level curriculum area
 */
export interface Subject {
    id: string;
    name: string;
    grade: number;
    display_name: string;
    created_at: string;
}

/**
 * Lesson - Collection of related concepts within a subject
 */
export interface Lesson {
    id: string;
    subject_id: string;
    title: string;
    display_name: string;
    order: number;
    created_at: string;
}

/**
 * Concept - Smallest unit of learning
 */
export interface Concept {
    id: string;
    lesson_id: string;
    title: string;
    source_text: string;
    order: number;
    created_at: string;
}

// ============================================
// Learning Runtime Types
// ============================================

/**
 * Hook - Engaging opener for a concept
 */
export interface Hook {
    type: 'question' | 'fact' | 'story';
    content: string;
}

/**
 * Dose - Core content explaining the concept
 */
export interface Dose {
    text: string;
    media: { type: string; url: string } | null;
}

/**
 * Adaptive Explain - Alternative explanations for failures
 */
export interface AdaptiveExplain {
    simplified: string[];
    analogies: string[];
}

/**
 * Experiment - Interactive exercise
 */
export interface Experiment {
    type: 'mcq' | 'drag_drop' | 'fill_blank';
    question: string;
    options: string[];
    correct_index: number;
}

/**
 * Why - Reflection prompt
 */
export interface Why {
    prompt: string;
}

/**
 * Exit Challenge - Final assessment
 */
export interface ExitChallenge {
    question: string;
    answer: string;
}

/**
 * Reward - XP and achievements
 */
export interface Reward {
    xp: number;
}

/**
 * Learning Flow - Complete learning flow for a concept
 */
export interface LearningFlow {
    concept_id: string;
    version: number;
    generated_at: string;
    story_context: string;
    hooks: Hook[];
    dose: Dose;
    adaptive_explain: AdaptiveExplain;
    experiment: Experiment;
    why: Why;
    exit_challenge: ExitChallenge;
    reward: Reward;
}

/**
 * Progress - Student's progress on a concept
 */
export interface Progress {
    id: string;
    student_id: string;
    concept_id: string;
    status: 'not_started' | 'started' | 'completed';
    failed_attempts: number;
    last_step: string;
    updated_at: string;
}

/**
 * Adaptive Recommendation - Backend's recommendation for what to show
 */
export interface AdaptiveRecommendation {
    action: 'continue' | 'show_simplified_explain' | 'show_analogy' | 'restart_from_dose' | 'celebrate_resilience';
    message: string | null;
    show: string | null;
    hook_index: number;
    current_hook: Hook;
    bonus_xp?: number;
    suggest_chat?: boolean;
    simplified?: string;
}

/**
 * Learning Session - Complete response from /runtime/learn/start
 */
export interface LearningSession {
    flow: LearningFlow;
    progress: Progress;
    adaptive: AdaptiveRecommendation;
}

// ============================================
// Error Types
// ============================================

/**
 * API Error Response
 */
export interface ApiErrorResponse {
    detail: string | ValidationError[];
}

/**
 * Validation Error (422 responses)
 */
export interface ValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}

/**
 * Rate Limit Error Response
 */
export interface RateLimitError {
    error: 'rate_limit_exceeded';
    message: string;
    detail: string;
    retry_after: string;
}
