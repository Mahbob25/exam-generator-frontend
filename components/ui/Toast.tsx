'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4000;

/**
 * ToastProvider - Wrap your app to enable toast notifications
 * 
 * @example
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback(
        (type: ToastType, message: string, duration = DEFAULT_DURATION) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newToast: Toast = { id, type, message, duration };

            setToasts((prev) => [...prev, newToast]);

            if (duration > 0) {
                setTimeout(() => removeToast(id), duration);
            }
        },
        [removeToast]
    );

    const success = useCallback(
        (message: string, duration?: number) => addToast('success', message, duration),
        [addToast]
    );

    const error = useCallback(
        (message: string, duration?: number) => addToast('error', message, duration),
        [addToast]
    );

    const warning = useCallback(
        (message: string, duration?: number) => addToast('warning', message, duration),
        [addToast]
    );

    const info = useCallback(
        (message: string, duration?: number) => addToast('info', message, duration),
        [addToast]
    );

    return (
        <ToastContext.Provider
            value={{ toasts, addToast, removeToast, success, error, warning, info }}
        >
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

/**
 * useToast - Hook to access toast functions
 * 
 * @example
 * const toast = useToast();
 * toast.success('Operation completed!');
 */
export const useToast = (): ToastContextValue => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Toast Icons
const icons: Record<ToastType, React.ReactNode> = {
    success: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    error: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
    warning: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    info: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    ),
};

// Toast Container
const ToastContainer: React.FC<{
    toasts: Toast[];
    onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
    if (typeof document === 'undefined' || toasts.length === 0) return null;

    return createPortal(
        <div className={styles.container} role="region" aria-label="Notifications">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>,
        document.body
    );
};

// Individual Toast
const ToastItem: React.FC<{
    toast: Toast;
    onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 200);
    };

    return (
        <div
            className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exiting : ''}`}
            role="alert"
        >
            <span className={styles.icon}>{icons[toast.type]}</span>
            <p className={styles.message}>{toast.message}</p>
            <button
                type="button"
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Dismiss notification"
            >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    );
};

export default ToastProvider;
