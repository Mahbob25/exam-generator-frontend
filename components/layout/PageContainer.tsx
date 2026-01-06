'use client';

import React from 'react';
import styles from './PageContainer.module.css';

export interface PageContainerProps {
    children: React.ReactNode;
    /** Page title */
    title?: string;
    /** Page description/subtitle */
    description?: string;
    /** Max width constraint */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Top actions (buttons, etc.) */
    actions?: React.ReactNode;
    /** Back button configuration */
    backButton?: {
        label: string;
        onClick: () => void;
    };
    /** Additional class name */
    className?: string;
}

/**
 * PageContainer Component
 * 
 * Consistent page wrapper with title, description, and actions.
 * 
 * @example
 * <PageContainer
 *   title="Dashboard"
 *   description="Welcome back!"
 *   actions={<Button>New Item</Button>}
 * >
 *   <ContentHere />
 * </PageContainer>
 */
export const PageContainer: React.FC<PageContainerProps> = ({
    children,
    title,
    description,
    maxWidth = 'lg',
    actions,
    backButton,
    className = '',
}) => {
    return (
        <div className={`${styles.container} ${className}`}>
            <div className={`${styles.content} ${styles[`maxWidth-${maxWidth}`]}`}>
                {/* Page Header */}
                {(title || actions || backButton) && (
                    <header className={styles.header}>
                        <div className={styles.headerContent}>
                            {backButton && (
                                <button
                                    type="button"
                                    className={styles.backButton}
                                    onClick={backButton.onClick}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="20"
                                        height="20"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                    <span>{backButton.label}</span>
                                </button>
                            )}
                            {title && (
                                <div className={styles.titleGroup}>
                                    <h1 className={styles.title}>{title}</h1>
                                    {description && (
                                        <p className={styles.description}>{description}</p>
                                    )}
                                </div>
                            )}
                        </div>
                        {actions && <div className={styles.actions}>{actions}</div>}
                    </header>
                )}

                {/* Page Content */}
                <main className={styles.main}>{children}</main>
            </div>
        </div>
    );
};

export default PageContainer;
