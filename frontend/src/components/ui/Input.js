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
    className = '',
    ...props
}) {
    const baseStyles = hasIcon
        ? 'w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed'
        : 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed';

    const errorStyles = error ? 'border-danger-500 focus:ring-danger-500' : 'focus:ring-primary-500';

    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={cn(baseStyles, errorStyles, className)}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-danger-600">
                    {error}
                </p>
            )}
        </div>
    );
}

