'use client';

import React from 'react';
import { Skeleton } from '@/components/ui';
import { LessonCard } from './LessonCard';
import type { Lesson } from '../types';
import styles from './LessonList.module.css';

interface LessonListProps {
    lessons: Lesson[] | undefined;
    subjectId: string;
    isLoading?: boolean;
    error?: Error | null;
}

/**
 * LessonList Component
 * 
 * Displays an ordered list of lessons for a subject.
 * Handles loading and empty states.
 */
export function LessonList({ lessons, subjectId, isLoading, error }: LessonListProps) {
    // Loading state
    if (isLoading) {
        return (
            <div className={styles.list}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={styles.skeletonCard}>
                        <Skeleton variant="rectangular" height={60} />
                    </div>
                ))}
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles.error}>
                <p>عذراً، حدث خطأ أثناء تحميل الدروس</p>
                <p className={styles.errorDetail}>{error.message}</p>
            </div>
        );
    }

    // Empty state
    if (!lessons || lessons.length === 0) {
        return (
            <div className={styles.empty}>
                <span className={styles.emptyIcon}>📝</span>
                <p>لا توجد دروس متاحة حالياً</p>
            </div>
        );
    }

    // Render list
    return (
        <div className={styles.list}>
            {lessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} subjectId={subjectId} />
            ))}
        </div>
    );
}

export default LessonList;
