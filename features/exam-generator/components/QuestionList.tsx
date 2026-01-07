'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, MessageCircle } from 'lucide-react';
import { Question } from '../types';
import { useExamStore } from '../store';
import { QuestionCard } from './QuestionCard';
import { ResultsModal } from './ResultsModal';
import { GeneralFeedbackModal } from './FeedbackModals';
import { saveExamResult } from '@/lib/history'; // Ensure this utility exists/is accessible
import styles from './QuestionList.module.css';
import { useToast } from '@/components/ui';
import { submitGeneralFeedback } from '@/lib/api/exam';

const SUBJECT_NAMES: Record<string, string> = {
    "seerah": "السيرة النبوية",
    "fiqh": "فقه",
    "tafsir": "تفسير",
    "hadith": "حديث",
};

interface QuestionListProps {
    // We use store for primary state, but props can trigger updates or override
    // For migration, we might rely on store state (questions, settings)
}

export function QuestionList() {
    const {
        questions,
        settings,
        jobId,
        answers: storeAnswers,
        score: storeScore,
        isFinished: storeIsFinished,
        answerQuestion,
        finishExam: finishExamStore,
        retakeExam: retakeExamStore
    } = useExamStore();

    // Local state for UI only (animations, timer display)
    // We sync with store
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const toast = useToast();

    // Track hasSaved locally to prevent dups
    const [hasSaved, setHasSaved] = useState(false);

    // Timer Logic
    useEffect(() => {
        if (settings.timerEnabled && questions.length > 0 && !storeIsFinished) {
            // If duration is per question (legacy was unclear, form said 1 min default)
            // settings.duration is set to 1 in form default.
            // Legacy code: totalSeconds = shuffledQuestions.length * 60;
            const totalSeconds = questions.length * 60 * (settings.duration || 1);
            setTimeLeft(totalSeconds);
        } else {
            setTimeLeft(null);
        }
    }, [questions.length, settings.timerEnabled, settings.duration, storeIsFinished]);

    useEffect(() => {
        if (!timeLeft || timeLeft <= 0 || storeIsFinished) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(timer);
                    finishExamStore(); // Timer expired
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, storeIsFinished, finishExamStore]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Completion Check
    useEffect(() => {
        if (questions.length > 0 && Object.keys(storeAnswers).length === questions.length && !storeIsFinished) {
            // All answered, wait a moment then finish
            const t = setTimeout(() => {
                finishExamStore();
            }, 1000);
            return () => clearTimeout(t);
        }
    }, [storeAnswers, questions.length, storeIsFinished, finishExamStore]);

    // Save Result on Finish
    useEffect(() => {
        if (storeIsFinished && !hasSaved && questions.length > 0) {
            const subjectName = SUBJECT_NAMES[settings.subject] || settings.subject;
            saveExamResult({
                subject: settings.subject,
                subjectName,
                grade: settings.grade,
                score: storeScore,
                total: questions.length,
                percentage: Math.round((storeScore / questions.length) * 100)
            });
            setHasSaved(true);
        }
    }, [storeIsFinished, hasSaved, settings, storeScore, questions.length]);

    // Reset local state on retake
    useEffect(() => {
        if (!storeIsFinished) {
            setHasSaved(false);
        }
    }, [storeIsFinished]);

    const handleRetake = () => {
        // In legacy, retake shuffled questions.
        // Ideally we shuffle here before calling retake on store?
        // Or store handles it? Store implementation just cleared answers.
        // Let's rely on simple clear for now as implemented in step 1.
        retakeExamStore();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleGeneralFeedback = async (type: any, message: string) => {
        try {
            await submitGeneralFeedback({
                type,
                message,
                page: 'exam-list',
                timestamp: Date.now()
            });
            toast.success("شكراً لك! تم إرسال ملاحظاتك بنجاح");
            setShowFeedback(false);
        } catch (e) {
            toast.error("حدث خطأ في إرسال الملاحظات");
        }
    };

    if (!questions || questions.length === 0) {
        return (
            <div className={styles.emptyState}>
                <h3>لم يتم إنشاء أسئلة</h3>
                <p>يرجى المحاولة مرة أخرى باستخدام مواضيع مختلفة.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.header}
                dir="rtl"
            >
                <div>
                    <h2 className={styles.title}>اختبر معرفتك ✨</h2>
                    {timeLeft !== null && (
                        <div className={`${styles.timer} ${timeLeft < 60 ? styles.timerUrgent : ''}`}>
                            ⏱️ الوقت المتبقي: {formatTime(timeLeft)}
                        </div>
                    )}
                </div>

                <div className={styles.controls}>
                    <button onClick={handleRetake} className={styles.retakeLink}>
                        إعادة الامتحان
                    </button>
                    <div className={styles.scoreBadge}>
                        النتيجة: <span className={styles.scoreValue}>{storeScore}</span> / {questions.length}
                    </div>
                </div>
            </motion.div>

            {/* Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={styles.banner}
                dir="rtl"
            >
                <div className={styles.bannerIcon}>
                    <Flag size={24} />
                </div>
                <div className={styles.bannerContent}>
                    <p className={styles.bannerTitle}>
                        لو حسّيت سؤال غريب، بلّغ عليه فورًا… رأيك يفرق 💛
                    </p>
                    <p className={styles.bannerSubtitle}>
                        اضغط على أيقونة العلم 🚩 في رأس كل سؤال
                    </p>
                </div>
            </motion.div>

            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {questions.map((q, i) => (
                    <QuestionCard
                        key={`${i}-${hasSaved ? 'saved' : 'active'}`} // Force render on state change if needed, though react handles it
                        question={q}
                        index={i}
                        onAnswer={(isCorrect) => answerQuestion(i, isCorrect)}
                        metadata={{ subject: settings.subject, grade: settings.grade }}
                    />
                ))}
            </div>

            {/* Results Modal */}
            <AnimatePresence>
                {storeIsFinished && (
                    <ResultsModal
                        score={storeScore}
                        total={questions.length}
                        onRetake={handleRetake}
                        onClose={() => { /* Store keeps finished state, we just close modal visually? legacy didn't close modal easily */ }}
                    />
                )}
            </AnimatePresence>

            {/* Floating Feedback */}
            <button
                className={styles.floatingButton}
                onClick={() => setShowFeedback(true)}
            >
                <MessageCircle size={24} />
                <span className={styles.ping} />
                <span className={styles.tooltip}>شاركنا رأيك</span>
            </button>

            <GeneralFeedbackModal
                isOpen={showFeedback}
                onClose={() => setShowFeedback(false)}
                onSubmit={handleGeneralFeedback}
                isSubmitting={false} // Todo: track submitting state
            />
        </div>
    );
}
