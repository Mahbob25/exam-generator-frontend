'use client';

import { Skeleton } from '@/components/ui';
import styles from './page.module.css';

/**
 * Dashboard Loading State
 * Skeleton loaders that match the exact shape of dashboard content
 */
export default function DashboardLoading() {
    return (
        <div className={styles.page}>
            {/* Welcome Section */}
            <section className={styles.welcomeSection}>
                <div className={styles.greeting}>
                    <Skeleton variant="text" width="180px" height={40} />
                </div>
                <div className={styles.subtitle}>
                    <Skeleton variant="text" width="320px" height={24} />
                </div>
            </section>

            {/* Quick Actions */}
            <section className={styles.actionsSection}>
                <h2 className={styles.sectionTitle}>
                    <Skeleton variant="text" width="150px" height={24} />
                </h2>
                <div className={styles.actionsGrid}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={styles.actionCard} style={{ pointerEvents: 'none' }}>
                            <div className={styles.actionIcon}>
                                <Skeleton variant="circular" width={28} height={28} />
                            </div>
                            <div className={styles.actionContent}>
                                <Skeleton variant="text" width="100px" height={20} />
                                <Skeleton variant="text" width="160px" height={16} />
                            </div>
                            <Skeleton variant="circular" width={20} height={20} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section className={styles.statsSection}>
                <h2 className={styles.sectionTitle}>
                    <Skeleton variant="text" width="100px" height={24} />
                </h2>
                <div className={styles.statsGrid}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={styles.statCard}>
                            <Skeleton variant="text" width="50px" height={40} />
                            <Skeleton variant="text" width="80px" height={16} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent Activity */}
            <section className={styles.recentSection}>
                <h2 className={styles.sectionTitle}>
                    <Skeleton variant="text" width="120px" height={24} />
                </h2>
                <div className={styles.emptyState}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Skeleton variant="text" width="140px" height={20} />
                    <Skeleton variant="text" width="200px" height={16} />
                </div>
            </section>
        </div>
    );
}
