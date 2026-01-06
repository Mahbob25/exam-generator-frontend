'use client';

import { useRouter } from 'next/navigation';
import { SignupForm } from '@/features/auth';
import styles from '../auth.module.css';

export default function SignupPage() {
    const router = useRouter();

    const handleSuccess = () => {
        // Redirect to dashboard after successful signup
        router.push('/');
    };

    const handleSwitchToLogin = () => {
        router.push('/login');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <SignupForm
                    onSuccess={handleSuccess}
                    onSwitchToLogin={handleSwitchToLogin}
                />
            </div>
        </div>
    );
}
