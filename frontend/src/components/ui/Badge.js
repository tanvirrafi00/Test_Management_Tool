import { cn } from '../../lib/utils';

export function Badge({
    children,
    variant = 'default',
    className = '',
    ...props
}) {
    const variants = {
        default: 'bg-gray-100 text-gray-700 border border-gray-200',
        primary: 'bg-primary-50 text-primary-700 border border-primary-200',
        success: 'bg-success-50 text-success-700 border border-success-200',
        warning: 'bg-warning-50 text-warning-700 border border-warning-200',
        danger: 'bg-danger-50 text-danger-700 border border-danger-200',
        info: 'bg-blue-50 text-blue-700 border border-blue-200',
    };

    const priorityVariants = {
        low: 'bg-gray-50 text-gray-600 border border-gray-200',
        medium: 'bg-blue-50 text-blue-700 border border-blue-200',
        high: 'bg-warning-50 text-warning-700 border border-warning-200',
        critical: 'bg-danger-50 text-danger-700 border border-danger-200',
    };

    const statusVariants = {
        not_run: 'bg-gray-100 text-gray-700 border border-gray-200',
        pass: 'bg-success-50 text-success-700 border border-success-200',
        fail: 'bg-danger-50 text-danger-700 border border-danger-200',
        blocked: 'bg-warning-50 text-warning-700 border border-warning-200',
        retest: 'bg-blue-50 text-blue-700 border border-blue-200',
        open: 'bg-primary-50 text-primary-700 border border-primary-200',
        in_progress: 'bg-blue-50 text-blue-700 border border-blue-200',
        resolved: 'bg-success-50 text-success-700 border border-success-200',
        closed: 'bg-gray-100 text-gray-700 border border-gray-200',
        active: 'bg-success-50 text-success-700 border border-success-200',
        archived: 'bg-gray-100 text-gray-600 border border-gray-200',
        ready: 'bg-blue-50 text-blue-700 border border-blue-200',
        completed: 'bg-success-50 text-success-700 border border-success-200',
        deprecated: 'bg-gray-100 text-gray-600 border border-gray-200',
    };

    const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium uppercase tracking-wider capitalize';

    return (
        <span
            className={cn(baseStyles, variants[variant] || priorityVariants[variant] || statusVariants[variant], className)}
            {...props}
        >
            {children}
        </span>
    );
}
