'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, FileText, History, Sparkles } from 'lucide-react';
import styles from './page.module.css';

// Get greeting based on time of day
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء الخير';
};

// Quick action card data
const quickActions = [
    {
        title: 'استمر في التعلم',
        description: 'تابع من حيث توقفت في رحلة التعلم',
        href: '/learn',
        icon: BookOpen,
        color: 'primary',
        gradient: 'from-blue-500 to-indigo-600',
    },
    {
        title: 'توليد اختبار',
        description: 'أنشئ اختباراً مخصصاً بالذكاء الاصطناعي',
        href: '/generate',
        icon: Sparkles,
        color: 'purple',
        gradient: 'from-purple-500 to-pink-600',
    },
    {
        title: 'سجل الاختبارات',
        description: 'راجع اختباراتك السابقة ونتائجك',
        href: '/history',
        icon: History,
        color: 'emerald',
        gradient: 'from-emerald-500 to-teal-600',
    },
];

// Quick action card component
const QuickActionCard = ({ action }: { action: typeof quickActions[0] }) => {
    const Icon = action.icon;

    return (
        <Link href={action.href} className={styles.actionCard}>
            <div className={`${styles.actionIcon} ${styles[action.color]}`}>
                <Icon size={28} />
            </div>
            <div className={styles.actionContent}>
                <h3 className={styles.actionTitle}>{action.title}</h3>
                <p className={styles.actionDescription}>{action.description}</p>
            </div>
            <ArrowLeft size={20} className={styles.actionArrow} />
        </Link>
    );
};

// Stats placeholder
const StatsSection = () => (
    <section className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>إحصائياتك</h2>
        <div className={styles.statsGrid}>
            <div className={styles.statCard}>
                <span className={styles.statValue}>0</span>
                <span className={styles.statLabel}>اختبارات مكتملة</span>
            </div>
            <div className={styles.statCard}>
                <span className={styles.statValue}>0</span>
                <span className={styles.statLabel}>مفاهيم متعلمة</span>
            </div>
            <div className={styles.statCard}>
                <span className={styles.statValue}>0</span>
                <span className={styles.statLabel}>نقاط الخبرة</span>
            </div>
        </div>
    </section>
);

export default function DashboardHomePage() {
    const greeting = getGreeting();

    return (
        <div className={styles.page}>
            {/* Welcome Section */}
            <section className={styles.welcomeSection}>
                <h1 className={styles.greeting}>{greeting} 👋</h1>
                <p className={styles.subtitle}>
                    مرحباً بك في منصة ذاكر. ماذا تريد أن تفعل اليوم؟
                </p>
            </section>

            {/* Quick Actions */}
            <section className={styles.actionsSection}>
                <h2 className={styles.sectionTitle}>الإجراءات السريعة</h2>
                <div className={styles.actionsGrid}>
                    {quickActions.map((action) => (
                        <QuickActionCard key={action.href} action={action} />
                    ))}
                </div>
            </section>

            {/* Stats */}
            <StatsSection />

            {/* Recent Activity Placeholder */}
            <section className={styles.recentSection}>
                <h2 className={styles.sectionTitle}>النشاط الأخير</h2>
                <div className={styles.emptyState}>
                    <FileText size={48} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>لا يوجد نشاط حديث</p>
                    <p className={styles.emptySubtext}>ابدأ بإنشاء اختبار أو تعلم مفهوم جديد</p>
                </div>
            </section>
        </div>
    );
}
