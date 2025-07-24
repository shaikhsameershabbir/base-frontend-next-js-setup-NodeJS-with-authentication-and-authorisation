import apiClient from './api-client';

// ============================================================================
// INTERFACES
// ============================================================================

export interface User {
    _id: string;
    username: string;
    email?: string;
    balance: number;
    role: 'superadmin' | 'admin' | 'distributor' | 'agent' | 'player';
    parentId?: string;
    isActive: boolean;
    loginSource?: string;
    lastLogin?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface Market {
    _id: string;
    marketName: string;
    openTime: string;
    closeTime: string;
    isActive: boolean;
    createdBy?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface MarketRank {
    _id: string;
    marketName: string;
    marketId: string | Market;
    rank: number;
    userId: string;
    isGolden: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdminWithMarkets {
    _id: string;
    username: string;
    markets: Market[];
}

export interface UserMarketAssignment {
    _id: string;
    assignedBy: {
        _id: string;
        username: string;
    };
    assignedTo: {
        _id: string;
        username: string;
    };
    marketId: {
        _id: string;
        name: string;
        status: string;
    };
    assignedAt: string;
    isActive: boolean;
    hierarchyLevel: 'admin' | 'distributor' | 'agent' | 'player';
    parentAssignment?: string;
}

export interface Transfer {
    _id: string;
    fromUser: {
        _id: string;
        username: string;
    };
    toUser: {
        _id: string;
        username: string;
    };
    amount: number;
    description?: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
    updatedAt: string;
}

export interface Activity {
    _id: string;
    user: {
        _id: string;
        username: string;
    };
    action: string;
    details: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}

// Request/Response Interfaces
export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    role: 'superadmin' | 'admin' | 'distributor' | 'agent' | 'player';
    parentId?: string;
}

export interface UpdateProfileRequest {
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}

export interface UpdateUserRequest {
    username?: string;
    email?: string;
    balance?: number;
    isActive?: boolean;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface UsersResponse {
    users: User[];
    pagination: PaginationInfo;
}

// Note: The actual backend API returns users directly as an array
// This interface is kept for backward compatibility but may not be used
export interface MarketsResponse {
    data: Market[];
    pagination: PaginationInfo;
}

export interface TransfersResponse {
    data: Transfer[];
    pagination: PaginationInfo;
}

export interface ActivitiesResponse {
    data: Activity[];
    pagination: PaginationInfo;
}

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
    login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
        const response = await apiClient.post('/auth/', credentials);

        // Store tokens in localStorage
        if (response.data.success && typeof window !== 'undefined') {
            localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }

        return response.data;
    },

    refresh: async (): Promise<ApiResponse<{ accessToken: string }>> => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await apiClient.post('/auth/refresh', { refreshToken });

        // Store new access token
        if (response.data.success && typeof window !== 'undefined') {
            localStorage.setItem('accessToken', response.data.data.accessToken);
        }

        return response.data;
    },

    logout: async (): Promise<ApiResponse> => {
        const response = await apiClient.post('/auth/logout');

        // Clear tokens from localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }

        return response.data;
    },

    getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.put('/auth/profile', data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },
};

// ============================================================================
// USERS API
// ============================================================================

export const usersAPI = {
    getUsers: async (page = 1, limit = 10, search = '', role = '', parentId = ''): Promise<ApiResponse<User[]>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(role && { role }),
            ...(parentId && { parentId })
        });
        const response = await apiClient.get(`/users?${params}`);
        return response.data;
    },

    getUserById: async (userId: string): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.get(`/users/${userId}`);
        return response.data;
    },

    updateUser: async (userId: string, data: UpdateUserRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.put(`/users/${userId}`, data);
        return response.data;
    },

    createUser: async (data: RegisterRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.post('/users/create', data);
        return response.data;
    },

    deleteUser: async (userId: string): Promise<ApiResponse> => {
        const response = await apiClient.delete(`/users/${userId}`);
        return response.data;
    },

    toggleUserActive: async (userId: string): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.put(`/users/${userId}/active`);
        return response.data;
    },

    updateUserPassword: async (userId: string, password: string): Promise<ApiResponse> => {
        const response = await apiClient.put(`/users/${userId}/password`, { newPassword: password });
        return response.data;
    },

    // Market assignment APIs
    getAvailableMarkets: async (userId: string): Promise<ApiResponse<{ markets: Market[] }>> => {
        const response = await apiClient.get(`/users/${userId}/available-markets`);
        console.log(response.data)
        return response.data;
    },

    assignMarkets: async (userId: string, marketIds: string[]): Promise<ApiResponse> => {
        const response = await apiClient.post(`/users/${userId}/assign-markets`, { marketIds });
        return response.data;
    },

    getAssignedMarkets: async (userId: string): Promise<ApiResponse<{ assignments: UserMarketAssignment[] }>> => {
        const response = await apiClient.get(`/users/${userId}/assigned-markets`);
        return response.data;
    },

    removeMarketAssignments: async (userId: string, marketIds: string[]): Promise<ApiResponse> => {
        const response = await apiClient.post(`/users/${userId}/remove-markets`, { marketIds });
        return response.data;
    },
};

// ============================================================================
// MARKETS API
// ============================================================================

export const marketsAPI = {
    getMarkets: async (page = 1, limit = 10, status = ''): Promise<ApiResponse<Market[]>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(status && { status })
        });
        const response = await apiClient.get(`/markets?${params}`);
        return response.data;
    },

    getMarketById: async (marketId: string): Promise<ApiResponse<{ market: Market }>> => {
        const response = await apiClient.get(`/markets/${marketId}`);
        return response.data;
    },

    createMarket: async (data: { marketName: string; openTime: string; closeTime: string }): Promise<ApiResponse<{ market: Market }>> => {
        const response = await apiClient.post('/markets', data);
        return response.data;
    },

    updateMarket: async (marketId: string, data: Partial<Market>): Promise<ApiResponse<{ market: Market }>> => {
        const response = await apiClient.put(`/markets/${marketId}`, data);
        return response.data;
    },

    deleteMarket: async (marketId: string): Promise<ApiResponse> => {
        const response = await apiClient.delete(`/markets/${marketId}`);
        return response.data;
    },

    updateMarketStatus: async (marketId: string, isActive: boolean): Promise<ApiResponse<{ market: Market }>> => {
        const response = await apiClient.put(`/markets/${marketId}/status`, { isActive });
        return response.data;
    },

    // Market ranking methods
    getAdminsWithMarkets: async () => {
        const response = await apiClient.get('/markets/ranks/admins');
        return response.data;
    },

    getMarketRanks: async (userId: string, page = 1, limit = 10) => {
        const response = await apiClient.get(`/markets/ranks/${userId}`, {
            params: { page, limit }
        });
        return response.data;
    },

    updateMarketRank: async (userId: string, marketId: string, rank: number) => {
        const response = await apiClient.put(`/markets/ranks/${userId}/${marketId}`, {
            rank
        });
        return response.data;
    },

    updateMarketGoldenStatus: async (userId: string, marketId: string, isGolden: boolean) => {
        const response = await apiClient.put(`/markets/ranks/${userId}/${marketId}/golden`, {
            isGolden
        });
        return response.data;
    }
};

// ============================================================================
// TRANSFERS API
// ============================================================================



// ============================================================================
// ACTIVITIES API
// ============================================================================

export const activitiesAPI = {
    getActivities: async (page = 1, limit = 10, user = '', action = ''): Promise<ApiResponse<Activity[]>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(user && { user }),
            ...(action && { action })
        });
        const response = await apiClient.get(`/activities?${params}`);
        return response.data;
    },

    getActivityById: async (activityId: string): Promise<ApiResponse<{ activity: Activity }>> => {
        const response = await apiClient.get(`/activities/${activityId}`);
        return response.data;
    },

    getUserActivities: async (userId: string, page = 1, limit = 10): Promise<ApiResponse<Activity[]>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        const response = await apiClient.get(`/activities/user/${userId}?${params}`);
        return response.data;
    },
};

// ============================================================================
// HEALTH CHECK API
// ============================================================================

export const healthAPI = {
    check: async (): Promise<{ status: string; timestamp: string; uptime: number; environment: string; version: string }> => {
        const response = await apiClient.get('/health');
        return response.data;
    },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const apiUtils = {
    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('accessToken');
    },

    // Get current user token
    getAccessToken: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('accessToken');
    },

    // Clear all authentication data
    clearAuth: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },

    // Format API error messages
    formatError: (error: any): string => {
        if (error.response?.data?.message) {
            return error.response.data.message;
        }
        if (error.message) {
            return error.message;
        }
        return 'An unexpected error occurred';
    },

    // Handle API errors consistently
    handleError: (error: any, defaultMessage = 'An error occurred'): string => {
        console.error('API Error:', error);
        return apiUtils.formatError(error) || defaultMessage;
    }
}; 