import api from './api';
import type { PageResponse, Product } from '@/types';

export const productService = {
    getProducts: async (page = 0, size = 20): Promise<PageResponse<Product>> => {
        const response = await api.get<PageResponse<Product>>('/products', {
            params: { page, size },
        });
        return response.data;
    },

    getProductById: async (id: string): Promise<Product> => {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    getProductsByCategory: async (
        category: string,
        page = 0,
        size = 20
    ): Promise<PageResponse<Product>> => {
        const response = await api.get<PageResponse<Product>>(
            `/products/category/${category}`,
            { params: { page, size } }
        );
        return response.data;
    },

    searchProducts: async (
        query: string,
        page = 0,
        size = 20
    ): Promise<PageResponse<Product>> => {
        const response = await api.get<PageResponse<Product>>('/products/search', {
            params: { q: query, page, size },
        });
        return response.data;
    },

    getLatestProducts: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>('/products/latest');
        return response.data;
    },
};
