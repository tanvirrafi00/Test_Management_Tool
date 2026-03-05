import { cn } from '../../lib/utils';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
    ...props
}) {
    const variants = {
        // Primary - Gradient Indigo
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500',

        // Secondary - Clean white with border
        secondary: 'bg-white text-gray-700 border border-gray-300 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md',

        // Danger - Gradient Rose
        danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-600 hover:to-red-700 focus:ring-red-500',

        // Success - Gradient Emerald
        success: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:from-green-600 hover:to-green-700 focus:ring-green-500',

        // Warning - Gradient Amber
        warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30 hover:from-yellow-600 hover:to-yellow-700 focus:ring-yellow-500',

        // Info - Gradient Blue
        info: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500',

        // Outline - Border only
        outline: 'bg-transparent border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:border-primary-600 focus:ring-primary-500',

        // Ghost - Minimal
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-300',

        // Link - Text only
        link: 'bg-transparent text-primary-600 hover:text-primary-700 hover:underline p-0 shadow-none focus:ring-0',
    };

    const sizes = {
        xs: 'px-2.5 py-1.5 text-xs',
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-5 py-3 text-base',
        xl: 'px-6 py-3.5 text-lg',
    };

    const baseStyles = 'btn-base font-medium rounded-lg transition-all duration-200 ease-out';

    const loadingStyles = loading ? 'opacity-70 cursor-not-allowed' : '';
    const fullWidthStyles = fullWidth ? 'w-full' : '';
    const iconStyles = Icon ? 'gap-2' : '';

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                loadingStyles,
                fullWidthStyles,
                iconStyles,
                className
            )}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            )}
            {!loading && Icon && iconPosition === 'left' && <Icon className="h-4 w-4" />}
            {children}
            {!loading && Icon && iconPosition === 'right' && <Icon className="h-4 w-4 ml-2" />}
        </button>
    );
}
