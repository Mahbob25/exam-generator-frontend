'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, History, Settings, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeroCard } from './components/HeroCard';

// Get greeting based on time of day
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء الخير';
};

// Mobile icon grid actions
const mobileActions = [
    { label: 'تعلم', href: '/learn', icon: BookOpen, color: 'bg-blue-500' },
    { label: 'اختبار', href: '/generate', icon: Sparkles, color: 'bg-purple-500' },
    { label: 'السجل', href: '/history', icon: History, color: 'bg-emerald-500' },
    { label: 'الإعدادات', href: '/settings', icon: Settings, color: 'bg-gray-500' },
];

// Desktop quick actions (original)
const desktopActions = [
    {
        title: 'استمر في التعلم',
        description: 'تابع من حيث توقفت في رحلة التعلم',
        href: '/learn',
        icon: BookOpen,
        color: 'primary',
    },
    {
        title: 'توليد اختبار',
        description: 'أنشئ اختباراً مخصصاً بالذكاء الاصطناعي',
        href: '/generate',
        icon: Sparkles,
        color: 'purple',
    },
    {
        title: 'سجل الاختبارات',
        description: 'راجع اختباراتك السابقة ونتائجك',
        href: '/history',
        icon: History,
        color: 'emerald',
    },
];

// Mobile Home Component
function MobileHome() {
    const greeting = getGreeting();

    // TODO: Get real stats from store/API
    const stats = { exams: 0, concepts: 0, xp: 0 };
    const hasStats = stats.exams > 0 || stats.concepts > 0 || stats.xp > 0;

    return (
        <div className="min-h-screen pb-20">
            {/* Greeting */}
            <div className="text-center pt-4 pb-2">
                <p className="text-lg text-muted-foreground">{greeting} 👋</p>
            </div>

            {/* Hero CTA */}
            <HeroCard />

            {/* 2x2 Action Grid */}
            <div className="grid grid-cols-2 gap-3 px-4 mb-6">
                {mobileActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="flex flex-col items-center justify-center p-4 bg-card rounded-xl border border-border/50 shadow-sm active:scale-95 transition-transform"
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center text-white mb-2",
                                action.color
                            )}>
                                <Icon size={24} />
                            </div>
                            <span className="text-sm font-medium text-foreground">{action.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Compact Stats Row (only if has stats) */}
            {hasStats && (
                <div className="mx-4 p-3 bg-card rounded-xl border border-border/50 flex items-center justify-around">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">📝</span>
                        <div className="text-center">
                            <div className="text-lg font-bold text-primary">{stats.exams}</div>
                            <div className="text-xs text-muted-foreground">اختبارات</div>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="flex items-center gap-2">
                        <span className="text-lg">📖</span>
                        <div className="text-center">
                            <div className="text-lg font-bold text-primary">{stats.concepts}</div>
                            <div className="text-xs text-muted-foreground">مفهوم</div>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="flex items-center gap-2">
                        <span className="text-lg">⭐</span>
                        <div className="text-center">
                            <div className="text-lg font-bold text-primary">{stats.xp}</div>
                            <div className="text-xs text-muted-foreground">XP</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Desktop Home Component (original layout)
function DesktopHome() {
    const greeting = getGreeting();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Welcome */}
            <div className="text-center py-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">{greeting} 👋</h1>
                <p className="text-lg text-muted-foreground">
                    مرحباً بك في منصة ذاكر. ماذا تريد أن تفعل اليوم؟
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {desktopActions.map((action) => {
                    const Icon = action.icon;
                    const colorClass = action.color === 'primary'
                        ? 'from-blue-500 to-indigo-600'
                        : action.color === 'purple'
                            ? 'from-purple-500 to-pink-600'
                            : 'from-emerald-500 to-teal-600';

                    return (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="flex items-center gap-4 p-5 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all group"
                        >
                            <div className={cn(
                                "w-14 h-14 rounded-xl flex items-center justify-center text-white bg-gradient-to-br",
                                colorClass
                            )}>
                                <Icon size={28} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                                <p className="text-sm text-muted-foreground">{action.description}</p>
                            </div>
                            <ChevronLeft size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                    );
                })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'اختبارات مكتملة', value: 0 },
                    { label: 'مفاهيم متعلمة', value: 0 },
                    { label: 'نقاط الخبرة', value: 0 },
                ].map((stat) => (
                    <div key={stat.label} className="p-4 bg-card rounded-xl border border-border text-center">
                        <div className="text-2xl font-bold text-primary">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function DashboardHomePage() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile ? <MobileHome /> : <DesktopHome />;
}
