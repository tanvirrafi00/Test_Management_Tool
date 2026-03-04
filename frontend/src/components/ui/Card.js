import { cn } from '../../lib/utils';

export function Card({
    children,
    className = '',
    ...props
}) {
    return (
        <div
            className={cn(
                'bg-white rounded-lg shadow-soft border border border-gray-200',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

