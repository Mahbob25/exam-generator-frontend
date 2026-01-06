'use client';

import React from 'react';
import styles from './LoadingScreen.module.css';

/**
 * Fun animated loading screen with bouncing books and sparkles
 */
export function LoadingScreen() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Animated Logo */}
                <div className={styles.logoWrapper}>
                    <div className={styles.sparkle} style={{ top: '-10px', right: '-10px', animationDelay: '0s' }}>✨</div>
                    <div className={styles.sparkle} style={{ top: '10px', left: '-15px', animationDelay: '0.3s' }}>💫</div>
                    <div className={styles.sparkle} style={{ bottom: '-5px', right: '10px', animationDelay: '0.6s' }}>⭐</div>

                    <div className={styles.logoIcon}>
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" className={styles.bookTop} />
                            <path d="M2 17l10 5 10-5" className={styles.bookMiddle} />
                            <path d="M2 12l10 5 10-5" className={styles.bookBottom} />
                        </svg>
                    </div>
                </div>

                {/* Brand Name */}
                <h1 className={styles.brandName}>ذاكر</h1>

                {/* Bouncing Dots */}
                <div className={styles.dotsContainer}>
                    <div className={styles.dot} style={{ animationDelay: '0s' }}></div>
                    <div className={styles.dot} style={{ animationDelay: '0.15s' }}></div>
                    <div className={styles.dot} style={{ animationDelay: '0.3s' }}></div>
                </div>

                {/* Fun Loading Text */}
                <p className={styles.loadingText}>جارٍ تحضير تجربة تعلم رائعة...</p>
            </div>

            {/* Background Decorations */}
            <div className={styles.bgCircle1}></div>
            <div className={styles.bgCircle2}></div>
            <div className={styles.bgCircle3}></div>
        </div>
    );
}

export default LoadingScreen;
