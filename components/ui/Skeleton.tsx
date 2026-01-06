'use client';

import React from 'react';
import styles from './Skeleton.module.css';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

export interface SkeletonProps {
    /** Variant shape */
    variant?: SkeletonVariant;
    /** Width (can be number for px or string like '100%') */
    width?: number | string;
    /** Height (can be number for px or string) */
    height?: number | string;
    /** Animation type */
    animation?: 'pulse' | 'shimmer' | 'none';
    /** Number of skeleton lines (for text variant) */
    lines?: number;
    /** Class name for custom styling */
    className?: string;
}

/**
 * Skeleton Component
 * 
 * A loading placeholder that mimics content shape.
 * 
 * @example
 * <Skeleton variant="text" lines={3} />
 * <Skeleton variant="circular" width={48} height={48} />
 * <Skeleton variant="rectangular" width="100%" height={200} />
 */
export const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width,
    height,
    animation = 'shimmer',
    lines = 1,
    className = '',
}) => {
    const getStyle = (): React.CSSProperties => {
        const style: React.CSSProperties = {};

        if (width) {
            style.width = typeof width === 'number' ? `${width}px` : width;
        }

        if (height) {
            style.height = typeof height === 'number' ? `${height}px` : height;
        }

        return style;
    };

    const classNames = [
        styles.skeleton,
        styles[`variant-${variant}`],
        styles[`animation-${animation}`],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    // For text variant with multiple lines
    if (variant === 'text' && lines > 1) {
        return (
            <div className={styles.textContainer}>
                {Array.from({ length: lines }).map((_, index) => (
                    <div
                        key={index}
                        className={classNames}
                        style={{
                            ...getStyle(),
                            width: index === lines - 1 ? '70%' : getStyle().width,
                        }}
                        aria-hidden="true"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className={classNames} style={getStyle()} aria-hidden="true" />
    );
};

/**
 * SkeletonCard - Pre-built skeleton for card layouts
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({
    className = '',
}) => (
    <div className={`${styles.skeletonCard} ${className}`}>
        <Skeleton variant="rectangular" width="100%" height={120} />
        <div className={styles.skeletonCardContent}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" lines={2} />
            <Skeleton variant="rounded" width={80} height={32} />
        </div>
    </div>
);

/**
 * SkeletonAvatar - Circular skeleton with optional text
 */
export const SkeletonAvatar: React.FC<{
    size?: number;
    withText?: boolean;
    className?: string;
}> = ({ size = 40, withText = false, className = '' }) => (
    <div className={`${styles.skeletonAvatar} ${className}`}>
        <Skeleton variant="circular" width={size} height={size} />
        {withText && (
            <div className={styles.skeletonAvatarText}>
                <Skeleton variant="text" width={100} />
                <Skeleton variant="text" width={60} />
            </div>
        )}
    </div>
);

export default Skeleton;
