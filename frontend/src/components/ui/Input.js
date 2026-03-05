import { cn } from '../../lib/utils';

export function Input({
    label,
    type = 'text',
    placeholder = '',
    value = '',
    onChange,
    error = '',
    disabled = false,
    hasIcon = false,
    icon: Icon,
    helperText = '',
    className = '',
    inputClassName = '',
    labelClassName = '',
    ...props
}) {
    const baseStyles = hasIcon
        ? 'w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:shadow-lg focus:shadow-primary-500/10 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60'
        : 'w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:shadow-lg focus:shadow-primary-500/10 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60';

    const errorStyles = error
        ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 focus:shadow-red-500/10'
        : '';

    const iconStyles = error
        ? 'text-red-500'
        : 'text-gray-400';

    return (
        <div className="mb-4">
            {label && (
                <label className={cn(
                    'block text-sm font-medium text-gray-900 mb-2 transition-colors duration-200',
                    error && 'text-red-600',
                    labelClassName
                )}>
                    {label}
                </label>
            )}
            <div className="relative group">
                {hasIcon && Icon && (
                    <div className={cn(
                        'absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200',
                        iconStyles
                    )}>
                        <Icon className="h-4 w-4" />
                    </div>
                )}
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={cn(
                        baseStyles,
                        errorStyles,
                        'hover:border-gray-400',
                        inputClassName
                    )}
                    {...props}
                />
            </div>
            {(error || helperText) && (
                <div className="mt-1.5 flex items-start gap-1.5">
                    {error && (
                        <svg
                            className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    )}
                    <p className={cn(
                        'text-sm transition-colors duration-200',
                        error ? 'text-red-600 font-medium' : 'text-gray-500'
                    )}>
                        {error || helperText}
                    </p>
                </div>
            )}
        </div>
    );
}
