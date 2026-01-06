'use client';

import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';
import type { ExitChallenge as ExitChallengeType } from '../types';
import styles from './ExitChallenge.module.css';

interface ExitChallengeProps {
    challenge: ExitChallengeType;
    onComplete: () => void;
}

/**
 * ExitChallenge Component
 * 
 * Final assessment to confirm concept mastery.
 */
export function ExitChallenge({ challenge, onComplete }: ExitChallengeProps) {
    const [response, setResponse] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);

    const handleSubmit = () => {
        setShowAnswer(true);
    };

    const handleConfirm = () => {
        onComplete();
    };

    return (
        <div className={styles.container}>
            <Card variant="elevated" className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.icon}>🏆</span>
                    <span className={styles.title}>التحدي النهائي</span>
                </div>

                <p className={styles.question}>{challenge.question}</p>

                {!showAnswer ? (
                    <>
                        <textarea
                            className={styles.textarea}
                            placeholder="اكتب إجابتك هنا..."
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            rows={4}
                            dir="rtl"
                        />

                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={response.trim().length < 5}
                            className={styles.submitButton}
                        >
                            إرسال الإجابة
                        </Button>
                    </>
                ) : (
                    <div className={styles.answerSection}>
                        <div className={styles.yourAnswer}>
                            <span className={styles.answerLabel}>إجابتك:</span>
                            <p>{response}</p>
                        </div>

                        <div className={styles.correctAnswer}>
                            <span className={styles.answerLabel}>الإجابة النموذجية:</span>
                            <p>{challenge.answer}</p>
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleConfirm}
                            className={styles.confirmButton}
                        >
                            🎉 أكملت التعلم!
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default ExitChallenge;
