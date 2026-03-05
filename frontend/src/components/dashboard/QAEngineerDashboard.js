'use client';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
    FileText,
    AlertTriangle,
    PlayCircle,
    Plus,
    CheckCircle,
    XCircle,
    Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QAEngineerDashboard({ assignedTestCases, executionTasks, reportedDefects, recentExecutions, loading }) {
    const router = useRouter();

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 border-blue-100',
            emerald: 'bg-emerald-50 border-emerald-100',
            rose: 'bg-rose-50 border-rose-100',
            amber: 'bg-amber-50 border-amber-100'
        };
        return colors[color] || colors.blue;
    };

    const getIconColor = (color) => {
        const colors = {
            blue: 'text-blue-600',
            emerald: 'text-emerald-600',
            rose: 'text-rose-600',
            amber: 'text-amber-600'
        };
        return colors[color] || colors.blue;
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            'Open': 'bg-blue-100 text-blue-700',
            'In Progress': 'bg-amber-100 text-amber-700',
            'Passed': 'bg-emerald-100 text-emerald-700',
            'Failed': 'bg-rose-100 text-rose-700',
            'Blocked': 'bg-gray-100 text-gray-700'
        };
        return statusColors[status] || statusColors['Open'];
    };

    return (
        <div className="space-y-8">
            {/* My Assigned Test Cases */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">My Assigned Test Cases</h2>
                <Card className="overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Test Case ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Feature</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Priority</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {assignedTestCases?.slice(0, 6).map((testCase) => (
                                <tr key={testCase._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/test-cases/${testCase._id}`)}>
                                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{testCase.testCaseId || `TC-${testCase._id.slice(-4)}`}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{testCase.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{testCase.feature?.name || 'Unassigned'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${testCase.priority === 'High' ? 'bg-rose-100 text-rose-700' :
                                                testCase.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {testCase.priority || 'Low'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* My Test Execution Tasks */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">My Test Execution Tasks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 bg-blue-50 border-blue-100">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 mb-1">Test Cases Pending</p>
                                <p className="text-3xl font-bold text-gray-900">{executionTasks?.pending || 0}</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg text-blue-600">
                                <FileText className="h-6 w-6" />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 bg-amber-50 border-amber-100">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 mb-1">Blocked Tests</p>
                                <p className="text-3xl font-bold text-gray-900">{executionTasks?.blocked || 0}</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg text-amber-600">
                                <XCircle className="h-6 w-6" />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 bg-rose-50 border-rose-100">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 mb-1">Failed Tests</p>
                                <p className="text-3xl font-bold text-gray-900">{executionTasks?.failed || 0}</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg text-rose-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 bg-emerald-50 border-emerald-100">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 mb-1">Ready to Execute</p>
                                <p className="text-3xl font-bold text-gray-900">{executionTasks?.ready || 0}</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg text-emerald-600">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Defects Reported By Me */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Defects Reported By Me</h2>
                <Card className="overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Defect ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Severity</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reportedDefects?.slice(0, 6).map((defect) => (
                                <tr key={defect._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/defects/${defect._id}`)}>
                                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{defect.defectId || `BUG-${defect._id.slice(-4)}`}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{defect.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${defect.severity === 'Critical' ? 'bg-rose-100 text-rose-700' :
                                                defect.severity === 'High' ? 'bg-red-100 text-red-700' :
                                                    defect.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {defect.severity || 'Low'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(defect.status)}`}>
                                            {defect.status || 'Open'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* Recent Test Executions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Test Executions</h2>
                <Card className="p-6">
                    <div className="space-y-3">
                        {recentExecutions?.slice(0, 6).map((execution, index) => {
                            const statusIcon = execution.status === 'pass' ? CheckCircle :
                                execution.status === 'fail' ? XCircle :
                                    Activity;
                            const statusColor = execution.status === 'pass' ? 'text-emerald-600' :
                                execution.status === 'fail' ? 'text-rose-600' : 'text-amber-600';
                            return (
                                <div key={index} className="flex items-center gap-4 pb-3 last:pb-0 border-b border-gray-100 last:border-0">
                                    <div className={`p-2 rounded-lg ${execution.status === 'pass' ? 'bg-emerald-100' :
                                            execution.status === 'fail' ? 'bg-rose-100' : 'bg-amber-100'
                                        }`}>
                                        <statusIcon className={`h-5 w-5 ${statusColor}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{execution.testCase?.title || 'Unknown Test Case'}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {execution.status === 'pass' ? 'Passed' : execution.status === 'fail' ? 'Failed' : 'Blocked'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">{execution.executionDate || 'Recently'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* QA Engineer Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                        onClick={() => router.push('/executions')}
                        className="flex items-center gap-2"
                    >
                        <PlayCircle className="h-4 w-4" />
                        Start Test Execution
                    </Button>
                    <Button
                        onClick={() => router.push('/defects?create=true')}
                        className="flex items-center gap-2"
                    >
                        <AlertTriangle className="h-4 w-4" />
                        Log Defect
                    </Button>
                    <Button
                        onClick={() => router.push('/test-cases?create=true')}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Create Test Case
                    </Button>
                    <Button
                        onClick={() => router.push('/test-cases')}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <FileText className="h-4 w-4" />
                        Update Test Results
                    </Button>
                </div>
            </div>
        </div>
    );
}
