'use client';

import React, { forwardRef, SelectHTMLAttributes, useId } from 'react';
import styles from './Select.module.css';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    /** Options to display */
    options: SelectOption[];
    /** Label text above the select */
    label?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Helper text below the select */
    helperText?: string;
    /** Error message (shows error state when present) */
    error?: string;
    /** Select size */
    size?: SelectSize;
    /** Full width select */
    fullWidth?: boolean;
}

/**
 * Select Component
 * 
 * A styled dropdown select with label, error states, and accessibility.
 * 
 * @example
 * <Select
 *   label="Grade"
 *   options={[
 *     { value: '7', label: 'Grade 7' },
 *     { value: '8', label: 'Grade 8' },
 *   ]}
 *   value={grade}
 *   onChange={(e) => setGrade(e.target.value)}
 * />
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            options,
            label,
            placeholder,
            helperText,
            error,
            size = 'md',
            fullWidth = false,
            className = '',
            id,
            ...props
        },
        ref
    ) => {
        const generatedId = useId();
        const selectId = id || generatedId;
        const errorId = `${selectId}-error`;
        const helperId = `${selectId}-helper`;

        const hasError = Boolean(error);

        const wrapperClassNames = [
            styles.wrapper,
            fullWidth ? styles.fullWidth : '',
            className,
        ]
            .filter(Boolean)
            .join(' ');

        const selectWrapperClassNames = [
            styles.selectWrapper,
            styles[`size-${size}`],
            hasError ? styles.error : '',
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <div className={wrapperClassNames}>
                {label && (
                    <label htmlFor={selectId} className={styles.label}>
                        {label}
                    </label>
                )}

                <div className={selectWrapperClassNames}>
                    <select
                        ref={ref}
                        id={selectId}
                        className={styles.select}
                        aria-invalid={hasError}
                        aria-describedby={
                            hasError ? errorId : helperText ? helperId : undefined
                        }
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <span className={styles.arrow} aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </span>
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

Select.displayName = 'Select';

export default Select;
