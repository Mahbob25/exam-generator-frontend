'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import type { Reward } from '../types';
import styles from './CelebrationScreen.module.css';

interface CelebrationScreenProps {
    reward: Reward;
    bonusXp?: number;
    conceptTitle: string;
    onContinue: () => void;
}

/**
 * CelebrationScreen Component
 * 
 * Shows success animation and XP earned after completing a concept.
 */
export function CelebrationScreen({
    reward,
    bonusXp = 0,
    conceptTitle,
    onContinue
}: CelebrationScreenProps) {
    const [showContent, setShowContent] = useState(false);
    const totalXp = reward.xp + bonusXp;

    useEffect(() => {
        // Delay content to allow animation
        const timer = setTimeout(() => setShowContent(true), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.confetti}>
                {Array.from({ length: 50 }).map((_, i) => (
                    <div
                        key={i}
                        className={styles.confettiPiece}
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
                        }}
                    />
                ))}
            </div>

            <div className={`${styles.content} ${showContent ? styles.contentVisible : ''}`}>
                <div className={styles.trophy}>🏆</div>

                <h1 className={styles.title}>أحسنت!</h1>

                <p className={styles.subtitle}>
                    لقد أكملت مفهوم "{conceptTitle}" بنجاح!
                </p>

                <div className={styles.xpContainer}>
                    <div className={styles.xpBadge}>
                        <span className={styles.xpLabel}>نقاط الخبرة</span>
                        <span className={styles.xpValue}>+{totalXp} XP</span>
                    </div>
                    {bonusXp > 0 && (
                        <p className={styles.bonusText}>
                            🎁 مكافأة المثابرة: +{bonusXp} XP
                        </p>
                    )}
                </div>

                <Button
                    variant="primary"
                    size="lg"
                    onClick={onContinue}
                    className={styles.continueButton}
                >
                    العودة للدرس
                </Button>
            </div>
        </div>
    );
}

export default CelebrationScreen;
