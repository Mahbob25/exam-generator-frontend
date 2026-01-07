"use server";

/**
 * Exam Generator API Module
 * 
 * API functions for the exam generation feature.
 * This is a Server Action file - all functions run on the server.
 * 
 * NOTE: This module uses server-side API key authentication (X-API-Key header),
 * not Firebase auth tokens. This is different from the learning runtime APIs.
 */

import type {
    GenerationRequest,
    JobResponse,
    JobStatus,
    TopicResponse,
    QuestionFeedback
} from '@/lib/types';

// Use env var directly - runs on server so we have access to non-NEXT_PUBLIC vars
const API_BASE_URL = process.env.NEXT_PUBLIC_EXAM_API_URL || 'http://localhost:8000';
const BACKEND_API_KEY = process.env.BACKEND_API_KEY;

// Debug logging (will show in server terminal)
console.log('[ExamAPI] Module loaded. Base URL:', API_BASE_URL);
console.log('[ExamAPI] API Key present:', !!BACKEND_API_KEY);

/**
 * API Endpoints for Exam Generator
 */
const ENDPOINTS = {
    health: '/',
    topics: (grade: number, subject: string) => `/topics/${grade}/${subject}`,
    generate: '/generate',
    job: (jobId: string) => `/jobs/${jobId}`,
    meta: '/meta',
    metaIndexing: '/meta/indexing',
    feedback: '/feedback',
    feedbackGeneral: '/feedback/general',
    indexKnowledge: '/index-knowledge',
} as const;

/**
 * Get request headers with API key for server-side auth
 */
function getHeaders(apiKey?: string): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    const key = apiKey || BACKEND_API_KEY;
    if (key) {
        headers['X-API-Key'] = key;
    } else {
        console.warn('[ExamAPI] Warning: No API Key found!');
    }

    return headers;
}

// ============================================
// Exam Generation Functions
// ============================================

/**
 * Check backend health status
 */
export async function checkHealth(): Promise<{ status: string; message: string }> {
    console.log('[ExamAPI] checkHealth called');
    const res = await fetch(`${API_BASE_URL}${ENDPOINTS.health}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
}

/**
 * Fetch available topics for a grade and subject
 */
export async function fetchTopics(grade: number, subject: string): Promise<string[]> {
    const url = `${API_BASE_URL}${ENDPOINTS.topics(grade, subject)}`;
    console.log(`[ExamAPI] fetchTopics called: ${url}`);

    const res = await fetch(url, {
        headers: getHeaders(),
        cache: 'no-store',
    });

    if (!res.ok) {
        const text = await res.text();
        console.error(`[ExamAPI] fetchTopics error: ${res.status} ${text}`);
        throw new Error(`Failed to fetch topics: ${res.status} ${text}`);
    }

    const data: TopicResponse = await res.json();
    return data.topics;
}

/**
 * Start question generation job
 */
export async function generateQuestions(payload: GenerationRequest): Promise<JobResponse> {
    const url = `${API_BASE_URL}${ENDPOINTS.generate}`;
    console.log(`[ExamAPI] generateQuestions called: ${url}`);

    const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error(`[ExamAPI] generateQuestions error: ${res.status} ${text}`);
        throw new Error(`Generation failed: ${res.status} ${text}`);
    }

    return res.json();
}

/**
 * Poll job status
 */
export async function pollJobStatus(jobId: string, apiKey?: string): Promise<JobStatus> {
    const url = `${API_BASE_URL}${ENDPOINTS.job(jobId)}`;
    console.log(`[ExamAPI] pollJobStatus called: ${url}`);

    const res = await fetch(url, {
        headers: getHeaders(apiKey),
        cache: 'no-store',
    });

    if (!res.ok) {
        const text = await res.text();
        console.error(`[ExamAPI] pollJobStatus error: ${res.status} ${text}`);
        throw new Error(`Failed to poll job status: ${res.status} ${text}`);
    }

    return res.json();
}

/**
 * Fetch quiz metadata (grades and subjects)
 */
export async function fetchMetadata(): Promise<{
    grades: number[];
    subjects: Record<number, { id: string; name: string }[]>;
}> {
    const url = `${API_BASE_URL}${ENDPOINTS.meta}`;
    console.log(`[ExamAPI] fetchMetadata called: ${url}`);

    const res = await fetch(url, {
        headers: getHeaders(),
        cache: 'no-store',
    });

    console.log(`[ExamAPI] fetchMetadata response status: ${res.status}`);

    if (!res.ok) {
        const text = await res.text();
        console.error(`[ExamAPI] fetchMetadata error: ${text}`);
        throw new Error(`Failed to fetch metadata: ${res.status} ${text}`);
    }

    return res.json();
}

/**
 * Fetch indexing metadata (from config file)
 */
export async function fetchIndexingMetadata(): Promise<{
    grades: number[];
    subjects: Record<number, { id: string; name: string }[]>;
}> {
    const url = `${API_BASE_URL}${ENDPOINTS.metaIndexing}`;
    console.log(`[ExamAPI] fetchIndexingMetadata called: ${url}`);

    const res = await fetch(url, {
        headers: getHeaders(),
        cache: 'no-store',
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch indexing metadata: ${res.status} ${text}`);
    }

    return res.json();
}

// ============================================
// Feedback Functions
// ============================================

/**
 * Submit question-specific feedback
 */
export async function submitQuestionFeedback(
    feedback: QuestionFeedback
): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}${ENDPOINTS.feedback}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(feedback),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Feedback submission failed: ${res.status} ${text}`);
    }

    return res.json();
}

/**
 * Submit general feedback
 */
export async function submitGeneralFeedback(feedback: {
    type: string;
    message: string;
    page?: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; message: string; feedback_id?: string }> {
    const res = await fetch(`${API_BASE_URL}${ENDPOINTS.feedbackGeneral}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(feedback),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`General feedback submission failed: ${res.status} ${text}`);
    }

    return res.json();
}

// ============================================
// Knowledge Indexing Functions
// ============================================

export interface KnowledgeIndexingRequest {
    subject: string;
    grade: number;
    topic: string;
    raw_text: string;
    metadata?: Record<string, unknown>;
}

export interface KnowledgeIndexingResponse {
    job_id: string;
    status: string;
    message: string;
}

/**
 * Submit knowledge for indexing
 */
export async function indexKnowledge(
    payload: KnowledgeIndexingRequest,
    apiKey?: string
): Promise<KnowledgeIndexingResponse> {
    const res = await fetch(`${API_BASE_URL}${ENDPOINTS.indexKnowledge}`, {
        method: 'POST',
        headers: getHeaders(apiKey),
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Knowledge indexing failed: ${res.status} ${text}`);
    }

    return res.json();
}

