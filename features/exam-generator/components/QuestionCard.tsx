'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle2, HelpCircle, Flag } from 'lucide-react';
import { Question, QuestionTier, FeedbackCategory, QuestionFeedback } from '../types';
import { ArabicTextNormalizer } from '@/lib/arabicNormalizer';
import { submitQuestionFeedback } from '@/lib/api/exam';
import { FeedbackModal } from './FeedbackModals';
import styles from './QuestionCard.module.css';

interface QuestionCardProps {
    question: Question;
    index: number;
    onAnswer: (isCorrect: boolean) => void;
    metadata?: {
        subject?: string;
        grade?: number;
    };
}

const tierNames: Record<QuestionTier, string> = {
    MEMORIZATION: 'حفظ وتذكر',
    GENERAL: 'عام / شامل',
    DIAGNOSTIC: 'تشخيصي',
    NUMBERS_STATISTICS: 'أرقام وإحصائيات',
};

export function QuestionCard({ question, index, onAnswer, metadata }: QuestionCardProps) {
    const [showAnswer, setShowAnswer] = useState(false);
    const [expandedExplanation, setExpandedExplanation] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | boolean | null>(null);
    const [typedAnswer, setTypedAnswer] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Feedback state
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Helper for text comparison
    const normalizeText = (text: string | number | boolean | null | undefined): string => {
        return ArabicTextNormalizer.normalize(String(text || ''));
    };

    const handleSelectOption = (value: string | boolean | 'True' | 'False') => {
        if (isSubmitted) return;

        let finalValue: string | boolean = value;
        if (value === 'True') finalValue = true;
        if (value === 'False') finalValue = false;

        setSelectedOption(value);
        setIsSubmitted(true);
        setShowAnswer(true);

        let isCorrect = false;

        if (question.type.toLowerCase() === 'true_false') {
            const boolValue = value === 'True';
            isCorrect = boolValue === question.correct_answer;
        } else if (question.type.toLowerCase() === 'msq' || question.type.toLowerCase() === 'mcq') {
            const correctOptionId = question.correct_option_id || question.correct_answer;
            const correctNorm = normalizeText(correctOptionId);

            if (Array.isArray(question.options)) {
                const selectedOpt = question.options.find(o => o.id === value);
                const selectedText = selectedOpt?.text || '';

                isCorrect = (selectedOpt?.is_correct === true) ||
                    (normalizeText(value) === correctNorm) ||
                    (normalizeText(selectedText) === correctNorm);
            } else {
                // Legacy Map handling
                // @ts-ignore
                const selectedVal = question.options[value];
                const selectedText = typeof selectedVal === 'object' ? selectedVal.text : selectedVal;

                isCorrect = (normalizeText(value) === correctNorm) ||
                    (normalizeText(selectedText) === correctNorm);
            }
        }

        onAnswer(isCorrect);
    };

    const handleFillBlankSubmit = () => {
        if (isSubmitted || !typedAnswer.trim()) return;

        setIsSubmitted(true);
        setShowAnswer(true);
        setSelectedOption(typedAnswer);

        const isCorrect = ArabicTextNormalizer.isAnswerCorrect(
            typedAnswer,
            question.accepted_answers || []
        );

        onAnswer(isCorrect);
    };

    const handleFeedbackSubmit = async (category: FeedbackCategory, comment: string) => {
        setIsSubmittingFeedback(true);
        try {
            const feedback: QuestionFeedback = {
                question,
                category,
                comment: comment || undefined,
                timestamp: Date.now(),
                metadata: {
                    ...metadata,
                    userAnswered: isSubmitted,
                    userAnswer: selectedOption !== null ? String(selectedOption) : typedAnswer || undefined,
                },
            };

            await submitQuestionFeedback(feedback);
            setFeedbackMessage({ type: 'success', text: 'تم إرسال التقرير بنجاح. شكراً لك!' });
            setShowFeedbackModal(false);

            setTimeout(() => setFeedbackMessage(null), 3000);
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            setFeedbackMessage({ type: 'error', text: 'فشل إرسال التقرير. يرجى المحاولة مرة أخرى.' });
            setTimeout(() => setFeedbackMessage(null), 5000);
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={styles.card}
            dir="rtl"
        >
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.numberBadge}>
                        {index + 1}
                    </div>
                    <span className={`${styles.tierBadge} ${styles[`tier_${question.question_tier}`] || ''}`}>
                        {tierNames[question.question_tier] || question.question_tier}
                    </span>
                </div>
                <button
                    onClick={() => setShowFeedbackModal(true)}
                    className={styles.feedbackButton}
                    title="الإبلاغ عن مشكلة"
                >
                    <Flag size={16} />
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                <h3 className={styles.questionText}>
                    {question.question_text || question.statement}
                </h3>

                {/* Options */}
                <div className={styles.optionsGrid}>
                    {question.type === 'msq' && question.options && (
                        <>
                            {Array.isArray(question.options) ? (
                                question.options.map((option) => {
                                    const key = option.id;
                                    const correct = question.correct_option_id || question.correct_answer;
                                    const correctNorm = normalizeText(correct);
                                    const optionTextNorm = normalizeText(option.text);
                                    const isThisCorrect = (normalizeText(key) === correctNorm) || (optionTextNorm === correctNorm);
                                    const isSelected = selectedOption === key;

                                    let statusClass = '';
                                    if (isSubmitted) {
                                        if (isThisCorrect) statusClass = styles.statusCorrect;
                                        else if (isSelected) statusClass = styles.statusWrong;
                                        else statusClass = styles.statusDimmed;
                                    }

                                    return (
                                        <button
                                            key={key}
                                            onClick={() => handleSelectOption(key)}
                                            disabled={isSubmitted}
                                            className={`${styles.optionButton} ${statusClass} ${isSelected ? styles.optionSelected : ''}`}
                                        >
                                            <div className={styles.optionLetter}>{key.toUpperCase()}</div>
                                            <span className={styles.optionText}>{option.text}</span>
                                            {isSubmitted && isThisCorrect && <CheckCircle2 size={16} className={styles.checkIcon} />}
                                        </button>
                                    );
                                })
                            ) : (
                                Object.entries(question.options).map(([key, value]) => {
                                    const correct = question.correct_option_id || question.correct_answer;
                                    const correctNorm = normalizeText(correct);
                                    // @ts-ignore
                                    const valText = typeof value === 'object' ? value.text : value;
                                    const optionTextNorm = normalizeText(valText);
                                    const isThisCorrect = (normalizeText(key) === correctNorm) || (optionTextNorm === correctNorm);
                                    const isSelected = selectedOption === key;

                                    let statusClass = '';
                                    if (isSubmitted) {
                                        if (isThisCorrect) statusClass = styles.statusCorrect;
                                        else if (isSelected) statusClass = styles.statusWrong;
                                        else statusClass = styles.statusDimmed;
                                    }

                                    return (
                                        <button
                                            key={key}
                                            onClick={() => handleSelectOption(key)}
                                            disabled={isSubmitted}
                                            className={`${styles.optionButton} ${statusClass} ${isSelected ? styles.optionSelected : ''}`}
                                        >
                                            <div className={styles.optionLetter}>{key.toUpperCase()}</div>
                                            <span className={styles.optionText}>{valText}</span>
                                            {isSubmitted && isThisCorrect && <CheckCircle2 size={16} className={styles.checkIcon} />}
                                        </button>
                                    );
                                })
                            )}
                        </>
                    )}

                    {question.type === 'true_false' && (
                        <div className={styles.tfContainer}>
                            {['True', 'False'].map((opt) => {
                                const isTrue = opt === 'True';
                                const isThisCorrect = (isTrue && question.correct_answer === true) || (!isTrue && question.correct_answer === false);
                                const isSelected = selectedOption === opt;

                                let statusClass = '';
                                if (isSubmitted) {
                                    if (isThisCorrect) statusClass = styles.statusCorrect;
                                    else if (isSelected) statusClass = styles.statusWrong;
                                    else statusClass = styles.statusDimmed;
                                }

                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleSelectOption(opt)}
                                        disabled={isSubmitted}
                                        className={`${styles.tfButton} ${statusClass} ${isSelected ? styles.optionSelected : ''}`}
                                    >
                                        {isTrue ? 'صحيح' : 'خاطئ'}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {question.type === 'fill_blank' && (
                        <div className={styles.fillBlankContainer}>
                            <div className={styles.fillBlankInputGroup}>
                                <input
                                    type="text"
                                    value={typedAnswer}
                                    onChange={(e) => setTypedAnswer(e.target.value)}
                                    disabled={isSubmitted}
                                    placeholder="اكتب إجابتك هنا..."
                                    className={styles.fillInput}
                                />
                                <button
                                    onClick={handleFillBlankSubmit}
                                    disabled={isSubmitted || !typedAnswer}
                                    className={styles.checkButton}
                                >
                                    تحقق
                                </button>
                            </div>

                            {isSubmitted && (
                                <div className={styles.correctAnswerBox}>
                                    <p className={styles.correctAnswerLabel}>الإجابة الصحيحة:</p>
                                    <div>
                                        {question.accepted_answers?.map((ans, i) => (
                                            <span key={i} className={styles.tag}>{ans}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                    {showAnswer && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className={styles.explanation}
                        >
                            <div className={styles.explanationContent}>
                                <h4 className={styles.explanationHeader}>
                                    <HelpCircle size={16} />
                                    التفسير
                                </h4>
                                <div className={styles.explanationText}>
                                    {question.type === 'fill_blank' ? (
                                        <span>
                                            {typeof question.explanation === 'string'
                                                ? question.explanation
                                                : (question.explanation?.correct || question.explanation?.why_correct || '')}
                                        </span>
                                    ) : question.type === 'true_false' ? (
                                        <span>
                                            {question.explanation.correct && (
                                                <span className={styles.correctText}>{question.explanation.correct}<br /></span>
                                            )}
                                            {question.explanation.why_false || ''}
                                        </span>
                                    ) : (
                                        <>
                                            {question.explanation.correct_answer ? (
                                                <div className={styles.correctText}>
                                                    ✓ الإجابة الصحيحة: {question.explanation.correct_answer}
                                                </div>
                                            ) : (
                                                <div className={styles.correctText}>
                                                    ✓ الإجابة الصحيحة: {(() => {
                                                        const correctId = question.correct_option_id || question.correct_answer;
                                                        if (Array.isArray(question.options)) return question.options.find(o => o.id === correctId)?.text;
                                                        // @ts-ignore
                                                        return question.options?.[correctId]?.text || question.options?.[correctId];
                                                    })()}
                                                </div>
                                            )}
                                            {question.explanation.why_correct && (
                                                <div className={styles.whyCorrect}>
                                                    {question.explanation.why_correct}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {(question.explanation.why_others_wrong || question.options) && (
                                    <div>
                                        <button
                                            onClick={() => setExpandedExplanation(!expandedExplanation)}
                                            className={styles.detailsButton}
                                        >
                                            {expandedExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            {expandedExplanation ? 'إخفاء تفاصيل الخيارات' : 'لماذا الخيارات الأخرى خاطئة؟'}
                                        </button>

                                        {expandedExplanation && question.explanation.why_others_wrong && (
                                            <div className={styles.detailsContent}>
                                                {Object.entries(question.explanation.why_others_wrong).map(([key, reason]) => (
                                                    <div key={key} className={styles.detailItem}>
                                                        <span className={styles.detailLabel}>{key.toUpperCase()}:</span> {reason}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                onSubmit={handleFeedbackSubmit}
                isSubmitting={isSubmittingFeedback}
            />

            <AnimatePresence>
                {feedbackMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={styles.toastContainer}
                    >
                        <div className={`${styles.toast} ${feedbackMessage.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
                            <CheckCircle2 size={18} />
                            <span className={styles.toastText}>{feedbackMessage.text}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
