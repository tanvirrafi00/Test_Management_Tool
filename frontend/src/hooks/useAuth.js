import { useState, useEffect } from 'react';
import { authAPI } from '../lib/api';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Fetch user data from backend to verify authentication
        const fetchUser = async () => {
            try {
                const response = await authAPI.getMe();
                setUser(response.data.data);
            } catch (error) {
                // User is not authenticated, clear any stored data
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { user } = response.data.data;
            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await authAPI.register({ name, email, password });
            const { user } = response.data.data;
            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
            setUser(null);
            router.push('/auth/login');
        } catch (error) {
            // Even if logout fails, clear user state and redirect
            setUser(null);
            router.push('/auth/login');
        }
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    return {
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user
    };
}
