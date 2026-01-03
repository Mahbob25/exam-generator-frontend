import { motion } from "framer-motion";

interface ProgressBarProps {
    current: number;
    total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
    const percentage = Math.round((current / total) * 100);

    return (
        <div className="w-full space-y-2 mb-6" dir="rtl">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>التقدم</span>
                <span>{percentage}%</span>
            </div>
            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full"
                />
            </div>
        </div>
    );
}
