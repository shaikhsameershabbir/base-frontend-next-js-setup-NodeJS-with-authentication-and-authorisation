"use client"
import axios, { type AxiosInstance } from "axios"

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

// Add a response interceptor
apiClient.interceptors.response.use(
    (response) => response, // Return the response normally if there's no error
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle 401 Unauthorized error
            alert("Your session has expired. Please log in again.") // You can replace this with a more user-friendly notification

            // Redirect to login page
            window.location.href = "/" // Replace '/login' with your actual login page route
        }
        return Promise.reject(error) // Reject the promise for other errors
    },
)

export default apiClient 