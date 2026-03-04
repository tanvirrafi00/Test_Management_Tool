import { cn } from '../../lib/utils';

export function Input({
    label,
    type = 'text',
    placeholder = '',
    value = '',
    onChange,
    error = '',
    disabled = false,
    className = '',
    ...props
}) {
    const baseStyles = 'w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed';

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
