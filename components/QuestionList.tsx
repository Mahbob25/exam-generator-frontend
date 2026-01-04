"use client";

import { useState, useEffect, useCallback } from "react";
import { Question } from "@/lib/types";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import ResultsModal from "./ResultsModal";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

import { saveExamResult } from "@/lib/history";
import FeedbackButton from "./FeedbackButton";

// Helper to map subject ID to Name (should ideally move to a shared constant)
const SUBJECT_NAMES: Record<string, string> = {
    "seerah": "السيرة النبوية",
    "fiqh": "فقه",
    "tafsir": "تفسير",
    "hadith": "حديث",
};

interface QuestionListProps {
    questions: Question[];
    settings?: { timerEnabled: boolean; duration: number };
    metadata?: { subject: string; grade: number };
}

export default function QuestionList({ questions, settings, metadata }: QuestionListProps) {
    const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<Record<number, boolean>>({});
    const [retakeCount, setRetakeCount] = useState(0);
    const [showResults, setShowResults] = useState(false);

    // Timer State
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Shuffle Helper
    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Initialize/Reset Questions
    useEffect(() => {
        if (questions && questions.length > 0) {
            // Initial shuffle or reset
            // We use the original questions prop, but we might want to shuffle initially too?
            // Usually, first load is as generated. Let's keep it as generated for first load?
            // Or consistenly shuffle? The user asked for "retake" to shuffle.
            // Let's just set it to questions initially.
            // Wait, if we want to support shuffling options on retake, we need to deep copy.
            setShuffledQuestions(questions);
        }
    }, [questions]);

    useEffect(() => {
        if (settings?.timerEnabled && shuffledQuestions.length > 0 && !showResults) {
            // 1 minute per question * number of questions
            const totalSeconds = shuffledQuestions.length * 60;
            setTimeLeft(totalSeconds);
        } else {
            setTimeLeft(null);
        }
    }, [shuffledQuestions, settings, retakeCount]); // Reset on retake

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(timer);
                    return 0; // Triggers finishExam via useEffect
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, showResults]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (index: number, isCorrect: boolean) => {
        if (answers[index] !== undefined) return;

        const newAnswers = { ...answers, [index]: isCorrect };
        setAnswers(newAnswers);

        let newScore = score;
        if (isCorrect) newScore = score + 1;

        if (isCorrect) setScore(newScore);

        // Completion handled by useEffect on 'answers' dependency now
    };

    const handleRetake = () => {
        setScore(0);
        setAnswers({});
        setRetakeCount(prev => prev + 1);
        setShowResults(false);

        // Shuffle Questions and Options
        const questionsCopy = JSON.parse(JSON.stringify(questions)) as Question[]; // Deep copy

        // 1. Shuffle Options for MSQ/MCQ
        questionsCopy.forEach((q: any) => {
            if ((q.type === 'msq' || q.type === 'mcq') && Array.isArray(q.options)) {
                q.options = shuffleArray(q.options);
            }
        });

        // 2. Shuffle Questions Order
        const newShuffled = shuffleArray(questionsCopy);
        setShuffledQuestions(newShuffled);

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!questions || questions.length === 0) {
        return (
            <div className="text-center p-12 bg-muted/10 rounded-3xl border border-dashed">
                <h3 className="text-lg font-semibold text-muted-foreground">لم يتم إنشاء أسئلة</h3>
                <p className="text-sm text-muted-foreground/80 mt-1">يرجى المحاولة مرة أخرى باستخدام مواضيع مختلفة.</p>
            </div>
        );
    }

    // State for History Save to prevent duplicates
    const [hasSaved, setHasSaved] = useState(false);

    // Unified Completion Handler (using useCallback to prevent stale closures)
    const finishExam = useCallback(() => {
        if (showResults) return; // Prevent double trigger

        setShowResults(true);

        // Save History
        if (metadata && !hasSaved) {
            console.log("Saving exam result...", { metadata, score });
            saveExamResult({
                subject: metadata.subject,
                subjectName: SUBJECT_NAMES[metadata.subject] || metadata.subject,
                grade: metadata.grade,
                score: score,
                total: shuffledQuestions.length,
                percentage: Math.round((score / shuffledQuestions.length) * 100)
            });
            setHasSaved(true);
        }
    }, [showResults, metadata, hasSaved, score, shuffledQuestions.length]);

    // Trigger on Timer Expiry
    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            finishExam();
        }
    }, [timeLeft, finishExam]);

    // Check if all answered
    useEffect(() => {
        if (shuffledQuestions.length > 0 && Object.keys(answers).length === shuffledQuestions.length) {
            const timer = setTimeout(() => {
                finishExam();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [answers, shuffledQuestions.length, finishExam]);

    // Reset saved state on retake
    useEffect(() => {
        if (!showResults) {
            setHasSaved(false);
        }
    }, [showResults]);

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8 sticky top-4 z-10 bg-background/80 backdrop-blur-md p-4 rounded-xl border shadow-sm"
                dir="rtl"
            >
                <div>
                    <h2 className="text-2xl font-bold font-heading">
                        اختبر معرفتك ✨
                    </h2>
                    {timeLeft !== null && (
                        <div className={clsx("text-sm font-mono mt-1", timeLeft < 60 ? "text-red-500 animate-pulse font-bold" : "text-muted-foreground")}>
                            ⏱️ الوقت المتبقي: {formatTime(timeLeft)}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleRetake}
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        إعادة الامتحان
                    </button>
                    <div className="text-sm font-medium px-4 py-2 bg-muted rounded-full">
                        النتيجة: <span className="text-primary font-bold">{score}</span> / {shuffledQuestions.length}
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-6">
                {shuffledQuestions.map((q, i) => (
                    <QuestionCard
                        key={`${i}-${retakeCount}`} // Force remix on retake
                        question={q}
                        index={i}
                        onAnswer={(isCorrect) => handleAnswer(i, isCorrect)}
                        metadata={metadata}
                    />
                ))}
            </div>

            <AnimatePresence>
                {showResults && (
                    <ResultsModal
                        score={score}
                        total={shuffledQuestions.length}
                        onRetake={handleRetake}
                        onClose={() => setShowResults(false)}
                    />
                )}
            </AnimatePresence>

            {/* Floating Feedback Button */}
            <FeedbackButton currentPage="results" />
        </div>
    );
}
