'use client';

/**
 * Logout Button Component
 * 
 * Simple button to sign out the current user.
 */

import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { Button } from '@/components/ui';
import type { ButtonVariant, ButtonSize } from '@/components/ui';

interface LogoutButtonProps {
    /** Button variant */
    variant?: ButtonVariant;
    /** Button size */
    size?: ButtonSize;
    /** Custom button content */
    children?: React.ReactNode;
    /** Additional class name */
    className?: string;
    /** Callback after successful logout */
    onLogoutSuccess?: () => void;
    /** Callback on logout error */
    onLogoutError?: (error: Error) => void;
}

/**
 * LogoutButton Component
 * 
 * @example
 * <LogoutButton onLogoutSuccess={() => router.push('/login')} />
 */
export function LogoutButton({
    variant = 'ghost',
    size = 'md',
    children,
    className,
    onLogoutSuccess,
    onLogoutError,
}: LogoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        const auth = getFirebaseAuth();
        if (!auth) {
            onLogoutError?.(new Error('Authentication service not available'));
            return;
        }

        setIsLoading(true);
        try {
            await signOut(auth);
            onLogoutSuccess?.();
        } catch (err: any) {
            console.error('Logout error:', err);
            onLogoutError?.(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleLogout}
            isLoading={isLoading}
            className={className}
        >
            {children || 'تسجيل الخروج'}
        </Button>
    );
}

export default LogoutButton;
