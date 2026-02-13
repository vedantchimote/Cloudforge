import api from './api';
import type { PageResponse, Product } from '@/types';

// Transform product to add imageUrl from images array
const transformProduct = (product: any): Product => ({
    ...product,
    imageUrl: product.images?.[0] || '/placeholder-product.png',
});

export const productService = {
    getProducts: async (page = 0, size = 20): Promise<PageResponse<Product>> => {
        const response = await api.get<PageResponse<Product>>('/products', {
            params: { page, size },
        });
        return {
            ...response.data,
            content: response.data.content.map(transformProduct),
        };
    },

    getAllProducts: async (): Promise<Product[]> => {
        const response = await api.get<PageResponse<Product>>('/products', {
            params: { page: 0, size: 100 },
        });
        return response.data.content.map(transformProduct);
    },

    getProductById: async (id: string): Promise<Product> => {
        const response = await api.get<Product>(`/products/${id}`);
        return transformProduct(response.data);
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
        return {
            ...response.data,
            content: response.data.content.map(transformProduct),
        };
    },

    searchProducts: async (
        query: string,
        page = 0,
        size = 20
    ): Promise<PageResponse<Product>> => {
        const response = await api.get<PageResponse<Product>>('/products/search', {
            params: { q: query, page, size },
        });
        return {
            ...response.data,
            content: response.data.content.map(transformProduct),
        };
    },

    getLatestProducts: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>('/products/latest');
        return response.data.map(transformProduct);
    },
};

