"use client"
import { useState, useEffect, createContext, useContext } from 'react';
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

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            if (apiUtils.isAuthenticated()) {
                const response = await authAPI.getProfile();
                if (response.success && response.data?.user) {
                    setUser(response.data.user);
                    setIsAuthenticated(true);
                } else {
                    // Invalid token, clear auth
                    apiUtils.clearAuth();
                    setIsAuthenticated(false);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            apiUtils.clearAuth();
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            setLoading(true);
            const response = await authAPI.login({ username, password });

            if (response.success && response.data?.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return true;
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setUser(null);
            setIsAuthenticated(false);
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
        }
    };

    const updateProfile = async (data: any): Promise<boolean> => {
        try {
            const response = await authAPI.updateProfile(data);
            if (response.success && response.data?.user) {
                setUser(response.data.user);
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

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 