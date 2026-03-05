import React, { useEffect, useRef } from 'react';
import { X, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showClose = true,
    showIcon = false,
    icon: Icon,
    className = '',
    contentClassName = '',
    footer,
    headerClassName = '',
}) {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        xs: 'max-w-sm',
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
        full: 'max-w-[95vw]',
    };

    const handleBackdropClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className={cn(
                    'bg-white rounded-lg shadow-2xl flex flex-col w-full overflow-hidden animate-in zoom-in-95 duration-300 ease-out',
                    sizeClasses[size] || sizeClasses.md,
                    className
                )}
            >
                {/* Header */}
                {(title || showClose || showIcon) && (
                    <div className={cn(
                        'flex items-center justify-between px-6 py-5 border-b border-gray-200',
                        headerClassName
                    )}>
                        <div className="flex items-center gap-3">
                            {showIcon && Icon && (
                                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center">
                                    <Icon className="h-5 w-5 text-primary-600" />
                                </div>
                            )}
                            {title && (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                        {title}
                                    </h2>
                                </div>
                            )}
                        </div>
                        {showClose && (
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
                                aria-label="Close modal"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className={cn('p-6 overflow-y-auto max-h-[85vh]', contentClassName)}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
}) {
    const variantStyles = {
        danger: {
            iconBg: 'bg-red-50',
            iconColor: 'text-red-600',
            buttonVariant: 'danger',
        },
        warning: {
            iconBg: 'bg-yellow-50',
            iconColor: 'text-yellow-600',
            buttonVariant: 'warning',
        },
        info: {
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            buttonVariant: 'info',
        },
        primary: {
            iconBg: 'bg-primary-50',
            iconColor: 'text-primary-600',
            buttonVariant: 'primary',
        },
    };

    const styles = variantStyles[variant] || variantStyles.danger;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            showIcon
            icon={Info}
            footer={
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={cn(
                            'px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200',
                            'bg-gradient-to-r',
                            variant === 'danger' && 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
                            variant === 'warning' && 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
                            variant === 'info' && 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                            variant === 'primary' && 'from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700',
                            'shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            }
        >
            <div className="flex items-start gap-4">
                <div className={cn('flex-shrink-0', styles.iconBg, 'rounded-xl p-3')}>
                    <Info className={cn('h-6 w-6', styles.iconColor)} />
                </div>
                <div className="flex-1">
                    <p className="text-gray-600 leading-relaxed">
                        {message}
                    </p>
                </div>
            </div>
        </Modal>
    );
}
