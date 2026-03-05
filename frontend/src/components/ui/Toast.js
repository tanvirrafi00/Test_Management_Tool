import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { ...toast, id }]);

        if (toast.duration !== Infinity) {
            setTimeout(() => {
                removeToast(id);
            }, toast.duration || 5000);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback((message, options = {}) => {
        return addToast({ type: 'success', message, ...options });
    }, [addToast]);

    const error = useCallback((message, options = {}) => {
        return addToast({ type: 'error', message, ...options });
    }, [addToast]);

    const warning = useCallback((message, options = {}) => {
        return addToast({ type: 'warning', message, ...options });
    }, [addToast]);

    const info = useCallback((message, options = {}) => {
        return addToast({ type: 'info', message, ...options });
    }, [addToast]);

    const loading = useCallback((message, options = {}) => {
        return addToast({ type: 'loading', message, duration: Infinity, ...options });
    }, [addToast]);

    const value = {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
        loading,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, onRemove }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-md w-full">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
            ))}
        </div>
    );
}

function Toast({ toast, onRemove }) {
    const variants = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
            borderColor: 'border-green-200',
            titleColor: 'text-green-900',
        },
        error: {
            icon: AlertCircle,
            bgColor: 'bg-red-50',
            iconColor: 'text-red-600',
            borderColor: 'border-red-200',
            titleColor: 'text-red-900',
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-50',
            iconColor: 'text-yellow-600',
            borderColor: 'border-yellow-200',
            titleColor: 'text-yellow-900',
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-200',
            titleColor: 'text-blue-900',
        },
        loading: {
            icon: Loader2,
            bgColor: 'bg-primary-50',
            iconColor: 'text-primary-600',
            borderColor: 'border-primary-200',
            titleColor: 'text-primary-900',
        },
    };

    const variant = variants[toast.type] || variants.info;
    const Icon = variant.icon;

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-right-full duration-300',
                variant.bgColor,
                variant.borderColor
            )}
        >
            <div className={cn('flex-shrink-0 mt-0.5', toast.type === 'loading' && 'animate-spin')}>
                <Icon className={cn('h-5 w-5', variant.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
                {toast.title && (
                    <p className={cn('text-sm font-semibold mb-1', variant.titleColor)}>
                        {toast.title}
                    </p>
                )}
                <p className="text-sm text-gray-600">
                    {toast.message}
                </p>
            </div>
            <button
                onClick={onRemove}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

// Convenience components for inline toasts
export function InlineToast({ type = 'info', message, title, className = '' }) {
    const variants = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
            borderColor: 'border-green-200',
            textColor: 'text-green-800',
        },
        error: {
            icon: AlertCircle,
            bgColor: 'bg-red-50',
            iconColor: 'text-red-600',
            borderColor: 'border-red-200',
            textColor: 'text-red-800',
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-50',
            iconColor: 'text-yellow-600',
            borderColor: 'border-yellow-200',
            textColor: 'text-yellow-800',
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800',
        },
    };

    const variant = variants[type] || variants.info;
    const Icon = variant.icon;

    return (
        <div className={cn(
            'flex items-center gap-3 p-4 rounded-xl border',
            variant.bgColor,
            variant.borderColor,
            className
        )}>
            <Icon className={cn('h-5 w-5 flex-shrink-0', variant.iconColor)} />
            <div className="flex-1">
                {title && (
                    <p className={cn('text-sm font-semibold mb-0.5', variant.textColor)}>
                        {title}
                    </p>
                )}
                <p className={cn('text-sm', variant.textColor)}>
                    {message}
                </p>
            </div>
        </div>
    );
}
