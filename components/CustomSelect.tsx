"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

interface CustomSelectProps {
    value: string | number;
    onChange: (value: string | number) => void;
    options: Array<{ value: string | number; label: string }>;
    placeholder?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
}

export default function CustomSelect({
    value,
    onChange,
    options,
    placeholder = "اختر...",
    disabled = false,
    icon
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

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
        <div ref={dropdownRef} className="relative">
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 bg-background border-2 rounded-xl text-sm font-medium outline-none transition-all ${disabled
                        ? "opacity-50 cursor-not-allowed border-muted"
                        : isOpen
                            ? "border-primary shadow-sm"
                            : "border-muted hover:border-primary/50"
                    }`}
            >
                <div className="flex items-center gap-2 flex-1 text-right">
                    {icon && <span className="text-muted-foreground">{icon}</span>}
                    <span className={selectedOption ? "text-foreground" : "text-muted-foreground"}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown
                    size={18}
                    className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-2 bg-card border-2 border-border rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="max-h-[300px] overflow-y-auto p-2">
                            {options.map((option) => {
                                const isSelected = option.value === value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-right ${isSelected
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "hover:bg-muted/50 text-foreground"
                                            }`}
                                    >
                                        <span>{option.label}</span>
                                        {isSelected && (
                                            <Check size={16} className="text-primary" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
