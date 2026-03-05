'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, FileText, PlayCircle, AlertTriangle, ClipboardList, FolderKanban } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateMenu({ userRole }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        {
            icon: FileText,
            label: 'New Test Case',
            description: 'Create a new test case',
            onClick: () => {
                router.push('/test-cases?create=true');
                setIsOpen(false);
            },
            show: ['admin', 'qa_lead', 'qa_engineer', 'qa_automation', 'product_manager'].includes(userRole)
        },
        {
            icon: PlayCircle,
            label: 'Start Test Execution',
            description: 'Begin executing test cases',
            onClick: () => {
                router.push('/executions');
                setIsOpen(false);
            },
            show: ['admin', 'qa_lead', 'qa_engineer', 'qa_automation'].includes(userRole)
        },
        {
            icon: AlertTriangle,
            label: 'Report Defect',
            description: 'Log a new defect',
            onClick: () => {
                router.push('/defects?create=true');
                setIsOpen(false);
            },
            show: ['admin', 'qa_lead', 'qa_engineer', 'qa_automation', 'product_manager', 'developer'].includes(userRole)
        },
        {
            icon: ClipboardList,
            label: 'New Test Plan',
            description: 'Create a test plan',
            onClick: () => {
                router.push('/test-plans?create=true');
                setIsOpen(false);
            },
            show: ['admin', 'qa_lead', 'qa_engineer', 'qa_automation', 'product_manager'].includes(userRole)
        },
        {
            icon: FolderKanban,
            label: 'New Project',
            description: 'Create a new project',
            onClick: () => {
                router.push('/projects?create=true');
                setIsOpen(false);
            },
            show: ['admin', 'qa_lead', 'product_manager'].includes(userRole)
        }
    ].filter(item => item.show);

    if (menuItems.length === 0) {
        return null;
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
            >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Create</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</p>
                    </div>
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={index}
                                onClick={item.onClick}
                                className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 text-left"
                            >
                                <div className="p-2 bg-primary-50 rounded-lg flex-shrink-0">
                                    <Icon className="h-4 w-4 text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

