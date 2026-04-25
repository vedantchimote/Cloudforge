import { AxiosError } from 'axios';

export interface ApiErrorResponse {
    error: string;
    message: string;
    errors?: string[];
    path?: string;
    status?: number;
    timestamp?: string;
}

export class ApiError extends Error {
    public status: number;
    public errors?: string[];
    public path?: string;

    constructor(message: string, status: number, errors?: string[], path?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
        this.path = path;
    }
}

/**
 * Extract error message from API error response
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        return error.message;
    }

    if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiErrorResponse;
        
        if (apiError?.message) {
            return apiError.message;
        }

        // Fallback to status text
        if (error.response?.statusText) {
            return error.response.statusText;
        }

        // Network error
        if (error.message === 'Network Error') {
            return 'Unable to connect to server. Please check your internet connection.';
        }

        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
}

/**
 * Get all error messages including validation errors
 */
export function getAllErrorMessages(error: unknown): string[] {
    if (error instanceof ApiError && error.errors) {
        return error.errors;
    }

    if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiErrorResponse;
        
        if (apiError?.errors && apiError.errors.length > 0) {
            return apiError.errors;
        }

        if (apiError?.message) {
            return [apiError.message];
        }
    }

    return [getErrorMessage(error)];
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
    if (error instanceof ApiError) {
        return error.status === 401;
    }

    if (error instanceof AxiosError) {
        return error.response?.status === 401;
    }

    return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
    if (error instanceof ApiError) {
        return error.status === 400 && (error.errors?.length ?? 0) > 0;
    }

    if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiErrorResponse;
        return error.response?.status === 400 && (apiError?.errors?.length ?? 0) > 0;
    }

    return false;
}

/**
 * Format error for display to user
 */
export function formatErrorForDisplay(error: unknown): {
    title: string;
    message: string;
    details?: string[];
} {
    if (isAuthError(error)) {
        return {
            title: 'Authentication Required',
            message: 'Your session has expired. Please log in again.',
        };
    }

    if (isValidationError(error)) {
        return {
            title: 'Validation Error',
            message: 'Please check the following errors:',
            details: getAllErrorMessages(error),
        };
    }

    if (error instanceof AxiosError) {
        const status = error.response?.status;
        
        switch (status) {
            case 403:
                return {
                    title: 'Access Denied',
                    message: 'You do not have permission to perform this action.',
                };
            case 404:
                return {
                    title: 'Not Found',
                    message: 'The requested resource was not found.',
                };
            case 500:
                return {
                    title: 'Server Error',
                    message: 'An unexpected error occurred on the server. Please try again later.',
                };
            default:
                return {
                    title: 'Error',
                    message: getErrorMessage(error),
                };
        }
    }

    return {
        title: 'Error',
        message: getErrorMessage(error),
    };
}
