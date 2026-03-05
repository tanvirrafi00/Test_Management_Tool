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
                className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <Bell className="h-4 w-4 text-indigo-600" />
                            </div>
                            <p className="text-sm font-bold text-indigo-900">Notifications</p>
                            {unreadCount > 0 && (
                                <span className="text-xs font-bold text-rose-600 bg-white px-2.5 py-1 rounded-full shadow-sm border border-rose-200">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/80 rounded-xl transition-colors"
                        >
                            <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {!notifications || notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl mb-4">
                                    <Bell className="h-14 w-14 text-indigo-300" />
                                </div>
                                <p className="text-base font-semibold text-gray-700 mb-2">No notifications</p>
                                <p className="text-sm text-gray-500">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.slice(0, 10).map((notification, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 cursor-pointer border-b border-gray-100 last:border-b-0 ${!notification.read ? 'bg-blue-50/40' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`p-2.5 rounded-xl border shadow-sm flex-shrink-0 ${getNotificationBgColor(notification.type)}`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <span className="h-2.5 w-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1 shadow-sm"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-2.5">
                                                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                    <span className="text-xs text-gray-500 font-medium">
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
                        <div className="px-5 py-3.5 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                            <button className="w-full text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:from-indigo-100 hover:to-purple-100 bg-gradient-to-r from-transparent to-transparent py-2.5 rounded-xl transition-all duration-200">
                                View All Notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
