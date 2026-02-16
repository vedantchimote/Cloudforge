import api from './api';

export interface RazorpayOrder {
    razorpayOrderId: string;
    amount: number;
    currency: string;
}

export interface PaymentVerification {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
}

export interface PaymentResult {
    success: boolean;
    paymentId: string;
    orderId: string;
    status: string;
}

export const paymentService = {
    createRazorpayOrder: async (orderId: string, amount: number): Promise<RazorpayOrder> => {
        const response = await api.post('/payments/create', {
            orderId,
            amount,
            currency: 'INR',
        });
        return response.data;
    },

    verifyPayment: async (verification: PaymentVerification): Promise<PaymentResult> => {
        const response = await api.post('/payments/verify', verification);
        return response.data;
    },

    getPaymentStatus: async (paymentId: string): Promise<PaymentResult> => {
        const response = await api.get(`/payments/${paymentId}`);
        return response.data;
    },
};

// Razorpay checkout options type
export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }) => void;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    theme: {
        color: string;
    };
}

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (document.getElementById('razorpay-script')) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};
