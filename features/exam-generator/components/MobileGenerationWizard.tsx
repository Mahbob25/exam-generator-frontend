'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Sparkles, Check, GraduationCap, BookOpen, Settings, ClipboardList, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamStore } from '../store';
import { fetchMetadata, fetchTopics, generateQuestions } from '@/lib/api/exam';
import { useToast } from '@/components/ui';
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
    const [grade, setGrade] = useState<number>(0);
    const [subject, setSubject] = useState<string>('');
    const [topics, setTopics] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [isLoadingTopics, setIsLoadingTopics] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [counts, setCounts] = useState({ msq: 5, true_false: 3, fill_blank: 2 });
    const [timerEnabled, setTimerEnabled] = useState(false);
    const [topicSearch, setTopicSearch] = useState('');

    // Load metadata
    useEffect(() => {
        async function loadMeta() {
            try {
                const meta = await fetchMetadata();
                if (!meta?.grades) return;
                setAvailableGrades(meta.grades);
                setAvailableSubjects(meta.subjects);
            } catch (e) {
                toast.error('فشل تحميل البيانات');
            }
        }
        loadMeta();
    }, []);

    // Load topics when subject changes
    useEffect(() => {
        if (!subject || !grade) return;
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

    const toggleTopic = (topic: string) => {
        setSelectedTopics(prev =>
            prev.includes(topic)
                ? prev.filter(t => t !== topic)
                : [...prev, topic]
        );
    };

    const filteredTopics = topics.filter(t =>
        t.toLowerCase().includes(topicSearch.toLowerCase())
    );

    const subjectName = availableSubjects[grade]?.find(s => s.id === subject)?.name || subject;
    const currentStepData = STEPS.find(s => s.id === currentStep);

    return (
        <div
            className="fixed inset-0 z-[99999] flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950"
            style={{ height: '100dvh' }}
            dir="rtl"
        >
            {/* === HEADER === */}
            <header className="shrink-0 px-4 pt-3 pb-4 bg-gradient-to-b from-black/20 to-transparent">
                {/* Step title */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-4"
                >
                    <h1 className="text-2xl font-bold text-white">
                        {currentStepData?.title}
                    </h1>
                    <p className="text-sm text-white/60 mt-1">
                        الخطوة {currentStep} من {STEPS.length}
                    </p>
                </motion.div>

                {/* Progress steps */}
                <div className="flex items-center justify-center gap-1">
                    {STEPS.map((step, i) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;
                        const Icon = step.icon;

                        return (
                            <React.Fragment key={step.id}>
                                {i > 0 && (
                                    <div className={cn(
                                        "w-8 h-1 rounded-full transition-all duration-500",
                                        step.id <= currentStep
                                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                                            : "bg-white/10"
                                    )} />
                                )}
                                <motion.div
                                    animate={{ scale: isActive ? 1.1 : 1 }}
                                    className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                                        isActive
                                            ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50"
                                            : isCompleted
                                                ? "bg-purple-500/30 text-purple-300"
                                                : "bg-white/10 text-white/40"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check size={20} className="text-white" strokeWidth={3} />
                                    ) : (
                                        <Icon size={20} className={isActive ? "text-white" : ""} />
                                    )}
                                </motion.div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </header>

            {/* === CONTENT === */}
            <main className="flex-1 overflow-y-auto px-4 pb-4">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Step 1: Grade & Subject */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                {/* Grade */}
                                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
                                    <label className="flex items-center gap-2 text-white font-semibold mb-3">
                                        <span className="text-2xl">🎓</span>
                                        الصف الدراسي
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {availableGrades.map(g => (
                                            <button
                                                key={g}
                                                onClick={() => {
                                                    setGrade(g);
                                                    setSubject('');
                                                }}
                                                className={cn(
                                                    "py-3 rounded-xl font-bold transition-all",
                                                    grade === g
                                                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                                        : "bg-white/10 text-white/70 hover:bg-white/20"
                                                )}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Subject - only show when grade selected */}
                                <AnimatePresence>
                                    {grade > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10"
                                        >
                                            <label className="flex items-center gap-2 text-white font-semibold mb-3">
                                                <span className="text-2xl">📚</span>
                                                المادة الدراسية
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {availableSubjects[grade]?.map(s => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => setSubject(s.id)}
                                                        className={cn(
                                                            "py-3 px-4 rounded-xl font-medium transition-all text-sm",
                                                            subject === s.id
                                                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                                                : "bg-white/10 text-white/70 hover:bg-white/20"
                                                        )}
                                                    >
                                                        {s.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Step 2: Topics */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                    <input
                                        type="text"
                                        placeholder="ابحث عن موضوع..."
                                        value={topicSearch}
                                        onChange={(e) => setTopicSearch(e.target.value)}
                                        className="w-full py-3 pr-12 pl-4 bg-white/10 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500"
                                    />
                                </div>

                                {/* Quick actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedTopics(filteredTopics)}
                                        className="flex-1 py-2 rounded-xl bg-purple-500/20 text-purple-300 font-medium text-sm"
                                    >
                                        ✓ تحديد الكل
                                    </button>
                                    <button
                                        onClick={() => setSelectedTopics([])}
                                        className="flex-1 py-2 rounded-xl bg-white/10 text-white/60 font-medium text-sm"
                                    >
                                        ✕ إلغاء الكل
                                    </button>
                                </div>

                                {/* Topics grid */}
                                {isLoadingTopics ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="animate-spin text-purple-400" size={32} />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredTopics.map(topic => {
                                            const isSelected = selectedTopics.includes(topic);
                                            return (
                                                <button
                                                    key={topic}
                                                    onClick={() => toggleTopic(topic)}
                                                    className={cn(
                                                        "w-full p-4 rounded-2xl text-right transition-all flex items-center gap-3",
                                                        isSelected
                                                            ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-2 border-purple-500"
                                                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                                                        isSelected ? "bg-purple-500" : "bg-white/10"
                                                    )}>
                                                        {isSelected && <Check size={14} className="text-white" />}
                                                    </div>
                                                    <span className={cn(
                                                        "flex-1 font-medium",
                                                        isSelected ? "text-white" : "text-white/70"
                                                    )}>
                                                        {topic}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Settings */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                {[
                                    { id: 'msq', label: 'اختيار من متعدد', icon: '🔢', color: 'from-blue-500 to-cyan-500' },
                                    { id: 'true_false', label: 'صح / خطأ', icon: '✅', color: 'from-green-500 to-emerald-500' },
                                    { id: 'fill_blank', label: 'أكمل الفراغ', icon: '✍️', color: 'from-orange-500 to-yellow-500' },
                                ].map((type) => (
                                    <div
                                        key={type.id}
                                        className="bg-white/5 backdrop-blur-xl rounded-3xl p-4 border border-white/10 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center text-xl`}>
                                                {type.icon}
                                            </span>
                                            <span className="font-medium text-white">{type.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setCounts({ ...counts, [type.id]: Math.max(0, counts[type.id as keyof typeof counts] - 1) })}
                                                className="w-10 h-10 rounded-xl bg-white/10 text-white font-bold text-xl"
                                            >
                                                −
                                            </button>
                                            <span className="w-8 text-center text-white font-bold text-xl">
                                                {counts[type.id as keyof typeof counts]}
                                            </span>
                                            <button
                                                onClick={() => setCounts({ ...counts, [type.id]: Math.min(15, counts[type.id as keyof typeof counts] + 1) })}
                                                className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Timer toggle */}
                                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-4 border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xl">
                                            ⏱️
                                        </span>
                                        <div>
                                            <div className="font-medium text-white">المؤقت</div>
                                            <div className="text-sm text-white/50">دقيقة لكل سؤال</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setTimerEnabled(!timerEnabled)}
                                        className={cn(
                                            "w-14 h-8 rounded-full transition-all relative",
                                            timerEnabled ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-white/20"
                                        )}
                                    >
                                        <motion.div
                                            animate={{ x: timerEnabled ? -22 : 0 }}
                                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white shadow"
                                        />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/30">
                                    {[
                                        { label: 'الصف', value: `الصف ${grade}`, icon: '🎓' },
                                        { label: 'المادة', value: subjectName, icon: '📚' },
                                        { label: 'المواضيع', value: `${selectedTopics.length} موضوع`, icon: '📝' },
                                        { label: 'الأسئلة', value: `${counts.msq + counts.true_false + counts.fill_blank} سؤال`, icon: '❓' },
                                        { label: 'المؤقت', value: timerEnabled ? 'مفعل' : 'معطل', icon: '⏱️' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                                            <span className="flex items-center gap-2 text-white/60">
                                                <span>{item.icon}</span>
                                                {item.label}
                                            </span>
                                            <span className="font-bold text-white">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-center text-white/50 text-sm">
                                    ✨ كل شيء جاهز للتوليد!
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* === FOOTER === */}
            <footer className="shrink-0 px-4 pb-4 pt-2 bg-gradient-to-t from-black/40 to-transparent">
                {/* Hint */}
                {!canProceed() && (
                    <p className="text-center text-white/40 text-sm mb-3">
                        {currentStep === 1 && "👆 اختر الصف والمادة"}
                        {currentStep === 2 && "👆 اختر موضوع واحد على الأقل"}
                    </p>
                )}

                {/* Selected count for step 2 */}
                {currentStep === 2 && selectedTopics.length > 0 && (
                    <p className="text-center text-purple-400 text-sm mb-3 font-medium">
                        ✓ تم اختيار {selectedTopics.length} موضوع
                    </p>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={goPrev}
                        disabled={currentStep === 1}
                        className={cn(
                            "px-6 py-4 rounded-2xl font-bold transition-all flex items-center gap-2",
                            currentStep === 1
                                ? "bg-white/5 text-white/20"
                                : "bg-white/10 text-white hover:bg-white/20"
                        )}
                    >
                        <ChevronRight size={20} />
                        السابق
                    </button>

                    {currentStep < 4 ? (
                        <button
                            onClick={goNext}
                            disabled={!canProceed()}
                            className={cn(
                                "flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2",
                                canProceed()
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                                    : "bg-white/10 text-white/30"
                            )}
                        >
                            التالي
                            <ChevronLeft size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 py-4 rounded-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <><Loader2 size={20} className="animate-spin" /> جاري التوليد...</>
                            ) : (
                                <><Sparkles size={20} /> توليد الاختبار</>
                            )}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}

export default MobileGenerationWizard;
