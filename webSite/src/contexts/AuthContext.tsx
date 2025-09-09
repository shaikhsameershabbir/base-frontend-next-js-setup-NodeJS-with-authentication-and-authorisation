'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from 'react';
import { authAPI } from '@/lib/api/auth';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * User interface - defines the structure of user data
 */
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

/**
 * AuthState interface - defines the structure of authentication state
 * This is what gets shared across all components for auth-related data
 */
interface AuthState {
    user: User | null;           // Current logged-in user (null if not logged in)
    loading: boolean;            // Whether auth operations are loading
    error: string | null;        // Any auth-related error messages
    isAuthenticated: boolean;    // Whether user is logged in
}

// ============================================================================
// ACTION TYPES (for useReducer)
// ============================================================================

/**
 * Action Types - these are like "commands" that tell the reducer what to do
 * Each action has a 'type' (what to do) and optional 'payload' (data to use)
 */
type AuthAction =
    | { type: 'SET_LOADING'; payload: boolean }           // Show/hide loading spinner
    | { type: 'SET_ERROR'; payload: string | null }       // Set error message
    | { type: 'SET_USER'; payload: User | null }          // Set current user
    | { type: 'SET_AUTHENTICATED'; payload: boolean }     // Set login status
    | { type: 'UPDATE_USER_BALANCE'; payload: number }    // Update user's balance
    | { type: 'LOGOUT' }                                  // Clear user data
    | { type: 'CLEAR_ERROR' };                            // Clear error message

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Initial state - the starting point for authentication
 * This is what the auth state looks like when the app first loads
 */
const initialState: AuthState = {
    user: null,              // No user logged in
    loading: true,           // Auth is loading (checking if user is logged in)
    error: null,             // No errors
    isAuthenticated: false,  // Not authenticated
};

// ============================================================================
// REDUCER FUNCTION (The "brain" of auth state management)
// ============================================================================

/**
 * Reducer function - this is like a "state machine" for authentication
 * It takes the current state and an action, then returns the new state
 * Think of it as: "If this auth action happens, how should the state change?"
 */
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SET_LOADING':
            // Update loading state
            return {
                ...state,                    // Keep all existing state
                loading: action.payload,     // Update only the loading field
            };

        case 'SET_ERROR':
            // Set error message and stop loading
            return {
                ...state,
                error: action.payload,       // Set the error message
                loading: false,              // Stop loading (since we have an error)
            };

        case 'SET_USER':
            // Set user data and update authentication status
            return {
                ...state,
                user: action.payload,                    // Set the user object
                isAuthenticated: !!action.payload,       // true if user exists, false if null
                loading: false,                          // Stop loading
                error: null,                             // Clear any errors
            };

        case 'SET_AUTHENTICATED':
            // Update authentication status
            return {
                ...state,
                isAuthenticated: action.payload,
            };

        case 'UPDATE_USER_BALANCE':
            // Update only the user's balance (keep everything else the same)
            return {
                ...state,
                user: state.user ? {
                    ...state.user,                       // Keep all user data
                    balance: action.payload,             // Update only the balance
                } : null,
            };

        case 'LOGOUT':
            // Clear all user data and reset to initial state
            return {
                ...state,
                user: null,               // Remove user
                isAuthenticated: false,   // Set as not authenticated
                error: null,              // Clear errors
                loading: false,           // Stop loading
            };

        case 'CLEAR_ERROR':
            // Remove error message
            return {
                ...state,
                error: null,
            };

        default:
            // If we get an unknown action, return state unchanged
            return state;
    }
};

// ============================================================================
// CONTEXT DEFINITION
// ============================================================================

/**
 * AuthContext Type - defines what auth data and functions will be available to components
 * This is like a "contract" that says what the auth context provides
 */
interface AuthContextType {
    state: AuthState;                                    // The current auth state
    dispatch: React.Dispatch<AuthAction>;                 // Function to update auth state
    // Auth action functions (convenience methods):
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateBalance: (newBalance: number) => void;
    clearError: () => void;
}

/**
 * Create the Auth Context - this is like creating a "container" that can hold auth data
 * The undefined is the default value (will be set by the Provider)
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Custom hook to use the auth context
 * This is what components will use to access the shared auth state
 */
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

/**
 * Provider Props - what the AuthProvider component accepts
 */
interface AuthProviderProps {
    children: ReactNode;  // The components that will use this context
}

/**
 * AuthProvider Component - this is the "wrapper" that provides auth data to all child components
 * Think of it as the "auth data source" for your entire app
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // useReducer gives us state and dispatch function
    // state = current auth state, dispatch = function to update auth state
    const [state, dispatch] = useReducer(authReducer, initialState);
    const isMountedRef = useRef(false);
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Set mounted ref after first render
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            // Clear any pending timeouts
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, []);

    // Sync user data to localStorage whenever user state changes
    useEffect(() => {
        if (state.user) {
            localStorage.setItem('user', JSON.stringify(state.user));
        }
    }, [state.user]);

    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================

    /**
     * Fetch user profile from the API
     * This gets the latest user data from the server
     */
    const fetchUserProfile = async (): Promise<void> => {
        // Prevent multiple simultaneous calls
        if (state.loading) {
            return;
        }

        // Prevent API calls if component is unmounted (React Strict Mode)
        if (!isMountedRef.current) {
            return;
        }

        try {
            // Start loading
            dispatch({ type: 'SET_LOADING', payload: true });

            // Call API to get user data
            const response = await authAPI.getProfile();

            // Check if component is still mounted before updating state
            if (!isMountedRef.current) {
                return;
            }

            if (response.success && response.data) {
                // If successful, set the user data
                dispatch({ type: 'SET_USER', payload: response.data.user });
            } else {
                throw new Error(response.message || 'Failed to fetch user profile');
            }
        } catch (err: any) {
            // Check if component is still mounted before updating state
            if (!isMountedRef.current) {
                return;
            }

            // If it's an authentication error (401/403), user is not logged in
            if (err.response?.status === 401 || err.response?.status === 403) {
                // Clear all authentication data
                dispatch({ type: 'LOGOUT' });
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                // Clear cookies and tokens
                if (typeof window !== 'undefined') {
                    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                }
            } else {
                // For other errors, just set loading to false without showing error
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        }
    };

    /**
     * Login function - handles user authentication
     */
    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            // Start loading and clear any previous errors
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'CLEAR_ERROR' });

            // Call login API
            const response = await authAPI.login({
                username,
                password,
                loginSource: 'web'
            });

            if (response.success && response.data) {
                const { user, accessToken, refreshToken } = response.data;

                // Check if user is a player (this app is only for players)
                if (user.role !== 'player') {
                    dispatch({ type: 'SET_ERROR', payload: 'Access denied. This login is only for players.' });
                    return false;
                }

                // Store user data in browser storage (so it persists between page refreshes)
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userRole', user.role);
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Update the app state with user data
                dispatch({ type: 'SET_USER', payload: user });
                return true;
            } else {
                dispatch({ type: 'SET_ERROR', payload: response.message || 'Login failed' });
                return false;
            }
        } catch (err: any) {
            // Handle different types of errors
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

    /**
     * Logout function - clears all user data
     */
    const logout = async (): Promise<void> => {
        try {
            // Call logout API (to invalidate tokens on server)
            await authAPI.logout();
        } catch (err) {
            // Logout error - silently fail
        } finally {
            // Always clear local state, even if API call fails
            dispatch({ type: 'LOGOUT' });

            // Clear all stored data
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    };

    /**
     * Refresh user data - gets latest data from server
     */
    const refreshUser = async (): Promise<void> => {
        if (state.isAuthenticated) {
            await fetchUserProfile();
        }
    };

    /**
     * Update user balance - for when user makes transactions
     */
    const updateBalance = (newBalance: number): void => {
        dispatch({ type: 'UPDATE_USER_BALANCE', payload: newBalance });

        // Also update localStorage to persist the balance change
        if (state.user) {
            const updatedUser = { ...state.user, balance: newBalance };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    /**
     * Clear error message
     */
    const clearError = (): void => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    // ============================================================================
    // INITIALIZATION EFFECT
    // ============================================================================

    /**
     * useEffect runs when the component mounts (app starts)
     * This checks if user is already logged in from previous session
     */
    useEffect(() => {
        const initializeAuth = async () => {
            // Check if user was logged in before
            const isAuth = localStorage.getItem('isAuthenticated');
            const userData = localStorage.getItem('user');
            const accessToken = localStorage.getItem('accessToken');

            if (isAuth && userData && accessToken) {
                try {
                    // Parse stored user data
                    const parsedUser = JSON.parse(userData);

                    // Set user in state (this makes them "logged in")
                    dispatch({ type: 'SET_USER', payload: parsedUser });

                    // Only fetch profile if we have a valid token and user data
                    if (isMountedRef.current) {
                        // Get fresh data from server (in case data changed)
                        await fetchUserProfile();
                    }
                } catch (err) {
                    // If stored data is corrupted, clear it
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('user');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } else {
                // No stored data, user is not logged in
                // Clear any partial data
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        initializeAuth();

        // Cleanup timeout on unmount
        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, []); // Empty dependency array to run only once

    // ============================================================================
    // PROVIDER VALUE
    // ============================================================================

    /**
     * This is what gets shared with all child components
     * Think of it as the "auth data package" that components can access
     */
    const value: AuthContextType = {
        state,              // Current auth state (user, loading, error, etc.)
        dispatch,           // Function to update auth state
        login,              // Login function
        logout,             // Logout function
        refreshUser,        // Refresh user data
        updateBalance,      // Update balance
        clearError,         // Clear errors
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    /**
     * Render the Provider with the shared value
     * All children components can now access this auth data
     */
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 