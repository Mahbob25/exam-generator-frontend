"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { GeneralFeedbackType } from "@/lib/types";
import { clsx } from "clsx";

interface GeneralFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (type: GeneralFeedbackType, message: string) => void;
    isSubmitting: boolean;
    currentPage?: string;
}

const FEEDBACK_TYPES: { value: GeneralFeedbackType; label: string; icon: string }[] = [
    { value: "suggestion", label: "اقتراح", icon: "💡" },
    { value: "improvement", label: "تحسين", icon: "✨" },
    { value: "bug_report", label: "مشكلة تقنية", icon: "🐛" },
    { value: "feature_request", label: "ميزة جديدة", icon: "🚀" },
    { value: "other", label: "أخرى", icon: "📝" },
];

export default function GeneralFeedbackModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    currentPage
}: GeneralFeedbackModalProps) {
    const [type, setType] = useState<GeneralFeedbackType | "">("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (!type) {
            setError("الرجاء اختيار نوع الملاحظة");
            return;
        }

        if (!message.trim()) {
            setError("الرجاء كتابة رسالتك");
            return;
        }

        if (message.length > 1000) {
            setError("الرسالة يجب ألا تتجاوز 1000 حرف");
            return;
        }

        onSubmit(type, message);

        // Reset form
        setType("");
        setMessage("");
        setError("");
    };

    const handleClose = () => {
        setType("");
        setMessage("");
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
                            className="bg-background border rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5"
                            dir="rtl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold font-heading">شاركنا رأيك</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        نسعى دائماً لتحسين تجربتك
                                    </p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    disabled={isSubmitting}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Type Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">نوع الملاحظة *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {FEEDBACK_TYPES.map((feedbackType) => (
                                        <button
                                            key={feedbackType.value}
                                            type="button"
                                            onClick={() => {
                                                setType(feedbackType.value);
                                                setError("");
                                            }}
                                            disabled={isSubmitting}
                                            className={clsx(
                                                "p-3 rounded-lg border-2 text-sm font-medium transition-all",
                                                "hover:border-primary/50 hover:bg-primary/5",
                                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                                "flex items-center gap-2",
                                                type === feedbackType.value
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-muted bg-card text-foreground"
                                            )}
                                        >
                                            <span className="text-lg">{feedbackType.icon}</span>
                                            <span>{feedbackType.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    رسالتك *
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={isSubmitting}
                                    maxLength={1000}
                                    rows={5}
                                    placeholder="شاركنا اقتراحاتك، أفكارك للتحسين، أو أي مشاكل واجهتك..."
                                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span>يمكنك الكتابة بكل راحة، ملاحظاتك تهمنا 💚</span>
                                    <span>{message.length}/1000</span>
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
