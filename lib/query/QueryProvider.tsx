'use client';

/**
 * Query Provider
 * 
 * Provides React Query context to the application.
 * Also includes DevTools in development mode.
 */

import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from './queryClient';

interface QueryProviderProps {
    children: React.ReactNode;
}

/**
 * QueryProvider Component
 * 
 * Wrap your app with this provider to enable React Query.
 * DevTools are automatically included in development mode.
 * 
 * @example
 * // In your root layout.tsx
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 */
export function QueryProvider({ children }: QueryProviderProps) {
    // Create a stable query client per component lifecycle
    // This ensures SSR hydration works correctly
    const [queryClient] = useState(() => createQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools
                    initialIsOpen={false}
                    buttonPosition="bottom-left"
                />
            )}
        </QueryClientProvider>
    );
}

export default QueryProvider;
