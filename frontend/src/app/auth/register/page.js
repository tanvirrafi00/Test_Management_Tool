'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function Register() {
    const router = useRouter();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'qa_engineer',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const result = await register(formData.name, formData.email, formData.password, formData.role);

        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-xl mb-4">
                        <UserPlus className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Create Account
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Join TestFlow to manage your test cases
                    </p>
                </div>

                {/* Register Form */}
                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                    {error && (
                        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md mb-6">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    error={!!error}
                                    disabled={loading}
                                    hasIcon={true}
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={!!error}
                                    disabled={loading}
                                    hasIcon={true}
                                />
                            </div>
                        </div>

                        {/* Role Field */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="qa_engineer">QA Engineer</option>
                                <option value="qa_lead">QA Lead</option>
                                <option value="viewer">Viewer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={!!error}
                                    disabled={loading}
                                    hasIcon={true}
                                />
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={!!error}
                                    disabled={loading}
                                    hasIcon={true}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <UserPlus className="h-5 w-5 mr-2" />
                                    Create Account
                                </div>
                            )}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <a href="/auth/login" className="font-medium text-primary-600 hover:text-primary-700">
                                Sign In
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
