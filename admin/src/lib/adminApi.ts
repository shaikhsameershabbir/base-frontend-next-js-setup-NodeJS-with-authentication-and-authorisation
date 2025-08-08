import apiClient from './api-client';

export interface DashboardStats {
    totalUsers: number;
    activeMarkets: number;
    totalBids: number;
    totalBetAmount: number;
    winAmount: number;
    markets: Array<{
        _id: string;
        marketName: string;
        isActive: boolean;
        totalBids: number;
        totalAmount: number;
    }>;
}

export interface User {
    _id: string;
    username: string;
    role: string;
    balance: number;
    isActive: boolean;
    createdAt: string;
}

export interface Market {
    _id: string;
    marketName: string;
    openTime: string;
    closeTime: string;
    isActive: boolean;
    isGolden: boolean;
    weekDays: number;
}

export interface Bet {
    _id: string;
    marketId: string;
    userId: string;
    type: string;
    betType: string;
    amount: number;
    status: boolean;
    winAmount?: number;
    claimStatus?: boolean;
    result?: string;
    selectedNumbers: { [key: number]: number };
    createdAt: string;
}

// Dashboard Statistics API
export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data.data;
};

// Users API
export const getUsers = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    parentId?: string;
}): Promise<{
    data: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}> => {
    const response = await apiClient.get('/users', { params });
    return response.data;
};

export const getUserById = async (userId: string): Promise<{ user: User }> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data.data;
};

// Markets API
export const getMarkets = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
}): Promise<{
    data: Market[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}> => {
    const response = await apiClient.get('/markets', { params });
    return response.data;
};

export const getMarketById = async (marketId: string): Promise<{ market: Market }> => {
    const response = await apiClient.get(`/markets/${marketId}`);
    return response.data.data;
};

// Bets API
export const getBets = async (params?: {
    page?: number;
    limit?: number;
    marketId?: string;
    userId?: string;
    status?: boolean;
    startDate?: string;
    endDate?: string;
}): Promise<{
    data: Bet[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}> => {
    const response = await apiClient.get('/bets', { params });
    return response.data;
};

// Auth API
export const getCurrentUser = async (): Promise<{ user: User }> => {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
};

export const logout = async (): Promise<void> => {
    await apiClient.post('/auth/logout');
};
