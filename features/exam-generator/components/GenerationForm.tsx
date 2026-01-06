'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, BookOpen, GraduationCap } from 'lucide-react';
import { useExamStore } from '../store';
import { examApi } from '@/lib/api/exam';
import { Button, useToast } from '@/components/ui';
import { ExamSelect } from './ExamSelect';
import { TopicSelector } from './TopicSelector';
import styles from './GenerationForm.module.css';

/**
 * GenerationForm Component
 * 
 * Form for selecting exam parameters and initiating generation.
 * Migrated from legacy components/GenerationForm.tsx
 */
export function GenerationForm() {
    const { startJob, setSettings } = useExamStore();
    const toast = useToast();

    const [availableGrades, setAvailableGrades] = useState<number[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<Record<number, { id: string; name: string }[]>>({});

    const [grade, setGrade] = useState<number>(12);
    const [subject, setSubject] = useState<string>('');

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
                const meta = await examApi.fetchMetadata();
                if (!meta || !meta.grades) {
                    console.warn('[Form Warning] Empty metadata received');
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
                console.error('[Form Error] Failed to load metadata', e);
                toast.error('فشل تحميل البيانات. يرجى تحديث الصفحة.');
            }
        }
        loadMeta();
    }, []);

    // Update subject when grade changes
    useEffect(() => {
        const subjectsForGrade = availableSubjects[grade];
        if (subjectsForGrade && subjectsForGrade.length > 0) {
            const exists = subjectsForGrade.find(s => s.id === subject);
            if (!exists) {
                setSubject(subjectsForGrade[0].id);
            }
        }
    }, [grade, availableSubjects, subject]);

    // Load topics when subject changes
    useEffect(() => {
        if (!subject) return;

        let mounted = true;
        async function load() {
            setIsLoadingTopics(true);
            setError(null);
            setSelectedTopics([]);

            try {
                const fetchedTopics = await examApi.fetchTopics(grade, subject);
                if (mounted) {
                    setTopics(fetchedTopics);
                }
            } catch (err) {
                console.error('[Form Error] Failed to load topics:', err);
                if (mounted) {
                    setError('فشل تحميل المواضيع. يرجى المحاولة مرة أخرى.');
                    setTopics([]);
                }
            } finally {
                if (mounted) setIsLoadingTopics(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, [grade, subject]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedTopics.length === 0) {
            toast.error('يرجى اختيار موضوع واحد على الأقل');
            return;
        }

        const totalQuestions = counts.msq + counts.true_false + counts.fill_blank;
        if (totalQuestions === 0) {
            toast.error('يرجى طلب سؤال واحد على الأقل');
            return;
        }

        const maxAllowed = selectedTopics.length * 15;
        if (totalQuestions > maxAllowed) {
            toast.error(`الحد الأقصى ${maxAllowed} سؤال (15 لكل موضوع). تم طلب ${totalQuestions}`);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await examApi.generateQuestions({
                grade,
                subject,
                topics: selectedTopics,
                counts,
                question_type: 'msq',
            });

            // Update store settings
            setSettings({
                subject,
                grade,
                topics: selectedTopics,
                timerEnabled,
                duration: 1 // Default duration per question logic can be handled in exam taking
            });

            // Start job (hooks will pick this up)
            startJob(response.job_id);

        } catch (err: any) {
            console.error(err);
            const errorMessage = err?.message || 'حدث خطأ غير معروف';
            toast.error(`فشل بدء التوليد: ${errorMessage}`);
            setIsSubmitting(false);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit} dir="rtl">
            {/* Grade & Subject Section */}
            <div className={styles.grid}>
                <div className={styles.field}>
                    <label className={styles.label}>
                        <GraduationCap size={18} />
                        الصف الدراسي
                    </label>
                    <ExamSelect
                        value={grade}
                        onChange={(val) => setGrade(Number(val))}
                        options={availableGrades.map(g => ({ value: g, label: `الصف ${g}` }))}
                        placeholder="اختر الصف"
                        icon={<GraduationCap size={16} />}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>
                        <BookOpen size={18} />
                        المادة
                    </label>
                    <ExamSelect
                        value={subject}
                        onChange={(val) => setSubject(String(val))}
                        options={
                            availableSubjects[grade]?.map(s => ({ value: s.id, label: s.name })) || []
                        }
                        placeholder="اختر المادة"
                        disabled={!availableSubjects[grade] || availableSubjects[grade].length === 0}
                        icon={<BookOpen size={16} />}
                    />
                </div>
            </div>

            <div className={styles.divider} />

            {/* Topic Selection */}
            <div className={styles.field}>
                <div className={styles.sectionHeader}>
                    <label className={styles.sectionTitle}>اختر المواضيع</label>
                    <span className={styles.badge}>
                        تم اختيار {selectedTopics.length}
                    </span>
                </div>

                {error && <div className={styles.errorBox}>{error}</div>}

                <TopicSelector
                    topics={topics}
                    selectedTopics={selectedTopics}
                    onChange={setSelectedTopics}
                    isLoading={isLoadingTopics}
                />
            </div>

            <div className={styles.divider} />

            {/* Configuration */}
            <div className={styles.field}>
                <div className={styles.sectionHeader}>
                    <label className={styles.sectionTitle}>إعدادات الاختبار</label>
                </div>

                <div className={styles.timerCard}>
                    <div>
                        <div className={styles.timerLabel}>
                            ⏰ المؤقت
                        </div>
                        <p className={styles.timerDesc}>
                            تفعيل مؤقت للامتحان (دقيقة واحدة لكل سؤال افتراضياً)
                        </p>
                    </div>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            className={styles.switchInput}
                            checked={timerEnabled}
                            onChange={(e) => setTimerEnabled(e.target.checked)}
                        />
                        <span className={styles.switchTrack}>
                            <span className={styles.switchThumb} />
                        </span>
                    </label>
                </div>

                <div className={styles.field}>
                    <div className={styles.sectionHeader}>
                        <label className={styles.label}>توزيع الأسئلة</label>
                        <span className={styles.badge}>
                            الحد الأقصى: {selectedTopics.length * 15}
                        </span>
                    </div>
                    <div className={styles.countsGrid}>
                        {[
                            { id: 'msq', label: 'اختيار من متعدد', icon: '🔢' },
                            { id: 'true_false', label: 'صح / خطأ', icon: '✅' },
                            { id: 'fill_blank', label: 'أكمل الفراغ', icon: '✍️' },
                        ].map((type) => (
                            <div key={type.id} className={styles.countCard}>
                                <div className={styles.countLabel}>
                                    <span>{type.icon}</span> {type.label}
                                </div>
                                <input
                                    type="number"
                                    min={0}
                                    max={15}
                                    className={styles.countInput}
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
                className={styles.submitButton}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className={styles.spin} /> جاري البدء...
                    </>
                ) : (
                    <>
                        <Sparkles className={styles.pulse} /> توليد الاختبار
                    </>
                )}
            </button>
        </form>
    );
}
