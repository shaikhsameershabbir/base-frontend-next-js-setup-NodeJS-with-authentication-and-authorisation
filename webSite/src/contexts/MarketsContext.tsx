'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { marketsAPI } from '@/lib/api/auth';
import { useAuthContext } from './AuthContext';

// Market types
export interface Market {
    _id: string;
    marketName: string;
    openTime: string;
    closeTime: string;
    isActive: boolean;
    isGolden?: boolean;
    rank?: number;
    isAssigned: boolean;
    assignmentId?: string;
}

export interface MarketAssignment {
    _id: string;
    assignedBy: {
        _id: string;
        username: string;
    };
    assignedTo: string;
    marketId: Market;
    marketData?: Market & { rank?: number };
    rank?: number;
    hierarchyLevel: string;
    parentAssignment?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// State interface
interface MarketsState {
    markets: Market[];
    assignments: MarketAssignment[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
    hasTriedFetch: boolean; // Flag to prevent infinite retries
}

// Action types
type MarketsAction =
    | { type: 'FETCH_MARKETS_START' }
    | { type: 'FETCH_MARKETS_SUCCESS'; payload: { assignments: MarketAssignment[] } }
    | { type: 'FETCH_MARKETS_ERROR'; payload: string | null }
    | { type: 'CLEAR_MARKETS_ERROR' }
    | { type: 'REFRESH_MARKETS' }
    | { type: 'SET_HAS_TRIED_FETCH' }
    | { type: 'RESET_MARKETS' };

// Initial state
const initialState: MarketsState = {
    markets: [],
    assignments: [],
    loading: false,
    error: null,
    lastFetched: null,
    hasTriedFetch: false,
};

// Reducer
function marketsReducer(state: MarketsState, action: MarketsAction): MarketsState {
    switch (action.type) {
        case 'FETCH_MARKETS_START':
            return {
                ...state,
                loading: true,
                error: null,
            };
        case 'FETCH_MARKETS_SUCCESS':
            return {
                ...state,
                loading: false,
                error: null,
                assignments: action.payload.assignments,
                markets: action.payload.assignments.map(assignment => {
                    // Use marketData if available, otherwise fall back to marketId
                    if (assignment.marketData) {
                        return {
                            ...assignment.marketData,
                            isAssigned: true,
                            assignmentId: assignment._id
                        };
                    }
                    return {
                        ...assignment.marketId,
                        isAssigned: true,
                        assignmentId: assignment._id
                    };
                }),
                lastFetched: Date.now(),
            };
        case 'FETCH_MARKETS_ERROR':
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case 'CLEAR_MARKETS_ERROR':
            return {
                ...state,
                error: null,
            };
        case 'REFRESH_MARKETS':
            return {
                ...state,
                lastFetched: null, // This will trigger a refetch
                hasTriedFetch: false, // Reset the flag
            };
        case 'SET_HAS_TRIED_FETCH':
            return {
                ...state,
                hasTriedFetch: true,
            };
        case 'RESET_MARKETS':
            return {
                ...initialState,
            };
        default:
            return state;
    }
}

// Context interface
interface MarketsContextType {
    state: MarketsState;
    fetchMarkets: () => Promise<void>;
    refreshMarkets: () => void;
    clearError: () => void;
    getMarketStatus: (market: Market) => string;
    getMarketStatusColor: (market: Market) => string;
}

// Create context
const MarketsContext = createContext<MarketsContextType | undefined>(undefined);

// Provider component
interface MarketsProviderProps {
    children: ReactNode;
}

export const MarketsProvider: React.FC<MarketsProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(marketsReducer, initialState);
    const { state: authState } = useAuthContext();

    // Fetch markets from server
    const fetchMarkets = async () => {
        try {
            dispatch({ type: 'FETCH_MARKETS_START' });
            dispatch({ type: 'SET_HAS_TRIED_FETCH' });

            const response = await marketsAPI.getAssignedMarkets();

            if (response.success && response.data) {
                dispatch({
                    type: 'FETCH_MARKETS_SUCCESS',
                    payload: { assignments: response.data.assignments }
                });
            } else {
                dispatch({
                    type: 'FETCH_MARKETS_ERROR',
                    payload: response.message || 'Failed to fetch markets'
                });
            }
        } catch (error: any) {
            console.error('Error fetching markets:', error);

            // If it's an authentication error, don't show error message and don't retry
            if (error.response?.status === 401 || error.response?.status === 403) {
                // Don't set error for auth issues, just stop loading
                dispatch({
                    type: 'FETCH_MARKETS_ERROR',
                    payload: null
                });
            } else {
                dispatch({
                    type: 'FETCH_MARKETS_ERROR',
                    payload: 'Failed to fetch markets. Please try again.'
                });
            }
        }
    };

    // Refresh markets
    const refreshMarkets = () => {
        dispatch({ type: 'REFRESH_MARKETS' });
    };

    // Clear error
    const clearError = () => {
        dispatch({ type: 'CLEAR_MARKETS_ERROR' });
    };

    // Helper function to determine market status
    const getMarketStatus = (market: Market): string => {
        const now = new Date();
        const openTime = new Date(market.openTime);
        const closeTime = new Date(market.closeTime);

        if (!market.isActive) {
            return 'Market closed';
        }

        if (now < openTime) {
            return 'Coming soon';
        } else if (now >= openTime && now <= closeTime) {
            return 'Market is open';
        } else {
            return 'Market close for today';
        }
    };

    // Helper function to get status color
    const getMarketStatusColor = (market: Market): string => {
        const status = getMarketStatus(market);

        switch (status) {
            case 'Market is open':
                return 'text-green-500';
            case 'Coming soon':
                return 'text-blue-500';
            case 'Market close for today':
                return 'text-red-500';
            case 'Running for close':
                return 'text-yellow-500';
            default:
                return 'text-gray-500';
        }
    };

    // Auto-fetch markets when authentication state changes
    useEffect(() => {
        // If user is authenticated and we haven't fetched markets yet
        if (authState.isAuthenticated && authState.user && !state.hasTriedFetch) {
            fetchMarkets();
        }

        // If user logs out, reset markets state
        if (!authState.isAuthenticated) {
            dispatch({ type: 'RESET_MARKETS' });
        }
    }, [authState.isAuthenticated, authState.user, state.hasTriedFetch]);

    // Also fetch markets when lastFetched is null (for manual refresh)
    useEffect(() => {
        if (authState.isAuthenticated && authState.user && state.lastFetched === null && !state.hasTriedFetch) {
            fetchMarkets();
        }
    }, [state.lastFetched, authState.isAuthenticated, authState.user, state.hasTriedFetch]);

    const value: MarketsContextType = {
        state,
        fetchMarkets,
        refreshMarkets,
        clearError,
        getMarketStatus,
        getMarketStatusColor,
    };

    return (
        <MarketsContext.Provider value={value}>
            {children}
        </MarketsContext.Provider>
    );
};

// Custom hook to use markets context
export const useMarkets = (): MarketsContextType => {
    const context = useContext(MarketsContext);
    if (context === undefined) {
        throw new Error('useMarkets must be used within a MarketsProvider');
    }
    return context;
}; 