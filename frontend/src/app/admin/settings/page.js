'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Settings as SettingsIcon,
    Save,
    Bell,
    Shield,
    Globe,
    Clock,
    Palette,
    CheckCircle,
    XCircle,
    AlertCircle,
    Info
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';

const AdminSettings = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // General Settings
    const [generalSettings, setGeneralSettings] = useState({
        companyName: 'TestFlow',
        logo: '',
        timeZone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        language: 'en'
    });

    // Email Notification Settings
    const [emailSettings, setEmailSettings] = useState({
        enableEmailNotifications: true,
        notifyOnTestAssignment: true,
        notifyOnDefectAssignment: true,
        notifyOnStatusUpdate: true,
        notifyOnComment: false,
        emailFrom: 'noreply@testflow.com',
        emailReplyTo: 'support@testflow.com'
    });

    // Status Configuration
    const [statusConfig, setStatusConfig] = useState({
        testCaseStatuses: ['Draft', 'Ready', 'Deprecated'],
        executionStatuses: ['Not Run', 'Pass', 'Fail', 'Blocked', 'Retest'],
        defectStatuses: ['Open', 'In Progress', 'Fixed', 'Retest', 'Closed'],
        severityLevels: ['Critical', 'Major', 'Minor', 'Trivial'],
        priorityLevels: ['Low', 'Medium', 'High', 'Critical']
    });

    const timeZones = [
        'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
        'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai',
        'Asia/Kolkata', 'Australia/Sydney'
    ];

    const dateFormats = [
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
        { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2024)' }
    ];

    const languages = [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
        { value: 'zh', label: 'Chinese' },
        { value: 'ja', label: 'Japanese' }
    ];

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification({ show: false, type: '', message: '' });
        }, 3000);
    };

    // Save settings
    const handleSaveSettings = async (settingsType) => {
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            let endpoint = '';
            let data = {};

            switch (settingsType) {
                case 'general':
                    endpoint = '/api/admin/settings/general';
                    data = generalSettings;
                    break;
                case 'email':
                    endpoint = '/api/admin/settings/email';
                    data = emailSettings;
                    break;
                case 'status':
                    endpoint = '/api/admin/settings/status';
                    data = statusConfig;
                    break;
            }

            // Simulate API call (replace with actual API)
            await new Promise(resolve => setTimeout(resolve, 1000));

            showNotification('success', 'Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            showNotification('error', 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'email', label: 'Email Notifications', icon: Bell },
        { id: 'status', label: 'Status Configuration', icon: SettingsIcon },
        { id: 'security', label: 'Security', icon: Shield }
    ];

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Page Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                            <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg border border-gray-200 mb-6 shadow-sm">
                    <div className="flex border-b border-gray-200 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    {activeTab === 'general' && (
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-indigo-600" />
                                General Settings
                            </h2>

                            <div className="space-y-6 max-w-2xl">
                                {/* Company Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Name
                                    </label>
                                    <Input
                                        type="text"
                                        value={generalSettings.companyName}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                                        placeholder="Enter company name"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        This name will appear in the application header and emails
                                    </p>
                                </div>

                                {/* Logo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Logo
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                            {generalSettings.logo ? (
                                                <img src={generalSettings.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <Palette className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <Button variant="secondary" size="sm">
                                                Upload Logo
                                            </Button>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Recommended size: 200x200px. Max file size: 2MB
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Time Zone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Time Zone
                                    </label>
                                    <Select
                                        value={generalSettings.timeZone}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, timeZone: e.target.value })}
                                    >
                                        {timeZones.map(tz => (
                                            <option key={tz} value={tz}>{tz}</option>
                                        ))}
                                    </Select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        All dates and times will be displayed in this time zone
                                    </p>
                                </div>

                                {/* Date Format */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date Format
                                    </label>
                                    <Select
                                        value={generalSettings.dateFormat}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                                    >
                                        {dateFormats.map(format => (
                                            <option key={format.value} value={format.value}>{format.label}</option>
                                        ))}
                                    </Select>
                                </div>

                                {/* Language */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Default Language
                                    </label>
                                    <Select
                                        value={generalSettings.language}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                                    >
                                        {languages.map(lang => (
                                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                                        ))}
                                    </Select>
                                </div>

                                {/* Save Button */}
                                <div className="pt-4">
                                    <Button
                                        onClick={() => handleSaveSettings('general')}
                                        disabled={saving}
                                        className="flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Saving...' : 'Save General Settings'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-indigo-600" />
                                Email Notification Settings
                            </h2>

                            <div className="space-y-6 max-w-2xl">
                                {/* Enable Email Notifications */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Enable Email Notifications</h3>
                                        <p className="text-sm text-gray-600">Send email notifications for system events</p>
                                    </div>
                                    <button
                                        onClick={() => setEmailSettings({ ...emailSettings, enableEmailNotifications: !emailSettings.enableEmailNotifications })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailSettings.enableEmailNotifications ? 'bg-indigo-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailSettings.enableEmailNotifications ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Notification Triggers */}
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">Notification Triggers</h3>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">Test Assignment</p>
                                            <p className="text-sm text-gray-600">Notify when test cases are assigned</p>
                                        </div>
                                        <button
                                            onClick={() => setEmailSettings({ ...emailSettings, notifyOnTestAssignment: !emailSettings.notifyOnTestAssignment })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailSettings.notifyOnTestAssignment ? 'bg-indigo-600' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailSettings.notifyOnTestAssignment ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">Defect Assignment</p>
                                            <p className="text-sm text-gray-600">Notify when defects are assigned</p>
                                        </div>
                                        <button
                                            onClick={() => setEmailSettings({ ...emailSettings, notifyOnDefectAssignment: !emailSettings.notifyOnDefectAssignment })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailSettings.notifyOnDefectAssignment ? 'bg-indigo-600' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailSettings.notifyOnDefectAssignment ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">Status Updates</p>
                                            <p className="text-sm text-gray-600">Notify when test or defect status changes</p>
                                        </div>
                                        <button
                                            onClick={() => setEmailSettings({ ...emailSettings, notifyOnStatusUpdate: !emailSettings.notifyOnStatusUpdate })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailSettings.notifyOnStatusUpdate ? 'bg-indigo-600' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailSettings.notifyOnStatusUpdate ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">Comments</p>
                                            <p className="text-sm text-gray-600">Notify when comments are added</p>
                                        </div>
                                        <button
                                            onClick={() => setEmailSettings({ ...emailSettings, notifyOnComment: !emailSettings.notifyOnComment })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailSettings.notifyOnComment ? 'bg-indigo-600' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailSettings.notifyOnComment ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Email Configuration */}
                                <div className="pt-4 border-t border-gray-200">
                                    <h3 className="font-medium text-gray-900 mb-4">Email Configuration</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                From Email Address
                                            </label>
                                            <Input
                                                type="email"
                                                value={emailSettings.emailFrom}
                                                onChange={(e) => setEmailSettings({ ...emailSettings, emailFrom: e.target.value })}
                                                placeholder="noreply@testflow.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Reply-To Email Address
                                            </label>
                                            <Input
                                                type="email"
                                                value={emailSettings.emailReplyTo}
                                                onChange={(e) => setEmailSettings({ ...emailSettings, emailReplyTo: e.target.value })}
                                                placeholder="support@testflow.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="pt-4">
                                    <Button
                                        onClick={() => handleSaveSettings('email')}
                                        disabled={saving}
                                        className="flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Saving...' : 'Save Email Settings'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'status' && (
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <SettingsIcon className="w-5 h-5 text-indigo-600" />
                                Status Configuration
                            </h2>

                            <div className="space-y-8 max-w-2xl">
                                {/* Info Banner */}
                                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-blue-800">
                                            Configure the available status options for different entities. These options will appear in dropdowns throughout the application.
                                        </p>
                                    </div>
                                </div>

                                {/* Test Case Statuses */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Test Case Statuses</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {statusConfig.testCaseStatuses.map((status, index) => (
                                            <Badge key={index} className="bg-gray-100 text-gray-700 border-gray-200">
                                                {status}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Execution Statuses */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Execution Statuses</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {statusConfig.executionStatuses.map((status, index) => {
                                            const colors = {
                                                'Not Run': 'bg-gray-100 text-gray-700 border-gray-200',
                                                'Pass': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                                'Fail': 'bg-rose-100 text-rose-700 border-rose-200',
                                                'Blocked': 'bg-amber-100 text-amber-700 border-amber-200',
                                                'Retest': 'bg-blue-100 text-blue-700 border-blue-200'
                                            };
                                            return (
                                                <Badge key={index} className={colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'}>
                                                    {status}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Defect Statuses */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Defect Statuses</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {statusConfig.defectStatuses.map((status, index) => {
                                            const colors = {
                                                'Open': 'bg-rose-100 text-rose-700 border-rose-200',
                                                'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
                                                'Fixed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                                'Retest': 'bg-amber-100 text-amber-700 border-amber-200',
                                                'Closed': 'bg-gray-100 text-gray-700 border-gray-200'
                                            };
                                            return (
                                                <Badge key={index} className={colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'}>
                                                    {status}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Severity Levels */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Severity Levels</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {statusConfig.severityLevels.map((severity, index) => {
                                            const colors = {
                                                'Critical': 'bg-rose-100 text-rose-700 border-rose-200',
                                                'Major': 'bg-orange-100 text-orange-700 border-orange-200',
                                                'Minor': 'bg-amber-100 text-amber-700 border-amber-200',
                                                'Trivial': 'bg-sky-100 text-sky-700 border-sky-200'
                                            };
                                            return (
                                                <Badge key={index} className={colors[severity] || 'bg-gray-100 text-gray-700 border-gray-200'}>
                                                    {severity}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Priority Levels */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Priority Levels</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {statusConfig.priorityLevels.map((priority, index) => {
                                            const colors = {
                                                'Low': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                                'Medium': 'bg-amber-100 text-amber-700 border-amber-200',
                                                'High': 'bg-orange-100 text-orange-700 border-orange-200',
                                                'Critical': 'bg-rose-100 text-rose-700 border-rose-200'
                                            };
                                            return (
                                                <Badge key={index} className={colors[priority] || 'bg-gray-100 text-gray-700 border-gray-200'}>
                                                    {priority}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="pt-4">
                                    <Button
                                        onClick={() => handleSaveSettings('status')}
                                        disabled={saving}
                                        className="flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Saving...' : 'Save Status Configuration'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-600" />
                                Security Settings
                            </h2>

                            <div className="space-y-6 max-w-2xl">
                                {/* Info Banner */}
                                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-blue-800">
                                            Configure security settings to protect your account and data. These settings help prevent unauthorized access.
                                        </p>
                                    </div>
                                </div>

                                {/* Password Policy */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-medium text-gray-900 mb-3">Password Policy</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            <p className="text-sm text-gray-700">Minimum password length: 6 characters</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            <p className="text-sm text-gray-700">Passwords are hashed using bcrypt</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            <p className="text-sm text-gray-700">Session timeout: 30 days</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Session Security */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-medium text-gray-900 mb-3">Session Security</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            <p className="text-sm text-gray-700">JWT-based authentication</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            <p className="text-sm text-gray-700">HTTP-only cookies for token storage</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            <p className="text-sm text-gray-700">SameSite cookie protection</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Access Control */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-medium text-gray-900 mb-3">Access Control</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            <p className="text-sm text-gray-700">Role-based access control (RBAC)</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            <p className="text-sm text-gray-700">Project-level permissions</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            <p className="text-sm text-gray-700">User account activation/deactivation</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Data Protection */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-medium text-gray-900 mb-3">Data Protection</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            <p className="text-sm text-gray-700">HTTPS encryption in production</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            <p className="text-sm text-gray-700">SQL/NoSQL injection protection</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            <p className="text-sm text-gray-700">XSS protection</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notification */}
                {notification.show && (
                    <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                        } text-white font-medium z-50`}>
                        {notification.message}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminSettings;
