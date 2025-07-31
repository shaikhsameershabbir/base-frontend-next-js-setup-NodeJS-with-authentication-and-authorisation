'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useRef, useCallback } from 'react';
import { betAPI } from '@/lib/api/bet';

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

// State interface
interface GameDataState {
    currentTime: CurrentTime | null;
    marketStatuses: Record<string, MarketStatus>;
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
}

// Action types
type GameDataAction =
    | { type: 'FETCH_DATA_START' }
    | { type: 'FETCH_CURRENT_TIME_SUCCESS'; payload: CurrentTime }
    | { type: 'FETCH_MARKET_STATUS_SUCCESS'; payload: { marketId: string; status: MarketStatus } }
    | { type: 'FETCH_DATA_ERROR'; payload: string | null }
    | { type: 'CLEAR_ERROR' }
    | { type: 'RESET_DATA' };

// Initial state
const initialState: GameDataState = {
    currentTime: null,
    marketStatuses: {},
    loading: false,
    error: null,
    lastFetched: null,
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
    getCurrentTime: () => CurrentTime | null;
    getMarketStatus: (marketId: string) => MarketStatus | null;
    clearError: () => void;
}

// Create context
const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

// Provider interface
interface GameDataProviderProps {
    children: ReactNode;
}

export const GameDataProvider: React.FC<GameDataProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(gameDataReducer, initialState);
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
        if (state.loading) {
            return;
        }

        if (!isMountedRef.current) {
            return;
        }

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
        }
    }, [state.loading]);

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

        // Prevent API calls if component is unmounted
        if (!isMountedRef.current) {
            return;
        }

        // Create a new request promise
        const requestPromise = (async () => {
            try {
                dispatch({ type: 'FETCH_DATA_START' });

                const response = await betAPI.getMarketStatus(marketId);

                // Check if component is still mounted before updating state
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
                dispatch({
                    type: 'FETCH_DATA_ERROR',
                    payload: error.message || 'Failed to fetch market status'
                });
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

    // Get current time from state
    const getCurrentTime = useCallback((): CurrentTime | null => {
        return state.currentTime;
    }, [state.currentTime]);

    // Get market status from state
    const getMarketStatus = useCallback((marketId: string): MarketStatus | null => {
        return state.marketStatuses[marketId] || null;
    }, [state.marketStatuses]);

    // Clear error
    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    // Auto-fetch current time on mount and set up interval
    useEffect(() => {
        // Initial fetch
        fetchCurrentTime();

        // Set up interval to update time every minute
        timeIntervalRef.current = setInterval(() => {
            if (isMountedRef.current) {
                fetchCurrentTime();
            }
        }, 60000);

        // Cleanup interval on unmount
        return () => {
            if (timeIntervalRef.current) {
                clearInterval(timeIntervalRef.current);
            }
        };
    }, []);

    const value: GameDataContextType = {
        state,
        fetchCurrentTime,
        fetchMarketStatus,
        getCurrentTime,
        getMarketStatus,
        clearError,
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