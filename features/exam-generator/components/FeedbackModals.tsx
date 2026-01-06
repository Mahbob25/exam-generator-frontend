'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { QuestionFeedback, FeedbackCategory, GeneralFeedbackType } from '../types';
import styles from './FeedbackModal.module.css';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (category: FeedbackCategory, comment: string) => void;
    isSubmitting: boolean;
}

const FEEDBACK_CATEGORIES: { value: FeedbackCategory; label: string }[] = [
    { value: 'wrong_answer', label: 'إجابة خاطئة' },
    { value: 'unclear_question', label: 'سؤال غير واضح' },
    { value: 'wrong_explanation', label: 'تفسير خاطئ' },
    { value: 'technical_issue', label: 'مشكلة تقنية' },
    { value: 'other', label: 'أخرى' },
];

export function FeedbackModal({ isOpen, onClose, onSubmit, isSubmitting }: FeedbackModalProps) {
    const [category, setCategory] = useState<FeedbackCategory | ''>('');
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!category) {
            setError('الرجاء اختيار نوع المشكلة');
            return;
        }

        if (comment.length > 500) {
            setError('التعليق يجب ألا يتجاوز 500 حرف');
            return;
        }

        onSubmit(category, comment);
        reset();
    };

    const reset = () => {
        setCategory('');
        setComment('');
        setError('');
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className={styles.overlay}
                    />

                    <div className={styles.modalContainer} onClick={handleClose}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={styles.modal}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.header}>
                                <h3 className={styles.title}>الإبلاغ عن مشكلة</h3>
                                <button
                                    onClick={handleClose}
                                    className={styles.closeButton}
                                    disabled={isSubmitting}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={styles.section}>
                                <label className={styles.label}>نوع المشكلة *</label>
                                <div className={styles.grid}>
                                    {FEEDBACK_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => {
                                                setCategory(cat.value);
                                                setError('');
                                            }}
                                            disabled={isSubmitting}
                                            className={`${styles.optionButton} ${category === cat.value ? styles.optionSelected : ''}`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.section}>
                                <label className={styles.label}>
                                    تعليق إضافي <span style={{ opacity: 0.7 }}>(اختياري)</span>
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    disabled={isSubmitting}
                                    maxLength={500}
                                    placeholder="اكتب تفاصيل المشكلة هنا..."
                                    className={styles.textarea}
                                    dir="rtl"
                                />
                                <div className={styles.counter}>
                                    <span>{comment.length}/500</span>
                                </div>
                            </div>

                            {error && (
                                <div className={styles.error}>
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className={styles.actions}>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className={`${styles.button} ${styles.submit}`}
                                >
                                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
                                </button>
                                <button
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className={`${styles.button} ${styles.cancel}`}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

// ============================================

interface GeneralFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (type: GeneralFeedbackType, message: string) => void;
    isSubmitting: boolean;
    currentPage?: string;
}

const GENERAL_FEEDBACK_TYPES: { value: GeneralFeedbackType; label: string; icon: string }[] = [
    { value: 'suggestion', label: 'اقتراح', icon: '💡' },
    { value: 'improvement', label: 'تحسين', icon: '✨' },
    { value: 'bug_report', label: 'مشكلة تقنية', icon: '🐛' },
    { value: 'feature_request', label: 'ميزة جديدة', icon: '🚀' },
    { value: 'other', label: 'أخرى', icon: '📝' },
];

export function GeneralFeedbackModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
}: GeneralFeedbackModalProps) {
    const [type, setType] = useState<GeneralFeedbackType | ''>('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!type) {
            setError('الرجاء اختيار نوع الملاحظة');
            return;
        }

        if (!message.trim()) {
            setError('الرجاء كتابة رسالتك');
            return;
        }

        if (message.length > 1000) {
            setError('الرسالة يجب ألا تتجاوز 1000 حرف');
            return;
        }

        onSubmit(type, message);
        reset();
    };

    const reset = () => {
        setType('');
        setMessage('');
        setError('');
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className={styles.overlay}
                    />

                    <div className={styles.modalContainer} onClick={handleClose}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={styles.modal}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.header}>
                                <div>
                                    <h3 className={styles.title}>شاركنا رأيك</h3>
                                    <p className={styles.subtitle}>
                                        نسعى دائماً لتحسين تجربتك
                                    </p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className={styles.closeButton}
                                    disabled={isSubmitting}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={styles.section}>
                                <label className={styles.label}>نوع الملاحظة *</label>
                                <div className={styles.grid}>
                                    {GENERAL_FEEDBACK_TYPES.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => {
                                                setType(cat.value);
                                                setError('');
                                            }}
                                            disabled={isSubmitting}
                                            className={`${styles.optionButton} ${type === cat.value ? styles.optionSelected : ''}`}
                                        >
                                            <span>{cat.icon}</span>
                                            <span>{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.section}>
                                <label className={styles.label}>
                                    رسالتك *
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={isSubmitting}
                                    maxLength={1000}
                                    placeholder="شاركنا اقتراحاتك، أفكارك للتحسين، أو أي مشاكل واجهتك..."
                                    className={styles.textarea}
                                    dir="rtl"
                                />
                                <div className={styles.counter}>
                                    <span>يمكنك الكتابة بكل راحة، ملاحظاتك تهمنا 💚</span>
                                    <span>{message.length}/1000</span>
                                </div>
                            </div>

                            {error && (
                                <div className={styles.error}>
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className={styles.actions}>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className={`${styles.button} ${styles.submit}`}
                                >
                                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
                                </button>
                                <button
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className={`${styles.button} ${styles.cancel}`}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
