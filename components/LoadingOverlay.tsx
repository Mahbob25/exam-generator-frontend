"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface LoadingOverlayProps {
    status?: string;
    progress?: string;
}

export default function LoadingOverlay({ status, progress }: LoadingOverlayProps) {
    const [dots, setDots] = useState(".");
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Animated dots effect
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? "." : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Timer for elapsed time
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Parse progress to determine stage
    const getProgressStage = () => {
        if (!progress) return { percent: 10 };

        const lower = progress.toLowerCase();
        if (lower.includes("تحضير") || lower.includes("بدء")) {
            return { percent: 15 };
        } else if (lower.includes("استرجاع") || lower.includes("جاري البحث")) {
            return { percent: 35 };
        } else if (lower.includes("توليد") || lower.includes("إنشاء")) {
            return { percent: 65 };
        } else if (lower.includes("تحقق") || lower.includes("مراجعة")) {
            return { percent: 90 };
        } else if (lower.includes("اكتمل") || lower.includes("انتهى")) {
            return { percent: 100 };
        }
        return { percent: 50 };
    };

    const { percent } = getProgressStage();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            dir="rtl"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
            >
                <div className="flex flex-col items-center gap-6">
                    {/* Animated Icon */}
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center"
                        >
                            <Sparkles className="text-primary" size={28} />
                        </motion.div>
                    </div>

                    {/* Status Text */}
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-foreground">
                            {status || "جاري التوليد"}
                            <span className="inline-block w-8 text-right">{dots}</span>
                        </h3>

                        {progress && (
                            <p className="text-sm text-muted-foreground">
                                {progress}
                            </p>
                        )}

                        {/* Elapsed Time */}
                        <p className="text-xs text-muted-foreground/70">
                            الوقت المنقضي: {elapsedSeconds} ثانية
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full space-y-2">
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-primary to-purple-600 relative"
                            >
                                {/* Shimmer effect */}
                                <motion.div
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                />
                            </motion.div>
                        </div>
                        <p className="text-xs text-center text-muted-foreground">
                            {percent}% مكتمل
                        </p>
                    </div>

                    {/* Stage Indicators */}
                    <div className="w-full flex justify-between items-center px-2">
                        {[
                            { id: "init", label: "البدء", value: 10 },
                            { id: "retrieval", label: "البحث", value: 30 },
                            { id: "generation", label: "التوليد", value: 60 },
                            { id: "validation", label: "التحقق", value: 85 },
                        ].map((item) => (
                            <div key={item.id} className="flex flex-col items-center gap-1">
                                <div className={`w-3 h-3 rounded-full transition-colors ${percent >= item.value
                                        ? "bg-primary"
                                        : "bg-muted-foreground/20"
                                    }`} />
                                <span className={`text-xs transition-colors ${percent >= item.value
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground/50"
                                    }`}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Helpful Tip */}
                    <div className="w-full p-3 bg-muted/50 rounded-lg border border-border/50">
                        <p className="text-xs text-muted-foreground text-center leading-relaxed">
                            💡 قد تستغرق هذه العملية دقيقة أو دقيقتين حسب عدد الأسئلة المطلوبة
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
