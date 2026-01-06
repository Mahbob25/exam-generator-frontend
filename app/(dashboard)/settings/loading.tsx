'use client';

import { Skeleton } from '@/components/ui';
import styles from './page.module.css';

/**
 * Settings Page Loading State
 * Skeleton loaders matching the settings page sections
 */
export default function SettingsLoading() {
    return (
        <div className={styles.page}>
            <h1 className={styles.pageTitle}>
                <Skeleton variant="text" width="100px" height={32} />
            </h1>

            {/* Theme Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Skeleton variant="circular" width={20} height={20} />
                    <Skeleton variant="text" width="60px" height={20} />
                </div>
                <div className={styles.sectionContent}>
                    <Skeleton variant="text" width="200px" height={16} />
                    <div className={styles.themeOptions}>
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} variant="rounded" width="100%" height={80} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Account Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Skeleton variant="circular" width={20} height={20} />
                    <Skeleton variant="text" width="60px" height={20} />
                </div>
                <div className={styles.sectionContent}>
                    <Skeleton variant="rounded" width="100%" height={80} />
                </div>
            </section>

            {/* Language Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Skeleton variant="circular" width={20} height={20} />
                    <Skeleton variant="text" width="50px" height={20} />
                </div>
                <div className={styles.sectionContent}>
                    <div className={styles.settingRow}>
                        <div>
                            <Skeleton variant="text" width="100px" height={16} />
                            <Skeleton variant="text" width="60px" height={14} />
                        </div>
                        <Skeleton variant="rounded" width="50px" height={24} />
                    </div>
                </div>
            </section>
        </div>
    );
}
