'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    useStartLearning,
    useHandleFailure,
    useCompleteConcept,
    LearningSession,
} from '@/features/learning';
import { useLearningStore } from '@/lib/store';
import { QueryProvider } from '@/lib/query';
import { Spinner } from '@/components/ui';
import { PageContainer } from '@/components/layout';
import type { LearningStep } from '@/lib/types/common';
import styles from './page.module.css';

function ConceptPageContent() {
    const params = useParams();
    const router = useRouter();
    const conceptId = params.conceptId as string;
    const subjectId = params.subjectId as string;
    const lessonId = params.lessonId as string;

    const { session, isLoading, error, setCurrentStep } = useLearningStore();
    const { mutate: startLearning } = useStartLearning();
    const { mutate: handleFailure } = useHandleFailure();
    const { mutate: completeConcept } = useCompleteConcept();

    const [isCompleting, setIsCompleting] = useState(false);

    // Start learning on mount
    useEffect(() => {
        setCurrentStep('hook'); // Reset to hook step
        startLearning(conceptId);
    }, [conceptId, startLearning, setCurrentStep]);

    const handleRecordFailure = (step: LearningStep) => {
        handleFailure({ conceptId, step });
    };

    const handleRefreshSession = () => {
        startLearning(conceptId);
    };

    const handleComplete = async (result: { total_xp: number; bonus_xp: number }) => {
        setIsCompleting(true);
        completeConcept(conceptId);
    };

    // Loading state
    if (isLoading && !session) {
        return (
            <div className={styles.loadingContainer}>
                <Spinner size="lg" label="جاري تحميل الدرس..." />
                <p className={styles.loadingText}>جاري تحميل المفهوم...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <PageContainer
                title="خطأ"
                backButton={{
                    label: 'العودة',
                    onClick: () => router.back(),
                }}
            >
                <div className={styles.errorContainer}>
                    <span className={styles.errorIcon}>⚠️</span>
                    <p className={styles.errorText}>{error}</p>
                    <button
                        className={styles.retryButton}
                        onClick={() => startLearning(conceptId)}
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </PageContainer>
        );
    }

    // No session yet
    if (!session) {
        return (
            <div className={styles.loadingContainer}>
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <LearningSession
                session={session}
                onComplete={handleComplete}
                onRecordFailure={handleRecordFailure}
                onRefreshSession={handleRefreshSession}
            />
        </div>
    );
}

export default function ConceptPage() {
    return (
        <QueryProvider>
            <ConceptPageContent />
        </QueryProvider>
    );
}
