"use client";

import { motion } from "framer-motion";

interface LoadingOverlayProps {
    status: string; // PENDING, PROCESSING, etc.
    progress?: string;
}

export default function LoadingOverlay({ status, progress }: LoadingOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
            <div className="flex flex-col items-center max-w-md p-6 text-center">
                <div className="relative w-24 h-24 mb-8">
                    <motion.div
                        className="absolute inset-0 border-4 border-muted rounded-full"
                    />
                    <motion.div
                        className="absolute inset-0 border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">🤖</span>
                    </div>
                </div>

                <h2 className="text-2xl font-bold font-heading mb-2">جاري توليد الأسئلة</h2>
                <p className="text-muted-foreground mb-6">
                    يرجى الانتظار بينما يقوم الذكاء الاصطناعي بإعداد أسئلتك. قد يستغرق هذا بضع لحظات.
                </p>

                <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden relative">
                    <motion.div
                        className="absolute inset-0 bg-primary/50 w-1/3"
                        animate={{
                            x: ["-100%", "300%"],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </div>

                <div className="mt-4 font-mono text-sm text-primary flex items-center justify-center gap-2" dir="rtl">
                    <span className="font-bold">الحالة:</span>
                    <span>{status}</span>
                    {progress && <span className="opacity-75"> - {progress}</span>}
                </div>
            </div>
        </motion.div>
    );
}
