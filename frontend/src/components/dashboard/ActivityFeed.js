import { Card } from '../ui/Card';
import {
    PlusCircle,
    CheckCircle,
    AlertCircle,
    Clock,
    User,
    ExternalLink,
    History
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ActivityFeed({ activities, loading, isSidebar = false }) {
    if (loading) {
        return (
            <div className="space-y-8 animate-pulse pt-2 px-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex space-x-5">
                        <div className="rounded-2xl bg-gray-50 h-10 w-10"></div>
                        <div className="flex-1 space-y-3 py-1">
                            <div className="h-2.5 bg-gray-50 rounded w-1/3"></div>
                            <div className="h-2 bg-gray-50 rounded w-5/6"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const allActivities = [
        ...(activities?.recentTestCases || []).map(tc => ({
            id: tc._id,
            type: 'test_case',
            title: 'Structural Update',
            description: tc.title,
            user: tc.createdBy?.name || 'User',
            date: new Date(tc.createdAt),
            icon: PlusCircle,
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50/50'
        })),
        ...(activities?.recentExecutions || []).map(exe => ({
            id: exe._id,
            type: 'execution',
            title: `Result: ${exe.status.replace('_', ' ')}`,
            description: exe.testCase?.title || 'Unknown Test Case',
            user: exe.executedBy?.name || 'User',
            date: new Date(exe.executionDate),
            icon: CheckCircle,
            iconColor: exe.status === 'pass' ? 'text-emerald-500' : 'text-rose-500',
            bgColor: exe.status === 'pass' ? 'bg-emerald-50/50' : 'bg-rose-50/50'
        })),
        ...(activities?.recentDefects || []).map(def => ({
            id: def._id,
            type: 'defect',
            title: 'Defect Logged',
            description: def.title,
            user: def.createdBy?.name || 'User',
            date: new Date(def.createdAt),
            icon: AlertCircle,
            iconColor: 'text-orange-500',
            bgColor: 'bg-orange-50/50'
        }))
    ].sort((a, b) => b.date - a.date).slice(0, 8);

    return (
        <div className="flex flex-col h-full">
            {!isSidebar && (
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-widest flex items-center">
                        <History className="h-5 w-5 mr-3 text-primary-500" />
                        Audit Information
                    </h2>
                </div>
            )}

            <div className="space-y-2 flex-1">
                {allActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-100">
                        <Clock className="h-10 w-10 text-gray-200 mb-4" />
                        <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest leading-relaxed px-8">System activity is currently<br />being synchronized</p>
                    </div>
                ) : (
                    allActivities.map((activity, idx) => (
                        <div key={`${activity.type}-${activity.id}-${idx}`} className="flex group relative px-2 py-4 transition-all rounded-[2rem] hover:bg-gray-50/80 border border-transparent hover:border-gray-100">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-2xl ${activity.bgColor} flex items-center justify-center border border-white shadow-sm transition-transform group-hover:scale-110 duration-300`}>
                                <activity.icon className={`h-5 w-5 ${activity.iconColor}`} />
                            </div>

                            <div className="ml-5 flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] font-black uppercase tracking-tight text-gray-400 group-hover:text-primary-500 transition-colors">
                                        {activity.title}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-300 tabular-nums lowercase">
                                        {formatDistanceToNow(activity.date, { addSuffix: true })}
                                    </span>
                                </div>
                                <h4 className="text-[13px] font-bold text-gray-800 truncate pr-10 leading-tight tracking-tight">
                                    {activity.description}
                                </h4>
                                <div className="flex items-center mt-1.5">
                                    <div className="h-2 w-2 rounded-full bg-gray-200 mr-2.5" />
                                    <span className="text-[10px] font-bold text-gray-400 capitalize tracking-tight">
                                        by {activity.user}
                                    </span>
                                </div>

                                <button className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all p-2.5 bg-white shadow-md border border-gray-100 rounded-xl hover:bg-primary-600 hover:text-white hover:border-primary-600">
                                    <ExternalLink className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
