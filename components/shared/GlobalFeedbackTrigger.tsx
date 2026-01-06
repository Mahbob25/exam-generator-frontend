'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { GeneralFeedbackModal } from '@/features/exam-generator/components';
import { useToast } from '@/components/ui';
import { examApi } from '@/lib/api/exam';

/**
 * Global Feedback Trigger
 * 
 * Floating button that appears on all pages to allow users to submit feedback.
 * Automatically detects current page for context in feedback submission.
 */
export function GlobalFeedbackTrigger() {
    const [isOpen, setIsOpen] = useState(false);
    const toast = useToast();
    const pathname = usePathname();

    // Get readable page name for feedback context
    const getPageName = () => {
        if (pathname === '/') return 'landing';
        if (pathname.startsWith('/dashboard')) return 'dashboard';
        if (pathname.startsWith('/learn')) return 'learn';
        if (pathname.startsWith('/generate')) return 'generate';
        if (pathname.startsWith('/history')) return 'history';
        if (pathname.startsWith('/settings')) return 'settings';
        return pathname.replace(/\//g, '-').slice(1) || 'unknown';
    };

    const handleSubmit = async (type: any, message: string) => {
        try {
            await examApi.submitGeneralFeedback({
                type,
                message,
                page: getPageName(),
                timestamp: Date.now()
            });
            toast.success("شكراً لك! تم إرسال ملاحظاتك بنجاح");
            setIsOpen(false);
        } catch (e) {
            toast.error("حدث خطأ في إرسال الملاحظات");
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-br from-primary to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 hover:shadow-xl"
                title="شاركنا رأيك"
                aria-label="شاركنا رأيك - إرسال ملاحظات"
            >
                <MessageCircle size={24} />
            </button>
            <GeneralFeedbackModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={handleSubmit}
                isSubmitting={false}
            />
        </>
    );
}

export default GlobalFeedbackTrigger;
