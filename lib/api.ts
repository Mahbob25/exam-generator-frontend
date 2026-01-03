"use server";

import { GenerationRequest, JobResponse, JobStatus, TopicResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.BACKEND_API_KEY;

function getHeaders() {
    return {
        "Content-Type": "application/json",
        "x-api-key": API_KEY || "",
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
