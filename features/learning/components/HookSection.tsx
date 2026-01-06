'use client';

import React from 'react';
import { Card, Button } from '@/components/ui';
import type { Hook } from '../types';
import styles from './HookSection.module.css';

interface HookSectionProps {
    hook: Hook;
    onContinue: () => void;
}

/**
 * HookSection Component
 * 
 * Displays the hook (attention grabber) at the start of learning.
 */
export function HookSection({ hook, onContinue }: HookSectionProps) {
    const getHookIcon = (type: string) => {
        switch (type) {
            case 'question': return '❓';
            case 'fact': return '💡';
            case 'story': return '📖';
            default: return '🎯';
        }
    };

    return (
        <div className={styles.container}>
            <Card variant="elevated" className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.icon}>{getHookIcon(hook.type)}</span>
                    <span className={styles.type}>
                        {hook.type === 'question' && 'سؤال للتفكير'}
                        {hook.type === 'fact' && 'هل تعلم؟'}
                        {hook.type === 'story' && 'قصة'}
                    </span>
                </div>
                <p className={styles.content}>{hook.content}</p>
            </Card>

            <Button
                variant="primary"
                size="lg"
                onClick={onContinue}
                className={styles.continueButton}
            >
                استمرار ←
            </Button>
        </div>
    );
}

export default HookSection;
