import apiClient from './api-client';

export interface User {
    _id: string;
    username: string;
    balance: number;
    role: 'superadmin' | 'admin' | 'distributor' | 'player';
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
    role?: 'superadmin' | 'admin' | 'distributor' | 'player';
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

// Auth API
export const authAPI = {
    login: async (credentials: LoginRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.post('/api/auth/login', credentials);
        return response.data;
    },

    register: async (userData: RegisterRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.post('/api/auth/register', userData);
        return response.data;
    },

    logout: async (): Promise<ApiResponse> => {
        const response = await apiClient.post('/api/auth/logout');
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

    getUsersByRole: async (role: string): Promise<ApiResponse<{ users: User[] }>> => {
        const response = await apiClient.get(`/api/users/role/${role}`);
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
};

// Health check
export const healthAPI = {
    check: async (): Promise<{ status: string; timestamp: string; uptime: number }> => {
        const response = await apiClient.get('/health');
        return response.data;
    },
}; 