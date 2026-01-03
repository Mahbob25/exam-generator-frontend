"use client";

import { motion } from "framer-motion";
import { Search, CheckSquare, Square, CheckCheck, XCircle } from "lucide-react";
import { useState } from "react";

interface TopicSelectorProps {
    topics: string[];
    selectedTopics: string[];
    onChange: (selected: string[]) => void;
    isLoading?: boolean;
}

export default function TopicSelector({ topics, selectedTopics, onChange, isLoading }: TopicSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter topics based on search
    const filteredTopics = topics.filter(topic =>
        topic.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleTopic = (topic: string) => {
        if (selectedTopics.includes(topic)) {
            onChange(selectedTopics.filter(t => t !== topic));
        } else {
            onChange([...selectedTopics, topic]);
        }
    };

    const selectAll = () => {
        onChange(filteredTopics);
    };

    const selectNone = () => {
        onChange([]);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 bg-muted/20 rounded-xl border-2 border-dashed">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-muted-foreground">جاري تحميل المواضيع...</p>
                </div>
            </div>
        );
    }

    if (topics.length === 0) {
        return (
            <div className="flex items-center justify-center p-12 bg-muted/20 rounded-xl border-2 border-dashed">
                <p className="text-sm text-muted-foreground">لا توجد مواضيع متاحة</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="ابحث عن موضوع..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={selectAll}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors"
                    >
                        <CheckCheck size={16} />
                        <span className="hidden sm:inline">الكل</span>
                    </button>
                    <button
                        type="button"
                        onClick={selectNone}
                        className="flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg text-sm font-medium transition-colors"
                    >
                        <XCircle size={16} />
                        <span className="hidden sm:inline">إلغاء</span>
                    </button>
                </div>
            </div>

            {/* Topics List - Scrollable */}
            <div className="max-h-[400px] overflow-y-auto border rounded-xl bg-card">
                <div className="p-2 space-y-1">
                    {filteredTopics.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            لا توجد مواضيع تطابق البحث
                        </div>
                    ) : (
                        filteredTopics.map((topic, index) => {
                            const isSelected = selectedTopics.includes(topic);
                            return (
                                <motion.button
                                    key={topic}
                                    type="button"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    onClick={() => toggleTopic(topic)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-right transition-all ${isSelected
                                            ? "bg-primary/10 border-2 border-primary text-primary font-medium"
                                            : "bg-muted/30 hover:bg-muted/50 border-2 border-transparent"
                                        }`}
                                >
                                    {isSelected ? (
                                        <CheckSquare className="flex-shrink-0 text-primary" size={20} />
                                    ) : (
                                        <Square className="flex-shrink-0 text-muted-foreground" size={20} />
                                    )}
                                    <span className="flex-1 text-sm">{topic}</span>
                                </motion.button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>
                    {filteredTopics.length} من {topics.length} موضوع
                </span>
                <span className="font-medium text-primary">
                    تم اختيار {selectedTopics.length}
                </span>
            </div>
        </div>
    );
}
