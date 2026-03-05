'use client';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
    FileText,
    CheckCircle,
    XCircle,
    Target,
    AlertTriangle,
    Users,
    Plus,
    ClipboardList,
    PlayCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QALeadDashboard({ stats, features, defects, testers, loading }) {
    const router = useRouter();

    const executionSummary = [
        {
            title: 'Total Tests',
            value: stats?.totalTestCases || 0,
            icon: FileText,
            color: 'blue'
        },
        {
            title: 'Executed',
            value: stats?.executionStats?.totalExecuted || 0,
            icon: CheckCircle,
            color: 'emerald'
        },
        {
            title: 'Passed',
            value: stats?.executionStats?.pass || 0,
            icon: CheckCircle,
            color: 'emerald'
        },
        {
            title: 'Failed',
            value: stats?.executionStats?.fail || 0,
            icon: XCircle,
            color: 'rose'
        }
    ];

    const defectSummary = [
        { name: 'Critical', count: defects?.critical || 0, color: 'bg-rose-500' },
        { name: 'High', count: defects?.high || 0, color: 'bg-red-500' },
        { name: 'Medium', count: defects?.medium || 0, color: 'bg-amber-500' },
        { name: 'Low', count: defects?.low || 0, color: 'bg-emerald-500' }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 border-blue-100',
            emerald: 'bg-emerald-50 border-emerald-100',
            rose: 'bg-rose-50 border-rose-100',
            indigo: 'bg-indigo-50 border-indigo-100'
        };
        return colors[color] || colors.blue;
    };

    const getIconColor = (color) => {
        const colors = {
            blue: 'text-blue-600',
            emerald: 'text-emerald-600',
            rose: 'text-rose-600',
            indigo: 'text-indigo-600'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="space-y-8">
            {/* Project Execution Summary */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Execution Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {executionSummary.map((metric, index) => {
                        const Icon = metric.icon;
                        return (
                            <Card key={index} className={`p-6 ${getColorClasses(metric.color)}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                                        <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
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

            {/* Feature Coverage */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Coverage</h2>
                <Card className="overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Feature</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total Tests</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Coverage</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {features?.slice(0, 6).map((feature) => {
                                const coverage = feature.totalTests > 0
                                    ? Math.round((feature.executed / feature.totalTests) * 100)
                                    : 0;
                                const statusColor = coverage >= 80 ? 'text-emerald-600' :
                                    coverage >= 60 ? 'text-blue-600' :
                                        coverage >= 40 ? 'text-amber-600' : 'text-rose-600';
                                return (
                                    <tr key={feature._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/features/${feature._id}`)}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{feature.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{feature.totalTests}</td>
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
                                                <span className={`text-sm font-semibold ${statusColor}`}>{coverage}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${coverage >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                                    coverage >= 60 ? 'bg-blue-100 text-blue-700' :
                                                        coverage >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                {coverage >= 80 ? 'On Track' : coverage >= 60 ? 'Good' : coverage >= 40 ? 'At Risk' : 'Critical'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* Defect Summary */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Defect Summary</h2>
                <Card className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {defectSummary.map((item) => (
                            <div key={item.name} className="text-center">
                                <div className={`h-24 ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                                    <AlertTriangle className="h-10 w-10 text-white" />
                                </div>
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">{item.name}</p>
                                <p className="text-3xl font-bold text-gray-900">{item.count}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Tester Workload */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tester Workload</h2>
                <Card className="overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tester</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Assigned Tests</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Executed</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Pending</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {testers?.slice(0, 6).map((tester, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/profile/${tester._id}`)}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <Users className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{tester.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{tester.assignedTests || 0}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{tester.executedTests || 0}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${(tester.pendingTests || 0) > 10 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {tester.pendingTests || 0}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* QA Lead Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                        onClick={() => router.push('/features?create=true')}
                        className="flex items-center gap-2"
                    >
                        <Target className="h-4 w-4" />
                        Create Feature
                    </Button>
                    <Button
                        onClick={() => router.push('/test-plans?create=true')}
                        className="flex items-center gap-2"
                    >
                        <ClipboardList className="h-4 w-4" />
                        Create Test Plan
                    </Button>
                    <Button
                        onClick={() => router.push('/test-cases')}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <FileText className="h-4 w-4" />
                        Assign Test Cases
                    </Button>
                    <Button
                        onClick={() => router.push('/executions')}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <PlayCircle className="h-4 w-4" />
                        Monitor Execution
                    </Button>
                </div>
            </div>
        </div>
    );
}
