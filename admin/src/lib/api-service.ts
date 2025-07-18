import apiClient from './api-client';

export interface User {
    _id: string;
    username: string;
    balance: number;
    role: 'superadmin' | 'admin' | 'distributor' | 'agent' | 'player';
    parentId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    balance?: number;
    role?: 'superadmin' | 'admin' | 'distributor' | 'agent' | 'player';
    parentId?: string;
}

export interface UpdateProfileRequest {
    username?: string;
    balance?: number;
}

export interface UpdateUserRequest {
    username?: string;
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
}

export interface LoginResponse {
    user: User;
    tokenExpires: number;
}

export interface UsersResponse {
    users: User[];
    pagination: PaginationInfo;
}

// Auth API
export const authAPI = {
    login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    refresh: async (): Promise<ApiResponse<{ tokenExpires: number }>> => {
        const response = await apiClient.post('/auth/refresh');
        return response.data;
    },

    logout: async (): Promise<ApiResponse> => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },

    logoutAll: async (): Promise<ApiResponse> => {
        const response = await apiClient.post('/auth/logout-all');
        return response.data;
    },

    getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.get('/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.put('/profile', data);
        return response.data;
    },
};

// Users API
export const usersAPI = {
    getUsers: async (page = 1, limit = 10, search = ''): Promise<ApiResponse<UsersResponse>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search })
        });
        const response = await apiClient.get(`/users?${params}`);
        return response.data;
    },

    getUsersByRole: async (role: string, userId: string, page = 1, limit = 10, search = ''): Promise<ApiResponse<UsersResponse>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search })
        });
        const response = await apiClient.get(`/users/${role}/${userId}?${params}`);
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
    createAdmin: async (data: RegisterRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.post('/users/create/admin', data);
        return response.data;
    },
    createDistributor: async (data: RegisterRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.post('/users/create/distributor', data);
        return response.data;
    },
    createAgent: async (data: RegisterRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.post('/users/create/agent', data);
        return response.data;
    },
    createPlayer: async (data: RegisterRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.post('/users/create/player', data);
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
        const response = await apiClient.put(`/users/${userId}/password`, { password });
        return response.data;
    },
    // Market assignment APIs
    getAvailableMarkets: async (userId: string): Promise<ApiResponse<{ markets: any[] }>> => {
        const response = await apiClient.get(`/users/${userId}/available-markets`);
        return response.data;
    },
    assignMarkets: async (userId: string, marketIds: string[]): Promise<ApiResponse> => {
        const response = await apiClient.post(`/users/${userId}/assign-markets`, { marketIds });
        return response.data;
    },
    getAssignedMarkets: async (userId: string): Promise<ApiResponse<{ assignments: any[] }>> => {
        const response = await apiClient.get(`/users/${userId}/assigned-markets`);
        return response.data;
    },
    removeMarketAssignments: async (userId: string, marketIds: string[]): Promise<ApiResponse> => {
        const response = await apiClient.post(`/users/${userId}/remove-markets`, { marketIds });
        return response.data;
    },
};

// Health check
export const healthAPI = {
    check: async (): Promise<{ status: string; timestamp: string; uptime: number }> => {
        const response = await apiClient.get('/health');
        return response.data;
    },
}; 