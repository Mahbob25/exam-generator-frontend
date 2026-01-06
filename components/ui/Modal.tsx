'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback when modal should close */
    onClose: () => void;
    /** Modal title */
    title?: string;
    /** Modal content */
    children: React.ReactNode;
    /** Modal size */
    size?: ModalSize;
    /** Show close button */
    showCloseButton?: boolean;
    /** Close on backdrop click */
    closeOnBackdrop?: boolean;
    /** Close on escape key */
    closeOnEscape?: boolean;
    /** Footer content */
    footer?: React.ReactNode;
}

/**
 * Modal Component
 * 
 * An accessible modal dialog with backdrop, animations, and keyboard support.
 * Renders via portal to document body.
 * 
 * @example
 * <Modal 
 *   isOpen={isOpen} 
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   footer={<Button onClick={handleConfirm}>Confirm</Button>}
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 */
export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnBackdrop = true,
    closeOnEscape = true,
    footer,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<Element | null>(null);

    // Handle escape key
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape' && closeOnEscape) {
                onClose();
            }
        },
        [closeOnEscape, onClose]
    );

    // Handle backdrop click
    const handleBackdropClick = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget && closeOnBackdrop) {
            onClose();
        }
    };

    // Focus trap and body scroll lock
    useEffect(() => {
        if (isOpen) {
            // Store current focus
            previousActiveElement.current = document.activeElement;

            // Lock body scroll
            document.body.style.overflow = 'hidden';

            // Focus modal
            modalRef.current?.focus();

            // Add escape listener
            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.body.style.overflow = '';
                document.removeEventListener('keydown', handleKeyDown);

                // Restore focus
                if (previousActiveElement.current instanceof HTMLElement) {
                    previousActiveElement.current.focus();
                }
            };
        }
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const modalContent = (
        <div
            className={styles.backdrop}
            onClick={handleBackdropClick}
            aria-modal="true"
            role="dialog"
            aria-labelledby={title ? 'modal-title' : undefined}
        >
            <div
                ref={modalRef}
                className={`${styles.modal} ${styles[`size-${size}`]}`}
                tabIndex={-1}
            >
                {(title || showCloseButton) && (
                    <div className={styles.header}>
                        {title && (
                            <h2 id="modal-title" className={styles.title}>
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                type="button"
                                className={styles.closeButton}
                                onClick={onClose}
                                aria-label="Close modal"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="24"
                                    height="24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                <div className={styles.body}>{children}</div>

                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </div>
    );

    // Render to portal
    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }

    return null;
};

export default Modal;
