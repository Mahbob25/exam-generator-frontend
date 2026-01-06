'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string | number;
    requiredRole?: 'student' | 'admin';
}

export interface SidebarProps {
    /** Navigation items */
    items: NavItem[];
    /** Whether sidebar is collapsed */
    isCollapsed?: boolean;
    /** Callback when collapse state changes */
    onToggleCollapse?: (collapsed: boolean) => void;
    /** Header content (logo, brand) */
    header?: React.ReactNode;
    /** Footer content */
    footer?: React.ReactNode;
    /** Mobile mode - renders as overlay */
    isMobile?: boolean;
    /** Whether mobile sidebar is open */
    isOpen?: boolean;
    /** Callback to close mobile sidebar */
    onClose?: () => void;
}

/**
 * Sidebar Component
 * 
 * Navigation sidebar with collapsible state and mobile support.
 * 
 * @example
 * <Sidebar
 *   items={[
 *     { label: 'Learn', href: '/learn', icon: <BookIcon /> },
 *     { label: 'Exams', href: '/exam-generator', icon: <FileIcon /> },
 *   ]}
 *   header={<Logo />}
 * />
 */
export const Sidebar: React.FC<SidebarProps> = ({
    items,
    isCollapsed = false,
    onToggleCollapse,
    header,
    footer,
    isMobile = false,
    isOpen = false,
    onClose,
}) => {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        if (isMobile && isOpen) {
            onClose?.();
        }
    }, [pathname]);

    const sidebarClasses = [
        styles.sidebar,
        isCollapsed ? styles.collapsed : '',
        isMobile ? styles.mobile : '',
        isMobile && isOpen ? styles.mobileOpen : '',
    ]
        .filter(Boolean)
        .join(' ');

    if (!mounted) return null;

    const sidebarContent = (
        <aside className={sidebarClasses}>
            {/* Header */}
            {header && (
                <div className={styles.header}>
                    {header}
                    {!isMobile && onToggleCollapse && (
                        <button
                            type="button"
                            className={styles.collapseButton}
                            onClick={() => onToggleCollapse(!isCollapsed)}
                            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={isCollapsed ? styles.iconRotated : ''}
                            >
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    )}
                </div>
            )}

            {/* Navigation */}
            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                        return (
                            <li key={item.href} className={styles.navItem}>
                                <Link
                                    href={item.href}
                                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    {!isCollapsed && (
                                        <>
                                            <span className={styles.navLabel}>{item.label}</span>
                                            {item.badge && (
                                                <span className={styles.badge}>{item.badge}</span>
                                            )}
                                        </>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            {footer && <div className={styles.footer}>{footer}</div>}
        </aside>
    );

    // Mobile: render with backdrop
    if (isMobile) {
        return (
            <>
                {isOpen && (
                    <div
                        className={styles.backdrop}
                        onClick={onClose}
                        aria-hidden="true"
                    />
                )}
                {sidebarContent}
            </>
        );
    }

    return sidebarContent;
};

// Default navigation icons
export const NavIcons = {
    home: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    learn: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    ),
    exam: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    ),
    progress: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    settings: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
};

export default Sidebar;
