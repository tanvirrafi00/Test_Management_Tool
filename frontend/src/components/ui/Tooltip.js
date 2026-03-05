import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export function Tooltip({
    children,
    content,
    position = 'top',
    delay = 200,
    className = '',
    arrow = true,
    disabled = false,
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);
    const tooltipRef = useRef(null);
    const triggerRef = useRef(null);

    const handleMouseEnter = () => {
        if (disabled) return;
        const id = setTimeout(() => setIsVisible(true), delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        setIsVisible(false);
    };

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-gray-800 border-r-transparent border-b-transparent border-l-transparent',
        bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-gray-800 border-r-transparent border-t-transparent border-l-transparent',
        left: 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent',
        right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent',
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={triggerRef}
        >
            {children}
            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={cn(
                        'absolute z-50 px-3 py-2 text-xs font-medium text-white bg-gray-800 rounded-lg shadow-xl',
                        'whitespace-nowrap max-w-xs',
                        'animate-in fade-in zoom-in-95 duration-200',
                        positionClasses[position],
                        className
                    )}
                    role="tooltip"
                >
                    {content}
                    {arrow && (
                        <div
                            className={cn(
                                'absolute w-0 h-0 border-4',
                                arrowClasses[position]
                            )}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

// Rich tooltip with more content
export function RichTooltip({
    children,
    title,
    description,
    position = 'top',
    delay = 200,
    className = '',
    disabled = false,
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const handleMouseEnter = () => {
        if (disabled) return;
        const id = setTimeout(() => setIsVisible(true), delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        setIsVisible(false);
    };

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
        left: 'right-full top-1/2 -translate-y-1/2 mr-3',
        right: 'left-full top-1/2 -translate-y-1/2 ml-3',
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {isVisible && (
                <div
                    className={cn(
                        'absolute z-50 w-64 p-4 bg-white rounded-xl shadow-2xl border border-gray-200',
                        'animate-in fade-in zoom-in-95 duration-200',
                        positionClasses[position],
                        className
                    )}
                    role="tooltip"
                >
                    {title && (
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                            {title}
                        </h4>
                    )}
                    {description && (
                        <p className="text-xs text-gray-500 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// Tooltip with icon
export function IconTooltip({
    icon: Icon,
    content,
    position = 'top',
    size = 'sm',
    className = '',
}) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    return (
        <Tooltip content={content} position={position} className={className}>
            <Icon className={cn('text-gray-400 hover:text-gray-600 transition-colors cursor-help', sizeClasses[size])} />
        </Tooltip>
    );
}
