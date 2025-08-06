'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useRef, useCallback } from 'react';
import { betAPI } from '@/lib/api/bet';
import { marketsAPI } from '@/lib/api/auth';
import { useAuthContext } from './AuthContext';

// Game data types
export interface MarketStatus {
    status: string;
    openTime: string;
    closeTime: string;
    isActive: boolean;
    message?: string;
    marketName?: string;
}

export interface CurrentTime {
    formattedTime: string;
    timestamp: number;
}

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
    weekDays?: number;
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
interface GameDataState {
    currentTime: CurrentTime | null;
    marketStatuses: Record<string, MarketStatus>;
    markets: Market[];
    assignments: MarketAssignment[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
    hasTriedFetch: boolean; // Flag to prevent infinite retries
}

// Action types
type GameDataAction =
    | { type: 'FETCH_DATA_START' }
    | { type: 'FETCH_CURRENT_TIME_SUCCESS'; payload: CurrentTime }
    | { type: 'FETCH_MARKET_STATUS_SUCCESS'; payload: { marketId: string; status: MarketStatus } }
    | { type: 'FETCH_MARKETS_SUCCESS'; payload: { assignments: MarketAssignment[] } }
    | { type: 'FETCH_DATA_ERROR'; payload: string | null }
    | { type: 'CLEAR_ERROR' }
    | { type: 'RESET_DATA' }
    | { type: 'SET_HAS_TRIED_FETCH' };

// Initial state
const initialState: GameDataState = {
    currentTime: null,
    marketStatuses: {},
    markets: [],
    assignments: [],
    loading: false,
    error: null,
    lastFetched: null,
    hasTriedFetch: false,
};

// Reducer
function gameDataReducer(state: GameDataState, action: GameDataAction): GameDataState {
    switch (action.type) {
        case 'FETCH_DATA_START':
            return {
                ...state,
                loading: true,
                error: null,
            };
        case 'FETCH_CURRENT_TIME_SUCCESS':
            return {
                ...state,
                loading: false,
                error: null,
                currentTime: action.payload,
                lastFetched: Date.now(),
            };
        case 'FETCH_MARKET_STATUS_SUCCESS':
            return {
                ...state,
                loading: false,
                error: null,
                marketStatuses: {
                    ...state.marketStatuses,
                    [action.payload.marketId]: action.payload.status
                },
                lastFetched: Date.now(),
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
        case 'FETCH_DATA_ERROR':
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        case 'SET_HAS_TRIED_FETCH':
            return {
                ...state,
                hasTriedFetch: true,
            };
        case 'RESET_DATA':
            return initialState;
        default:
            return state;
    }
}

// Context interface
interface GameDataContextType {
    state: GameDataState;
    fetchCurrentTime: () => Promise<void>;
    fetchMarketStatus: (marketId: string) => Promise<void>;
    fetchMarkets: () => Promise<void>;
    getCurrentTime: () => CurrentTime | null;
    getMarketStatus: (marketId: string) => MarketStatus | null;
    getMarketStatusColor: (market: Market) => string;
    clearError: () => void;
    refreshMarkets: () => void;
}

// Create context
const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

// Provider interface
interface GameDataProviderProps {
    children: ReactNode;
}

export const GameDataProvider: React.FC<GameDataProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(gameDataReducer, initialState);
    const { state: authState } = useAuthContext();
    const isMountedRef = useRef(false);
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastFetchRef = useRef<Record<string, number>>({});
    const pendingRequestsRef = useRef<Record<string, Promise<any>>>({});

    // Set mounted ref after first render
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            // Clear any pending timeouts and intervals
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
            if (timeIntervalRef.current) {
                clearInterval(timeIntervalRef.current);
            }
        };
    }, []);

    // Fetch current time
    const fetchCurrentTime = useCallback(async () => {
        // Prevent multiple simultaneous requests
        if (pendingRequestsRef.current['currentTime'] !== undefined) {
            return;
        }

        if (!isMountedRef.current) {
            return;
        }

        // Create a new request promise
        const requestPromise = (async () => {
            try {
                dispatch({ type: 'FETCH_DATA_START' });

                const response = await betAPI.getCurrentTime();

                if (!isMountedRef.current) {
                    return;
                }

                if (response.success && response.data) {
                    dispatch({
                        type: 'FETCH_CURRENT_TIME_SUCCESS',
                        payload: response.data
                    });
                } else {
                    throw new Error(response.message || 'Failed to fetch current time');
                }
            } catch (error: any) {
                dispatch({
                    type: 'FETCH_DATA_ERROR',
                    payload: error.message || 'Failed to fetch current time'
                });
            } finally {
                // Clean up the pending request
                delete pendingRequestsRef.current['currentTime'];
            }
        })();

        // Store the request promise
        pendingRequestsRef.current['currentTime'] = requestPromise;

        // Wait for the request to complete
        await requestPromise;
    }, []);

    // Fetch market status
    const fetchMarketStatus = useCallback(async (marketId: string) => {
        // Check if we already fetched this market recently (less than 30 seconds old)
        const now = Date.now();
        const lastFetch = lastFetchRef.current[marketId];
        if (lastFetch && (now - lastFetch) < 30000) {
            return;
        }

        // Check if there's already a pending request for this market
        if (pendingRequestsRef.current[marketId] !== undefined) {
            try {
                await pendingRequestsRef.current[marketId];
                return;
            } catch (error) {
                // If the pending request failed, we'll continue with a new request
            }
        }

        // Create a new request promise
        const requestPromise = (async () => {
            try {
                dispatch({ type: 'FETCH_DATA_START' });

                const response = await betAPI.getMarketStatus(marketId);

                // Only check if component is mounted after we get the response
                if (!isMountedRef.current) {
                    return;
                }

                if (response.success && response.data) {
                    // Update the last fetch time
                    lastFetchRef.current[marketId] = now;
                    dispatch({
                        type: 'FETCH_MARKET_STATUS_SUCCESS',
                        payload: { marketId, status: response.data }
                    });
                } else {
                    throw new Error(response.message || 'Failed to fetch market status');
                }
            } catch (error: any) {
                // Only dispatch error if component is still mounted
                if (isMountedRef.current) {
                    dispatch({
                        type: 'FETCH_DATA_ERROR',
                        payload: error.message || 'Failed to fetch market status'
                    });
                }
                throw error; // Re-throw so other waiting requests know it failed
            } finally {
                // Clean up the pending request
                delete pendingRequestsRef.current[marketId];
            }
        })();

        // Store the request promise
        pendingRequestsRef.current[marketId] = requestPromise;

        // Wait for the request to complete
        await requestPromise;
    }, []);

    // Fetch markets from server
    const fetchMarkets = useCallback(async () => {
        // Prevent multiple simultaneous requests
        if (pendingRequestsRef.current['markets'] !== undefined) {
            return;
        }

        // Prevent API calls if component is unmounted (React Strict Mode)
        if (!isMountedRef.current) {
            return;
        }

        // Create a new request promise
        const requestPromise = (async () => {
            try {
                dispatch({ type: 'FETCH_DATA_START' });
                dispatch({ type: 'SET_HAS_TRIED_FETCH' });

                const response = await marketsAPI.getAssignedMarkets();

                // Check if component is still mounted before updating state
                if (!isMountedRef.current) {
                    return;
                }

                if (response.success && response.data) {
                    dispatch({
                        type: 'FETCH_MARKETS_SUCCESS',
                        payload: { assignments: response.data.assignments }
                    });
                } else {
                    dispatch({
                        type: 'FETCH_DATA_ERROR',
                        payload: response.message || 'Failed to fetch markets'
                    });
                }
            } catch (error: any) {
                // Check if component is still mounted before updating state
                if (!isMountedRef.current) {
                    return;
                }

                // If it's an authentication error, don't show error message and don't retry
                if (error.response?.status === 401 || error.response?.status === 403) {
                    // Don't set error for auth issues, just stop loading
                    dispatch({
                        type: 'FETCH_DATA_ERROR',
                        payload: null
                    });
                } else {
                    dispatch({
                        type: 'FETCH_DATA_ERROR',
                        payload: 'Failed to fetch markets. Please try again.'
                    });
                }
            } finally {
                // Clean up the pending request
                delete pendingRequestsRef.current['markets'];
            }
        })();

        // Store the request promise
        pendingRequestsRef.current['markets'] = requestPromise;

        // Wait for the request to complete
        await requestPromise;
    }, []);

    // Get current time from state
    const getCurrentTime = useCallback((): CurrentTime | null => {
        return state.currentTime;
    }, [state.currentTime]);

    // Get market status from state
    const getMarketStatus = useCallback((marketId: string): MarketStatus | null => {
        return state.marketStatuses[marketId] || null;
    }, [state.marketStatuses]);

    // Refresh markets
    const refreshMarkets = () => {
        dispatch({ type: 'RESET_DATA' });
    };

    // Clear error
    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    // Helper function to determine market status
    const getMarketStatusColor = (market: Market): string => {
        const now = new Date();
        const openTime = new Date(market.openTime);
        const closeTime = new Date(market.closeTime);

        if (!market.isActive) {
            return 'text-red-500';
        }

        if (now < openTime) {
            return 'text-blue-500';
        } else if (now >= openTime && now <= closeTime) {
            return 'text-green-500';
        } else {
            return 'text-red-500';
        }
    };

    // Auto-fetch data on mount and set up intervals
    useEffect(() => {
        // Initial data fetch with minimal debounce
        const timeoutId = setTimeout(() => {
            if (isMountedRef.current) {
                // Fetch both current time and markets simultaneously
                Promise.all([
                    fetchCurrentTime(),
                    fetchMarkets()
                ]).catch(error => {
                    console.error('Error fetching initial data:', error);
                });
            }
        }, 50);

        // Set up interval to update time every minute
        timeIntervalRef.current = setInterval(() => {
            if (isMountedRef.current) {
                fetchCurrentTime();
            }
        }, 60000);

        // Cleanup interval and timeout on unmount
        return () => {
            clearTimeout(timeoutId);
            if (timeIntervalRef.current) {
                clearInterval(timeIntervalRef.current);
            }
        };
    }, [fetchCurrentTime, fetchMarkets]);

    // Auto-fetch markets when authentication state changes (for re-authentication scenarios)
    useEffect(() => {
        // Only fetch if:
        // 1. User is authenticated
        // 2. User data exists
        // 3. We haven't tried fetching yet OR we're doing a manual refresh (lastFetched is null)
        // 4. Not currently loading
        // 5. Component is mounted
        if (
            authState.isAuthenticated &&
            authState.user &&
            !state.loading &&
            isMountedRef.current &&
            (!state.hasTriedFetch || state.lastFetched === null)
        ) {
            // Clear any existing timeout
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }

            // Debounce the fetch call by 100ms to prevent rapid successive calls
            fetchTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current) {
                    fetchMarkets();
                }
            }, 100);
        }

        // If user logs out, reset markets state
        if (!authState.isAuthenticated && state.markets.length > 0) {
            dispatch({ type: 'RESET_DATA' });
        }

        // Cleanup timeout on unmount or dependency change
        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, [authState.isAuthenticated, state.hasTriedFetch, state.lastFetched, state.loading, fetchMarkets]);

    const value: GameDataContextType = {
        state,
        fetchCurrentTime,
        fetchMarketStatus,
        fetchMarkets,
        getCurrentTime,
        getMarketStatus,
        getMarketStatusColor,
        clearError,
        refreshMarkets,
    };

    return (
        <GameDataContext.Provider value={value}>
            {children}
        </GameDataContext.Provider>
    );
};

// Custom hook to use game data context
export const useGameData = (): GameDataContextType => {
    const context = useContext(GameDataContext);
    if (context === undefined) {
        throw new Error('useGameData must be used within a GameDataProvider');
    }
    return context;
}; 