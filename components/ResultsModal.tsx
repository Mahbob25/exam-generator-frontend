import { motion } from "framer-motion";
import { Printer, RefreshCcw, Trophy, CheckCircle, XCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { clsx } from "clsx";

interface ResultsModalProps {
    score: number;
    total: number;
    onRetake: () => void;
    onClose: () => void; // Optional if we want to view answers behind
}

export default function ResultsModal({ score, total, onRetake, onClose }: ResultsModalProps) {
    const percentage = Math.round((score / total) * 100);
    const isPassed = percentage >= 60;
    const isPerfect = percentage === 100;

    useEffect(() => {
        if (isPassed) {
            const end = Date.now() + 1000;
            const colors = ["#8b5cf6", "#d946ef", "#0ea5e9"];

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors,
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors,
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            })();
        }
    }, [isPassed]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" dir="rtl">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md bg-card border rounded-3xl shadow-xl overflow-hidden"
            >
                <div className={clsx(
                    "p-8 text-center space-y-4",
                    isPassed ? "bg-gradient-to-b from-green-50/50 to-transparent dark:from-green-900/10" : "bg-gradient-to-b from-red-50/50 to-transparent dark:from-red-900/10"
                )}>
                    <div className="mx-auto w-20 h-20 rounded-full bg-background shadow-sm flex items-center justify-center mb-6">
                        {isPerfect ? (
                            <Trophy className="w-10 h-10 text-yellow-500" />
                        ) : isPassed ? (
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        ) : (
                            <XCircle className="w-10 h-10 text-red-500" />
                        )}
                    </div>

                    <h2 className="text-3xl font-black font-heading">
                        {isPerfect ? "ممتاز!" : isPassed ? "أحسنت!" : "حظاً أوفر"}
                    </h2>

                    <p className="text-muted-foreground">
                        {isPassed
                            ? "لقد أتممت الاختبار بنجاح."
                            : "لا بأس، يمكنك المحاولة مرة أخرى لتحسين نتيجتك."}
                    </p>

                    <div className="py-6 flex items-center justify-center gap-8">
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground mb-1">النتيجة</div>
                            <div className="text-3xl font-bold font-heading">{score} <span className="text-muted-foreground/50 text-xl">/ {total}</span></div>
                        </div>
                        <div className="w-px h-12 bg-border" />
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground mb-1">النسبة</div>
                            <div className={clsx("text-3xl font-bold font-heading", isPassed ? "text-green-600" : "text-red-600")}>
                                {percentage}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-muted/20 border-t space-y-3">
                    <button
                        onClick={onRetake}
                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCcw size={18} />
                        إعادة الاختبار
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handlePrint}
                            className="py-3 rounded-xl border bg-background hover:bg-muted transition-all flex items-center justify-center gap-2 font-medium"
                        >
                            <Printer size={18} />
                            طباعة
                        </button>
                        <button
                            onClick={onClose}
                            className="py-3 rounded-xl border bg-background hover:bg-muted transition-all font-medium text-muted-foreground"
                        >
                            مراجعة الإجابات
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
