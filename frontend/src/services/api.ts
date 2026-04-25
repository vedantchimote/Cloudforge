import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { ApiError, type ApiErrorResponse } from '@/utils/errorHandler';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
        // Handle authentication errors
        if (error.response?.status === 401) {
            // Clear auth state on 401
            useAuthStore.getState().logout();
            
            // Create structured error
            const apiError = error.response.data;
            return Promise.reject(
                new ApiError(
                    apiError?.message || 'Authentication required',
                    401,
                    apiError?.errors,
                    apiError?.path
                )
            );
        }

        // Handle validation errors (400)
        if (error.response?.status === 400) {
            const apiError = error.response.data;
            return Promise.reject(
                new ApiError(
                    apiError?.message || 'Validation failed',
                    400,
                    apiError?.errors,
                    apiError?.path
                )
            );
        }

        // Handle forbidden errors (403)
        if (error.response?.status === 403) {
            const apiError = error.response.data;
            return Promise.reject(
                new ApiError(
                    apiError?.message || 'Access denied',
                    403,
                    apiError?.errors,
                    apiError?.path
                )
            );
        }

        // Handle not found errors (404)
        if (error.response?.status === 404) {
            const apiError = error.response.data;
            return Promise.reject(
                new ApiError(
                    apiError?.message || 'Resource not found',
                    404,
                    apiError?.errors,
                    apiError?.path
                )
            );
        }

        // Handle server errors (500)
        if (error.response?.status === 500) {
            const apiError = error.response.data;
            return Promise.reject(
                new ApiError(
                    apiError?.message || 'An unexpected server error occurred',
                    500,
                    apiError?.errors,
                    apiError?.path
                )
            );
        }

        // Handle network errors
        if (error.message === 'Network Error') {
            return Promise.reject(
                new ApiError(
                    'Unable to connect to server. Please check your internet connection.',
                    0
                )
            );
        }

        // Default error handling
        return Promise.reject(error);
    }
);

export default api;
