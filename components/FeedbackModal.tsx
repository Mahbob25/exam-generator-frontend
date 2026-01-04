"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { FeedbackCategory } from "@/lib/types";
import { clsx } from "clsx";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (category: FeedbackCategory, comment: string) => void;
    isSubmitting: boolean;
}

const FEEDBACK_CATEGORIES: { value: FeedbackCategory; label: string }[] = [
    { value: "wrong_answer", label: "إجابة خاطئة" },
    { value: "unclear_question", label: "سؤال غير واضح" },
    { value: "wrong_explanation", label: "تفسير خاطئ" },
    { value: "technical_issue", label: "مشكلة تقنية" },
    { value: "other", label: "أخرى" },
];

export default function FeedbackModal({ isOpen, onClose, onSubmit, isSubmitting }: FeedbackModalProps) {
    const [category, setCategory] = useState<FeedbackCategory | "">("");
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (!category) {
            setError("الرجاء اختيار نوع المشكلة");
            return;
        }

        if (comment.length > 500) {
            setError("التعليق يجب ألا يتجاوز 500 حرف");
            return;
        }

        onSubmit(category, comment);

        // Reset form
        setCategory("");
        setComment("");
        setError("");
    };

    const handleClose = () => {
        setCategory("");
        setComment("");
        setError("");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                        onClick={handleClose}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-background border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5"
                            dir="rtl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold font-heading">الإبلاغ عن مشكلة</h3>
                                <button
                                    onClick={handleClose}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    disabled={isSubmitting}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Category Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">نوع المشكلة *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {FEEDBACK_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => {
                                                setCategory(cat.value);
                                                setError("");
                                            }}
                                            disabled={isSubmitting}
                                            className={clsx(
                                                "p-3 rounded-lg border-2 text-sm font-medium transition-all",
                                                "hover:border-primary/50 hover:bg-primary/5",
                                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                                category === cat.value
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-muted bg-card text-foreground"
                                            )}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    تعليق إضافي <span className="text-muted-foreground">(اختياري)</span>
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    disabled={isSubmitting}
                                    maxLength={500}
                                    rows={4}
                                    placeholder="اكتب تفاصيل المشكلة هنا..."
                                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                                <div className="text-xs text-muted-foreground text-left">
                                    {comment.length}/500
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className={clsx(
                                        "flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium transition-all",
                                        isSubmitting
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:bg-primary/90 active:scale-[0.98]"
                                    )}
                                >
                                    {isSubmitting ? "جاري الإرسال..." : "إرسال"}
                                </button>
                                <button
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-4 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
