'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Sparkles, Check, GraduationCap, BookOpen, Settings, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamStore } from '../store';
import { fetchMetadata, fetchTopics, generateQuestions } from '@/lib/api/exam';
import { useToast } from '@/components/ui';
import { TopicSelector } from './TopicSelector';
import { ExamSelect } from './ExamSelect';

interface MobileGenerationWizardProps {
    onClose: () => void;
}

const STEPS = [
    { id: 1, title: 'الصف والمادة', icon: GraduationCap },
    { id: 2, title: 'المواضيع', icon: BookOpen },
    { id: 3, title: 'الإعدادات', icon: Settings },
    { id: 4, title: 'المراجعة', icon: ClipboardList },
];

export function MobileGenerationWizard({ onClose }: MobileGenerationWizardProps) {
    const { startJob, setSettings } = useExamStore();
    const toast = useToast();

    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);

    // Form state
    const [availableGrades, setAvailableGrades] = useState<number[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<Record<number, { id: string; name: string }[]>>({});
    const [grade, setGrade] = useState<number>(12);
    const [subject, setSubject] = useState<string>('');
    const [topics, setTopics] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [isLoadingTopics, setIsLoadingTopics] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [counts, setCounts] = useState({ msq: 5, true_false: 3, fill_blank: 2 });
    const [timerEnabled, setTimerEnabled] = useState(false);

    // Load metadata
    useEffect(() => {
        async function loadMeta() {
            try {
                const meta = await fetchMetadata();
                if (!meta?.grades) return;
                setAvailableGrades(meta.grades);
                setAvailableSubjects(meta.subjects);
                if (meta.grades.length > 0) {
                    const defaultGrade = meta.grades.includes(12) ? 12 : meta.grades[0];
                    setGrade(defaultGrade);
                    const subjectsForGrade = meta.subjects[defaultGrade];
                    if (subjectsForGrade?.length > 0) setSubject(subjectsForGrade[0].id);
                }
            } catch (e) {
                toast.error('فشل تحميل البيانات');
            }
        }
        loadMeta();
    }, []);

    // Update subject when grade changes
    useEffect(() => {
        const subjectsForGrade = availableSubjects[grade];
        if (subjectsForGrade?.length > 0) {
            if (!subjectsForGrade.find(s => s.id === subject)) {
                setSubject(subjectsForGrade[0].id);
            }
        }
    }, [grade, availableSubjects]);

    // Load topics when subject changes
    useEffect(() => {
        if (!subject) return;
        let mounted = true;
        async function load() {
            setIsLoadingTopics(true);
            setSelectedTopics([]);
            try {
                const fetchedTopics = await fetchTopics(grade, subject);
                if (mounted) setTopics(fetchedTopics);
            } catch {
                if (mounted) setTopics([]);
            } finally {
                if (mounted) setIsLoadingTopics(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, [grade, subject]);

    const goNext = () => {
        if (currentStep < 4) {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
        }
    };

    const goPrev = () => {
        if (currentStep > 1) {
            setDirection(-1);
            setCurrentStep(prev => prev - 1);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1: return grade && subject;
            case 2: return selectedTopics.length > 0;
            case 3: return counts.msq + counts.true_false + counts.fill_blank > 0;
            case 4: return true;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        if (selectedTopics.length === 0) {
            toast.error('يرجى اختيار موضوع واحد على الأقل');
            return;
        }

        const total = counts.msq + counts.true_false + counts.fill_blank;
        const maxAllowed = selectedTopics.length * 15;
        if (total > maxAllowed) {
            toast.error(`الحد الأقصى ${maxAllowed} سؤال`);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await generateQuestions({
                grade, subject, topics: selectedTopics, counts, question_type: 'msq',
            });
            setSettings({ subject, grade, topics: selectedTopics, timerEnabled, duration: 1 });
            startJob(response.job_id);
        } catch (err: any) {
            toast.error(`فشل التوليد: ${err?.message || 'خطأ'}`);
            setIsSubmitting(false);
        }
    };

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
    };

    const subjectName = availableSubjects[grade]?.find(s => s.id === subject)?.name || subject;
    const currentStepData = STEPS.find(s => s.id === currentStep);

    // State for portal mounting
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const wizardContent = (
        <div
            className="fixed inset-0 flex flex-col overflow-hidden"
            style={{ zIndex: 99999 }}
            dir="rtl"
        >
            {/* Premium gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />

            {/* Header with step info */}
            <header className="relative shrink-0 pt-4 pb-2 px-4">
                {/* Current step title */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-4"
                >
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                        {currentStepData?.title}
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        الخطوة {currentStep} من {STEPS.length}
                    </p>
                </motion.div>

                {/* Progress indicators */}
                <div className="flex items-center justify-center gap-2">
                    {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;

                        return (
                            <React.Fragment key={step.id}>
                                {/* Connector line */}
                                {i > 0 && (
                                    <div className={cn(
                                        "h-0.5 w-8 rounded-full transition-colors duration-300",
                                        step.id <= currentStep ? "bg-primary" : "bg-muted"
                                    )} />
                                )}

                                {/* Step circle */}
                                <motion.div
                                    animate={{ scale: isActive ? 1.15 : 1 }}
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                                        isActive
                                            ? "bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg shadow-primary/30"
                                            : isCompleted
                                                ? "bg-primary/20 text-primary"
                                                : "bg-muted/80 text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                                </motion.div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </header>

            {/* Content area */}
            <main className="relative flex-1 min-h-0 overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="absolute inset-0 overflow-y-auto px-5 py-6"
                    >
                        {/* Step 1: Grade & Subject */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                {/* Grade selector */}
                                <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50 shadow-sm">
                                    <label className="block text-sm font-semibold mb-3 text-foreground">
                                        🎓 الصف الدراسي
                                    </label>
                                    <ExamSelect
                                        value={grade}
                                        onChange={(val) => setGrade(Number(val))}
                                        options={availableGrades.map(g => ({ value: g, label: `الصف ${g}` }))}
                                        placeholder="اختر الصف"
                                    />
                                </div>

                                {/* Subject selector with animation */}
                                <AnimatePresence>
                                    {grade && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                            className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50 shadow-sm"
                                        >
                                            <label className="block text-sm font-semibold mb-3 text-foreground">
                                                📚 المادة الدراسية
                                            </label>
                                            <ExamSelect
                                                value={subject}
                                                onChange={(val) => setSubject(String(val))}
                                                options={availableSubjects[grade]?.map(s => ({ value: s.id, label: s.name })) || []}
                                                placeholder="اختر المادة"
                                                autoFocus
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Step 2: Topics */}
                        {currentStep === 2 && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold">📝 اختر المواضيع</h2>
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full">
                                        {selectedTopics.length} مختار
                                    </span>
                                </div>
                                <TopicSelector
                                    topics={topics}
                                    selectedTopics={selectedTopics}
                                    onChange={setSelectedTopics}
                                    isLoading={isLoadingTopics}
                                />
                            </div>
                        )}

                        {/* Step 3: Config */}
                        {currentStep === 3 && (
                            <div className="space-y-5">
                                <h2 className="text-lg font-bold mb-4">⚙️ توزيع الأسئلة</h2>

                                {[
                                    { id: 'msq', label: 'اختيار من متعدد', icon: '🔢', color: 'from-blue-500 to-blue-600' },
                                    { id: 'true_false', label: 'صح / خطأ', icon: '✅', color: 'from-green-500 to-green-600' },
                                    { id: 'fill_blank', label: 'أكمل الفراغ', icon: '✍️', color: 'from-purple-500 to-purple-600' },
                                ].map((type) => (
                                    <div
                                        key={type.id}
                                        className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm"
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-lg shadow-sm`}>
                                                {type.icon}
                                            </span>
                                            <span className="font-medium">{type.label}</span>
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCounts({ ...counts, [type.id]: Math.max(0, counts[type.id as keyof typeof counts] - 1) })}
                                                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-lg active:scale-95 transition-transform"
                                            >
                                                −
                                            </button>
                                            <span className="w-8 text-center font-bold text-lg">
                                                {counts[type.id as keyof typeof counts]}
                                            </span>
                                            <button
                                                onClick={() => setCounts({ ...counts, [type.id]: Math.min(15, counts[type.id as keyof typeof counts] + 1) })}
                                                className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-transform"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Timer toggle */}
                                <div className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-lg shadow-sm">
                                            ⏰
                                        </span>
                                        <div>
                                            <div className="font-medium">المؤقت</div>
                                            <div className="text-xs text-muted-foreground">دقيقة لكل سؤال</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setTimerEnabled(!timerEnabled)}
                                        className={cn(
                                            "w-14 h-8 rounded-full transition-all duration-300 relative",
                                            timerEnabled
                                                ? "bg-gradient-to-r from-primary to-purple-600"
                                                : "bg-muted"
                                        )}
                                    >
                                        <motion.span
                                            animate={{ x: timerEnabled ? -24 : 0 }}
                                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white shadow-md"
                                        />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold mb-4">📋 مراجعة الاختبار</h2>

                                <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl p-5 border border-primary/20 space-y-4">
                                    {[
                                        { label: 'الصف', value: `الصف ${grade}`, icon: '🎓' },
                                        { label: 'المادة', value: subjectName, icon: '📚' },
                                        { label: 'المواضيع', value: `${selectedTopics.length} موضوع`, icon: '📝' },
                                        { label: 'عدد الأسئلة', value: counts.msq + counts.true_false + counts.fill_blank, icon: '❓' },
                                        { label: 'المؤقت', value: timerEnabled ? 'مفعل' : 'معطل', icon: '⏰' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-muted-foreground">
                                                <span>{item.icon}</span>
                                                <span>{item.label}</span>
                                            </span>
                                            <span className="font-bold">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-sm text-muted-foreground text-center mt-4">
                                    ✨ كل شيء جاهز! اضغط على زر التوليد للبدء
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Fixed footer */}
            <footer className="relative shrink-0 px-4 py-4 bg-background/95 backdrop-blur-xl border-t border-border/50">
                {/* Hint text */}
                {currentStep === 1 && !canProceed() && (
                    <p className="text-xs text-muted-foreground text-center mb-3">
                        👆 اختر الصف والمادة للمتابعة
                    </p>
                )}
                {currentStep === 2 && !canProceed() && (
                    <p className="text-xs text-muted-foreground text-center mb-3">
                        👆 اختر موضوع واحد على الأقل
                    </p>
                )}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between gap-3">
                    <button
                        onClick={goPrev}
                        disabled={currentStep === 1}
                        className={cn(
                            "flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all",
                            currentStep === 1
                                ? "text-muted-foreground/40 bg-muted/50"
                                : "text-foreground bg-muted active:scale-95"
                        )}
                    >
                        <ChevronRight size={20} />
                        <span>السابق</span>
                    </button>

                    {currentStep < 4 ? (
                        <button
                            onClick={goNext}
                            disabled={!canProceed()}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                                canProceed()
                                    ? "text-white bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/30 active:scale-[0.98]"
                                    : "text-muted-foreground/50 bg-muted"
                            )}
                        >
                            <span>التالي</span>
                            <ChevronLeft size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary via-purple-600 to-pink-500 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
                        >
                            {isSubmitting ? (
                                <><Loader2 size={20} className="animate-spin" /> جاري التوليد...</>
                            ) : (
                                <><Sparkles size={20} /> توليد الاختبار ✨</>
                            )}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );

    return createPortal(wizardContent, document.body);
}

export default MobileGenerationWizard;
