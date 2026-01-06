'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
    status?: string;
    progress?: string;
}

export function LoadingOverlay({ status, progress }: LoadingOverlayProps) {
    const [dots, setDots] = useState('.');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Animated dots effect
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '.' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Timer for elapsed time
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Parse progress to determine stage
    const getProgressStage = () => {
        if (!progress) return { percent: 10 };

        const lower = progress.toLowerCase();
        if (lower.includes('تحضير') || lower.includes('بدء')) {
            return { percent: 15 };
        } else if (lower.includes('استرجاع') || lower.includes('جاري البحث')) {
            return { percent: 35 };
        } else if (lower.includes('توليد') || lower.includes('إنشاء')) {
            return { percent: 65 };
        } else if (lower.includes('تحقق') || lower.includes('مراجعة')) {
            return { percent: 90 };
        } else if (lower.includes('اكتمل') || lower.includes('انتهى')) {
            return { percent: 100 };
        }
        return { percent: 50 };
    };

    const { percent } = getProgressStage();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.overlay}
                dir="rtl"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={styles.modal}
                >
                    <div className={styles.content}>
                        {/* Animated Icon */}
                        <div className={styles.iconContainer}>
                            <div className={styles.iconCircle}>
                                <Sparkles className={styles.icon} size={28} />
                            </div>
                        </div>

                        {/* Status Text */}
                        <div className={styles.statusContainer}>
                            <h3 className={styles.statusTitle}>
                                {status || 'جاري التوليد'}
                                <span className={styles.dots}>{dots}</span>
                            </h3>

                            {progress && (
                                <p className={styles.statusProgress}>
                                    {progress}
                                </p>
                            )}

                            {/* Elapsed Time */}
                            <p className={styles.statusTimer}>
                                الوقت المنقضي: {elapsedSeconds} ثانية
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className={styles.progressContainer}>
                            <div className={styles.progressTrack}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className={styles.progressBar}
                                >
                                    <div className={styles.shimmer} />
                                </motion.div>
                            </div>
                            <p className={styles.percentText}>
                                {percent}% مكتمل
                            </p>
                        </div>

                        {/* Stage Indicators */}
                        <div className={styles.stages}>
                            {[
                                { id: 'init', label: 'البدء', value: 10 },
                                { id: 'retrieval', label: 'البحث', value: 30 },
                                { id: 'generation', label: 'التوليد', value: 60 },
                                { id: 'validation', label: 'التحقق', value: 85 },
                            ].map((item) => (
                                <div
                                    key={item.id}
                                    className={`${styles.stage} ${percent >= item.value ? styles.stageActive : ''}`}
                                >
                                    <div className={styles.stageDot} />
                                    <span className={styles.stageLabel}>
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Helpful Tip */}
                        <div className={styles.tip}>
                            <p className={styles.tipText}>
                                💡 قد تستغرق هذه العملية دقيقة أو دقيقتين حسب عدد الأسئلة المطلوبة
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default LoadingOverlay;
