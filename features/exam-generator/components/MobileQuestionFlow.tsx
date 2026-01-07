'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Question } from '../types';
import { useExamStore } from '../store';
import { QuestionCard } from './QuestionCard';
import { ResultsModal } from './ResultsModal';

interface MobileQuestionFlowProps {
    questions: Question[];
    onClose: () => void;
}

const SWIPE_THRESHOLD = 50;

export function MobileQuestionFlow({ questions, onClose }: MobileQuestionFlowProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const {
        settings,
        answers: storeAnswers,
        score: storeScore,
        isFinished: storeIsFinished,
        answerQuestion,
        retakeExam: retakeExamStore,
    } = useExamStore();

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;
    const progress = ((currentIndex + 1) / totalQuestions) * 100;
    const isAnswered = storeAnswers[currentIndex] !== undefined;

    const goToNext = useCallback(() => {
        if (currentIndex < totalQuestions - 1) {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, totalQuestions]);

    const goToPrevious = useCallback(() => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.x < -SWIPE_THRESHOLD && info.velocity.x < 0) {
            // Swiped left -> next (RTL: previous)
            goToPrevious();
        } else if (info.offset.x > SWIPE_THRESHOLD && info.velocity.x > 0) {
            // Swiped right -> previous (RTL: next)
            goToNext();
        }
    };

    const handleRetake = () => {
        retakeExamStore();
        setCurrentIndex(0);
    };

    const handleAnswer = (isCorrect: boolean) => {
        answerQuestion(currentIndex, isCorrect);

        // Auto-advance after a short delay
        if (currentIndex < totalQuestions - 1) {
            setTimeout(() => {
                goToNext();
            }, 1500);
        }
    };

    // Slide animation variants
    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir: number) => ({
            x: dir > 0 ? '-100%' : '100%',
            opacity: 0,
        }),
    };

    if (storeIsFinished) {
        return (
            <ResultsModal
                score={storeScore}
                total={totalQuestions}
                onRetake={handleRetake}
                onClose={onClose}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col" dir="rtl">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-lg safe-area-pt">
                <button
                    onClick={onClose}
                    className="p-2 -m-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                        {currentIndex + 1} / {totalQuestions}
                    </span>
                </div>

                <button
                    onClick={handleRetake}
                    className="p-2 -m-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    <RotateCcw size={20} />
                </button>
            </header>

            {/* Progress Bar */}
            <div className="h-1 bg-muted">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Score Badge */}
            <div className="flex justify-center py-2">
                <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    النتيجة: {storeScore} / {totalQuestions}
                </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        className="absolute inset-0 overflow-y-auto px-4 py-4 scroll-native"
                    >
                        <QuestionCard
                            question={currentQuestion}
                            index={currentIndex}
                            onAnswer={handleAnswer}
                            metadata={{ subject: settings.subject, grade: settings.grade }}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <footer className="flex items-center justify-between px-4 py-4 border-t border-border/50 bg-background/80 backdrop-blur-lg safe-area-pb">
                <button
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
                        currentIndex === 0
                            ? "text-muted-foreground/50 cursor-not-allowed"
                            : "text-foreground bg-muted hover:bg-muted/80 active:scale-95"
                    )}
                >
                    <ChevronRight size={20} />
                    <span>السابق</span>
                </button>

                {/* Dots indicator */}
                <div className="flex items-center gap-1.5">
                    {questions.slice(
                        Math.max(0, currentIndex - 2),
                        Math.min(totalQuestions, currentIndex + 3)
                    ).map((_, i) => {
                        const actualIndex = Math.max(0, currentIndex - 2) + i;
                        const isActive = actualIndex === currentIndex;
                        const wasAnswered = storeAnswers[actualIndex] !== undefined;

                        return (
                            <button
                                key={actualIndex}
                                onClick={() => {
                                    setDirection(actualIndex > currentIndex ? 1 : -1);
                                    setCurrentIndex(actualIndex);
                                }}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    isActive
                                        ? "w-6 bg-primary"
                                        : wasAnswered
                                            ? "bg-primary/40"
                                            : "bg-muted-foreground/30"
                                )}
                            />
                        );
                    })}
                </div>

                <button
                    onClick={goToNext}
                    disabled={currentIndex === totalQuestions - 1}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
                        currentIndex === totalQuestions - 1
                            ? "text-muted-foreground/50 cursor-not-allowed"
                            : "text-primary-foreground bg-primary hover:bg-primary/90 active:scale-95 shadow-md"
                    )}
                >
                    <span>التالي</span>
                    <ChevronLeft size={20} />
                </button>
            </footer>
        </div>
    );
}

export default MobileQuestionFlow;
