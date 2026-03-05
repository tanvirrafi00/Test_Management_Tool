'use client';

import { useState } from 'react';
import { Plus, X, FileText, PlayCircle, AlertTriangle, ClipboardList, FolderKanban } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuickActionPanel({ userRole }) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const actions = [
        {
            icon: FileText,
            label: 'Create Test Case',
            onClick: () => {
                router.push('/test-cases?create=true');
                setIsOpen(false);
            },
            show: ['admin', 'qa_lead', 'qa_engineer', 'qa_automation', 'product_manager'].includes(userRole)
        },
        {
            icon: PlayCircle,
            label: 'Start Test Execution',
            onClick: () => {
                router.push('/executions');
                setIsOpen(false);
            },
            show: ['admin', 'qa_lead', 'qa_engineer', 'qa_automation'].includes(userRole)
        },
        {
            icon: AlertTriangle,
            label: 'Log Defect',
            onClick: () => {
                router.push('/defects?create=true');
                setIsOpen(false);
            },
            show: ['admin', 'qa_lead', 'qa_engineer', 'qa_automation', 'product_manager', 'developer'].includes(userRole)
        },
        {
            icon: ClipboardList,
            label: 'Create Test Plan',
            onClick: () => {
                router.push('/test-plans?create=true');
                setIsOpen(false);
            },
            show: ['admin', 'qa_lead', 'qa_engineer', 'qa_automation', 'product_manager'].includes(userRole)
        },
        {
            icon: FolderKanban,
            label: 'New Project',
            onClick: () => {
                router.push('/projects?create=true');
                setIsOpen(false);
            },
            show: ['admin', 'qa_lead', 'product_manager'].includes(userRole)
        }
    ].filter(action => action.show);

    if (actions.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div className="mb-4 space-y-2 animate-in slide-in-from-bottom-4 duration-200">
                    {actions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={index}
                                onClick={action.onClick}
                                className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl hover:border-gray-300 transition-all duration-200 w-48 group"
                                style={{
                                    animationDelay: `${index * 50}ms`
                                }}
                            >
                                <div className="p-2 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                                    <Icon className="h-4 w-4 text-primary-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{action.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${isOpen
                        ? 'bg-gray-700 hover:bg-gray-800 rotate-45'
                        : 'bg-primary-600 hover:bg-primary-700 hover:scale-110'
                    }`}
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : (
                    <Plus className="h-6 w-6 text-white" />
                )}
            </button>
        </div>
    );
}
