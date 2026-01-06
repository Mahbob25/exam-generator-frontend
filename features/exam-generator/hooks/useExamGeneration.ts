'use client';

import { useEffect, useRef } from 'react';
import { useExamStore } from '../store';
import { examApi } from '@/lib/api/exam';
import { useToast } from '@/components/ui'; // Use new toast

/**
 * Hook to manage exam generation process (polling)
 */
export function useExamGeneration() {
    const {
        jobId,
        status,
        updateJobStatus,
        completeJob,
        failJob
    } = useExamStore();

    const toast = useToast();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // If we have a jobId and status is not completed/failed, assume we need to poll
        // (e.g. page refresh or continued session)
        if (jobId && (!status || (status.status !== 'COMPLETED' && status.status !== 'FAILED'))) {
            startPolling(jobId);
        }

        return () => stopPolling();
    }, [jobId]);

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const startPolling = (id: string) => {
        stopPolling(); // Ensure no duplicates

        intervalRef.current = setInterval(async () => {
            try {
                const newStatus = await examApi.pollJobStatus(id);
                updateJobStatus(newStatus, newStatus.progress);

                if (newStatus.status === 'COMPLETED') {
                    stopPolling();
                    if (newStatus.result) {
                        completeJob(newStatus.result);
                        toast.success('تم توليد الأسئلة بنجاح!');
                    } else {
                        failJob('تم الانتهاء ولكن لا توجد أسئلة');
                        toast.error('فشل في استلام الأسئلة');
                    }
                } else if (newStatus.status === 'FAILED') {
                    stopPolling();
                    const errorMsg = newStatus.error || 'فشل التوليد';
                    failJob(errorMsg);
                    toast.error(errorMsg);
                }
            } catch (err) {
                console.error('Polling error:', err);
                // Don't simplify fail on network error, keep retrying or let user retry manually?
                // Legacy code cleared interval. Let's keep retrying for a bit or just warn.
                // For now, allow retry on next interval.
            }
        }, 2000);
    };

    return {
        isGenerating: !!jobId && status?.status !== 'COMPLETED',
        progress: status?.progress || '',
    };
}
