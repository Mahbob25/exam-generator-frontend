"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import GeneralFeedbackModal from "./GeneralFeedbackModal";
import { GeneralFeedbackType } from "@/lib/types";
import { submitGeneralFeedback } from "@/lib/api";
import { useToast } from "./Toast";

interface FeedbackButtonProps {
    currentPage?: string;
}

export default function FeedbackButton({ currentPage }: FeedbackButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const handleSubmit = async (type: GeneralFeedbackType, message: string) => {
        setIsSubmitting(true);

        try {
            await submitGeneralFeedback({
                type,
                message,
                page: currentPage,
                timestamp: Date.now(),
                metadata: {
                    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
                    screenSize: typeof window !== "undefined"
                        ? `${window.screen.width}x${window.screen.height}`
                        : undefined,
                    language: typeof window !== "undefined" ? window.navigator.language : undefined,
                }
            });

            toast.success("شكراً لك! تم إرسال ملاحظاتك بنجاح 🎉");
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to submit feedback:", error);
            toast.error("حدث خطأ في إرسال الملاحظات. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 z-40 w-14 h-14 bg-gradient-to-br from-primary to-purple-600 text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center group"
                aria-label="إرسال ملاحظات"
            >
                <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />

                {/* Pulse animation */}
                <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />

                {/* Tooltip */}
                <span className="absolute bottom-full mb-2 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    شاركنا رأيك
                </span>
            </motion.button>

            {/* Feedback Modal */}
            <GeneralFeedbackModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                currentPage={currentPage}
            />
        </>
    );
}
