'use client';

import { Card } from '../ui/Card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export default function MetricCard({
    title,
    value,
    subtitle,
    trend,
    trendValue,
    icon: Icon,
    color = 'blue',
    onClick,
    loading = false
}) {
    const colorConfig = {
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        emerald: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600'
        },
        rose: {
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600'
        },
        indigo: {
            bg: 'bg-indigo-50',
            border: 'border-indigo-100',
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600'
        },
        amber: {
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600'
        },
        purple: {
            bg: 'bg-purple-50',
            border: 'border-purple-100',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600'
        }
    };

    const config = colorConfig[color] || colorConfig.blue;

    const getTrendIcon = () => {
        if (trend === 'up') return <ArrowUp className="h-3 w-3" />;
        if (trend === 'down') return <ArrowDown className="h-3 w-3" />;
        return <Minus className="h-3 w-3" />;
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-emerald-600 bg-emerald-50';
        if (trend === 'down') return 'text-rose-600 bg-rose-50';
        return 'text-gray-600 bg-gray-50';
    };

    if (loading) {
        return (
            <Card className={`p-6 ${config.bg} ${config.border} h-full`}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    </div>
                    <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
            </Card>
        );
    }

    return (
        <Card
            className={`p-6 ${config.bg} ${config.border} h-full transition-all duration-200 hover:shadow-lg cursor-pointer ${onClick ? 'hover:scale-[1.02]' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
                    )}
                    {trend && trendValue && (
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getTrendColor()}`}>
                            {getTrendIcon()}
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={`p-3 ${config.iconBg} rounded-lg flex-shrink-0`}>
                        <Icon className={`h-6 w-6 ${config.iconColor}`} />
                    </div>
                )}
            </div>
        </Card>
    );
}
