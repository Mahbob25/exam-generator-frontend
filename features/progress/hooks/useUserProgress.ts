'use client';

import { useState, useEffect } from 'react';
import { useLearningStore } from '@/lib/store';

export interface UserProgress {
    hasProgress: boolean;
    lastConceptId?: string;
    stepProgress?: number; // 0-100 or step index
    isLoading: boolean;
}

export function useUserProgress(): UserProgress {
    const [progress, setProgress] = useState<UserProgress>({
        hasProgress: false,
        isLoading: true,
    });

    // Subscribe to store changes to keep UI in sync if session starts while on dashboard
    const session = useLearningStore((state) => state.session);

    useEffect(() => {
        const checkProgress = () => {
            // 1. Check active session in store
            if (session) {
                const STEP_ORDER = ['hook', 'dose', 'experiment', 'why', 'exit_challenge'];
                // Cast last_step to string to check index, fallback to 0
                const lastStep = session.progress.last_step;
                const stepIndex = STEP_ORDER.indexOf(lastStep);

                setProgress({
                    hasProgress: true,
                    lastConceptId: session.progress.concept_id,
                    stepProgress: stepIndex > -1 ? stepIndex + 1 : 1,
                    isLoading: false,
                });
                return;
            }

            // 2. Check localStorage for persisted progress
            // This is a simulation until we have a real backend endpoint for "last active session"
            try {
                const lastConceptId = localStorage.getItem('last_concept_id');
                const lastStepIndex = localStorage.getItem('last_step_index');

                if (lastConceptId) {
                    setProgress({
                        hasProgress: true,
                        lastConceptId,
                        stepProgress: lastStepIndex ? parseInt(lastStepIndex, 10) : 0,
                        isLoading: false,
                    });
                } else {
                    setProgress({
                        hasProgress: false,
                        isLoading: false,
                    });
                }
            } catch (error) {
                console.error('Failed to read progress from storage:', error);
                setProgress({ hasProgress: false, isLoading: false });
            }
        };

        checkProgress();
    }, [session]);

    return progress;
}
