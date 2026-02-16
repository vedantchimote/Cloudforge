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
        // Transform nested shippingAddress to flat structure expected by backend
        const flatRequest = {
            items: data.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            })),
            shippingAddress: `${data.shippingAddress.addressLine1}${
                data.shippingAddress.addressLine2 
                    ? ', ' + data.shippingAddress.addressLine2 
                    : ''
            }`,
            shippingCity: data.shippingAddress.city,
            shippingState: data.shippingAddress.state,
            shippingZip: data.shippingAddress.postalCode,
            shippingCountry: data.shippingAddress.country,
            notes: `${data.shippingAddress.fullName} | ${data.shippingAddress.phone}`
        };
        
        const response = await api.post('/orders', flatRequest);
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
