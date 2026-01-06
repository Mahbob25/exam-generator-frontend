'use client';

import React, { forwardRef, InputHTMLAttributes, useState, useId } from 'react';
import styles from './Input.module.css';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Label text above the input */
    label?: string;
    /** Helper text below the input */
    helperText?: string;
    /** Error message (shows error state when present) */
    error?: string;
    /** Input size */
    size?: InputSize;
    /** Left addon/icon */
    leftAddon?: React.ReactNode;
    /** Right addon/icon */
    rightAddon?: React.ReactNode;
    /** Full width input */
    fullWidth?: boolean;
}

/**
 * Input Component
 * 
 * A styled text input with label, helper text, error states, and addons.
 * 
 * @example
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   error={errors.email}
 *   leftAddon={<MailIcon />}
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            helperText,
            error,
            size = 'md',
            leftAddon,
            rightAddon,
            fullWidth = false,
            className = '',
            id,
            ...props
        },
        ref
    ) => {
        const generatedId = useId();
        const inputId = id || generatedId;
        const errorId = `${inputId}-error`;
        const helperId = `${inputId}-helper`;

        const hasError = Boolean(error);

        const wrapperClassNames = [
            styles.wrapper,
            fullWidth ? styles.fullWidth : '',
            className,
        ]
            .filter(Boolean)
            .join(' ');

        const inputWrapperClassNames = [
            styles.inputWrapper,
            styles[`size-${size}`],
            hasError ? styles.error : '',
            leftAddon ? styles.hasLeftAddon : '',
            rightAddon ? styles.hasRightAddon : '',
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <div className={wrapperClassNames}>
                {label && (
                    <label htmlFor={inputId} className={styles.label}>
                        {label}
                    </label>
                )}

                <div className={inputWrapperClassNames}>
                    {leftAddon && (
                        <span className={styles.addonLeft} aria-hidden="true">
                            {leftAddon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={styles.input}
                        aria-invalid={hasError}
                        aria-describedby={
                            hasError ? errorId : helperText ? helperId : undefined
                        }
                        {...props}
                    />

                    {rightAddon && (
                        <span className={styles.addonRight} aria-hidden="true">
                            {rightAddon}
                        </span>
                    )}
                </div>

                {hasError && (
                    <span id={errorId} className={styles.errorText} role="alert">
                        {error}
                    </span>
                )}

                {!hasError && helperText && (
                    <span id={helperId} className={styles.helperText}>
                        {helperText}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
