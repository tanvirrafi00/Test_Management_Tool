'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';

export default function NotificationBell({ notifications }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications?.filter(n => !n.read).length || 0;

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-emerald-500" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case 'error':
                return <AlertTriangle className="h-4 w-4 text-rose-500" />;
            default:
                return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    const getNotificationBgColor = (type) => {
        switch (type) {
            case 'success':
                return 'bg-emerald-50 border-emerald-100';
            case 'warning':
                return 'bg-amber-50 border-amber-100';
            case 'error':
                return 'bg-rose-50 border-rose-100';
            default:
                return 'bg-blue-50 border-blue-100';
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
                )}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-gray-500" />
                            <p className="text-sm font-semibold text-gray-900">Notifications</p>
                            {unreadCount > 0 && (
                                <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-4 w-4 text-gray-400" />
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {!notifications || notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Bell className="h-12 w-12 text-gray-200 mb-4" />
                                <p className="text-sm text-gray-500 mb-2">No notifications</p>
                                <p className="text-xs text-gray-400">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.slice(0, 10).map((notification, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/30' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`p-2 rounded-lg border ${getNotificationBgColor(notification.type)} flex-shrink-0`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-1 mt-2">
                                                    <Clock className="h-3 w-3 text-gray-400" />
                                                    <span className="text-xs text-gray-400">
                                                        {notification.time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications && notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100">
                            <button className="w-full text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                                View All Notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
