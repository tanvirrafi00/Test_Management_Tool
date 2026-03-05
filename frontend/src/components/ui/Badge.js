import { cn } from '../../lib/utils';

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    className = '',
    dot = false,
    icon: Icon,
    ...props
}) {
    const variants = {
        // Default - Neutral gray
        default: 'bg-gray-100 text-gray-700 border border-gray-200',

        // Primary - Indigo
        primary: 'bg-primary-50 text-primary-700 border border-primary-200',

        // Success - Emerald
        success: 'bg-green-50 text-green-700 border border-green-200',

        // Warning - Amber
        warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',

        // Danger - Rose
        danger: 'bg-red-50 text-red-700 border border-red-200',

        // Info - Blue
        info: 'bg-blue-50 text-blue-700 border border-blue-200',

        // Gradient variants
        'gradient-primary': 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0 shadow-lg shadow-primary-500/25',
        'gradient-success': 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg shadow-green-500/25',
        'gradient-warning': 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg shadow-yellow-500/25',
        'gradient-danger': 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg shadow-red-500/25',
    };

    const priorityVariants = {
        low: 'bg-gray-50 text-gray-600 border border-gray-200',
        medium: 'bg-blue-50 text-blue-700 border border-blue-200',
        high: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        critical: 'bg-red-50 text-red-700 border border-red-200',
    };

    const statusVariants = {
        not_run: 'bg-gray-100 text-gray-700 border border-gray-200',
        pass: 'bg-green-50 text-green-700 border border-green-200',
        fail: 'bg-red-50 text-red-700 border border-red-200',
        blocked: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        retest: 'bg-blue-50 text-blue-700 border border-blue-200',
        open: 'bg-primary-50 text-primary-700 border border-primary-200',
        in_progress: 'bg-blue-50 text-blue-700 border border-blue-200',
        resolved: 'bg-green-50 text-green-700 border border-green-200',
        closed: 'bg-gray-100 text-gray-700 border border-gray-200',
        active: 'bg-green-50 text-green-700 border border-green-200',
        archived: 'bg-gray-100 text-gray-600 border border-gray-200',
        ready: 'bg-blue-50 text-blue-700 border border-blue-200',
        completed: 'bg-green-50 text-green-700 border border-green-200',
        deprecated: 'bg-gray-100 text-gray-600 border border-gray-200',
        draft: 'bg-gray-50 text-gray-600 border border-gray-200',
        published: 'bg-green-50 text-green-700 border border-green-200',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    const baseStyles = 'badge-base inline-flex items-center gap-1.5 rounded-md font-medium capitalize transition-all duration-200';

    const activeVariant = variants[variant] || priorityVariants[variant] || statusVariants[variant] || variants.default;

    return (
        <span
            className={cn(
                baseStyles,
                activeVariant,
                sizes[size],
                className
            )}
            {...props}
        >
            {dot && (
                <span className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    variant === 'success' || variant === 'pass' || variant === 'resolved' || variant === 'completed' || variant === 'published' || variant === 'active'
                        ? 'bg-current'
                        : variant === 'danger' || variant === 'fail' || variant === 'critical'
                            ? 'bg-current'
                            : variant === 'warning' || variant === 'blocked' || variant === 'high'
                                ? 'bg-current'
                                : 'bg-current'
                )} />
            )}
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {children}
        </span>
    );
}
