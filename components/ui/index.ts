/**
 * UI Components - Barrel Export
 * 
 * This file exports all primitive UI components for easy imports.
 * Usage: import { Button, Card, Input } from '@/components/ui';
 */

// Button
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

// Card
export { Card, CardHeader, CardBody, CardFooter } from './Card';
export type { CardProps, CardVariant } from './Card';

// Input
export { Input } from './Input';
export type { InputProps, InputSize } from './Input';

// Select
export { Select } from './Select';
export type { SelectProps, SelectOption, SelectSize } from './Select';

// Modal
export { Modal } from './Modal';
export type { ModalProps, ModalSize } from './Modal';

// Skeleton
export { Skeleton, SkeletonCard, SkeletonAvatar } from './Skeleton';
export type { SkeletonProps, SkeletonVariant } from './Skeleton';

// Spinner
export { Spinner, SpinnerOverlay } from './Spinner';
export type { SpinnerProps, SpinnerSize } from './Spinner';

// Toast
export { ToastProvider, useToast } from './Toast';
export type { Toast, ToastType } from './Toast';
