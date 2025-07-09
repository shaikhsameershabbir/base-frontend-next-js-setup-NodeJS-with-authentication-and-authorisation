const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            _id: string;
            username: string;
            balance: number;
            role: string;
            parentId?: string;
            isActive: boolean;
            createdAt: string;
        };
        token: string;
    };
}

export interface User {
    _id: string;
    username: string;
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
        users: User[];
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
            localStorage.setItem('authToken', token);
        }
    }

    getToken(): string | null {
        if (!this.token && typeof window !== 'undefined') {
            this.token = localStorage.getItem('authToken');
        }
        return this.token;
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
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
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
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
        return this.request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    }

    async register(userData: {
        username: string;
        password: string;
        balance?: number;
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
        username?: string;
        balance?: number;
    }): Promise<UserResponse> {
        return this.request<UserResponse>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    // User management endpoints
    async getUsers(): Promise<UsersResponse> {
        return this.request<UsersResponse>('/auth/users');
    }

    async getUserById(userId: string): Promise<UserResponse> {
        return this.request<UserResponse>(`/auth/users/${userId}`);
    }

    async updateUser(userId: string, userData: {
        username?: string;
        balance?: number;
        isActive?: boolean;
    }): Promise<UserResponse> {
        return this.request<UserResponse>(`/auth/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    // Role-specific registration endpoints
    async registerAdmin(userData: {
        username: string;
        password: string;
        balance?: number;
        parentId: string;
    }): Promise<LoginResponse> {
        return this.request<LoginResponse>('/auth/register/admin', {
            method: 'POST',
            body: JSON.stringify({ ...userData, role: 'admin' }),
        });
    }

    async registerDistributor(userData: {
        username: string;
        password: string;
        balance?: number;
        parentId: string;
    }): Promise<LoginResponse> {
        return this.request<LoginResponse>('/auth/register/distributor', {
            method: 'POST',
            body: JSON.stringify({ ...userData, role: 'distributor' }),
        });
    }

    async registerPlayer(userData: {
        username: string;
        password: string;
        balance?: number;
        parentId: string;
    }): Promise<LoginResponse> {
        return this.request<LoginResponse>('/auth/register/player', {
            method: 'POST',
            body: JSON.stringify({ ...userData, role: 'player' }),
        });
    }
}

export const apiService = new ApiService(); 