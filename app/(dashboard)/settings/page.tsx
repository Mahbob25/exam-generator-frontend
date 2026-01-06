'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, User, Globe, Bell, Shield } from 'lucide-react';
import { useUIStore, type Theme } from '@/lib/store/useUIStore';
import styles from './page.module.css';

// Theme option component
const ThemeOption = ({
    value,
    current,
    onChange,
    icon: Icon,
    label
}: {
    value: Theme;
    current: Theme;
    onChange: (v: Theme) => void;
    icon: React.ElementType;
    label: string;
}) => (
    <button
        onClick={() => onChange(value)}
        className={`${styles.themeOption} ${current === value ? styles.active : ''}`}
    >
        <Icon size={24} />
        <span>{label}</span>
    </button>
);

// Settings section component
const SettingsSection = ({
    title,
    icon: Icon,
    children
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) => (
    <section className={styles.section}>
        <div className={styles.sectionHeader}>
            <Icon size={20} />
            <h2 className={styles.sectionTitle}>{title}</h2>
        </div>
        <div className={styles.sectionContent}>
            {children}
        </div>
    </section>
);

export default function SettingsPage() {
    const { theme, setTheme } = useUIStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div className={styles.page}>
                <h1 className={styles.pageTitle}>الإعدادات</h1>
                <div className={styles.loading}>جاري التحميل...</div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <h1 className={styles.pageTitle}>الإعدادات</h1>

            {/* Theme Settings */}
            <SettingsSection title="المظهر" icon={Sun}>
                <p className={styles.description}>
                    اختر المظهر المفضل لديك للمنصة
                </p>
                <div className={styles.themeOptions}>
                    <ThemeOption
                        value="light"
                        current={theme}
                        onChange={setTheme}
                        icon={Sun}
                        label="فاتح"
                    />
                    <ThemeOption
                        value="dark"
                        current={theme}
                        onChange={setTheme}
                        icon={Moon}
                        label="داكن"
                    />
                    <ThemeOption
                        value="system"
                        current={theme}
                        onChange={setTheme}
                        icon={Monitor}
                        label="تلقائي"
                    />
                </div>
            </SettingsSection>

            {/* Account Settings (Placeholder) */}
            <SettingsSection title="الحساب" icon={User}>
                <div className={styles.placeholderCard}>
                    <p className={styles.placeholderText}>
                        إعدادات الحساب ستكون متاحة قريباً
                    </p>
                </div>
            </SettingsSection>

            {/* Language Settings (Placeholder) */}
            <SettingsSection title="اللغة" icon={Globe}>
                <div className={styles.settingRow}>
                    <div>
                        <span className={styles.settingLabel}>اللغة الحالية</span>
                        <span className={styles.settingValue}>العربية</span>
                    </div>
                    <span className={styles.badge}>قريباً</span>
                </div>
            </SettingsSection>

            {/* Notifications (Placeholder) */}
            <SettingsSection title="الإشعارات" icon={Bell}>
                <div className={styles.settingRow}>
                    <div>
                        <span className={styles.settingLabel}>إشعارات المنصة</span>
                        <span className={styles.settingDescription}>تلقي إشعارات عند اكتمال الاختبارات</span>
                    </div>
                    <span className={styles.badge}>قريباً</span>
                </div>
            </SettingsSection>

            {/* Privacy (Placeholder) */}
            <SettingsSection title="الخصوصية" icon={Shield}>
                <div className={styles.placeholderCard}>
                    <p className={styles.placeholderText}>
                        إعدادات الخصوصية ستكون متاحة قريباً
                    </p>
                </div>
            </SettingsSection>
        </div>
    );
}
