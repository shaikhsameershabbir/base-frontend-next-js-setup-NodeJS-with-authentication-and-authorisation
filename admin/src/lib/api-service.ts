import apiClient from './api-client';

export interface User {
    _id: string;
    username: string;
    balance: number;
    role: 'superadmin' | 'admin' | 'distributor'|'agent' | 'player';
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

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

export interface LoginResponse {
    user: User;
    tokenExpires: number;
}

// Auth API
export const authAPI = {
    login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
        const response = await apiClient.post('/api/auth/login', credentials);
        return response.data;
    },

    refresh: async (): Promise<ApiResponse<{ tokenExpires: number }>> => {
        const response = await apiClient.post('/api/auth/refresh');
        return response.data;
    },

    logout: async (): Promise<ApiResponse> => {
        const response = await apiClient.post('/api/auth/logout');
        return response.data;
    },

    logoutAll: async (): Promise<ApiResponse> => {
        const response = await apiClient.post('/api/auth/logout-all');
        return response.data;
    },

    getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.get('/api/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.put('/api/profile', data);
        return response.data;
    },
};

// Users API
export const usersAPI = {
    getUsers: async (): Promise<ApiResponse<{ users: User[] }>> => {
        const response = await apiClient.get('/api/users');
        return response.data;
    },

    getUsersByRole: async (role: string, userId: string): Promise<ApiResponse<{ users: User[] }>> => {
        const response = await apiClient.get(`/api/users/${role}/${userId}`);
        return response.data;
    },

    getUserById: async (userId: string): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.get(`/api/users/${userId}`);
        return response.data;
    },

    updateUser: async (userId: string, data: UpdateUserRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.put(`/api/users/${userId}`, data);
        return response.data;
    },

    registerAdmin: async (data: RegisterRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.post('/api/register/admin', data);
        return response.data;
    },
    registerDistributor: async (data: RegisterRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.post('/api/register/distributor', data);
        return response.data;
    },
    registerAgent: async (data: RegisterRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.post('/api/register/agent', data);
        return response.data;
    },
    registerPlayer: async (data: RegisterRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.post('/api/register/player', data);
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