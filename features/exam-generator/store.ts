'use client';

/**
 * Exam Store
 * 
 * Manages state for the exam generator feature (generation settings, active job, results).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, JobStatus } from './types';

interface ExamState {
    // Generation Settings
    settings: {
        subject: string;
        grade: number;
        topics: string[];
        timerEnabled: boolean;
        duration: number;
    };

    // Job State
    jobId: string | null;
    status: JobStatus | null;
    progress: string;

    // Results
    questions: Question[];
    currentQuestionIndex: number;
    answers: Record<number, boolean>;
    score: number;
    isFinished: boolean; // Renamed from showResults for clarity

    // Actions
    setSettings: (settings: Partial<ExamState['settings']>) => void;
    startJob: (jobId: string) => void;
    updateJobStatus: (status: JobStatus, progress?: string) => void;
    completeJob: (questions: Question[]) => void;
    failJob: (error: string) => void;
    resetJob: () => void;

    // Exam Taking Actions
    answerQuestion: (index: number, isCorrect: boolean) => void;
    finishExam: () => void;
    retakeExam: () => void;
    resetAll: () => void;
}

const initialState = {
    settings: {
        subject: '',
        grade: 12, // Default to 12 as per legacy
        topics: [],
        timerEnabled: false,
        duration: 1,
    },
    jobId: null,
    status: null,
    progress: '',
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    score: 0,
    isFinished: false,
};

export const useExamStore = create<ExamState>()(
    persist(
        (set, get) => ({
            ...initialState,

            setSettings: (newSettings) =>
                set((state) => ({ settings: { ...state.settings, ...newSettings } })),

            startJob: (jobId) =>
                set({
                    jobId,
                    status: {
                        job_id: jobId,
                        status: 'PENDING',
                        progress: 'Starting...',
                        created_at: Date.now()
                    },
                    progress: 'Starting...',
                    questions: [], // Clear previous results
                    isFinished: false,
                    score: 0,
                    answers: {},
                }),

            updateJobStatus: (status, progress) =>
                set((state) => ({
                    status,
                    progress: progress || state.progress
                })),

            completeJob: (questions) =>
                set({
                    questions,
                    status: null,
                    jobId: null, // Job is done
                    progress: '',
                    // Ready to take exam
                    currentQuestionIndex: 0,
                    answers: {},
                    score: 0,
                    isFinished: false,
                }),

            failJob: (error) =>
                set({
                    status: null, // Clear status to stop polling
                    progress: error,
                    // Keep jobId to allow retry? Or clear? 
                    // Legacy cleared it.
                    jobId: null,
                }),

            resetJob: () =>
                set({
                    jobId: null,
                    status: null,
                    progress: '',
                }),

            answerQuestion: (index, isCorrect) => {
                const { answers, score } = get();
                if (answers[index] !== undefined) return; // Already answered

                const newAnswers = { ...answers, [index]: isCorrect };
                const newScore = isCorrect ? score + 1 : score;

                set({ answers: newAnswers, score: newScore });
            },

            finishExam: () => set({ isFinished: true }),

            retakeExam: () => {
                const { questions } = get();
                // Shuffle questions logic should be handled by the component or a helper, 
                // but for now let's just reset the state.
                // Deep shuffling is complex in store, might be better to keep in hook/component
                // or add a helper here.
                // For simple state reset:
                set({
                    answers: {},
                    score: 0,
                    isFinished: false,
                    currentQuestionIndex: 0,
                });
            },

            resetAll: () => set(initialState),
        }),
        {
            name: 'alp-exam-storage',
            partialize: (state) => ({
                // Persist settings and active job info
                settings: state.settings,
                jobId: state.jobId,
                status: state.status, // To resume polling
                questions: state.questions, // To keep results after refresh
            }),
        }
    )
);
