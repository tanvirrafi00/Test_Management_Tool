import { cn } from '../../lib/utils';

export function Badge({
    children,
    variant = 'default',
    className = '',
    ...props
}) {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-primary-100 text-primary-800',
        success: 'bg-success-100 text-success-800',
        warning: 'bg-warning-100 text-warning-800',
        danger: 'bg-danger-100 text-danger-800',
        info: 'bg-blue-100 text-blue-800',
    };

    const priorityVariants = {
        low: 'bg-blue-100 text-blue-800',
        medium: 'bg-warning-100 text-warning-800',
        high: 'bg-danger-100 text-danger-800',
        critical: 'bg-danger-600 text-white',
    };

    const statusVariants = {
        not_run: 'bg-gray-100 text-gray-800',
        pass: 'bg-success-100 text-success-800',
        fail: 'bg-danger-100 text-danger-800',
        blocked: 'bg-warning-100 text-warning-800',
        retest: 'bg-blue-100 text-blue-800',
        open: 'bg-primary-100 text-primary-800',
        in_progress: 'bg-blue-100 text-blue-800',
        resolved: 'bg-success-100 text-success-800',
        closed: 'bg-gray-100 text-gray-800',
    };

    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    return (
        <span
            className={cn(baseStyles, variants[variant] || priorityVariants[variant] || statusVariants[variant], className)}
            {...props}
        >
            {children}
        </span>
    );
}
