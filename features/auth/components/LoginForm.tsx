'use client';

/**
 * Login Form Component
 * 
 * Email/password login form for Firebase authentication.
 */

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { Button, Input } from '@/components/ui';
import styles from './LoginForm.module.css';

interface LoginFormProps {
    /** Callback after successful login */
    onSuccess?: () => void;
    /** Callback if user wants to switch to signup */
    onSwitchToSignup?: () => void;
}

/**
 * LoginForm Component
 * 
 * @example
 * <LoginForm onSuccess={() => router.push('/dashboard')} />
 */
export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const auth = getFirebaseAuth();
        if (!auth) {
            setError('Authentication service not available');
            setIsLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            onSuccess?.();
        } catch (err: any) {
            // Handle Firebase auth errors
            const errorCode = err?.code;
            switch (errorCode) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
                    break;
                case 'auth/invalid-email':
                    setError('البريد الإلكتروني غير صالح');
                    break;
                case 'auth/user-disabled':
                    setError('تم تعطيل هذا الحساب');
                    break;
                case 'auth/too-many-requests':
                    setError('محاولات كثيرة جداً. حاول مرة أخرى لاحقاً');
                    break;
                default:
                    setError('فشل تسجيل الدخول. حاول مرة أخرى');
                    console.error('Login error:', err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.header}>
                <h1 className={styles.title}>تسجيل الدخول</h1>
                <p className={styles.subtitle}>أدخل بياناتك للوصول إلى حسابك</p>
            </div>

            {error && (
                <div className={styles.error} role="alert">
                    {error}
                </div>
            )}

            <div className={styles.fields}>
                <Input
                    label="البريد الإلكتروني"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    autoComplete="email"
                    fullWidth
                    dir="ltr"
                />

                <Input
                    label="كلمة المرور"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    fullWidth
                    dir="ltr"
                />
            </div>

            <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                fullWidth
            >
                تسجيل الدخول
            </Button>

            {onSwitchToSignup && (
                <p className={styles.switchText}>
                    ليس لديك حساب؟{' '}
                    <button
                        type="button"
                        className={styles.switchLink}
                        onClick={onSwitchToSignup}
                    >
                        إنشاء حساب جديد
                    </button>
                </p>
            )}
        </form>
    );
}

export default LoginForm;
