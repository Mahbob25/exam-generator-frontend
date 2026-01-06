'use client';

import React from 'react';
import { Skeleton } from '@/components/ui';
import { SubjectCard } from './SubjectCard';
import type { Subject } from '../types';
import styles from './SubjectGrid.module.css';

interface SubjectGridProps {
    subjects: Subject[] | undefined;
    isLoading?: boolean;
    error?: Error | null;
}

/**
 * SubjectGrid Component
 * 
 * Displays a responsive grid of subject cards.
 * Handles loading and empty states.
 */
export function SubjectGrid({ subjects, isLoading, error }: SubjectGridProps) {
    // Loading state
    if (isLoading) {
        return (
            <div className={styles.grid}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={styles.skeletonCard}>
                        <Skeleton variant="rectangular" height={80} />
                    </div>
                ))}
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles.error}>
                <p>عذراً، حدث خطأ أثناء تحميل المواد</p>
                <p className={styles.errorDetail}>{error.message}</p>
            </div>
        );
    }

    // Empty state
    if (!subjects || subjects.length === 0) {
        return (
            <div className={styles.empty}>
                <span className={styles.emptyIcon}>📚</span>
                <p>لا توجد مواد متاحة حالياً</p>
            </div>
        );
    }

    // Render grid
    return (
        <div className={styles.grid}>
            {subjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
            ))}
        </div>
    );
}

export default SubjectGrid;
