'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import styles from './ExamSelect.module.css';

interface ExamSelectProps {
    value: string | number;
    onChange: (value: string | number) => void;
    options: Array<{ value: string | number; label: string }>;
    placeholder?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
    autoFocus?: boolean;
}

/**
 * ExamSelect Component
 * 
 * Styled select component specifically for the exam generator form.
 * Supports icons and custom animations (preserved from legacy CustomSelect).
 */
export function ExamSelect({
    value,
    onChange,
    options,
    placeholder = "اختر...",
    disabled = false,
    icon,
    autoFocus = false
}: ExamSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Auto-open dropdown when autoFocus is true (with slight delay for animation)
    useEffect(() => {
        if (autoFocus && !disabled) {
            const timer = setTimeout(() => setIsOpen(true), 350);
            return () => clearTimeout(timer);
        }
    }, [autoFocus, disabled]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className={styles.relative}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''}`}
            >
                <div className={styles.labelContainer}>
                    {icon && <span className={styles.icon}>{icon}</span>}
                    <span className={selectedOption ? '' : styles.placeholder}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown
                    size={18}
                    className={`${styles.chevron} ${isOpen ? styles.chevronRotate : ''}`}
                />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.optionsList}>
                        {options.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                                >
                                    <span>{option.label}</span>
                                    {isSelected && (
                                        <Check size={16} className={styles.check} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExamSelect;
