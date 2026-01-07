'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronLeft, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserProgress } from '@/features/progress/hooks/useUserProgress';

export function HeroCard() {
    const { hasProgress, isLoading } = useUserProgress();
    const [showHint, setShowHint] = useState(false);

    // Initial hint check
    useEffect(() => {
        if (!isLoading && !hasProgress) {
            const dismissed = localStorage.getItem('hero_hint_dismissed');
            if (!dismissed) {
                setShowHint(true);
            }
        }
    }, [isLoading, hasProgress]);

    const handleDismissHint = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        setShowHint(false);
        localStorage.setItem('hero_hint_dismissed', 'true');
    };

    const handleLinkClick = () => {
        if (showHint) {
            handleDismissHint();
        }
    };

    if (isLoading) {
        return (
            <div className="mx-4 mb-6 h-32 rounded-2xl bg-muted/20 animate-pulse" />
        );
    }

    // New User State
    if (!hasProgress) {
        return (
            <div className="relative group">
                {/* First-time User Hint Tooltip */}
                {showHint && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-foreground text-background text-sm font-medium py-2 px-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce z-10 whitespace-nowrap">
                        <span>ابدأ من هنا</span>
                        <span className="text-lg">👆</span>
                        <button
                            onClick={handleDismissHint}
                            className="ml-1 p-0.5 hover:bg-white/20 rounded-full"
                        >
                            <X size={12} />
                        </button>
                        {/* Twitter-like tooltip arrow */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rotate-45" />
                    </div>
                )}

                <Link
                    href="/learn"
                    onClick={handleLinkClick}
                    className="block mx-4 mb-6 p-5 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg active:scale-[0.98] transition-transform ring-offset-2 focus:ring-2 focus:ring-primary"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-1">ابدأ درسك الأول</h2>
                            <p className="text-sm text-white/80">انطلق في رحلة التعلم الذكي</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                            <Sparkles size={24} />
                        </div>
                    </div>
                    <div className="flex items-center justify-end mt-3 text-sm text-white/80 font-medium">
                        <span>ابدأ الآن</span>
                        <ChevronLeft size={16} className="mr-1" />
                    </div>
                </Link>
            </div>
        );
    }

    // Returning User State
    return (
        <Link
            href="/learn"
            className="block mx-4 mb-6 p-5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg active:scale-[0.98] transition-transform"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold mb-1">استمر من حيث توقفت</h2>
                    <p className="text-sm text-white/80">
                        {/* TODO: Add concept title here potentially */}
                        العودة إلى التعلم
                    </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <BookOpen size={24} />
                </div>
            </div>

            {/* Micro-progress Indicator */}
            <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((dot) => (
                        <div
                            key={dot}
                            className={cn(
                                "w-2 h-2 rounded-full transition-colors",
                                dot <= 2 ? "bg-white" : "bg-white/30"
                            )}
                        />
                    ))}
                </div>
                <span className="text-xs text-white/70 font-medium">
                    خطوة 2 من 5
                </span>

                <div className="mr-auto flex items-center text-sm text-white font-medium">
                    <span>تابـع</span>
                    <ChevronLeft size={16} className="mr-1" />
                </div>
            </div>
        </Link>
    );
}
