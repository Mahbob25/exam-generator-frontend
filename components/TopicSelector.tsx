"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { clsx } from "clsx";

interface TopicSelectorProps {
    topics: string[];
    selectedTopics: string[];
    onChange: (topics: string[]) => void;
    isLoading: boolean;
}

export default function TopicSelector({
    topics,
    selectedTopics,
    onChange,
    isLoading,
}: TopicSelectorProps) {
    const toggleTopic = (topic: string) => {
        if (selectedTopics.includes(topic)) {
            onChange(selectedTopics.filter((t) => t !== topic));
        } else {
            onChange([...selectedTopics, topic]);
        }
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="h-16 bg-muted/50 rounded-lg animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (topics.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                <p>لا توجد مواضيع متاحة لهذا الاختيار.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {topics.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                    <motion.button
                        key={topic}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleTopic(topic)}
                        className={clsx(
                            "relative p-4 rounded-xl border-2 text-right transition-all duration-200 flex items-center justify-between group",
                            isSelected
                                ? "border-primary bg-primary/5 text-primary shadow-sm"
                                : "border-muted hover:border-primary/50 hover:bg-muted/30 text-foreground"
                        )}
                        type="button"
                    >
                        <div
                            className={clsx(
                                "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                isSelected
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-muted-foreground/30 group-hover:border-primary/50"
                            )}
                        >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="flex-1 mr-3 font-medium truncate" dir="rtl">
                            {topic}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}
