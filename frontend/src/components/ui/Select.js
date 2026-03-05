import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Select({
    label,
    options = [],
    value,
    onChange,
    error,
    placeholder = 'Select option',
    className = '',
    containerClassName = '',
    disabled = false,
    helperText = '',
    labelClassName = '',
    ...props
}) {
    return (
        <div className={cn('mb-4 w-full', containerClassName)}>
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
                <select
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={cn(
                        'w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md appearance-none cursor-pointer text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed',
                        'hover:border-gray-400',
                        error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500 focus:shadow-red-500/10',
                        disabled && 'cursor-not-allowed opacity-60',
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                            className="py-2"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className={cn(
                    'absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none transition-colors duration-200',
                    error ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
                )}>
                    <ChevronDown className="h-4 w-4" />
                </div>
                {value && (
                    <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
                        <Check className="h-4 w-4 text-primary-600" />
                    </div>
                )}
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
