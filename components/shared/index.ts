/**
 * Shared Components - Barrel Export
 * 
 * This file exports feature-agnostic shared components.
 * Usage: import { ErrorBoundary, ProtectedRoute } from '@/components/shared';
 * 
 * Note: LoadingOverlay was moved to features/exam-generator/components/
 */

// Error Boundary
export { ErrorBoundary } from './ErrorBoundary';

// Protected Route
export { ProtectedRoute } from './ProtectedRoute';
export type { UserRole } from './ProtectedRoute';
