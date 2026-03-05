'use client';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
    Code,
    CheckCircle,
    XCircle,
    Activity,
    Upload,
    Link2,
    PlayCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QAAutomationDashboard({ automatedTests, executionResults, automationRuns, loading }) {
    const router = useRouter();

    const automationStats = [
        {
            title: 'Automated Tests',
            value: automatedTests?.total || 0,
            icon: Code,
            color: 'blue'
        },
        {
            title: 'Execution Results',
            value: executionResults?.total || 0,
            icon: CheckCircle,
            color: 'emerald'
        },
        {
            title: 'Passed',
            value: executionResults?.passed || 0,
            icon: CheckCircle,
            color: 'emerald'
        },
        {
            title: 'Failed',
            value: executionResults?.failed || 0,
            icon: XCircle,
            color: 'rose'
        }
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

    const getRunStatusBadge = (status) => {
        const statusColors = {
            'Passed': 'bg-emerald-100 text-emerald-700',
            'Failed': 'bg-rose-100 text-rose-700',
            'Running': 'bg-blue-100 text-blue-700',
            'Pending': 'bg-gray-100 text-gray-700'
        };
        return statusColors[status] || statusColors['Pending'];
    };

    return (
        <div className="space-y-8">
            {/* Automated Test Cases */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Automated Test Cases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {automationStats.map((metric, index) => {
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

            {/* Automation Execution Results */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Automation Execution Results</h2>
                <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center">
                            <div className="h-24 bg-emerald-500 rounded-lg flex items-center justify-center mb-3">
                                <CheckCircle className="h-10 w-10 text-white" />
                            </div>
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Passed</p>
                            <p className="text-3xl font-bold text-gray-900">{executionResults?.passed || 0}</p>
                            <p className="text-xs text-gray-500 mt-1">{executionResults?.passRate || 0}% pass rate</p>
                        </div>
                        <div className="text-center">
                            <div className="h-24 bg-rose-500 rounded-lg flex items-center justify-center mb-3">
                                <XCircle className="h-10 w-10 text-white" />
                            </div>
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Failed</p>
                            <p className="text-3xl font-bold text-gray-900">{executionResults?.failed || 0}</p>
                            <p className="text-xs text-gray-500 mt-1">{executionResults?.failRate || 0}% fail rate</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Automation Runs */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Automation Runs</h2>
                <Card className="p-6">
                    <div className="space-y-3">
                        {automationRuns?.slice(0, 6).map((run, index) => {
                            const statusIcon = run.status === 'Passed' ? CheckCircle :
                                run.status === 'Failed' ? XCircle :
                                    Activity;
                            const statusColor = run.status === 'Passed' ? 'text-emerald-600' :
                                run.status === 'Failed' ? 'text-rose-600' : 'text-blue-600';
                            return (
                                <div key={index} className="flex items-center gap-4 pb-3 last:pb-0 border-b border-gray-100 last:border-0">
                                    <div className={`p-2 rounded-lg ${run.status === 'Passed' ? 'bg-emerald-100' :
                                            run.status === 'Failed' ? 'bg-rose-100' : 'bg-blue-100'
                                        }`}>
                                        <statusIcon className={`h-5 w-5 ${statusColor}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{run.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{run.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRunStatusBadge(run.status)}`}>
                                                {run.status}
                                            </span>
                                            <span className="text-xs text-gray-400">{run.time}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Automation Engineer Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                        onClick={() => router.push('/test-cases')}
                        className="flex items-center gap-2"
                    >
                        <Code className="h-4 w-4" />
                        Mark as Automated
                    </Button>
                    <Button
                        onClick={() => router.push('/executions?upload=true')}
                        className="flex items-center gap-2"
                    >
                        <Upload className="h-4 w-4" />
                        Upload Results
                    </Button>
                    <Button
                        onClick={() => router.push('/test-cases')}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Link2 className="h-4 w-4" />
                        Link Automation Script
                    </Button>
                    <Button
                        onClick={() => router.push('/executions')}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <PlayCircle className="h-4 w-4" />
                        View All Runs
                    </Button>
                </div>
            </div>
        </div>
    );
}
