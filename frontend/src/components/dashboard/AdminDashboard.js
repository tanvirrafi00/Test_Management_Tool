'use client';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
    FolderKanban,
    Users,
    FileText,
    AlertTriangle,
    Plus,
    Activity,
    ArrowRight,
    UserPlus
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard({ stats, projects, loading }) {
    const router = useRouter();

    const systemMetrics = [
        {
            title: 'Total Projects',
            value: stats?.totalProjects || 0,
            icon: FolderKanban,
            color: 'blue',
            trend: '+2 this month'
        },
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            color: 'emerald',
            trend: '+5 this week'
        },
        {
            title: 'Total Test Cases',
            value: stats?.totalTestCases || 0,
            icon: FileText,
            color: 'indigo',
            trend: '+12 this week'
        },
        {
            title: 'Total Defects',
            value: stats?.totalDefects || 0,
            icon: AlertTriangle,
            color: 'rose',
            trend: '+3 today'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 border-blue-100',
            emerald: 'bg-emerald-50 border-emerald-100',
            indigo: 'bg-indigo-50 border-indigo-100',
            rose: 'bg-rose-50 border-rose-100'
        };
        return colors[color] || colors.blue;
    };

    const getIconColor = (color) => {
        const colors = {
            blue: 'text-blue-600',
            emerald: 'text-emerald-600',
            indigo: 'text-indigo-600',
            rose: 'text-rose-600'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="space-y-8">
            {/* System Metrics */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">System Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {systemMetrics.map((metric, index) => {
                        const Icon = metric.icon;
                        return (
                            <Card key={index} className={`p-6 ${getColorClasses(metric.color)}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                                        <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                                        <p className="text-xs text-gray-500 mt-1">{metric.trend}</p>
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

            {/* Project Health Overview */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Health Overview</h2>
                <Card className="overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">QA Lead</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Execution Progress</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Open Defects</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {projects.map((project) => (
                                <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{project.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{project.qaLead?.name || 'Unassigned'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-emerald-500 h-2 rounded-full"
                                                    style={{ width: `${project.executionProgress || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">{project.executionProgress || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${(project.openDefects || 0) > 10 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {project.openDefects || 0}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* Recent System Activity */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activity</h2>
                <Card className="p-6">
                    <div className="space-y-4">
                        {stats?.recentActivity?.slice(0, 5).map((activity, index) => (
                            <div key={index} className="flex items-start gap-3 pb-4 last:pb-0 border-b border-gray-100 last:border-0">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Activity className="h-4 w-4 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Admin Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                        onClick={() => router.push('/projects?create=true')}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Create Project
                    </Button>
                    <Button
                        onClick={() => router.push('/admin/users?create=true')}
                        className="flex items-center gap-2"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add User
                    </Button>
                    <Button
                        onClick={() => router.push('/projects')}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <FolderKanban className="h-4 w-4" />
                        Assign Project Members
                    </Button>
                    <Button
                        onClick={() => router.push('/admin/settings')}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <ArrowRight className="h-4 w-4" />
                        System Settings
                    </Button>
                </div>
            </div>
        </div>
    );
}
