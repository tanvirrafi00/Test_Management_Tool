'use client';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
    CheckCircle,
    AlertTriangle,
    Target,
    BarChart3,
    Eye,
    Download,
    FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProductManagerDashboard({ executionProgress, criticalDefects, features, loading }) {
    const router = useRouter();

    const progressMetrics = [
        {
            title: 'Total Tests',
            value: executionProgress?.totalTests || 0,
            icon: FileText,
            color: 'blue'
        },
        {
            title: 'Executed',
            value: executionProgress?.executed || 0,
            icon: CheckCircle,
            color: 'emerald'
        },
        {
            title: 'Progress',
            value: `${executionProgress?.progress || 0}%`,
            icon: Target,
            color: 'indigo'
        },
        {
            title: 'Pass Rate',
            value: `${executionProgress?.passRate || 0}%`,
            icon: CheckCircle,
            color: 'emerald'
        }
    ];

    const defectMetrics = [
        {
            title: 'Critical Bugs',
            value: criticalDefects?.critical || 0,
            icon: AlertTriangle,
            color: 'rose',
            trend: '+2 this week'
        },
        {
            title: 'High Bugs',
            value: criticalDefects?.high || 0,
            icon: AlertTriangle,
            color: 'red',
            trend: '+5 this week'
        },
        {
            title: 'Total Open',
            value: (criticalDefects?.critical || 0) + (criticalDefects?.high || 0) + (criticalDefects?.medium || 0) + (criticalDefects?.low || 0),
            icon: AlertTriangle,
            color: 'amber'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 border-blue-100',
            emerald: 'bg-emerald-50 border-emerald-100',
            rose: 'bg-rose-50 border-rose-100',
            red: 'bg-red-50 border-red-100',
            amber: 'bg-amber-50 border-amber-100',
            indigo: 'bg-indigo-50 border-indigo-100'
        };
        return colors[color] || colors.blue;
    };

    const getIconColor = (color) => {
        const colors = {
            blue: 'text-blue-600',
            emerald: 'text-emerald-600',
            rose: 'text-rose-600',
            red: 'text-red-600',
            amber: 'text-amber-600',
            indigo: 'text-indigo-600'
        };
        return colors[color] || colors.blue;
    };

    const getReadinessBadge = (coverage) => {
        if (coverage >= 80) return 'bg-emerald-100 text-emerald-700';
        if (coverage >= 60) return 'bg-blue-100 text-blue-700';
        if (coverage >= 40) return 'bg-amber-100 text-amber-700';
        return 'bg-rose-100 text-rose-700';
    };

    const getReadinessText = (coverage) => {
        if (coverage >= 80) return 'Ready';
        if (coverage >= 60) return 'Good';
        if (coverage >= 40) return 'Needs Work';
        return 'At Risk';
    };

    return (
        <div className="space-y-8">
            {/* Execution Progress */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Execution Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {progressMetrics.map((metric, index) => {
                        const Icon = metric.icon;
                        return (
                            <Card key={index} className={`p-6 ${getColorClasses(metric.color)}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                                        <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                                        {metric.trend && <p className="text-xs text-gray-500 mt-1">{metric.trend}</p>}
                                    </div>
                                    <div className={`p-3 bg-white rounded-lg ${getIconColor(metric.color)}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Critical Defects */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Critical Defects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {defectMetrics.map((metric, index) => {
                        const Icon = metric.icon;
                        return (
                            <Card key={index} className={`p-6 ${getColorClasses(metric.color)}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                                        <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                                        {metric.trend && <p className="text-xs text-gray-500 mt-1">{metric.trend}</p>}
                                    </div>
                                    <div className={`p-3 bg-white rounded-lg ${getIconColor(metric.color)}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Feature Readiness */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Readiness</h2>
                <Card className="overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Feature</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Coverage</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Readiness</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {features?.slice(0, 6).map((feature) => {
                                const coverage = feature.totalTests > 0
                                    ? Math.round((feature.executed / feature.totalTests) * 100)
                                    : 0;
                                return (
                                    <tr key={feature._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/features/${feature._id}`)}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{feature.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${coverage >= 80 ? 'bg-emerald-500' :
                                                                coverage >= 60 ? 'bg-blue-500' :
                                                                    coverage >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                                            }`}
                                                        style={{ width: `${coverage}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">{coverage}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getReadinessBadge(coverage)}`}>
                                                {getReadinessText(coverage)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">{feature.executed} / {feature.totalTests}</span>
                                                <span className="text-xs text-gray-400">tests</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* Product Manager Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2"
                    >
                        <Eye className="h-4 w-4" />
                        Review Progress
                    </Button>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2"
                    >
                        <Target className="h-4 w-4" />
                        Check Release Readiness
                    </Button>
                    <Button
                        onClick={() => router.push('/dashboard?tab=reports')}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <BarChart3 className="h-4 w-4" />
                        View Reports
                    </Button>
                    <Button
                        onClick={() => router.push('/dashboard?export=true')}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export Data
                    </Button>
                </div>
            </div>
        </div>
    );
}
