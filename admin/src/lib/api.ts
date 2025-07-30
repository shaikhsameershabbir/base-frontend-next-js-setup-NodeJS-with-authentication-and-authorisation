// This file is deprecated. Please use api-service.ts for all API functionality.
// This file is kept for backward compatibility only.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555/api/v1';

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            _id: string;
            username: string;
            email?: string;
            balance: number;
            role: string;
            parentId?: string;
            isActive: boolean;
            createdAt: string;
        };
        accessToken: string;
        refreshToken: string;
    };
}

export interface User {
    _id: string;
    username: string;
    email?: string;
    balance: number;
    role: string;
    parentId?: {
        _id: string;
        username: string;
        role: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UsersResponse {
    success: boolean;
    data: {
        data: User[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export interface UserResponse {
    success: boolean;
    data: {
        user: User;
    };
}

class ApiService {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token);
        }
    }

    getToken(): string | null {
        if (!this.token && typeof window !== 'undefined') {
            this.token = localStorage.getItem('accessToken');
        }
        return this.token;
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = this.getToken();

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            credentials: 'include',
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                console.log(data);

                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error');
        }
    }

    // Auth endpoints
    async login(username: string, password: string): Promise<LoginResponse> {
        const response = await this.request<LoginResponse>('/auth/', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        // Store tokens
        if (response.success && typeof window !== 'undefined') {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
        }

        return response;
    }

    async register(userData: {
        username: string;
        email?: string;
        password: string;
        role: string;
        parentId?: string;
    }): Promise<LoginResponse> {
        return this.request<LoginResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async getProfile(): Promise<UserResponse> {
        return this.request<UserResponse>('/auth/profile');
    }

    async updateProfile(profileData: {
        email?: string;
        currentPassword?: string;
        newPassword?: string;
    }): Promise<UserResponse> {
        return this.request<UserResponse>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    // User management endpoints
    async getUsers(page = 1, limit = 10, search = '', role = ''): Promise<UsersResponse> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(role && { role })
        });
        return this.request<UsersResponse>(`/users?${params}`);
    }

    async getUserById(userId: string): Promise<UserResponse> {
        return this.request<UserResponse>(`/users/${userId}`);
    }

    async updateUser(userId: string, userData: {
        username?: string;
        email?: string;
        balance?: number;
        isActive?: boolean;
    }): Promise<UserResponse> {
        return this.request<UserResponse>(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    // Role-specific registration endpoints
    async registerAdmin(userData: {
        username: string;
        email?: string;
        password: string;
        parentId?: string;
    }): Promise<LoginResponse> {
        return this.request<LoginResponse>('/users/create/admin', {
            method: 'POST',
            body: JSON.stringify({ ...userData, role: 'admin' }),
        });
    }

    async registerDistributor(userData: {
        username: string;
        email?: string;
        password: string;
        parentId?: string;
    }): Promise<LoginResponse> {
        return this.request<LoginResponse>('/users/create/distributor', {
            method: 'POST',
            body: JSON.stringify({ ...userData, role: 'distributor' }),
        });
    }

    async registerAgent(userData: {
        username: string;
        email?: string;
        password: string;
        parentId?: string;
    }): Promise<LoginResponse> {
        return this.request<LoginResponse>('/users/create/agent', {
            method: 'POST',
            body: JSON.stringify({ ...userData, role: 'agent' }),
        });
    }

    async registerPlayer(userData: {
        username: string;
        email?: string;
        password: string;
        parentId?: string;
    }): Promise<LoginResponse> {
        return this.request<LoginResponse>('/users/create/player', {
            method: 'POST',
            body: JSON.stringify({ ...userData, role: 'player' }),
        });
    }

    // Market endpoints
    async getMarkets(page = 1, limit = 10, status = ''): Promise<any> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(status && { status })
        });
        return this.request<any>(`/markets?${params}`);
    }

    async createMarket(data: { name: string; status: string }): Promise<any> {
        return this.request<any>('/markets', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateMarket(marketId: string, data: any): Promise<any> {
        return this.request<any>(`/markets/${marketId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteMarket(marketId: string): Promise<any> {
        return this.request<any>(`/markets/${marketId}`, {
            method: 'DELETE',
        });
    }

    // Transfer endpoints
    async getChildren(): Promise<any> {
        return this.request<any>('/transfers/children');
    }

    async processTransfer(data: { toUserId: string; amount: number; description?: string }): Promise<any> {
        return this.request<any>('/transfers/process', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getTransferHistory(page = 1, limit = 10, type = 'all'): Promise<any> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            type
        });
        return this.request<any>(`/transfers/history?${params}`);
    }

    // Activity endpoints
    async getActivities(page = 1, limit = 10, user = '', action = ''): Promise<any> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(user && { user }),
            ...(action && { action })
        });
        return this.request<any>(`/activities?${params}`);
    }

    // Health check
    async healthCheck(): Promise<any> {
        return this.request<any>('/health');
    }
}

export const apiService = new ApiService(); 