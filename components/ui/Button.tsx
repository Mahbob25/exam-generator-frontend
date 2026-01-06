'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Visual style variant */
    variant?: ButtonVariant;
    /** Button size */
    size?: ButtonSize;
    /** Show loading spinner */
    isLoading?: boolean;
    /** Full width button */
    fullWidth?: boolean;
    /** Left icon element */
    leftIcon?: React.ReactNode;
    /** Right icon element */
    rightIcon?: React.ReactNode;
}

/**
 * Button Component
 * 
 * A versatile button with multiple variants, sizes, and states.
 * Supports loading state, icons, and full-width mode.
 * 
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            fullWidth = false,
            leftIcon,
            rightIcon,
            disabled,
            className = '',
            ...props
        },
        ref
    ) => {
        const classNames = [
            styles.button,
            styles[`variant-${variant}`],
            styles[`size-${size}`],
            fullWidth ? styles.fullWidth : '',
            isLoading ? styles.loading : '',
            className,
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <button
                ref={ref}
                className={classNames}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <span className={styles.spinner} aria-hidden="true">
                        <svg viewBox="0 0 24 24" className={styles.spinnerIcon}>
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray="31.4 31.4"
                            />
                        </svg>
                    </span>
                )}
                {!isLoading && leftIcon && (
                    <span className={styles.iconLeft}>{leftIcon}</span>
                )}
                <span className={styles.content}>{children}</span>
                {!isLoading && rightIcon && (
                    <span className={styles.iconRight}>{rightIcon}</span>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
