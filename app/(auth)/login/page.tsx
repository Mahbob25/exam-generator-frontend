'use client';

import { useRouter } from 'next/navigation';
import { LoginForm } from '@/features/auth';
import styles from '../auth.module.css';

export default function LoginPage() {
    const router = useRouter();

    const handleSuccess = () => {
        // Redirect to dashboard after successful login
        router.push('/dashboard');
    };

    const handleSwitchToSignup = () => {
        router.push('/signup');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <LoginForm
                    onSuccess={handleSuccess}
                    onSwitchToSignup={handleSwitchToSignup}
                />
            </div>
        </div>
    );
}
