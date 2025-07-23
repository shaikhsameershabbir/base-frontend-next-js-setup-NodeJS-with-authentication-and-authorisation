'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { authAPI } from '@/lib/api/auth';

// Types
interface User {
    _id: string;
    username: string;
    balance: number;
    role: 'superadmin' | 'admin' | 'distributor' | 'agent' | 'player';
    parentId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

interface AppState {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    // Add more global state here as needed
    // theme: 'light' | 'dark';
    // notifications: Notification[];
    // settings: AppSettings;
}

// Action Types
type Action =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_USER'; payload: User | null }
    | { type: 'SET_AUTHENTICATED'; payload: boolean }
    | { type: 'UPDATE_USER_BALANCE'; payload: number }
    | { type: 'LOGOUT' }
    | { type: 'CLEAR_ERROR' };

// Initial State
const initialState: AppState = {
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
};

// Reducer
const globalReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };

        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };

        case 'SET_USER':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload,
                loading: false,
                error: null,
            };

        case 'SET_AUTHENTICATED':
            return {
                ...state,
                isAuthenticated: action.payload,
            };

        case 'UPDATE_USER_BALANCE':
            return {
                ...state,
                user: state.user ? {
                    ...state.user,
                    balance: action.payload,
                } : null,
            };

        case 'LOGOUT':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                error: null,
                loading: false,
            };

        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};

// Context
interface GlobalContextType {
    state: AppState;
    dispatch: React.Dispatch<Action>;
    // Actions
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateBalance: (newBalance: number) => void;
    clearError: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Hook
export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobalContext must be used within a GlobalProvider');
    }
    return context;
};

// Provider Props
interface GlobalProviderProps {
    children: ReactNode;
}

// Provider Component
export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(globalReducer, initialState);

    // Fetch user profile from API
    const fetchUserProfile = async (): Promise<void> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            const response = await authAPI.getProfile();

            if (response.success && response.data) {
                dispatch({ type: 'SET_USER', payload: response.data.user });
            } else {
                throw new Error(response.message || 'Failed to fetch user profile');
            }
        } catch (err: any) {
            console.error('Error fetching user profile:', err);

            // If it's an authentication error, clear auth state
            if (err.response?.status === 401 || err.response?.status === 403) {
                dispatch({ type: 'LOGOUT' });
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');

                // Clear cookies and token
                if (typeof window !== 'undefined') {
                    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    localStorage.removeItem('authToken');
                }
            } else {
                dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to fetch user profile' });
            }
        }
    };

    // Login function
    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'CLEAR_ERROR' });

            const response = await authAPI.login({
                username,
                password,
                loginSource: 'web'
            });

            if (response.success && response.data) {
                const { user, accessToken, refreshToken } = response.data;

                // Check if user is a player
                if (user.role !== 'player') {
                    dispatch({ type: 'SET_ERROR', payload: 'Access denied. This login is only for players.' });
                    return false;
                }

                // Store user data and tokens
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userRole', user.role);
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Set user in context
                dispatch({ type: 'SET_USER', payload: user });
                return true;
            } else {
                dispatch({ type: 'SET_ERROR', payload: response.message || 'Login failed' });
                return false;
            }
        } catch (err: any) {
            console.error('Login error:', err);

            let errorMessage = 'Login failed. Please try again.';

            if (err.response?.status === 401) {
                errorMessage = 'Invalid mobile number or password';
            } else if (err.response?.status === 403) {
                errorMessage = 'Access denied. This login is only for players.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            return false;
        }
    };

    // Logout function
    const logout = async (): Promise<void> => {
        try {
            await authAPI.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Clear local state
            dispatch({ type: 'LOGOUT' });

            // Clear localStorage
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            localStorage.removeItem('authToken');
        }
    };

    // Refresh user data
    const refreshUser = async (): Promise<void> => {
        if (state.isAuthenticated) {
            await fetchUserProfile();
        }
    };

    // Update balance
    const updateBalance = (newBalance: number): void => {
        dispatch({ type: 'UPDATE_USER_BALANCE', payload: newBalance });
    };

    // Clear error
    const clearError = (): void => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const isAuth = localStorage.getItem('isAuthenticated');
            const userData = localStorage.getItem('user');

            if (isAuth && userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    dispatch({ type: 'SET_USER', payload: parsedUser });

                    // Fetch fresh user data from API
                    await fetchUserProfile();
                } catch (err) {
                    console.error('Error parsing user data:', err);
                    // Clear invalid data
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('user');
                    localStorage.removeItem('userRole');
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } else {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        initializeAuth();
    }, []);

    const value: GlobalContextType = {
        state,
        dispatch,
        login,
        logout,
        refreshUser,
        updateBalance,
        clearError,
    };

    return (
        <GlobalContext.Provider value={value}>
            {children}
        </GlobalContext.Provider>
    );
}; 