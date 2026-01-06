'use client';

import React from 'react';
import { Skeleton } from '@/components/ui';
import { ConceptCard } from './ConceptCard';
import type { Concept } from '../types';
import styles from './ConceptList.module.css';

interface ConceptListProps {
    concepts: Concept[] | undefined;
    subjectId: string;
    lessonId: string;
    isLoading?: boolean;
    error?: Error | null;
    /** Map of concept_id -> completion status (from progress API) */
    completedMap?: Record<string, boolean>;
}

/**
 * ConceptList Component
 * 
 * Displays an ordered list of concepts for a lesson.
 * Handles loading and empty states.
 */
export function ConceptList({
    concepts,
    subjectId,
    lessonId,
    isLoading,
    error,
    completedMap = {}
}: ConceptListProps) {
    // Loading state
    if (isLoading) {
        return (
            <div className={styles.list}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={styles.skeletonCard}>
                        <Skeleton variant="rectangular" height={56} />
                    </div>
                ))}
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles.error}>
                <p>عذراً، حدث خطأ أثناء تحميل المفاهيم</p>
                <p className={styles.errorDetail}>{error.message}</p>
            </div>
        );
    }

    // Empty state
    if (!concepts || concepts.length === 0) {
        return (
            <div className={styles.empty}>
                <span className={styles.emptyIcon}>💡</span>
                <p>لا توجد مفاهيم متاحة حالياً</p>
            </div>
        );
    }

    // Render list
    return (
        <div className={styles.list}>
            {concepts.map((concept) => (
                <ConceptCard
                    key={concept.id}
                    concept={concept}
                    subjectId={subjectId}
                    lessonId={lessonId}
                    isCompleted={completedMap[concept.id] || false}
                />
            ))}
        </div>
    );
}

export default ConceptList;
