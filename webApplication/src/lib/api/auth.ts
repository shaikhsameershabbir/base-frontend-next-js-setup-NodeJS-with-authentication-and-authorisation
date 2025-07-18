import apiClient from '../api-client';
import { ApiResponse, LoginRequest, LoginResponse, UpdateProfileRequest, User } from '../type';



// Auth API
export const authAPI = {
    login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    // Note: Refresh is handled by HTTP-only cookies, not by API calls
    // refresh: async (): Promise<ApiResponse<{ tokenExpires: number }>> => {
    //     const response = await apiClient.post('/auth/refresh');
    //     return response.data;
    // },

    logout: async (): Promise<ApiResponse> => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },

    // Player-specific profile endpoints
    getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.get('/player/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.put('/player/profile', data);
        return response.data;
    },
};

// Users API
export const usersAPI = {
    getUserById: async (userId: string): Promise<ApiResponse<{ user: User }>> => {
        const response = await apiClient.get(`/users/${userId}`);
        return response.data;
    },
    getAssignedMarkets: async (userId: string): Promise<ApiResponse<{ assignments: any[] }>> => {
        const response = await apiClient.get(`/users/${userId}/assigned-markets`);
        return response.data;
    },
};

// Markets API
export const marketsAPI = {
    getAssignedMarkets: async (): Promise<ApiResponse<{ assignments: any[] }>> => {
        const response = await apiClient.get('/player/assigned-markets');
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