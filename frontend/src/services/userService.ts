import api from './api';
import type { User, UpdateAddressRequest } from '@/types';

export const userService = {
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<User>('/users/me');
        return response.data;
    },

    updateAddress: async (address: UpdateAddressRequest): Promise<User> => {
        const response = await api.put<User>('/users/me/address', address);
        return response.data;
    },
};
