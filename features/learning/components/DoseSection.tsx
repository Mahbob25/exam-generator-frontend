'use client';

import React from 'react';
import { Card, Button } from '@/components/ui';
import type { Dose } from '../types';
import styles from './DoseSection.module.css';

interface DoseSectionProps {
    dose: Dose;
    storyContext?: string | null;
    onContinue: () => void;
}

/**
 * DoseSection Component
 * 
 * Displays the main learning content (the "dose" of knowledge).
 */
export function DoseSection({ dose, storyContext, onContinue }: DoseSectionProps) {
    return (
        <div className={styles.container}>
            {storyContext && (
                <div className={styles.context}>
                    <span className={styles.contextIcon}>📚</span>
                    <p className={styles.contextText}>{storyContext}</p>
                </div>
            )}

            <Card variant="elevated" className={styles.card}>
                <div className={styles.content}>
                    <p className={styles.text}>{dose.text}</p>

                    {dose.media && (
                        <div className={styles.media}>
                            {dose.media.type === 'image' && (
                                <img
                                    src={dose.media.url}
                                    alt={'توضيح'}
                                    className={styles.image}
                                />
                            )}
                            {dose.media.type === 'video' && (
                                <video
                                    src={dose.media.url}
                                    controls
                                    className={styles.video}
                                />
                            )}
                        </div>
                    )}
                </div>
            </Card>

            <Button
                variant="primary"
                size="lg"
                onClick={onContinue}
                className={styles.continueButton}
            >
                فهمت! استمرار ←
            </Button>
        </div>
    );
}

export default DoseSection;
