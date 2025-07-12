"use client"
import axios, { type AxiosInstance, AxiosError } from "axios"
import { authAPI } from "./api-service"

// Create the API client instance
const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Allow credentials
})

// Add an interceptor to set the appropriate headers
apiClient.interceptors.request.use((config) => {
    // Ensure the 'credentials' option is set to 'include'
    config.withCredentials = true
    return config
})

// Flag to prevent multiple refresh attempts
let isRefreshing = false
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

// Add a response interceptor
apiClient.interceptors.response.use(
    (response) => response, // Return the response normally if there's no error
    async (error: AxiosError) => {
        const originalRequest = error.config as any

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
                // Attempt to refresh the token
                const refreshResponse = await authAPI.refresh()

                if (refreshResponse.success) {
                    processQueue(null, 'refreshed')
                    return apiClient(originalRequest)
                } else {
                    processQueue(new Error('Token refresh failed'), null)
                    // Clear all local/session storage and redirect to login
                    if (typeof window !== 'undefined') {
                        localStorage.clear();
                        sessionStorage.clear();
                        alert('Your session has expired. Please log in again.')
                        window.location.href = "/login"
                    }
                    throw new Error('Token refresh failed')
                }
            } catch (refreshError) {
                processQueue(refreshError, null)
                // Clear all local/session storage and redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.clear();
                    sessionStorage.clear();
                    alert('Your session has expired. Please log in again.')
                    window.location.href = "/login"
                }
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // Handle other errors
        if (error.response?.status === 403) {
            if (typeof window !== 'undefined') {
                alert("You don't have permission to perform this action.")
            }
        }

        return Promise.reject(error)
    },
)

export default apiClient 