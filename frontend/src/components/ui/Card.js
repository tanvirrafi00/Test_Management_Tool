import { cn } from '../../lib/utils';

export function Card({
    children,
    className = '',
    variant = 'default',
    hover = false,
    ...props
}) {
    const variants = {
        default: 'bg-white border border-gray-200 shadow-sm',
        elevated: 'bg-white border border-gray-200 shadow-lg',
        outlined: 'bg-white border-2 border-gray-300 shadow-none',
        flat: 'bg-white border-0 shadow-none',
        glass: 'bg-white/80 backdrop-blur-md border border-white/20 shadow-lg',
    };

    const hoverStyles = hover
        ? 'hover:shadow-xl hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-300'
        : '';

    return (
        <div
            className={cn(
                'card-base rounded-lg',
                variants[variant],
                hoverStyles,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '', ...props }) {
    return (
        <div
            className={cn('px-6 py-5 border-b border-gray-200', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardTitle({ children, className = '', ...props }) {
    return (
        <h3
            className={cn('text-lg font-semibold text-gray-900', className)}
            {...props}
        >
            {children}
        </h3>
    );
}

export function CardDescription({ children, className = '', ...props }) {
    return (
        <p
            className={cn('text-sm text-gray-500 mt-1', className)}
            {...props}
        >
            {children}
        </p>
    );
}

export function CardContent({ children, className = '', ...props }) {
    return (
        <div className={cn('px-6 py-5', className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '', ...props }) {
    return (
        <div
            className={cn('px-6 py-4 border-t border-gray-200 bg-gray-50/50', className)}
            {...props}
        >
            {children}
        </div>
    );
}
