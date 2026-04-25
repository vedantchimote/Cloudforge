import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, CreditCard } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { orderService } from '@/services/orderService';
import { paymentService, loadRazorpayScript } from '@/services/paymentService';
import { userService } from '@/services/userService';
import ErrorToast from '@/components/ErrorToast';
import { formatErrorForDisplay, isAuthError } from '@/utils/errorHandler';
import type { RazorpayOptions } from '@/services/paymentService';

const addressSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    addressLine1: z.string().min(5, 'Address is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().min(6, 'Valid PIN code is required'),
    country: z.string().min(1),
});

type AddressFormData = z.infer<typeof addressSchema>;

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => { open: () => void };
    }
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items, getTotal, clearCart } = useCartStore();
    const { user, isAuthenticated } = useAuthStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(true);
    const [step, setStep] = useState<'address' | 'payment'>('address');
    const [savedAddress, setSavedAddress] = useState<AddressFormData | null>(null);
    const [error, setError] = useState<{ title: string; message: string; details?: string[] } | null>(null);

    const total = getTotal();
    const deliveryFee = total >= 499 ? 0 : 40;
    const grandTotal = total + deliveryFee;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            country: 'India',
        },
    });

    // Fetch user's saved address on mount
    useEffect(() => {
        const fetchUserAddress = async () => {
            if (!isAuthenticated) return;
            
            try {
                const userData = await userService.getCurrentUser();
                
                // If user has a saved address, pre-fill the form
                if (userData.addressLine1) {
                    const address: AddressFormData = {
                        fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username,
                        phone: userData.phone || '',
                        addressLine1: userData.addressLine1,
                        addressLine2: userData.addressLine2 || '',
                        city: userData.city || '',
                        state: userData.state || '',
                        postalCode: userData.postalCode || '',
                        country: userData.country || 'India',
                    };
                    
                    reset(address);
                    setSavedAddress(address);
                }
            } catch (err) {
                console.error('Failed to fetch user address:', err);
                // Don't show error toast for address fetch failure - it's not critical
            } finally {
                setIsLoadingAddress(false);
            }
        };

        fetchUserAddress();
    }, [isAuthenticated, reset]);

    const onAddressSubmit = async (data: AddressFormData) => {
        setSavedAddress(data);
        
        // Save address to user profile
        try {
            await userService.updateAddress({
                phone: data.phone,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2,
                city: data.city,
                state: data.state,
                postalCode: data.postalCode,
                country: data.country,
            });
        } catch (err) {
            console.error('Failed to save address:', err);
            // Continue anyway - address is saved locally for this order
            // Don't show error toast as it's not critical
        }
        
        setStep('payment');
    };

    const handlePayment = async () => {
        if (!savedAddress || !user) return;

        setIsProcessing(true);
        setError(null);

        try {
            // 1. Create order in backend
            const order = await orderService.createOrder({
                userId: user.id,
                items: items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                })),
                shippingAddress: savedAddress,
            });

            // 2. Create Razorpay order
            const razorpayOrder = await paymentService.createRazorpayOrder(
                order.id,
                grandTotal * 100 // Amount in paise
            );

            // 3. Load Razorpay script
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                setError({
                    title: 'Payment Gateway Error',
                    message: 'Failed to load payment gateway. Please try again.',
                });
                setIsProcessing(false);
                return;
            }

            // 4. Open Razorpay checkout
            const options: RazorpayOptions = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_xxxxx',
                amount: grandTotal * 100,
                currency: 'INR',
                name: 'CloudForge',
                description: `Order #${order.id}`,
                order_id: razorpayOrder.razorpayOrderId,
                handler: async (response) => {
                    try {
                        // 5. Verify payment
                        await paymentService.verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            orderId: order.id,
                        });

                        // 6. Clear cart and redirect
                        clearCart();
                        navigate(`/order/${order.id}`);
                    } catch (err) {
                        const errorInfo = formatErrorForDisplay(err);
                        setError({
                            title: 'Payment Verification Failed',
                            message: 'Your payment could not be verified. Please contact support.',
                            details: errorInfo.details,
                        });
                    }
                },
                prefill: {
                    name: savedAddress.fullName,
                    email: user.email || '',
                    contact: savedAddress.phone,
                },
                theme: {
                    color: '#131921',
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err) {
            console.error('Payment error:', err);
            
            // Handle authentication errors
            if (isAuthError(err)) {
                setError({
                    title: 'Authentication Required',
                    message: 'Your session has expired. Please log in again.',
                });
                setTimeout(() => {
                    navigate('/login?redirect=/checkout');
                }, 2000);
                return;
            }

            // Format and display error
            const errorInfo = formatErrorForDisplay(err);
            setError(errorInfo);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isAuthenticated) {
        navigate('/login?redirect=/checkout');
        return null;
    }

    if (items.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="bg-gray-100 min-h-screen py-6">
            {/* Error Toast */}
            {error && (
                <ErrorToast
                    type="error"
                    title={error.title}
                    message={error.message}
                    details={error.details}
                    onClose={() => setError(null)}
                />
            )}

            <div className="max-w-5xl mx-auto px-4">
                {/* Checkout Header */}
                <div className="flex items-center gap-2 mb-6">
                    <Lock size={20} className="text-gray-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Address Step */}
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">1. Delivery Address</h2>
                                {step === 'payment' && savedAddress && (
                                    <button
                                        onClick={() => setStep('address')}
                                        className="text-sm text-[#007185] hover:underline"
                                    >
                                        Change
                                    </button>
                                )}
                            </div>

                            {isLoadingAddress ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-8 h-8 border-4 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : step === 'address' ? (
                                <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name
                                            </label>
                                            <input
                                                {...register('fullName')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                                            />
                                            {errors.fullName && (
                                                <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                {...register('phone')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                                            />
                                            {errors.phone && (
                                                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address Line 1
                                        </label>
                                        <input
                                            {...register('addressLine1')}
                                            placeholder="House/Flat No., Building, Street"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                                        />
                                        {errors.addressLine1 && (
                                            <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address Line 2 (Optional)
                                        </label>
                                        <input
                                            {...register('addressLine2')}
                                            placeholder="Area, Landmark"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input
                                                {...register('city')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                                            />
                                            {errors.city && (
                                                <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                            <input
                                                {...register('state')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                                            />
                                            {errors.state && (
                                                <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                PIN Code
                                            </label>
                                            <input
                                                {...register('postalCode')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                                            />
                                            {errors.postalCode && (
                                                <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium py-3 px-4 rounded-md"
                                    >
                                        Use this address
                                    </button>
                                </form>
                            ) : (
                                <div className="text-sm text-gray-700">
                                    <p className="font-medium">{savedAddress?.fullName}</p>
                                    <p>{savedAddress?.addressLine1}</p>
                                    {savedAddress?.addressLine2 && <p>{savedAddress.addressLine2}</p>}
                                    <p>
                                        {savedAddress?.city}, {savedAddress?.state} - {savedAddress?.postalCode}
                                    </p>
                                    <p>Phone: {savedAddress?.phone}</p>
                                </div>
                            )}
                        </div>

                        {/* Payment Step */}
                        {step === 'payment' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">2. Payment Method</h2>

                                <div className="border border-[#FF9900] rounded-lg p-4 bg-orange-50 mb-4">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="text-[#FF9900]" />
                                        <div>
                                            <p className="font-medium text-gray-900">Pay with Razorpay</p>
                                            <p className="text-sm text-gray-600">
                                                Credit Card, Debit Card, UPI, Net Banking, Wallets
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="w-full bg-[#FFD814] hover:bg-[#F7CA00] disabled:bg-gray-300 text-gray-900 font-medium py-3 px-4 rounded-md flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Pay ₹${grandTotal.toLocaleString('en-IN')}`
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:w-80">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Items ({items.length}):</span>
                                    <span>₹{total.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delivery:</span>
                                    <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t mt-4 pt-4">
                                <div className="flex justify-between text-lg font-bold text-red-700">
                                    <span>Order Total:</span>
                                    <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {deliveryFee === 0 && (
                                <p className="text-xs text-green-600 mt-2">
                                    ✓ Your order qualifies for FREE Delivery
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
