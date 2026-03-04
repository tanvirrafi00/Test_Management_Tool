import { cn } from '../../lib/utils';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    className = '',
    ...props
}) {
    const variants = {
        primary: 'bg-primary-600 text-white shadow-sm hover:shadow hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 focus:ring-gray-200',
        danger: 'bg-danger-600 text-white shadow-sm hover:shadow hover:bg-danger-700 focus:ring-danger-500',
        success: 'bg-success-600 text-white shadow-sm hover:shadow hover:bg-success-700 focus:ring-success-500',
        outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
    };

    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    return (
        <button
            type={type}
            disabled={disabled}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
}
