'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    BarChart2,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Menu,
    X
} from 'lucide-react';

export interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string | number;
    requiredRole?: 'student' | 'admin';
}

export interface SidebarProps {
    items: NavItem[];
    isCollapsed?: boolean;
    onToggleCollapse?: (collapsed: boolean) => void;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    isMobile?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
}

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

    if (!mounted) return null;

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-card/50 backdrop-blur-xl border-r border-border/50 shadow-sm relative overflow-hidden">
            {/* Header */}
            <div className={cn(
                "flex items-center h-16 px-4 border-b border-border/40",
                isCollapsed ? "justify-center" : "justify-between"
            )}>
                <div className={cn(
                    "font-bold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent transition-all duration-300",
                    isCollapsed && "scale-0 w-0 opacity-0 overflow-hidden"
                )}>
                    {header || "ExamGen"}
                </div>

                {!isMobile && onToggleCollapse && (
                    <button
                        onClick={() => onToggleCollapse(!isCollapsed)}
                        className={cn(
                            "p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors",
                            isCollapsed && "mx-auto"
                        )}
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                )}

                {isMobile && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ml-auto"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-none">
                {items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.label : undefined}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                isCollapsed && "justify-center px-2"
                            )}
                        >
                            {/* Active Indicator Strip (Left) */}
                            {isActive && !isCollapsed && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-white/20" />
                            )}

                            <span className={cn(
                                "flex items-center justify-center transition-transform",
                                isActive ? "scale-100" : "group-hover:scale-110",
                            )}>
                                {item.icon}
                            </span>

                            {!isCollapsed && (
                                <>
                                    <span className="font-medium whitespace-nowrap flex-1 text-sm tracking-wide">
                                        {item.label}
                                    </span>
                                    {item.badge && (
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-xs font-semibold",
                                            isActive
                                                ? "bg-white/20 text-white"
                                                : "bg-primary/10 text-primary"
                                        )}>
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            {footer && (
                <div className={cn(
                    "p-4 border-t border-border/40 bg-muted/20 backdrop-blur-sm",
                    isCollapsed && "flex flex-col items-center justify-center p-2"
                )}>
                    {!isCollapsed ? footer : (
                        <button className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );

    // Mobile: render bottom navigation bar
    if (isMobile) {
        return (
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 shadow-lg safe-area-pb">
                <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
                    {items.slice(0, 5).map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 relative min-w-[56px]",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground active:scale-95"
                                )}
                            >
                                {/* Active indicator dot */}
                                {isActive && (
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                )}

                                <span className={cn(
                                    "transition-transform",
                                    isActive && "scale-110"
                                )}>
                                    {item.icon}
                                </span>

                                <span className={cn(
                                    "text-[10px] font-medium transition-opacity",
                                    isActive ? "opacity-100" : "opacity-70"
                                )}>
                                    {item.label}
                                </span>

                                {/* Badge */}
                                {item.badge && (
                                    <span className="absolute -top-0.5 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        );
    }

    // Desktop
    return (
        <aside className={cn(
            "sticky top-0 z-30 h-screen transition-all duration-300 border-r border-border bg-background/50 backdrop-blur-sm hidden md:block",
            isCollapsed ? "w-[80px]" : "w-[280px]"
        )}>
            <SidebarContent />
        </aside>
    );
};

// Default navigation icons using Lucide React
export const NavIcons = {
    home: <LayoutDashboard size={20} />,
    learn: <BookOpen size={20} />,
    exam: <FileText size={20} />,
    progress: <BarChart2 size={20} />,
    settings: <Settings size={20} />,
};

export default Sidebar;
