import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export function Tabs({ defaultValue, value, onValueChange, children, className = '' }) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = value !== undefined ? value : internalValue;

    const handleValueChange = (newValue) => {
        if (onValueChange) {
            onValueChange(newValue);
        } else {
            setInternalValue(newValue);
        }
    };

    return (
        <div className={cn('w-full', className)}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        value: currentValue,
                        onValueChange: handleValueChange,
                    });
                }
                return child;
            })}
        </div>
    );
}

export function TabsList({ children, className = '', value, onValueChange }) {
    return (
        <div className={cn(
            'inline-flex items-center justify-center rounded-xl bg-gray-100 p-1.5 gap-1',
            className
        )}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        isActive: value === child.props.value,
                        onClick: () => onValueChange?.(child.props.value),
                    });
                }
                return child;
            })}
        </div>
    );
}

export function TabsTrigger({
    children,
    value,
    isActive = false,
    onClick,
    className = '',
    disabled = false,
    icon: Icon
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isActive
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50',
                className
            )}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {children}
        </button>
    );
}

export function TabsContent({ children, value, currentValue, className = '' }) {
    if (currentValue !== value) return null;

    return (
        <div className={cn('mt-4 animate-in fade-in slide-in-from-top-2 duration-200', className)}>
            {children}
        </div>
    );
}

// Vertical Tabs variant
export function TabsVertical({ defaultValue, value, onValueChange, children, className = '' }) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = value !== undefined ? value : internalValue;

    const handleValueChange = (newValue) => {
        if (onValueChange) {
            onValueChange(newValue);
        } else {
            setInternalValue(newValue);
        }
    };

    return (
        <div className={cn('flex gap-6 w-full', className)}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        value: currentValue,
                        onValueChange: handleValueChange,
                    });
                }
                return child;
            })}
        </div>
    );
}

export function TabsListVertical({ children, className = '', value, onValueChange }) {
    return (
        <div className={cn('flex flex-col gap-1 min-w-[200px]', className)}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        isActive: value === child.props.value,
                        onClick: () => onValueChange?.(child.props.value),
                    });
                }
                return child;
            })}
        </div>
    );
}

export function TabsTriggerVertical({
    children,
    value,
    isActive = false,
    onClick,
    className = '',
    disabled = false,
    icon: Icon
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'inline-flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-left transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isActive
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent',
                className
            )}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {children}
        </button>
    );
}

export function TabsContentVertical({ children, value, currentValue, className = '' }) {
    if (currentValue !== value) return null;

    return (
        <div className={cn('flex-1 animate-in fade-in slide-in-from-right-2 duration-200', className)}>
            {children}
        </div>
    );
}
