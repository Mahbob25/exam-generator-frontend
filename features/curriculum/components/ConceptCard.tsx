'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import type { Concept } from '../types';
import styles from './ConceptCard.module.css';

interface ConceptCardProps {
    concept: Concept;
    subjectId: string;
    lessonId: string;
    /** Whether concept is completed by current user */
    isCompleted?: boolean;
    /** Whether concept is locked (requires previous concepts) */
    isLocked?: boolean;
}

/**
 * ConceptCard Component
 * 
 * Displays a concept with title and completion status.
 * Links to the learning page for that concept.
 */
export function ConceptCard({
    concept,
    subjectId,
    lessonId,
    isCompleted = false,
    isLocked = false
}: ConceptCardProps) {
    const href = `/learn/${subjectId}/${lessonId}/${concept.id}`;

    // Status indicator
    const statusIcon = isCompleted ? '✓' : isLocked ? '🔒' : '○';
    const statusClass = isCompleted ? styles.completed : isLocked ? styles.locked : styles.pending;

    if (isLocked) {
        return (
            <Card variant="outlined" className={`${styles.card} ${styles.cardLocked}`}>
                <div className={styles.content}>
                    <span className={`${styles.status} ${statusClass}`}>{statusIcon}</span>
                    <div className={styles.info}>
                        <h3 className={styles.title}>{concept.title}</h3>
                        <span className={styles.lockedText}>أكمل المفاهيم السابقة أولاً</span>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Link href={href} className={styles.link}>
            <Card variant="interactive" className={styles.card}>
                <div className={styles.content}>
                    <span className={`${styles.status} ${statusClass}`}>{statusIcon}</span>
                    <div className={styles.info}>
                        <h3 className={styles.title}>{concept.title}</h3>
                        {isCompleted && (
                            <span className={styles.completedText}>تم الإتمام</span>
                        )}
                    </div>
                    <span className={styles.arrow}>←</span>
                </div>
            </Card>
        </Link>
    );
}

export default ConceptCard;
