import api from './api';

export interface CreateOrderRequest {
    userId: string;
    items: {
        productId: string;
        quantity: number;
        price: number;
    }[];
    shippingAddress: {
        fullName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
}

export interface Order {
    id: string;
    userId: string;
    status: string;
    totalAmount: number;
    items: {
        productId: string;
        quantity: number;
        price: number;
    }[];
    shippingAddress: {
        fullName: string;
        phone: string;
        addressLine1: string;
        city: string;
        state: string;
        postalCode: string;
    };
    createdAt: string;
}

export const orderService = {
    createOrder: async (data: CreateOrderRequest): Promise<Order> => {
        const response = await api.post('/orders', data);
        return response.data;
    },

    getOrders: async (userId: string): Promise<Order[]> => {
        const response = await api.get(`/orders/user/${userId}`);
        return response.data;
    },

    getOrderById: async (orderId: string): Promise<Order> => {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    },

    cancelOrder: async (orderId: string): Promise<Order> => {
        const response = await api.post(`/orders/${orderId}/cancel`);
        return response.data;
    },
};
