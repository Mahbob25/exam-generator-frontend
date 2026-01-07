'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Loader2, Sparkles, Check, GraduationCap, BookOpen, Settings, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamStore } from '../store';
import { examApi } from '@/lib/api/exam';
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
                const meta = await examApi.fetchMetadata();
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
                const fetchedTopics = await examApi.fetchTopics(grade, subject);
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
            const response = await examApi.generateQuestions({
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

    return (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col" dir="rtl">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-lg safe-area-pt">
                <button onClick={onClose} className="p-2 -m-2 rounded-full text-muted-foreground hover:text-foreground">
                    <X size={24} />
                </button>
                <h1 className="text-lg font-bold">إنشاء اختبار</h1>
                <div className="w-8" />
            </header>

            {/* Progress */}
            <div className="px-4 py-3 flex items-center justify-between gap-2">
                {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    return (
                        <div key={step.id} className="flex-1 flex flex-col items-center">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all",
                                isActive ? "bg-primary text-primary-foreground scale-110" :
                                    isCompleted ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                                {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}>{step.title}</span>
                        </div>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 overflow-y-auto px-4 py-6 scroll-native"
                    >
                        {/* Step 1: Grade & Subject */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">الصف الدراسي</label>
                                    <ExamSelect
                                        value={grade}
                                        onChange={(val) => setGrade(Number(val))}
                                        options={availableGrades.map(g => ({ value: g, label: `الصف ${g}` }))}
                                        placeholder="اختر الصف"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">المادة</label>
                                    <ExamSelect
                                        value={subject}
                                        onChange={(val) => setSubject(String(val))}
                                        options={availableSubjects[grade]?.map(s => ({ value: s.id, label: s.name })) || []}
                                        placeholder="اختر المادة"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Topics */}
                        {currentStep === 2 && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold">اختر المواضيع</h2>
                                    <span className="text-sm text-primary font-medium">{selectedTopics.length} مختار</span>
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
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold mb-4">توزيع الأسئلة</h2>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'msq', label: 'اختيار من متعدد', icon: '🔢' },
                                            { id: 'true_false', label: 'صح / خطأ', icon: '✅' },
                                            { id: 'fill_blank', label: 'أكمل الفراغ', icon: '✍️' },
                                        ].map((type) => (
                                            <div key={type.id} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border/50">
                                                <span className="flex items-center gap-2">
                                                    <span>{type.icon}</span>
                                                    <span className="font-medium">{type.label}</span>
                                                </span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={15}
                                                    className="w-16 p-2 text-center bg-muted rounded-lg border-0 font-bold"
                                                    value={counts[type.id as keyof typeof counts]}
                                                    onChange={(e) => setCounts({ ...counts, [type.id]: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50">
                                    <div>
                                        <div className="font-medium">⏰ المؤقت</div>
                                        <div className="text-sm text-muted-foreground">دقيقة لكل سؤال</div>
                                    </div>
                                    <button
                                        onClick={() => setTimerEnabled(!timerEnabled)}
                                        className={cn(
                                            "w-12 h-7 rounded-full transition-colors relative",
                                            timerEnabled ? "bg-primary" : "bg-muted"
                                        )}
                                    >
                                        <span className={cn(
                                            "absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all",
                                            timerEnabled ? "right-1" : "left-1"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold mb-4">مراجعة الاختبار</h2>

                                <div className="p-4 bg-card rounded-xl border border-border/50 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">الصف</span>
                                        <span className="font-medium">الصف {grade}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">المادة</span>
                                        <span className="font-medium">{subjectName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">المواضيع</span>
                                        <span className="font-medium">{selectedTopics.length} موضوع</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">عدد الأسئلة</span>
                                        <span className="font-medium">{counts.msq + counts.true_false + counts.fill_blank}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">المؤقت</span>
                                        <span className="font-medium">{timerEnabled ? 'مفعل' : 'معطل'}</span>
                                    </div>
                                </div>

                                <div className="text-sm text-muted-foreground text-center">
                                    راجع التفاصيل ثم اضغط على زر التوليد
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer */}
            <footer className="flex items-center justify-between px-4 py-4 border-t border-border/50 bg-background/80 backdrop-blur-lg safe-area-pb">
                <button
                    onClick={goPrev}
                    disabled={currentStep === 1}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
                        currentStep === 1 ? "text-muted-foreground/50" : "text-foreground bg-muted active:scale-95"
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
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all",
                            canProceed()
                                ? "text-primary-foreground bg-primary active:scale-95 shadow-md"
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
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-primary-foreground bg-gradient-to-r from-primary to-purple-600 active:scale-95 shadow-lg"
                    >
                        {isSubmitting ? (
                            <><Loader2 size={20} className="animate-spin" /> جاري التوليد...</>
                        ) : (
                            <><Sparkles size={20} /> توليد الاختبار</>
                        )}
                    </button>
                )}
            </footer>
        </div>
    );
}

export default MobileGenerationWizard;
