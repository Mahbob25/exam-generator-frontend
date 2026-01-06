'use client';

import React from 'react';
import { LEARNING_STEPS } from '../types';
import type { LearningStep } from '@/lib/types/common';
import styles from './StepIndicator.module.css';

interface StepIndicatorProps {
    currentStep: LearningStep;
    failedAttempts?: number;
}

/**
 * StepIndicator Component
 * 
 * Shows progress through the 5 learning stages.
 */
export function StepIndicator({ currentStep, failedAttempts = 0 }: StepIndicatorProps) {
    const currentIndex = LEARNING_STEPS.findIndex(s => s.id === currentStep);

    return (
        <div className={styles.container}>
            <div className={styles.steps}>
                {LEARNING_STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isPending = index > currentIndex;

                    return (
                        <React.Fragment key={step.id}>
                            <div
                                className={`
                  ${styles.step} 
                  ${isCompleted ? styles.completed : ''} 
                  ${isCurrent ? styles.current : ''} 
                  ${isPending ? styles.pending : ''}
                `}
                            >
                                <span className={styles.icon}>{step.icon}</span>
                                <span className={styles.label}>{step.label}</span>
                            </div>
                            {index < LEARNING_STEPS.length - 1 && (
                                <div className={`${styles.connector} ${isCompleted ? styles.connectorCompleted : ''}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            {failedAttempts > 0 && (
                <div className={styles.attempts}>
                    محاولات: {failedAttempts}
                </div>
            )}
        </div>
    );
}

export default StepIndicator;
