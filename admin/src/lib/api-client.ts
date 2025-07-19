"use client"
import axios, { type AxiosInstance, AxiosError } from "axios"

// Create the API client instance
const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Allow credentials
})

// Add an interceptor to set the appropriate headers
apiClient.interceptors.request.use((config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
    }

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
                // Get refresh token from localStorage
                const refreshToken = localStorage.getItem('refreshToken')
                if (!refreshToken) {
                    throw new Error('No refresh token available')
                }

                // Attempt to refresh the token
                const refreshResponse = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/auth/refresh`,
                    { refreshToken },
                    { withCredentials: true }
                )

                if (refreshResponse.data.success) {
                    // Store new access token
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('accessToken', refreshResponse.data.data.accessToken)
                    }

                    // Update the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.data.accessToken}`

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

        if (error.response?.status === 429) {
            if (typeof window !== 'undefined') {
                alert("Too many requests. Please wait a moment before trying again.")
            }
        }

        return Promise.reject(error)
    },
)

export default apiClient 