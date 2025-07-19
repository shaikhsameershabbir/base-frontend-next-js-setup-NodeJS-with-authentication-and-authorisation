"use client"
import { useState, useCallback } from 'react';
import { usersAPI, User, RegisterRequest, UpdateUserRequest, UserMarketAssignment, Market } from '@/lib/api-service';

interface UseUsersReturn {
    users: User[];
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    getUsers: (page?: number, limit?: number, search?: string, role?: string) => Promise<void>;
    getUserById: (userId: string) => Promise<User | null>;
    createUser: (data: RegisterRequest) => Promise<boolean>;
    updateUser: (userId: string, data: UpdateUserRequest) => Promise<boolean>;
    deleteUser: (userId: string) => Promise<boolean>;
    toggleUserActive: (userId: string) => Promise<boolean>;
    updateUserPassword: (userId: string, password: string) => Promise<boolean>;
    getAvailableMarkets: (userId: string) => Promise<Market[]>;
    assignMarkets: (userId: string, marketIds: string[]) => Promise<boolean>;
    getAssignedMarkets: (userId: string) => Promise<UserMarketAssignment[]>;
    removeMarketAssignments: (userId: string, marketIds: string[]) => Promise<boolean>;
    clearError: () => void;
}

export function useUsers(): UseUsersReturn {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const getUsers = useCallback(async (page = 1, limit = 10, search = '', role = '') => {
        try {
            setLoading(true);
            setError(null);
            const response = await usersAPI.getUsers(page, limit, search, role);

            if (response.success && response.data) {
                setUsers(response.data.data);
                setPagination(response.data.pagination);
            } else {
                setError(response.message || 'Failed to fetch users');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, []);

    const getUserById = useCallback(async (userId: string): Promise<User | null> => {
        try {
            setError(null);
            const response = await usersAPI.getUserById(userId);

            if (response.success && response.data?.user) {
                return response.data.user;
            } else {
                setError(response.message || 'Failed to fetch user');
                return null;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch user');
            return null;
        }
    }, []);

    const createUser = useCallback(async (data: RegisterRequest): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await usersAPI.createUser(data);

            if (response.success) {
                // Refresh users list
                await getUsers(pagination.page, pagination.limit);
                return true;
            } else {
                setError(response.message || 'Failed to create user');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create user');
            return false;
        } finally {
            setLoading(false);
        }
    }, [getUsers, pagination.page, pagination.limit]);

    const updateUser = useCallback(async (userId: string, data: UpdateUserRequest): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await usersAPI.updateUser(userId, data);

            if (response.success) {
                // Update user in the list
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user._id === userId
                            ? { ...user, ...response.data?.user }
                            : user
                    )
                );
                return true;
            } else {
                setError(response.message || 'Failed to update user');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update user');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await usersAPI.deleteUser(userId);

            if (response.success) {
                // Remove user from the list
                setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
                return true;
            } else {
                setError(response.message || 'Failed to delete user');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to delete user');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleUserActive = useCallback(async (userId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await usersAPI.toggleUserActive(userId);

            if (response.success && response.data?.user) {
                // Update user in the list
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user._id === userId
                            ? { ...user, isActive: response.data.user.isActive }
                            : user
                    )
                );
                return true;
            } else {
                setError(response.message || 'Failed to toggle user status');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to toggle user status');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUserPassword = useCallback(async (userId: string, password: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await usersAPI.updateUserPassword(userId, password);

            if (response.success) {
                return true;
            } else {
                setError(response.message || 'Failed to update password');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const getAvailableMarkets = useCallback(async (userId: string): Promise<Market[]> => {
        try {
            setError(null);
            const response = await usersAPI.getAvailableMarkets(userId);

            if (response.success && response.data?.markets) {
                return response.data.markets;
            } else {
                setError(response.message || 'Failed to fetch available markets');
                return [];
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch available markets');
            return [];
        }
    }, []);

    const assignMarkets = useCallback(async (userId: string, marketIds: string[]): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await usersAPI.assignMarkets(userId, marketIds);

            if (response.success) {
                return true;
            } else {
                setError(response.message || 'Failed to assign markets');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to assign markets');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const getAssignedMarkets = useCallback(async (userId: string): Promise<UserMarketAssignment[]> => {
        try {
            setError(null);
            const response = await usersAPI.getAssignedMarkets(userId);

            if (response.success && response.data?.assignments) {
                return response.data.assignments;
            } else {
                setError(response.message || 'Failed to fetch assigned markets');
                return [];
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch assigned markets');
            return [];
        }
    }, []);

    const removeMarketAssignments = useCallback(async (userId: string, marketIds: string[]): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await usersAPI.removeMarketAssignments(userId, marketIds);

            if (response.success) {
                return true;
            } else {
                setError(response.message || 'Failed to remove market assignments');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to remove market assignments');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        users,
        loading,
        error,
        pagination,
        getUsers,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
        toggleUserActive,
        updateUserPassword,
        getAvailableMarkets,
        assignMarkets,
        getAssignedMarkets,
        removeMarketAssignments,
        clearError,
    };
} 