'use client';

/**
 * Signup Form Component
 * 
 * Registration form for new users with Firebase authentication.
 */

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { Button, Input } from '@/components/ui';
import styles from './LoginForm.module.css'; // Reuse login form styles

interface SignupFormProps {
    /** Callback after successful signup */
    onSuccess?: () => void;
    /** Callback if user wants to switch to login */
    onSwitchToLogin?: () => void;
}

/**
 * SignupForm Component
 * 
 * @example
 * <SignupForm onSuccess={() => router.push('/dashboard')} />
 */
export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }

        // Validate password strength
        if (password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setIsLoading(true);

        const auth = getFirebaseAuth();
        if (!auth) {
            setError('Authentication service not available');
            setIsLoading(false);
            return;
        }

        try {
            // Create user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update profile with display name
            if (name) {
                await updateProfile(userCredential.user, { displayName: name });
            }

            onSuccess?.();
        } catch (err: any) {
            // Handle Firebase auth errors
            const errorCode = err?.code;
            switch (errorCode) {
                case 'auth/email-already-in-use':
                    setError('هذا البريد الإلكتروني مستخدم بالفعل');
                    break;
                case 'auth/invalid-email':
                    setError('البريد الإلكتروني غير صالح');
                    break;
                case 'auth/weak-password':
                    setError('كلمة المرور ضعيفة جداً');
                    break;
                case 'auth/operation-not-allowed':
                    setError('تسجيل الحسابات الجديدة غير متاح حالياً');
                    break;
                default:
                    setError('فشل إنشاء الحساب. حاول مرة أخرى');
                    console.error('Signup error:', err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.header}>
                <h1 className={styles.title}>إنشاء حساب جديد</h1>
                <p className={styles.subtitle}>ابدأ رحلة التعلم معنا</p>
            </div>

            {error && (
                <div className={styles.error} role="alert">
                    {error}
                </div>
            )}

            <div className={styles.fields}>
                <Input
                    label="الاسم"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسمك الكامل"
                    autoComplete="name"
                    fullWidth
                />

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
                    placeholder="6 أحرف على الأقل"
                    required
                    autoComplete="new-password"
                    fullWidth
                    dir="ltr"
                />

                <Input
                    label="تأكيد كلمة المرور"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور"
                    required
                    autoComplete="new-password"
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
                إنشاء الحساب
            </Button>

            {onSwitchToLogin && (
                <p className={styles.switchText}>
                    لديك حساب بالفعل؟{' '}
                    <button
                        type="button"
                        className={styles.switchLink}
                        onClick={onSwitchToLogin}
                    >
                        تسجيل الدخول
                    </button>
                </p>
            )}
        </form>
    );
}

export default SignupForm;
