'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    Search,
    Plus,
    MoreVertical,
    Edit,
    Shield,
    Lock,
    Power,
    Mail,
    User as UserIcon,
    Calendar,
    Filter
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';

const UserManagement = () => {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'qa_engineer'
    });
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: ''
    });
    const [resetPasswordData, setResetPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // Role options
    const roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'qa_lead', label: 'QA Lead' },
        { value: 'qa_engineer', label: 'QA Engineer' },
        { value: 'qa_automation', label: 'QA Automation' },
        { value: 'developer', label: 'Developer' },
        { value: 'product_manager', label: 'Product Manager' }
    ];

    // Fetch users
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/auth/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
                setFilteredUsers(data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showNotification('error', 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users
    useEffect(() => {
        let filtered = [...users];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'active') {
                filtered = filtered.filter(user => user.isActive);
            } else {
                filtered = filtered.filter(user => !user.isActive);
            }
        }

        setFilteredUsers(filtered);
    }, [searchTerm, roleFilter, statusFilter, users]);

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification({ show: false, type: '', message: '' });
        }, 3000);
    };

    // Create user
    const handleCreateUser = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password) {
            showNotification('error', 'Please fill in all required fields');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (data.success) {
                showNotification('success', 'User created successfully');
                setShowCreateModal(false);
                setFormData({ name: '', email: '', password: '', role: 'qa_engineer' });
                fetchUsers();
            } else {
                showNotification('error', data.message || 'Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            showNotification('error', 'Failed to create user');
        }
    };

    // Edit user
    const handleEditUser = async (e) => {
        e.preventDefault();

        if (!editFormData.name || !editFormData.email) {
            showNotification('error', 'Please fill in all required fields');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/auth/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editFormData)
            });
            const data = await response.json();

            if (data.success) {
                showNotification('success', 'User updated successfully');
                setShowEditModal(false);
                setSelectedUser(null);
                setEditFormData({ name: '', email: '' });
                fetchUsers();
            } else {
                showNotification('error', data.message || 'Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            showNotification('error', 'Failed to update user');
        }
    };

    // Change user role
    const handleChangeRole = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/auth/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            const data = await response.json();

            if (data.success) {
                showNotification('success', 'User role updated successfully');
                fetchUsers();
            } else {
                showNotification('error', data.message || 'Failed to update role');
            }
        } catch (error) {
            console.error('Error updating role:', error);
            showNotification('error', 'Failed to update role');
        }
    };

    // Deactivate user
    const handleDeactivateUser = async (userId) => {
        if (!confirm('Are you sure you want to deactivate this user?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/auth/users/${userId}/deactivate`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                showNotification('success', 'User deactivated successfully');
                setShowUserMenu(null);
                fetchUsers();
            } else {
                showNotification('error', data.message || 'Failed to deactivate user');
            }
        } catch (error) {
            console.error('Error deactivating user:', error);
            showNotification('error', 'Failed to deactivate user');
        }
    };

    // Activate user
    const handleActivateUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/auth/users/${userId}/activate`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                showNotification('success', 'User activated successfully');
                setShowUserMenu(null);
                fetchUsers();
            } else {
                showNotification('error', data.message || 'Failed to activate user');
            }
        } catch (error) {
            console.error('Error activating user:', error);
            showNotification('error', 'Failed to activate user');
        }
    };

    // Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!resetPasswordData.newPassword || !resetPasswordData.confirmPassword) {
            showNotification('error', 'Please fill in all fields');
            return;
        }

        if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
            showNotification('error', 'Passwords do not match');
            return;
        }

        if (resetPasswordData.newPassword.length < 6) {
            showNotification('error', 'Password must be at least 6 characters');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/auth/users/${selectedUser._id}/reset-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword: resetPasswordData.newPassword })
            });
            const data = await response.json();

            if (data.success) {
                showNotification('success', 'Password reset successfully');
                setShowResetPasswordModal(false);
                setSelectedUser(null);
                setResetPasswordData({ newPassword: '', confirmPassword: '' });
            } else {
                showNotification('error', data.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            showNotification('error', 'Failed to reset password');
        }
    };

    // Open edit modal
    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditFormData({ name: user.name, email: user.email });
        setShowEditModal(true);
        setShowUserMenu(null);
    };

    // Open reset password modal
    const openResetPasswordModal = (user) => {
        setSelectedUser(user);
        setResetPasswordData({ newPassword: '', confirmPassword: '' });
        setShowResetPasswordModal(true);
        setShowUserMenu(null);
    };

    // Get role badge color
    const getRoleBadgeColor = (role) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-700 border-purple-200',
            qa_lead: 'bg-blue-100 text-blue-700 border-blue-200',
            qa_engineer: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            qa_automation: 'bg-cyan-100 text-cyan-700 border-cyan-200',
            developer: 'bg-orange-100 text-orange-700 border-orange-200',
            product_manager: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };
        return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Page Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                            <p className="text-gray-600 mt-1">Manage system users and their roles</p>
                        </div>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create User
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Users</p>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {users.filter(u => u.isActive).length}
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-lg">
                                <Power className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Inactive Users</p>
                                <p className="text-2xl font-bold text-rose-600">
                                    {users.filter(u => !u.isActive).length}
                                </p>
                            </div>
                            <div className="p-3 bg-rose-50 rounded-lg">
                                <Power className="w-6 h-6 text-rose-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Admins</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {users.filter(u => u.role === 'admin').length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Role Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <Select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-40"
                            >
                                <option value="all">All Roles</option>
                                {roleOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-40"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            Loading users...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No users found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Last Login
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Select
                                                    value={user.role}
                                                    onChange={(e) => handleChangeRole(user._id, e.target.value)}
                                                    className="text-sm"
                                                >
                                                    {roleOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={user.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(user.lastLogin)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowUserMenu(showUserMenu === user._id ? null : user._id)}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical className="w-5 h-5 text-gray-600" />
                                                    </button>
                                                    {showUserMenu === user._id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                                            <button
                                                                onClick={() => openEditModal(user)}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 first:rounded-t-lg"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                                Edit User
                                                            </button>
                                                            <button
                                                                onClick={() => openResetPasswordModal(user)}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Lock className="w-4 h-4" />
                                                                Reset Password
                                                            </button>
                                                            {user.isActive ? (
                                                                <button
                                                                    onClick={() => handleDeactivateUser(user._id)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 last:rounded-b-lg"
                                                                >
                                                                    <Power className="w-4 h-4" />
                                                                    Deactivate
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleActivateUser(user._id)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 last:rounded-b-lg"
                                                                >
                                                                    <Power className="w-4 h-4" />
                                                                    Activate
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Create User Modal */}
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Create New User"
                >
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                            </label>
                            <Input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter full name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Enter email address"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password *
                            </label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Enter password (min 6 characters)"
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role *
                            </label>
                            <Select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                required
                            >
                                {roleOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Create User
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Edit User Modal */}
                <Modal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title="Edit User"
                >
                    <form onSubmit={handleEditUser} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                            </label>
                            <Input
                                type="text"
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                placeholder="Enter full name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <Input
                                type="email"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                placeholder="Enter email address"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Reset Password Modal */}
                <Modal
                    isOpen={showResetPasswordModal}
                    onClose={() => setShowResetPasswordModal(false)}
                    title="Reset Password"
                >
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-blue-800">
                                You are resetting the password for <strong>{selectedUser?.name}</strong> ({selectedUser?.email})
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password *
                            </label>
                            <Input
                                type="password"
                                value={resetPasswordData.newPassword}
                                onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                                placeholder="Enter new password (min 6 characters)"
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password *
                            </label>
                            <Input
                                type="password"
                                value={resetPasswordData.confirmPassword}
                                onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                                placeholder="Confirm new password"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowResetPasswordModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Reset Password
                            </Button>
                        </div>
                    </form>
                </Modal>

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

export default UserManagement;
