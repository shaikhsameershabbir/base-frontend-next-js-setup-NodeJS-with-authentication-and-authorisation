import apiClient from './api-client';

// Types for load data
export interface LoadData {
    [gameType: string]: {
        open?: { [key: string]: number };
        close?: { [key: string]: number };
        both?: { [key: string]: number };
    };
}

export interface CompleteTotals {
    total: number;
    [gameType: string]: {
        open?: number;
        close?: number;
        both?: number;
        total: number;
    } | number;
}

export interface BetStatistics {
    totalBets: number;
    totalAmount: number;
    betTypeStats: {
        open: { count: number; amount: number };
        close: { count: number; amount: number };
        both: { count: number; amount: number };
    };
    gameTypeStats: {
        [gameType: string]: {
            count: number;
            amount: number;
            betTypes: {
                open: { count: number; amount: number };
                close: { count: number; amount: number };
                both: { count: number; amount: number };
            };
        };
    };
}

export interface LoadResponse {
    success: boolean;
    message: string;
    data: LoadData;
    statistics: BetStatistics;
    completeTotals: CompleteTotals;
    debug: {
        totalBets: number;
        dateRange: { start: string; end: string };
        betTypes: string[];
        filters?: { userId?: string; marketId?: string };
    };
}

export interface HierarchicalUser {
    _id: string;
    username: string;
    role: string;
    isActive: boolean;
    parentId?: string;
}

export interface HierarchicalUsersResponse {
    success: boolean;
    message: string;
    data: Record<string, HierarchicalUser[]>;
}

export interface Market {
    _id: string;
    marketName: string;
    openTime: string;
    closeTime: string;
    isActive: boolean;
}

export interface AssignedMarketsResponse {
    success: boolean;
    message: string;
    data: Market[];
}

// API functions
export const loadApi = {
    // Get all loads for a specific date with optional filters
    getAllLoads: async (date?: string, userId?: string, marketId?: string): Promise<LoadResponse> => {
        const params: Record<string, string> = {};
        if (date) params.date = date;
        if (userId) params.userId = userId;
        if (marketId) params.marketId = marketId;

        const response = await apiClient.get('/load/getAllLoads', { params });
        return response.data;
    },

    // Get loads for today
    getTodayLoads: async (): Promise<LoadResponse> => {
        const today = new Date().toISOString().split('T')[0];
        return loadApi.getAllLoads(today);
    },

    // Get loads for a date range
    getLoadsByDateRange: async (startDate: string, endDate: string): Promise<LoadResponse> => {
        const response = await apiClient.get('/load/getAllLoads', {
            params: { startDate, endDate }
        });
        return response.data;
    },

    // Get hierarchical users for the current user
    getHierarchicalUsers: async (role?: string): Promise<HierarchicalUsersResponse> => {
        const params = role ? { role } : {};
        const response = await apiClient.get('/load/hierarchical-users', { params });
        return response.data;
    },

    // Get assigned markets for the current user
    getAssignedMarkets: async (): Promise<AssignedMarketsResponse> => {
        const response = await apiClient.get('/load/assigned-markets');
        return response.data;
    }
};
