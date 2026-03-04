'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authAPI } from '../../lib/api';
import { User, Lock, CheckCircle, AlertCircle, Save } from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Profile form state
    const [profileData, setProfileData] = useState({ name: '', email: '' });
    const [profileErrors, setProfileErrors] = useState({});
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileSubmitting, setProfileSubmitting] = useState(false);

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await authAPI.getMe();
            const userData = res.data?.data || res.data;
            setUser(userData);
            setProfileData({ name: userData.name || '', email: userData.email || '' });
        } catch (err) {
            console.error('Failed to fetch profile', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
        if (profileErrors[name]) setProfileErrors(prev => ({ ...prev, [name]: '' }));
        setProfileSuccess('');
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (passwordErrors[name]) setPasswordErrors(prev => ({ ...prev, [name]: '' }));
        setPasswordSuccess('');
    };

    const validateProfile = () => {
        const errors = {};
        if (!profileData.name.trim()) errors.name = 'Name is required';
        if (!profileData.email.trim()) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(profileData.email)) errors.email = 'Email is invalid';
        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePassword = () => {
        const errors = {};
        if (!passwordData.currentPassword) errors.currentPassword = 'Current password is required';
        if (!passwordData.newPassword) errors.newPassword = 'New password is required';
        else if (passwordData.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
        if (!passwordData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
        else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!validateProfile()) return;
        setProfileSubmitting(true);
        try {
            const res = await authAPI.updateProfile(profileData);
            const updated = res.data?.data || res.data;
            setUser(updated);
            setProfileSuccess('Profile updated successfully!');
            // Update stored user data
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updated }));
        } catch (err) {
            setProfileErrors({ submit: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setProfileSubmitting(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!validatePassword()) return;
        setPasswordSubmitting(true);
        try {
            await authAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setPasswordSuccess('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordErrors({ submit: err.response?.data?.message || 'Failed to change password' });
        } finally {
            setPasswordSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    const roleLabel = user?.role?.replace(/_/g, ' ') || 'User';

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-600 mt-1">Manage your personal information and account security</p>
                </div>

                {/* Profile Overview Card */}
                <Card className="p-6">
                    <div className="flex items-center gap-5">
                        <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-10 w-10 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                            <p className="text-gray-500 text-sm">{user?.email}</p>
                            <span className="mt-1 inline-block text-xs font-medium bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full capitalize border border-primary-100">
                                {roleLabel}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Update Profile Card */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-9 w-9 bg-blue-50 rounded-lg flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                            <p className="text-sm text-gray-500">Update your name and email address</p>
                        </div>
                    </div>

                    {profileSuccess && (
                        <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200">
                            <CheckCircle className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm">{profileSuccess}</span>
                        </div>
                    )}
                    {profileErrors.submit && (
                        <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm">{profileErrors.submit}</span>
                        </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleProfileChange}
                                    placeholder="Your full name"
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm ${profileErrors.name ? 'border-red-400' : 'border-gray-300'
                                        }`}
                                />
                                {profileErrors.name && (
                                    <p className="mt-1 text-xs text-red-600">{profileErrors.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleProfileChange}
                                    placeholder="your@email.com"
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm ${profileErrors.email ? 'border-red-400' : 'border-gray-300'
                                        }`}
                                />
                                {profileErrors.email && (
                                    <p className="mt-1 text-xs text-red-600">{profileErrors.email}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                            <input
                                type="text"
                                value={roleLabel}
                                disabled
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm capitalize cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-400">Your role can only be changed by an administrator</p>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={profileSubmitting} className="flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                {profileSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Change Password Card */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-9 w-9 bg-orange-50 rounded-lg flex items-center justify-center">
                            <Lock className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                            <p className="text-sm text-gray-500">Keep your account secure with a strong password</p>
                        </div>
                    </div>

                    {passwordSuccess && (
                        <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200">
                            <CheckCircle className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm">{passwordSuccess}</span>
                        </div>
                    )}
                    {passwordErrors.submit && (
                        <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm">{passwordErrors.submit}</span>
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter your current password"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm ${passwordErrors.currentPassword ? 'border-red-400' : 'border-gray-300'
                                    }`}
                            />
                            {passwordErrors.currentPassword && (
                                <p className="mt-1 text-xs text-red-600">{passwordErrors.currentPassword}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="At least 6 characters"
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm ${passwordErrors.newPassword ? 'border-red-400' : 'border-gray-300'
                                        }`}
                                />
                                {passwordErrors.newPassword && (
                                    <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Re-enter new password"
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm ${passwordErrors.confirmPassword ? 'border-red-400' : 'border-gray-300'
                                        }`}
                                />
                                {passwordErrors.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-600">{passwordErrors.confirmPassword}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={passwordSubmitting} variant="secondary" className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                {passwordSubmitting ? 'Changing...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Account Info */}
                <Card className="p-4 bg-gray-50/50 border-dashed">
                    <p className="text-xs text-gray-500 text-center">
                        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                    </p>
                </Card>
            </div>
        </DashboardLayout>
    );
}
