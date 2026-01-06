'use client';

import React, { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import type { Why } from '../types';
import styles from './WhySection.module.css';

interface WhySectionProps {
    why: Why;
    onContinue: () => void;
}

/**
 * WhySection Component
 * 
 * Reflection prompt where student explains their understanding.
 */
export function WhySection({ why, onContinue }: WhySectionProps) {
    const [response, setResponse] = useState('');

    const handleSubmit = () => {
        // For now, we just continue regardless of response
        // In future, this could be evaluated by AI
        onContinue();
    };

    return (
        <div className={styles.container}>
            <Card variant="elevated" className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.icon}>💡</span>
                    <span className={styles.title}>لماذا؟</span>
                </div>

                <p className={styles.prompt}>{why.prompt}</p>

                <textarea
                    className={styles.textarea}
                    placeholder="اكتب إجابتك هنا..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={4}
                    dir="rtl"
                />

                <p className={styles.hint}>
                    💭 هذا السؤال للتأمل الذاتي. أي إجابة صادقة مقبولة!
                </p>
            </Card>

            <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={response.trim().length < 5}
                className={styles.submitButton}
            >
                إرسال والاستمرار ←
            </Button>
        </div>
    );
}

export default WhySection;
