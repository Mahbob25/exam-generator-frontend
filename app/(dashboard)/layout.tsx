'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Monitor, LogOut, User, Sparkles } from 'lucide-react';
import { Sidebar, NavIcons, PageContainer } from '@/components/layout';
import { ProtectedRoute } from '@/components/shared';
import { useUIStore } from '@/lib/store/useUIStore';
import type { NavItem } from '@/components/layout/Sidebar';
import styles from './layout.module.css';

// Dashboard navigation items
const navItems: NavItem[] = [
    { label: 'الرئيسية', href: '/dashboard', icon: NavIcons.home },
    { label: 'التعلم', href: '/learn', icon: NavIcons.learn },
    { label: 'توليد الأسئلة', href: '/generate', icon: NavIcons.exam },
    { label: 'السجل', href: '/history', icon: NavIcons.progress },
    { label: 'الإعدادات', href: '/settings', icon: NavIcons.settings },
];

// Theme toggle component
const ThemeToggle = () => {
    const { theme, setTheme } = useUIStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const cycleTheme = () => {
        const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
        setTheme(next);
    };

    return (
        <button
            onClick={cycleTheme}
            className={styles.themeButton}
            title={`الوضع الحالي: ${theme === 'light' ? 'فاتح' : theme === 'dark' ? 'داكن' : 'تلقائي'}`}
            aria-label={`تبديل المظهر - الوضع الحالي: ${theme === 'light' ? 'فاتح' : theme === 'dark' ? 'داكن' : 'تلقائي'}`}
        >
            {theme === 'light' && <Sun size={20} />}
            {theme === 'dark' && <Moon size={20} />}
            {theme === 'system' && <Monitor size={20} />}
        </button>
    );
};

// Dashboard header for mobile (top bar with logo and actions)
const DashboardHeader = () => {
    return (
        <header className={styles.header}>
            <Link href="/dashboard" className={styles.logo}>
                <div className={styles.logoIcon}>
                    <Sparkles size={18} />
                </div>
                <span className={styles.logoText}>ذاكر</span>
            </Link>

            <div className={styles.headerActions}>
                <ThemeToggle />
                <button className={styles.userButton} title="الحساب" aria-label="حسابي">
                    <User size={20} />
                </button>
            </div>
        </header>
    );
};

// Sidebar header (logo)
const SidebarHeader = ({ isCollapsed = false }: { isCollapsed?: boolean }) => (
    <Link href="/dashboard" className={styles.sidebarLogo}>
        <div className={styles.logoIcon}>
            <Sparkles size={18} />
        </div>
        {!isCollapsed && <span className={styles.logoText}>ذاكر</span>}
    </Link>
);

// Sidebar footer
const SidebarFooter = () => {
    const { theme, setTheme } = useUIStore();

    return (
        <div className={styles.sidebarFooter}>
            <ThemeToggle />
            <button className={styles.logoutButton} title="تسجيل الخروج">
                <LogOut size={18} />
                <span>خروج</span>
            </button>
        </div>
    );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const {
        isSidebarCollapsed,
        setSidebarCollapsed,
        isSidebarOpen,
        setSidebarOpen
    } = useUIStore();

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [pathname, isMobile, setSidebarOpen]);

    return (
        <ProtectedRoute>
            <div className={styles.layout} dir="rtl">
                {/* Desktop Sidebar */}
                {!isMobile && (
                    <Sidebar
                        items={navItems}
                        isCollapsed={isSidebarCollapsed}
                        onToggleCollapse={setSidebarCollapsed}
                        header={<SidebarHeader isCollapsed={isSidebarCollapsed} />}
                        footer={<SidebarFooter />}
                    />
                )}

                {/* Mobile Sidebar */}
                {isMobile && (
                    <Sidebar
                        items={navItems}
                        isMobile={true}
                        isOpen={isSidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        header={<SidebarHeader />}
                        footer={<SidebarFooter />}
                    />
                )}

                {/* Main Content Area */}
                <div className={`${styles.main} ${!isMobile && isSidebarCollapsed ? styles.mainExpanded : ''}`}>
                    {/* Mobile Header */}
                    {isMobile && <DashboardHeader />}

                    {/* Page Content */}
                    <main className={styles.content}>
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
