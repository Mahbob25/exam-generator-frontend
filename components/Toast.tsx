"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (type: ToastType, message: string, duration = 5000) => {
        const id = Math.random().toString(36).substring(7);
        const toast: Toast = { id, type, message, duration };

        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    };

    const success = (message: string, duration?: number) => showToast("success", message, duration);
    const error = (message: string, duration?: number) => showToast("error", message, duration);
    const warning = (message: string, duration?: number) => showToast("warning", message, duration);
    const info = (message: string, duration?: number) => showToast("info", message, duration);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 z-[100] flex flex-col gap-2 md:min-w-[400px]" dir="rtl">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
                ))}
            </AnimatePresence>
        </div>
    );
}

interface ToastItemProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
    const getToastStyle = () => {
        switch (toast.type) {
            case "success":
                return {
                    bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
                    icon: <CheckCircle2 className="text-green-600 dark:text-green-400" size={20} />,
                    text: "text-green-900 dark:text-green-100"
                };
            case "error":
                return {
                    bg: "bg-red-50 dark:bg-red-950/90 border-red-300 dark:border-red-700",
                    icon: <XCircle className="text-red-700 dark:text-red-400" size={20} />,
                    text: "text-red-950 dark:text-red-50 font-medium"
                };
            case "warning":
                return {
                    bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
                    icon: <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={20} />,
                    text: "text-yellow-900 dark:text-yellow-100"
                };
            case "info":
                return {
                    bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
                    icon: <Info className="text-blue-600 dark:text-blue-400" size={20} />,
                    text: "text-blue-900 dark:text-blue-100"
                };
        }
    };

    const style = getToastStyle();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`${style.bg} ${style.text} border rounded-lg shadow-lg p-4 flex items-start gap-3 relative overflow-hidden`}
        >
            {/* Progress bar */}
            {toast.duration && toast.duration > 0 && (
                <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: toast.duration / 1000, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-1 bg-current opacity-20"
                />
            )}

            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
                {style.icon}
            </div>

            {/* Message */}
            <div className="flex-1 text-sm font-medium leading-relaxed">
                {toast.message}
            </div>

            {/* Close button */}
            <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
                aria-label="إغلاق"
            >
                <X size={18} />
            </button>
        </motion.div>
    );
}
