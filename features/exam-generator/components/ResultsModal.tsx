'use client';

import { motion } from 'framer-motion';
import { Printer, RefreshCcw, Trophy, CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import styles from './ResultsModal.module.css';

interface ResultsModalProps {
    score: number;
    total: number;
    onRetake: () => void;
    onClose: () => void;
}

export function ResultsModal({ score, total, onRetake, onClose }: ResultsModalProps) {
    const percentage = Math.round((score / total) * 100);
    const isPassed = percentage >= 60;
    const isPerfect = percentage === 100;

    useEffect(() => {
        if (isPassed) {
            const end = Date.now() + 1000;
            const colors = ['#8b5cf6', '#d946ef', '#0ea5e9'];

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors,
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors,
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();
        }
    }, [isPassed]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={styles.overlay} dir="rtl">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={styles.modal}
            >
                <div className={`${styles.content} ${isPassed ? styles.passed : styles.failed}`}>
                    <div className={styles.iconCircle}>
                        {isPerfect ? (
                            <Trophy className={`${styles.icon} ${styles.iconPerfect}`} />
                        ) : isPassed ? (
                            <CheckCircle className={`${styles.icon} ${styles.iconSuccess}`} />
                        ) : (
                            <XCircle className={`${styles.icon} ${styles.iconFailure}`} />
                        )}
                    </div>

                    <h2 className={styles.title}>
                        {isPerfect ? 'ممتاز!' : isPassed ? 'أحسنت!' : 'حظاً أوفر'}
                    </h2>

                    <p className={styles.description}>
                        {isPassed
                            ? 'لقد أتممت الاختبار بنجاح.'
                            : 'لا بأس، يمكنك المحاولة مرة أخرى لتحسين نتيجتك.'}
                    </p>

                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <div className={styles.statLabel}>النتيجة</div>
                            <div className={styles.statValue}>
                                {score} <span className={styles.statTotal}>/ {total}</span>
                            </div>
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.statItem}>
                            <div className={styles.statLabel}>النسبة</div>
                            <div className={`${styles.statValue} ${isPassed ? styles.statSuccess : styles.statFailure}`}>
                                {percentage}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button onClick={onRetake} className={styles.retakeButton}>
                        <RefreshCcw size={18} />
                        إعادة الاختبار
                    </button>

                    <div className={styles.secondaryActions}>
                        <button onClick={handlePrint} className={styles.actionButton}>
                            <Printer size={18} />
                            طباعة
                        </button>
                        <button
                            onClick={onClose}
                            className={`${styles.actionButton} ${styles.reviewButton}`}
                        >
                            مراجعة الإجابات
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default ResultsModal;
