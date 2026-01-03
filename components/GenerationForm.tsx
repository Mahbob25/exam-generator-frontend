"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchTopics, generateQuestions, fetchMetadata } from "@/lib/api";
import TopicSelector from "./TopicSelector";
import { Loader2, Sparkles, BookOpen, GraduationCap } from "lucide-react";
import { clsx } from "clsx";

interface GenerationFormProps {
    onJobStarted: (
        jobId: string,
        settings: { timerEnabled: boolean; duration: number },
        metadata: { subject: string; grade: number }
    ) => void;
}

export default function GenerationForm({ onJobStarted }: GenerationFormProps) {
    const [availableGrades, setAvailableGrades] = useState<number[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<Record<number, { id: string; name: string }[]>>({});

    // Defaulting to 12 if available, or first available later
    const [grade, setGrade] = useState<number>(12);
    const [subject, setSubject] = useState<string>("");

    const [topics, setTopics] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

    const [isLoadingTopics, setIsLoadingTopics] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [counts, setCounts] = useState({
        msq: 5,
        true_false: 3,
        fill_blank: 2,
    });

    const [timerEnabled, setTimerEnabled] = useState(false);

    // Initial Data Load
    useEffect(() => {
        async function loadMeta() {
            try {
                const meta = await fetchMetadata();
                if (!meta || !meta.grades) {
                    console.warn("[Form Warning] Empty metadata received");
                    return;
                }
                setAvailableGrades(meta.grades);
                setAvailableSubjects(meta.subjects);

                // Smart defaults
                if (meta.grades.length > 0) {
                    const defaultGrade = meta.grades.includes(12) ? 12 : meta.grades[0];
                    setGrade(defaultGrade);

                    // Set first subject for this grade
                    const subjectsForGrade = meta.subjects[defaultGrade];
                    if (subjectsForGrade && subjectsForGrade.length > 0) {
                        setSubject(subjectsForGrade[0].id);
                    }
                }
            } catch (e) {
                console.error("[Form Error] Failed to load metadata", e);
                // Fallback or Error UI
            }
        }
        loadMeta();
    }, []);

    // Effect to update subject when grade changes if needed
    useEffect(() => {
        const subjectsForGrade = availableSubjects[grade];
        if (subjectsForGrade && subjectsForGrade.length > 0) {
            // If current subject is not in the new grade list, reset it
            const exists = subjectsForGrade.find(s => s.id === subject);
            if (!exists) {
                setSubject(subjectsForGrade[0].id);
            }
        }
    }, [grade, availableSubjects]);

    // ... (rest of state logic)

    useEffect(() => {
        if (!subject) return;

        let mounted = true;
        async function loadTopics() {
            setIsLoadingTopics(true);
            setError(null);
            setSelectedTopics([]); // Reset on subject change

            try {
                const fetchedTopics = await fetchTopics(grade, subject);

                if (mounted) {
                    setTopics(fetchedTopics);
                }
            } catch (err) {
                console.error("[Form Error] Failed to load topics:", err);
                if (mounted) {
                    setError("Failed to load topics. Please try again.");
                    setTopics([]);
                }
            } finally {
                if (mounted) setIsLoadingTopics(false);
            }
        }
        loadTopics();
        return () => { mounted = false; };
    }, [grade, subject]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTopics.length === 0) {
            setError("Please select at least one topic.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await generateQuestions({
                grade,
                subject,
                topics: selectedTopics,
                counts,
                question_type: "msq", // Default, backend uses counts anyway
            });
            onJobStarted(
                response.job_id,
                { timerEnabled, duration: 1 },
                { subject, grade }
            );
        } catch (err) {
            console.error(err);
            setError("Failed to start generation job.");
            setIsSubmitting(false);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 bg-card p-6 md:p-8 rounded-3xl shadow-sm border"
            onSubmit={handleSubmit}
        >
            {/* Grade & Subject Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <GraduationCap size={18} />
                        الصف الدراسي
                    </label>
                    <div className="flex gap-2 p-1 bg-muted/30 rounded-xl overflow-x-auto">
                        {availableGrades.length > 0 ? (
                            availableGrades.map((g) => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => setGrade(g)}
                                    className={clsx(
                                        "flex-1 py-2 rounded-lg text-sm font-medium transition-all shadow-sm min-w-[80px]",
                                        grade === g
                                            ? "bg-white dark:bg-zinc-800 text-primary shadow"
                                            : "text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50"
                                    )}
                                >
                                    الصف {g}
                                </button>
                            ))
                        ) : (
                            <div className="p-2 text-sm text-muted-foreground">جاري التحميل...</div>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <BookOpen size={18} />
                        المادة
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {availableSubjects[grade]?.length > 0 ? (
                            availableSubjects[grade].map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setSubject(s.id)}
                                    className={clsx(
                                        "py-2 px-3 rounded-lg text-sm font-medium transition-all border text-center",
                                        subject === s.id
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50"
                                    )}
                                >
                                    {s.name}
                                </button>
                            ))
                        ) : (
                            <div className="p-2 text-sm text-muted-foreground col-span-2 text-center border border-dashed rounded bg-muted/20">
                                {availableGrades.length === 0 ? "جاري التحميل..." : "لا توجد مواد"}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-border/50" />

            {/* Topic Selection */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-bold font-heading">اختر المواضيع</label>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                        تم اختيار {selectedTopics.length}
                    </span>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 rounded-lg">
                        {error}
                    </div>
                )}

                <TopicSelector
                    topics={topics}
                    selectedTopics={selectedTopics}
                    onChange={setSelectedTopics}
                    isLoading={isLoadingTopics}
                />
            </div>

            <div className="w-full h-px bg-border/50" />

            {/* Configuration */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 py-2">
                    <label className="text-lg font-bold font-heading">إعدادات الاختبار</label>
                    <div className="h-px flex-1 bg-border/50" />
                </div>

                {/* Timer Setting */}
                <div className="bg-muted/10 p-4 rounded-xl border flex items-center justify-between">
                    <div>
                        <div className="font-semibold flex items-center gap-2">
                            ⏰ المؤقت
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            تفعيل مؤقت للامتحان (دقيقة واحدة لكل سؤال افتراضياً)
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={timerEnabled}
                            onChange={(e) => setTimerEnabled(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">توزيع الأسئلة</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: "msq", label: "اختيار من متعدد", icon: "🔢" },
                            { id: "true_false", label: "صح / خطأ", icon: "✅" },
                            { id: "fill_blank", label: "أكمل الفراغ", icon: "✍️" },
                        ].map((type) => (
                            <div key={type.id} className="p-4 rounded-xl border bg-muted/10 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm flex items-center gap-2">
                                        <span>{type.icon}</span> {type.label}
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    min={0}
                                    max={10}
                                    className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={counts[type.id as keyof typeof counts]}
                                    onChange={(e) => setCounts({ ...counts, [type.id]: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isSubmitting || selectedTopics.length === 0}
                className={clsx(
                    "w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center gap-3",
                    isSubmitting || selectedTopics.length === 0
                        ? "bg-muted-foreground/50 cursor-not-allowed"
                        : "bg-primary hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] shadow-primary/25"
                )}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin" /> جاري البدء...
                    </>
                ) : (
                    <>
                        <Sparkles className="animate-pulse" /> توليد الاختبار
                    </>
                )}
            </button>
        </motion.form>
    );
}
