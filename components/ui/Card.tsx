'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import styles from './Card.module.css';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'interactive';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** Visual style variant */
    variant?: CardVariant;
    /** Padding size */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Make card clickable with hover effects */
    clickable?: boolean;
    /** Show loading shimmer effect */
    isLoading?: boolean;
}

/**
 * Card Component
 * 
 * A container component with shadow, border radius, and optional interactivity.
 * 
 * @example
 * <Card variant="elevated" padding="md">
 *   <h2>Card Title</h2>
 *   <p>Card content goes here</p>
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            children,
            variant = 'default',
            padding = 'md',
            clickable = false,
            isLoading = false,
            className = '',
            ...props
        },
        ref
    ) => {
        const classNames = [
            styles.card,
            styles[`variant-${variant}`],
            styles[`padding-${padding}`],
            clickable ? styles.clickable : '',
            isLoading ? styles.loading : '',
            className,
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <div ref={ref} className={classNames} {...props}>
                {isLoading ? (
                    <div className={styles.shimmer} aria-label="Loading..." />
                ) : (
                    children
                )}
            </div>
        );
    }
);

Card.displayName = 'Card';

/**
 * CardHeader - Optional header section for Card
 */
export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    ...props
}) => (
    <div className={`${styles.header} ${className}`} {...props}>
        {children}
    </div>
);

/**
 * CardBody - Main content section for Card
 */
export const CardBody: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    ...props
}) => (
    <div className={`${styles.body} ${className}`} {...props}>
        {children}
    </div>
);

/**
 * CardFooter - Optional footer section for Card
 */
export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    ...props
}) => (
    <div className={`${styles.footer} ${className}`} {...props}>
        {children}
    </div>
);

export default Card;
