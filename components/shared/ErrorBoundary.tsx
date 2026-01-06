'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
    children: ReactNode;
    /** Custom fallback UI */
    fallback?: ReactNode;
    /** Callback when an error is caught */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    /** Key to reset the error boundary (change to reset) */
    resetKey?: string | number;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors in child components and displays a fallback UI.
 * 
 * @example
 * <ErrorBoundary fallback={<CustomError />} onError={logError}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps): void {
        // Reset error state when resetKey changes
        if (
            this.state.hasError &&
            prevProps.resetKey !== this.props.resetKey
        ) {
            this.setState({ hasError: false, error: null });
        }
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback
            return (
                <div className={styles.container} role="alert">
                    <div className={styles.content}>
                        <div className={styles.icon}>
                            <svg
                                viewBox="0 0 24 24"
                                width="48"
                                height="48"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h2 className={styles.title}>Something went wrong</h2>
                        <p className={styles.message}>
                            We're sorry, but something unexpected happened. Please try again.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <pre className={styles.errorDetails}>
                                {this.state.error.message}
                            </pre>
                        )}
                        <button
                            type="button"
                            className={styles.button}
                            onClick={this.handleReset}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
