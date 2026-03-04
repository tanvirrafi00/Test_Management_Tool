import { cn } from '../../lib/utils';

export function Badge({
    children,
    variant = 'default',
    className = '',
    ...props
}) {
    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    const variantStyles = {
        default: 'bg-gray-100 text-gray-700',
        primary: 'bg-primary-100 text-primary-700',
        success: 'bg-success-100 text-success-700',
        warning: 'bg-warning-100 text-warning-700',
        danger: 'bg-danger-100 text-danger-700',
        info: 'bg-blue-100 text-blue-700',
    };

    const priorityStyles = {
        low: 'bg-gray-100 text-gray-700',
        medium: 'bg-blue-100 text-blue-700',
        high: 'bg-orange-100 text-orange-700',
        critical: 'bg-red-100 text-red-700',
    };

    const statusStyles = {
        active: 'bg-success-100 text-success-700',
        archived: 'bg-gray-100 text-gray-700',
        draft: 'bg-yellow-100 text-yellow-700',
        ready: 'bg-green-100 text-green-700',
        deprecated: 'bg-red-100 text-red-700',
    };

    return (
        <span
            className={cn(
                baseStyles,
                variantStyles[variant] || priorityStyles[variant] || statusStyles[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
