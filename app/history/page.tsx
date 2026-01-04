
"use client";

import { useEffect, useState } from "react";
import { getExamHistory, clearHistory, ExamResult } from "@/lib/history";
import { Trash2, Calendar, BookOpen, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Link from "next/link";

export default function HistoryPage() {
    const [history, setHistory] = useState<ExamResult[]>([]);

    useEffect(() => {
        setHistory(getExamHistory());
    }, []);

    const handleClear = () => {
        if (confirm("هل أنت متأكد من مسح جميع السجلات؟")) {
            clearHistory();
            setHistory([]);
        }
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <main className="min-h-screen bg-background" dir="rtl">
            <Header />
            <div className="p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {history.length > 0 && (
                        <div className="flex justify-end mb-6">
                            <button
                                onClick={handleClear}
                                className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors text-sm font-medium px-4 py-2 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20"
                            >
                                <Trash2 size={16} />
                                مسح السجل
                            </button>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold font-heading">سجل الاختبارات</h1>
                            <span className="text-muted-foreground text-sm bg-muted px-3 py-1 rounded-full">
                                {history.length} اختبار
                            </span>
                        </div>

                        {history.length === 0 ? (
                            <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed">
                                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                                <h3 className="text-xl font-bold text-muted-foreground">لا يوجد سجلات حتى الآن</h3>
                                <p className="text-muted-foreground/70 mt-2 mb-6">قم بإجراء اختبار جديد لترى نتائجه هنا.</p>
                                <Link
                                    href="/generate"
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all"
                                >
                                    بدء اختبار جديد
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {history.map((exam, i) => (
                                    <motion.div
                                        key={exam.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-card p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-lg">{exam.subjectName || exam.subject}</h3>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium flex items-center gap-1">
                                                    <GraduationCap size={12} />
                                                    الصف {exam.grade}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={14} />
                                                    {formatDate(exam.date)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <div className="text-xs text-muted-foreground mb-1">النتيجة</div>
                                                <div className="font-bold text-xl flex items-center gap-1">
                                                    <span className={exam.percentage >= 60 ? "text-green-600" : "text-red-600"}>
                                                        {exam.score}
                                                    </span>
                                                    <span className="text-muted-foreground text-sm">/ {exam.total}</span>
                                                </div>
                                            </div>
                                            <div className="w-px h-8 bg-border hidden md:block" />
                                            <div className="text-center min-w-[3rem]">
                                                <div className="text-xs text-muted-foreground mb-1">النسبة</div>
                                                <div className={`font-bold ${exam.percentage >= 60 ? "text-green-600" : "text-red-600"}`}>
                                                    {exam.percentage}%
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
