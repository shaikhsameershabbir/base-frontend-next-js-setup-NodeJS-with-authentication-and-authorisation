"use client"
import React, { useState, useEffect, createContext, useContext } from 'react';
import { authAPI, apiUtils, User } from '@/lib/api-service';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updateProfile: (data: any) => Promise<boolean>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const storedAuth = localStorage.getItem('isAuthenticated');
            const storedUser = localStorage.getItem('user');
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

   

            if (!storedAuth || !storedUser) {
                setLoading(false);
                return;
            }

            // First, restore user data from localStorage
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (parseError) {
                console.error('❌ Failed to parse stored user data:', parseError);
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            // Check if we have tokens
            const hasToken = apiUtils.isAuthenticated();

            if (!hasToken) {
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

        } catch (error) {
            console.error('❌ Auth check failed:', error);
            // Only clear auth if there's a critical error
            apiUtils.clearAuth();
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            setLoading(true);
            const response = await authAPI.login({ username, password, login: 'admin' });

            if (response.success && response.data?.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return true;
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            apiUtils.clearAuth();
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
        }
    };

    const updateProfile = async (data: any): Promise<boolean> => {
        try {
            const response = await authAPI.updateProfile(data);
            if (response.success && response.data?.user) {
                setUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        updateProfile,
        isAuthenticated,
    };

    return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 