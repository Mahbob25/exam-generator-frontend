'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import type { Lesson } from '../types';
import styles from './LessonCard.module.css';

interface LessonCardProps {
    lesson: Lesson;
    subjectId: string;
}

/**
 * LessonCard Component
 * 
 * Displays a lesson with title and order number.
 * Links to the concepts page for that lesson.
 */
export function LessonCard({ lesson, subjectId }: LessonCardProps) {
    return (
        <Link href={`/learn/${subjectId}/${lesson.id}`} className={styles.link}>
            <Card variant="interactive" className={styles.card}>
                <div className={styles.content}>
                    <span className={styles.order}>{lesson.order}</span>
                    <div className={styles.info}>
                        <h3 className={styles.title}>{lesson.display_name || lesson.title}</h3>
                    </div>
                    <span className={styles.arrow}>←</span>
                </div>
            </Card>
        </Link>
    );
}

export default LessonCard;
