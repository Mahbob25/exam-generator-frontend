'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import type { Subject } from '../types';
import styles from './SubjectCard.module.css';

// Subject icons mapping
const subjectIcons: Record<string, string> = {
    science: '🔬',
    math: '📐',
    arabic: '📖',
    english: '🔤',
    social_studies: '🌍',
    islamic: '🕌',
    default: '📚',
};

interface SubjectCardProps {
    subject: Subject;
    /** Whether to show as loading skeleton */
    isLoading?: boolean;
}

/**
 * SubjectCard Component
 * 
 * Displays a subject with icon and grade.
 * Links to the lessons page for that subject.
 */
export function SubjectCard({ subject, isLoading }: SubjectCardProps) {
    const icon = subjectIcons[subject.name] || subjectIcons.default;

    if (isLoading) {
        return (
            <Card variant="outlined" className={styles.card} isLoading>
                <div className={styles.skeleton} />
            </Card>
        );
    }

    return (
        <Link href={`/learn/${subject.id}`} className={styles.link}>
            <Card variant="interactive" className={styles.card}>
                <div className={styles.content}>
                    <span className={styles.icon}>{icon}</span>
                    <div className={styles.info}>
                        <h3 className={styles.name}>{subject.display_name || subject.name}</h3>
                        <span className={styles.grade}>الصف {subject.grade}</span>
                    </div>
                </div>
                <span className={styles.arrow}>←</span>
            </Card>
        </Link>
    );
}

export default SubjectCard;
