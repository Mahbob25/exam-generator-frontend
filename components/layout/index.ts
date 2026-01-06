/**
 * Layout Components - Barrel Export
 * 
 * This file exports all layout components for easy imports.
 * Usage: import { Header, Footer, Sidebar } from '@/components/layout';
 */

// Re-export existing layout components
export { default as Header } from '../Header';
export { default as Footer } from '../Footer';

// Sidebar
export { Sidebar, NavIcons } from './Sidebar';
export type { SidebarProps, NavItem } from './Sidebar';

// PageContainer
export { PageContainer } from './PageContainer';
export type { PageContainerProps } from './PageContainer';
