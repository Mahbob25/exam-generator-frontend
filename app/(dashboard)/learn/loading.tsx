'use client';

import { Skeleton } from '@/components/ui';

export default function LearnLoading() {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }} dir="rtl">
            {/* Header Skeleton */}
            <div style={{ marginBottom: '2rem' }}>
                <Skeleton variant="text" width="250px" height={40} />
                <div style={{ marginTop: '0.5rem' }}>
                    <Skeleton variant="text" width="350px" height={20} />
                </div>
            </div>

            {/* Subject Grid Skeleton */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem'
            }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        style={{
                            background: 'var(--color-bg-primary)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            border: '1px solid var(--color-border)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <Skeleton variant="rounded" width={64} height={64} />
                            <div style={{ flex: 1 }}>
                                <Skeleton variant="text" width="120px" height={24} />
                                <div style={{ marginTop: '0.5rem' }}>
                                    <Skeleton variant="text" width="80px" height={16} />
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <Skeleton variant="text" lines={2} />
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <Skeleton variant="rounded" width="100%" height={8} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
