'use client';

import React from 'react';
import styles from './Spinner.module.css';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps {
    /** Spinner size */
    size?: SpinnerSize;
    /** Color (defaults to accent color) */
    color?: string;
    /** Label for screen readers */
    label?: string;
    /** Show spinner centered in container */
    centered?: boolean;
    /** Class name for custom styling */
    className?: string;
}

/**
 * Spinner Component
 * 
 * A loading spinner with multiple sizes and accessible labeling.
 * 
 * @example
 * <Spinner size="md" label="Loading content..." />
 */
export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    color,
    label = 'Loading...',
    centered = false,
    className = '',
}) => {
    const classNames = [
        styles.spinner,
        styles[`size-${size}`],
        centered ? styles.centered : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const style = color ? { '--spinner-color': color } as React.CSSProperties : undefined;

    return (
        <div className={classNames} style={style} role="status" aria-live="polite">
            <svg viewBox="0 0 24 24" className={styles.svg} aria-hidden="true">
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    className={styles.circle}
                />
            </svg>
            <span className={styles.srOnly}>{label}</span>
        </div>
    );
};

/**
 * SpinnerOverlay - Full-screen or container overlay with spinner
 */
export const SpinnerOverlay: React.FC<{
    label?: string;
    fullScreen?: boolean;
    className?: string;
}> = ({ label = 'Loading...', fullScreen = false, className = '' }) => (
    <div
        className={`${styles.overlay} ${fullScreen ? styles.fullScreen : ''} ${className}`}
    >
        <Spinner size="lg" label={label} />
        <p className={styles.overlayLabel}>{label}</p>
    </div>
);

export default Spinner;
