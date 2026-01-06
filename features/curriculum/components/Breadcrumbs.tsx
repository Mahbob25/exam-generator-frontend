'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

/**
 * Breadcrumbs Component
 * 
 * Navigation breadcrumbs for curriculum hierarchy.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <ol className={styles.list}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className={styles.item}>
                            {item.href && !isLast ? (
                                <Link href={item.href} className={styles.link}>
                                    {item.label}
                                </Link>
                            ) : (
                                <span className={isLast ? styles.current : styles.link}>
                                    {item.label}
                                </span>
                            )}
                            {!isLast && <span className={styles.separator}>›</span>}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export default Breadcrumbs;
