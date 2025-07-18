"use client"
import axios, { type AxiosInstance, AxiosError } from "axios"
import { authAPI } from "./api/auth"

// Create the API client instance
const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Allow credentials
})

// Add an interceptor to set the appropriate headers
apiClient.interceptors.request.use((config) => {
    // Ensure the 'credentials' option is set to 'include'
    config.withCredentials = true

    // Add Authorization header if user is authenticated
    if (typeof window !== 'undefined') {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (isAuthenticated === 'true') {
            // Get token from localStorage
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    }

    return config
})

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let refreshFailed = false
let failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error)
        } else {
            resolve(token)
        }
    })
    failedQueue = []
}

// Function to clear authentication and redirect to login
const clearAuthAndRedirect = () => {
    if (typeof window !== 'undefined') {
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear cookies
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
            window.location.href = "/login";
        }
    }
};

// Add a response interceptor
apiClient.interceptors.response.use(
    (response) => response, // Return the response normally if there's no error
    async (error: AxiosError) => {
        const originalRequest = error.config as any

        // If refresh has already failed, don't try again
        if (refreshFailed) {
            clearAuthAndRedirect();
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(() => {
                    return apiClient(originalRequest)
                }).catch((err) => {
                    return Promise.reject(err)
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                // Instead of trying to refresh, just redirect to login since refresh tokens are HTTP-only
                refreshFailed = true;
                processQueue(new Error('Session expired'), null)
                clearAuthAndRedirect();
                throw new Error('Session expired. Please log in again.')
            } catch (refreshError) {
                refreshFailed = true;
                processQueue(refreshError, null)
                clearAuthAndRedirect();
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // Handle other errors
        if (error.response?.status === 403) {
            if (typeof window !== 'undefined') {
                console.warn("You don't have permission to perform this action.");
            }
        }

        return Promise.reject(error)
    },
)

// Function to reset refresh failed flag (call this after successful login)
export const resetRefreshFailed = () => {
    refreshFailed = false;
};

export default apiClient 