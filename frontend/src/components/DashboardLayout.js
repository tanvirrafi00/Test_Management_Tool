'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    ClipboardList,
    PlayCircle,
    AlertTriangle,
    LogOut,
    Menu,
    X,
    User,
    ChevronRight,
    Users,
    Search,
    ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import CreateMenu from './dashboard/CreateMenu';
import NotificationBell from './dashboard/NotificationBell';

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const userRole = user?.role;

    // Define navigation items based on user role
    const getNavigationByRole = (role) => {
        const commonItems = [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ];

        if (role === 'admin') {
            return [
                ...commonItems,
                { name: 'Projects', href: '/projects', icon: FolderKanban },
                { name: 'Test Cases', href: '/test-cases', icon: FileText },
                { name: 'Test Plans', href: '/test-plans', icon: ClipboardList },
                { name: 'Executions', href: '/executions', icon: PlayCircle },
                { name: 'Defects', href: '/defects', icon: AlertTriangle },
                { name: 'Users', href: '/admin/users', icon: Users },
            ];
        }

        if (role === 'qa_lead' || role === 'qa_engineer' || role === 'qa_automation') {
            return [
                ...commonItems,
                { name: 'Projects', href: '/projects', icon: FolderKanban },
                { name: 'Test Cases', href: '/test-cases', icon: FileText },
                { name: 'Test Plans', href: '/test-plans', icon: ClipboardList },
                { name: 'Executions', href: '/executions', icon: PlayCircle },
                { name: 'Defects', href: '/defects', icon: AlertTriangle },
            ];
        }

        if (role === 'developer') {
            return [
                ...commonItems,
                { name: 'Defects', href: '/defects', icon: AlertTriangle },
            ];
        }

        if (role === 'product_manager') {
            return [
                ...commonItems,
                { name: 'Projects', href: '/projects', icon: FolderKanban },
                { name: 'Test Cases', href: '/test-cases', icon: FileText },
                { name: 'Test Plans', href: '/test-plans', icon: ClipboardList },
                { name: 'Executions', href: '/executions', icon: PlayCircle },
                { name: 'Defects', href: '/defects', icon: AlertTriangle },
            ];
        }

        return commonItems;
    };

    // Get navigation items based on user role
    const navigation = getNavigationByRole(userRole);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                    {sidebarOpen ? (
                        <X className="h-6 w-6 text-gray-600" />
                    ) : (
                        <Menu className="h-6 w-6 text-gray-600" />
                    )}
                </button>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={cn(
                        'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    )}
                >
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                        <Link href="/dashboard" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <LayoutDashboard className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">TestFlow</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="mt-6 px-3 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                                        isActive
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    )}
                                >
                                    <item.icon className={cn(
                                        'h-5 w-5 mr-3 flex-shrink-0 transition-colors duration-200',
                                        isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                                    )} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile Section */}
                    <div className="absolute bottom-0 left-0 right-0 w-full border-t border-gray-200 p-4">
                        {loading ? (
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse"></div>
                                <div className="ml-3 flex-1">
                                    <div className="h-4 bg-gray-100 rounded animate-pulse mb-2"></div>
                                    <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                                </div>
                            </div>
                        ) : user ? (
                            <>
                                <Link href="/profile" className="flex items-center mb-3 hover:bg-gray-50 rounded-lg p-1 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <User className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div className="ml-3 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{user.name || 'User'}</p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {userRole?.replace('_', ' ') || 'Guest'}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400 ml-auto flex-shrink-0" />
                                </Link>
                                <button
                                    onClick={logout}
                                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <LogOut className="h-5 w-5 mr-2" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="text-sm text-gray-500">Not authenticated</div>
                        )}
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 lg:pl-64">
                    {/* Top Header */}
                    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                        <div className="px-4 lg:px-8 py-4">
                            <div className="flex items-center justify-between gap-4">
                                {/* Left Side - Logo and Project Selector */}
                                <div className="flex items-center gap-4 flex-1">
                                    {/* Mobile Logo */}
                                    <div className="lg:hidden flex items-center gap-2">
                                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                            <LayoutDashboard className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">TestFlow</span>
                                    </div>

                                    {/* Global Search */}
                                    <div className="hidden md:flex items-center flex-1 max-w-xl">
                                        <div className="relative w-full">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search projects, test cases, defects..."
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Actions */}
                                <div className="flex items-center gap-2 lg:gap-3">
                                    {/* Create Menu */}
                                    <CreateMenu userRole={userRole} />

                                    {/* Notifications */}
                                    <NotificationBell notifications={[]} />

                                    {/* User Profile */}
                                    {user && (
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <User className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <div className="hidden lg:block text-left">
                                                <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                                                    {user.name?.split(' ')[0] || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-500 capitalize">
                                                    {userRole?.replace('_', ' ')}
                                                </p>
                                            </div>
                                            <ChevronDown className="hidden lg:block h-4 w-4 text-gray-400" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="p-4 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
