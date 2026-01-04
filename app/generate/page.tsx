"use client";

import { useState, useRef, useEffect } from "react";
import GenerationForm from "@/components/GenerationForm";
import LoadingOverlay from "@/components/LoadingOverlay";
import QuestionList from "@/components/QuestionList";
import { pollJobStatus } from "@/lib/api";
import { JobStatus, Question } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/Toast";

type Stage = "SELECTION" | "GENERATING" | "RESULTS";

interface ActiveJob {
    jobId: string;
    settings: { timerEnabled: boolean; duration: number };
    metadata: { subject: string; grade: number };
    startedAt: number;
}

const ACTIVE_JOB_KEY = "active_generation_job";
const JOB_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export default function GeneratePage() {
    const [stage, setStage] = useState<Stage>("SELECTION");
    const [jobId, setJobId] = useState<string | null>(null);
    const [settings, setSettings] = useState<{ timerEnabled: boolean; duration: number }>({ timerEnabled: false, duration: 1 });
    const [metadata, setMetadata] = useState<{ subject: string; grade: number }>({ subject: "", grade: 12 });
    const toast = useToast();

    // Auto-resume job on page load
    useEffect(() => {
        const savedJob = localStorage.getItem(ACTIVE_JOB_KEY);
        if (savedJob) {
            try {
                const job: ActiveJob = JSON.parse(savedJob);

                // Check if job is not too old (1 hour max)
                const age = Date.now() - job.startedAt;
                if (age < JOB_EXPIRY_MS) {
                    console.log("Resuming job:", job.jobId);
                    toast.info("استئناف توليد الأسئلة...");
                    startPolling(job.jobId, job.settings, job.metadata, true);
                } else {
                    // Job too old, clear it
                    localStorage.removeItem(ACTIVE_JOB_KEY);
                }
            } catch (e) {
                console.error("Failed to parse saved job:", e);
                localStorage.removeItem(ACTIVE_JOB_KEY);
            }
        }
    }, []);

    const saveJobToStorage = (jobId: string, settings: any, metadata: any) => {
        const job: ActiveJob = {
            jobId,
            settings,
            metadata,
            startedAt: Date.now()
        };
        localStorage.setItem(ACTIVE_JOB_KEY, JSON.stringify(job));
    };

    const clearJobFromStorage = () => {
        localStorage.removeItem(ACTIVE_JOB_KEY);
    };

    const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [progress, setProgress] = useState<string>("");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startPolling = (
        id: string,
        formSettings: { timerEnabled: boolean; duration: number },
        meta: { subject: string; grade: number },
        isResume: boolean = false
    ) => {
        setJobId(id);
        setSettings(formSettings);
        setMetadata(meta);
        setStage("GENERATING");

        // Save job to localStorage for resume capability
        if (!isResume) {
            saveJobToStorage(id, formSettings, meta);
        }

        // Clear any existing interval
        if (intervalRef.current) clearInterval(intervalRef.current);

        let hasShownSuccessToast = false; // Track if success toast was shown

        intervalRef.current = setInterval(async () => {
            try {
                const status = await pollJobStatus(id);
                setJobStatus(status);
                if (status.progress) setProgress(status.progress);

                if (status.status === "COMPLETED") {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    if (status.result) {
                        setQuestions(status.result);
                        setStage("RESULTS");

                        // Clear job from localStorage on success
                        clearJobFromStorage();

                        // Only show toast once
                        if (!hasShownSuccessToast) {
                            toast.success("تم توليد الأسئلة بنجاح! 🎉");
                            hasShownSuccessToast = true;
                        }
                    }
                } else if (status.status === "FAILED") {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    const errorMessage = status.error || "حدث خطأ غير معروف";

                    // Clear job from localStorage on failure
                    clearJobFromStorage();

                    toast.error(`فشل توليد الأسئلة: ${errorMessage}`);
                    setStage("SELECTION");
                }
            } catch (err) {
                console.error("Polling error", err);
                if (intervalRef.current) clearInterval(intervalRef.current);
                toast.error("حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.");
                setStage("SELECTION");

                // Don't clear localStorage on connection error - allow retry
            }
        }, 2000); // Poll every 2 seconds
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const handleReset = () => {
        setStage("SELECTION");
        setQuestions([]);
        setJobId(null);
        setProgress("");
        clearJobFromStorage();
    };

    return (
        <main className="min-h-screen bg-background p-4 md:p-8 relative" dir="rtl">
            {/* Simple Header */}
            <header className="flex items-center justify-between max-w-5xl mx-auto mb-8">
                <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
                    <ArrowLeft size={20} className="rotate-180" /> {/* Rotate arrow for RTL */}
                    العودة إلى الرئيسية
                </Link>
                {stage === "RESULTS" && (
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                    >
                        البدء من جديد
                    </button>
                )}
            </header>

            <div className="max-w-5xl mx-auto">
                <AnimatePresence mode="wait">
                    {stage === "SELECTION" && (
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
                            <GenerationForm onJobStarted={startPolling} />
                        </motion.div>
                    )}

                    {stage === "RESULTS" && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <QuestionList questions={questions} settings={settings} metadata={metadata} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {stage === "GENERATING" && (
                    <LoadingOverlay
                        status={jobStatus?.status === "PROCESSING" ? "جاري المعالجة..." : "جاري البدء..."}
                        progress={progress || "جاري التحضير..."}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}
