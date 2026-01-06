'use client';

import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';
import type { Experiment } from '../types';
import styles from './ExperimentSection.module.css';

interface ExperimentSectionProps {
    experiment: Experiment;
    onCorrect: () => void;
    onIncorrect: () => void;
}

/**
 * ExperimentSection Component
 * 
 * Interactive quiz component for testing understanding.
 * Currently supports MCQ type experiments.
 */
export function ExperimentSection({ experiment, onCorrect, onIncorrect }: ExperimentSectionProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const handleSelect = (index: number) => {
        if (isSubmitted) return;
        setSelectedIndex(index);
    };

    const handleSubmit = () => {
        if (selectedIndex === null) return;

        const correct = selectedIndex === experiment.correct_index;
        setIsCorrect(correct);
        setIsSubmitted(true);

        // Delay callback to show feedback
        setTimeout(() => {
            if (correct) {
                onCorrect();
            } else {
                onIncorrect();
            }
        }, 1500);
    };

    return (
        <div className={styles.container}>
            <Card variant="elevated" className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.icon}>🧪</span>
                    <span className={styles.title}>تجربة</span>
                </div>

                <p className={styles.question}>{experiment.question}</p>

                <div className={styles.options}>
                    {experiment.options.map((option, index) => {
                        const isSelected = selectedIndex === index;
                        const showCorrect = isSubmitted && index === experiment.correct_index;
                        const showIncorrect = isSubmitted && isSelected && !isCorrect;

                        return (
                            <button
                                key={index}
                                type="button"
                                className={`
                  ${styles.option}
                  ${isSelected ? styles.selected : ''}
                  ${showCorrect ? styles.correct : ''}
                  ${showIncorrect ? styles.incorrect : ''}
                `}
                                onClick={() => handleSelect(index)}
                                disabled={isSubmitted}
                            >
                                <span className={styles.optionLetter}>
                                    {String.fromCharCode(1571 + index)}
                                </span>
                                <span className={styles.optionText}>{option}</span>
                            </button>
                        );
                    })}
                </div>

                {isSubmitted && (
                    <div className={`${styles.feedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect}`}>
                        {isCorrect ? (
                            <>🎉 أحسنت! إجابة صحيحة</>
                        ) : (
                            <>❌ إجابة خاطئة، لا بأس سنساعدك</>
                        )}
                    </div>
                )}
            </Card>

            {!isSubmitted && (
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={selectedIndex === null}
                    className={styles.submitButton}
                >
                    تأكيد الإجابة
                </Button>
            )}
        </div>
    );
}

export default ExperimentSection;
