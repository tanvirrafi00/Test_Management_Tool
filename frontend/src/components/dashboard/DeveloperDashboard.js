'use client';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
    AlertTriangle,
    CheckCircle,
    MessageSquare,
    GitBranch,
    RefreshCw,
    Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeveloperDashboard({ assignedDefects, defectSeverity, fixedBugs, loading }) {
    const router = useRouter();

    const getColorClasses = (color) => {
        const colors = {
            rose: 'bg-rose-50 border-rose-100',
            red: 'bg-red-50 border-red-100',
            amber: 'bg-amber-50 border-amber-100',
            emerald: 'bg-emerald-50 border-emerald-100'
        };
        return colors[color] || colors.rose;
    };

    const getIconColor = (color) => {
        const colors = {
            rose: 'text-rose-600',
            red: 'text-red-600',
            amber: 'text-amber-600',
            emerald: 'text-emerald-600'
        };
        return colors[color] || colors.rose;
    };

    const getSeverityBadge = (severity) => {
        const severityColors = {
            'Critical': 'bg-rose-100 text-rose-700',
            'High': 'bg-red-100 text-red-700',
            'Medium': 'bg-amber-100 text-amber-700',
            'Low': 'bg-emerald-100 text-emerald-700'
        };
        return severityColors[severity] || severityColors['Low'];
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            'Open': 'bg-blue-100 text-blue-700',
            'In Progress': 'bg-amber-100 text-amber-700',
            'Fixed': 'bg-emerald-100 text-emerald-700',
            'Verified': 'bg-indigo-100 text-indigo-700'
        };
        return statusColors[status] || statusColors['Open'];
    };

    return (
        <div className="space-y-8">
            {/* Defects Assigned To Me */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Defects Assigned To Me</h2>
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
                            {assignedDefects?.slice(0, 6).map((defect) => (
                                <tr key={defect._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/defects/${defect._id}`)}>
                                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{defect.defectId || `BUG-${defect._id.slice(-4)}`}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{defect.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityBadge(defect.severity)}`}>
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

            {/* Defect Severity Distribution */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Defect Severity Distribution</h2>
                <Card className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {defectSeverity?.map((item) => (
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

            {/* Recently Fixed Bugs */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Fixed Bugs</h2>
                <Card className="p-6">
                    <div className="space-y-3">
                        {fixedBugs?.slice(0, 6).map((bug, index) => (
                            <div key={index} className="flex items-start gap-4 pb-4 last:pb-0 border-b border-gray-100 last:border-0">
                                <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{bug.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{bug.description}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                Fixed
                                            </span>
                                            <p className="text-xs text-gray-400">{bug.fixedDate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Developer Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                        onClick={() => router.push('/defects')}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Update Bug Status
                    </Button>
                    <Button
                        onClick={() => router.push('/defects')}
                        className="flex items-center gap-2"
                    >
                        <CheckCircle className="h-4 w-4" />
                        Mark as Fixed
                    </Button>
                    <Button
                        onClick={() => router.push('/defects')}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Add Fix Comment
                    </Button>
                    <Button
                        onClick={() => router.push('/defects')}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <GitBranch className="h-4 w-4" />
                        Link Commits
                    </Button>
                </div>
            </div>
        </div>
    );
}
