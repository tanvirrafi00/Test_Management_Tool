'use client';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
    ClipboardList,
    AlertTriangle,
    PlayCircle,
    ChevronRight,
    FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyAssignedWork({ assignedTasks, loading, userRole }) {
    const router = useRouter();

    if (loading) {
        return (
            <Card className="p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-gray-900 tracking-tight">My Tasks</h3>
                </div>
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    const tasks = assignedTasks || {
        testCasesToExecute: 0,
        defectsAssigned: 0,
        testPlansAssigned: 0,
        pendingExecutions: 0
    };

    const taskItems = [
        {
            icon: PlayCircle,
            title: 'Test Cases to Execute',
            count: tasks.testCasesToExecute || 0,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100',
            onClick: () => router.push('/test-cases?assigned=me&status=pending'),
            show: true
        },
        {
            icon: AlertTriangle,
            title: 'Defects Assigned',
            count: tasks.defectsAssigned || 0,
            color: 'text-rose-600',
            bgColor: 'bg-rose-50',
            borderColor: 'border-rose-100',
            onClick: () => router.push('/defects?assigned=me&status=open'),
            show: true
        },
        {
            icon: ClipboardList,
            title: 'Test Plans Assigned',
            count: tasks.testPlansAssigned || 0,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-100',
            onClick: () => router.push('/test-plans?assigned=me'),
            show: userRole !== 'developer'
        },
        {
            icon: FileText,
            title: 'Pending Executions',
            count: tasks.pendingExecutions || 0,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-100',
            onClick: () => router.push('/executions?assigned=me&status=pending'),
            show: userRole === 'qa_engineer' || userRole === 'qa_automation'
        }
    ].filter(task => task.show);

    const totalTasks = taskItems.reduce((sum, task) => sum + task.count, 0);

    return (
        <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-gray-500" />
                    <h3 className="text-sm font-bold text-gray-900 tracking-tight">My Tasks</h3>
                </div>
                {totalTasks > 0 && (
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        {totalTasks} pending
                    </span>
                )}
            </div>

            {totalTasks === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ClipboardList className="h-12 w-12 text-gray-200 mb-4" />
                    <p className="text-sm text-gray-500 mb-2">No pending tasks</p>
                    <p className="text-xs text-gray-400">All caught up!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {taskItems.map((task, index) => {
                        const Icon = task.icon;
                        return (
                            <div
                                key={index}
                                onClick={task.onClick}
                                className="group cursor-pointer transition-all duration-200 hover:shadow-md border border-gray-100 hover:border-gray-200 rounded-lg p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-lg ${task.bgColor} ${task.borderColor} border`}>
                                            <Icon className={`h-5 w-5 ${task.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                {task.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {task.count === 1 ? '1 item' : `${task.count} items`}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/test-cases?assigned=me')}
                        className="w-full"
                    >
                        View Tasks
                    </Button>
                    {userRole === 'qa_engineer' || userRole === 'qa_automation' ? (
                        <Button
                            size="sm"
                            onClick={() => router.push('/executions')}
                            className="w-full"
                        >
                            Start Execution
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={() => router.push('/test-plans')}
                            className="w-full"
                        >
                            View Plans
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
