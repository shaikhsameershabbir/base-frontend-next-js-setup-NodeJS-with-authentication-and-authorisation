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
    login: string;
}

export interface UpdateProfileRequest {
    username?: string;
    balance?: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}
export interface LoginResponse {
    user: User;
    token: string;
    tokenExpires: number;
}