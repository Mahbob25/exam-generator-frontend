'use client';

import React from 'react';
import { Card, Button } from '@/components/ui';
import type { AdaptiveExplain } from '../types';
import styles from './AdaptiveMessage.module.css';

interface AdaptiveMessageProps {
    adaptive: AdaptiveExplain;
    failedAttempts: number;
    onContinue: () => void;
}

/**
 * AdaptiveMessage Component
 * 
 * Shows helpful content after a student fails an experiment.
 * Displays simplified explanations or analogies based on attempt count.
 */
export function AdaptiveMessage({ adaptive, failedAttempts, onContinue }: AdaptiveMessageProps) {
    // Choose content based on failed attempts
    const simplifiedIndex = Math.min(failedAttempts - 1, adaptive.simplified.length - 1);
    const analogyIndex = Math.min(failedAttempts - 1, adaptive.analogies.length - 1);

    const showSimplified = failedAttempts <= adaptive.simplified.length;
    const showAnalogy = !showSimplified && failedAttempts <= adaptive.simplified.length + adaptive.analogies.length;

    const content = showSimplified
        ? adaptive.simplified[simplifiedIndex]
        : adaptive.analogies[analogyIndex];

    return (
        <div className={styles.container}>
            <Card variant="elevated" className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.icon}>
                        {showSimplified ? '📝' : '💡'}
                    </span>
                    <span className={styles.title}>
                        {showSimplified ? 'لنبسط الأمر' : 'فكر في الأمر هكذا'}
                    </span>
                </div>

                <p className={styles.encouragement}>
                    لا بأس! كل خطأ يقربنا من الفهم الصحيح 💪
                </p>

                <div className={styles.content}>
                    <p>{content}</p>
                </div>

                <p className={styles.tip}>
                    خذ وقتك لفهم هذا الشرح، ثم حاول مرة أخرى
                </p>
            </Card>

            <Button
                variant="primary"
                size="lg"
                onClick={onContinue}
                className={styles.continueButton}
            >
                فهمت! أريد المحاولة مجدداً
            </Button>
        </div>
    );
}

export default AdaptiveMessage;
