import { cn } from '../../lib/utils';

export function Card({
    children,
    className = '',
    ...props
}) {
    return (
        <div
            className={cn('bg-white rounded-xl shadow-sm border border-gray-200/60', className)}
            {...props}
        >
            {children}
        </div>
    );
}
