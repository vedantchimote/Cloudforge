export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: 'USER' | 'ADMIN';
    enabled: boolean;
    createdAt: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface LoginResponse {
    token: string;
    type: string;
    user: User;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    stock: number;
    sku: string;
    imageUrl: string;
    images: string[];
    tags: string[];
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}
