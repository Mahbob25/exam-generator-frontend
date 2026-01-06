'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import {
    GenerationForm,
    QuestionList,
    LoadingOverlay,
} from '@/features/exam-generator/components';
import { useExamGeneration } from '@/features/exam-generator/hooks/useExamGeneration';
import { useExamStore } from '@/features/exam-generator/store';

export default function GeneratePage() {
    // Use the hook to handle polling effects
    const { isGenerating: hookIsGenerating, progress } = useExamGeneration();

    const {
        questions,
        status,
        resetAll
    } = useExamStore();

    const isGenerating = status?.status === 'PROCESSING' || status?.status === 'PENDING' || hookIsGenerating;
    const hasQuestions = questions && questions.length > 0;

    // Derive stage for animation/render logic
    const stage = hasQuestions ? 'RESULTS' : (isGenerating ? 'GENERATING' : 'SELECTION');

    return (
        <div className="relative">
            {stage === 'RESULTS' && (
                <div className="flex justify-end max-w-5xl mx-auto mb-4">
                    <button
                        onClick={resetAll}
                        className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                    >
                        البدء من جديد
                    </button>
                </div>
            )}

            <div className="max-w-5xl mx-auto">
                <AnimatePresence mode="wait">
                    {stage === 'SELECTION' && (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="text-center mb-10 space-y-3">
                                <h1 className="text-4xl md:text-5xl font-black font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 py-2 leading-relaxed">
                                    تكوين الاختبار
                                </h1>
                                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                    اختر الصف، المادة، والمواضيع لتوليد اختبار مخصص فوراً باستخدام الذكاء الاصطناعي.
                                </p>
                            </div>

                            {/* Beta Banner */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5 mb-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                    <MessageCircle className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-base font-bold text-foreground leading-relaxed">
                                        المنصة في مرحلة تجريبية، وملاحظتك قد تضيف فائدة 💎
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        اضغط على أيقونة الرسائل 💬 في الزاوية السفلى
                                    </p>
                                </div>
                            </motion.div>

                            <GenerationForm />
                        </motion.div>
                    )}

                    {stage === 'RESULTS' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <QuestionList />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isGenerating && (
                    <LoadingOverlay
                        status={status?.status === 'PROCESSING' ? 'جاري المعالجة...' : 'جاري البدء...'}
                        progress={progress || 'جاري التحضير...'}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

