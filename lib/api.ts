"use server";

import { GenerationRequest, JobResponse, JobStatus, TopicResponse, QuestionFeedback } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.BACKEND_API_KEY;

function getHeaders() {
    return {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY || "",
    };
}

export async function checkHealth(): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
}

export async function fetchTopics(grade: number, subject: string): Promise<string[]> {
    const url = `${API_BASE_URL}/topics/${grade}/${subject}`;
    try {
        const res = await fetch(url, {
            headers: getHeaders(),
            cache: "no-store",
        });
        if (!res.ok) {
            const text = await res.text();
            console.error(`[API Error] fetchTopics failed. Status: ${res.status}, URL: ${url}, Response: ${text}`);
            throw new Error(`Failed to fetch topics: ${res.status} ${text}`);
        }
        const data: TopicResponse = await res.json();
        return data.topics;
    } catch (error) {
        console.error(`[API Exception] fetchTopics error:`, error);
        throw error;
    }
}

export async function generateQuestions(payload: GenerationRequest): Promise<JobResponse> {
    const url = `${API_BASE_URL}/generate`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`[API Error] generateQuestions failed. Status: ${res.status}, URL: ${url}, Response: ${errorText}`);
            throw new Error(`Generation failed: ${res.status} ${errorText}`);
        }
        return res.json();
    } catch (error) {
        console.error(`[API Exception] generateQuestions error:`, error);
        throw error;
    }
}

export async function pollJobStatus(jobId: string): Promise<JobStatus> {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        headers: getHeaders(),
        cache: "no-store", // Ensure we always get fresh status
    });
    if (!res.ok) throw new Error("Failed to poll job status");
    return res.json();
}

export async function fetchMetadata(): Promise<{ grades: number[]; subjects: Record<number, { id: string; name: string }[]> }> {
    const url = `${API_BASE_URL}/meta`;
    try {
        const res = await fetch(url, {
            headers: getHeaders(),
            cache: "no-store", // Disable caching for development
        });
        if (!res.ok) {
            const text = await res.text();
            console.error(`[API Error] fetchMetadata failed. Status: ${res.status}, URL: ${url}, Response: ${text}`);
            throw new Error(`Failed to fetch metadata: ${res.status} ${text}`);
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.error(`[API Exception] fetchMetadata error:`, error);
        throw error;
    }
}

// Fetch metadata for indexing page (uses config file)
export async function fetchIndexingMetadata(): Promise<{ grades: number[]; subjects: Record<number, { id: string; name: string }[]> }> {
    const url = `${API_BASE_URL}/meta/indexing`;
    try {
        const res = await fetch(url, {
            headers: getHeaders(),
            cache: "no-store",
        });
        if (!res.ok) {
            const text = await res.text();
            console.error(`[API Error] fetchIndexingMetadata failed. Status: ${res.status}, URL: ${url}, Response: ${text}`);
            throw new Error(`Failed to fetch indexing metadata: ${res.status} ${text}`);
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.error(`[API Exception] fetchIndexingMetadata error:`, error);
        throw error;
    }
}

export async function submitQuestionFeedback(feedback: QuestionFeedback): Promise<{ success: boolean; message: string }> {
    const url = `${API_BASE_URL}/feedback`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(feedback),
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`[API Error] submitQuestionFeedback failed. Status: ${res.status}, URL: ${url}, Response: ${errorText}`);
            throw new Error(`Feedback submission failed: ${res.status} ${errorText}`);
        }
        return res.json();
    } catch (error) {
        console.error(`[API Exception] submitQuestionFeedback error:`, error);
        throw error;
    }
}

export async function submitGeneralFeedback(
    feedback: { type: string; message: string; page?: string; timestamp: number; metadata?: Record<string, any> }
): Promise<{ success: boolean; message: string; feedback_id?: string }> {
    const url = `${API_BASE_URL}/feedback/general`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(feedback),
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`[API Error] submitGeneralFeedback failed. Status: ${res.status}, URL: ${url}, Response: ${errorText}`);
            throw new Error(`General feedback submission failed: ${res.status} ${errorText}`);
        }
        return res.json();
    } catch (error) {
        console.error(`[API Exception] submitGeneralFeedback error:`, error);
        throw error;
    }
}

// Knowledge indexing types
export interface KnowledgeIndexingRequest {
    subject: string;
    grade: number;
    topic: string;
    raw_text: string;
    metadata?: Record<string, any>;
}

export interface KnowledgeIndexingResponse {
    job_id: string;
    status: string;
    message: string;
}

// Client-side API call for knowledge indexing (requires API key in params)
export async function indexKnowledge(
    payload: KnowledgeIndexingRequest,
    apiKey?: string
): Promise<KnowledgeIndexingResponse> {
    const url = `${API_BASE_URL}/index-knowledge`;
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        // Use provided API key or fall back to environment variable
        if (apiKey) {
            headers["X-API-Key"] = apiKey;
        } else if (API_KEY) {
            headers["X-API-Key"] = API_KEY;
        }

        const res = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`[API Error] indexKnowledge failed. Status: ${res.status}, URL: ${url}, Response: ${errorText}`);
            throw new Error(`Knowledge indexing failed: ${res.status} ${errorText}`);
        }
        return res.json();
    } catch (error) {
        console.error(`[API Exception] indexKnowledge error:`, error);
        throw error;
    }
}

// Client-side job status polling (requires API key in params)
export async function pollJobStatusClient(jobId: string, apiKey?: string): Promise<JobStatus> {
    const headers: Record<string, string> = {};

    if (apiKey) {
        headers["X-API-Key"] = apiKey;
    } else if (API_KEY) {
        headers["X-API-Key"] = API_KEY;
    }

    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        headers,
        cache: "no-store",
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to poll job status: ${res.status} ${errorText}`);
    }
    return res.json();
}
