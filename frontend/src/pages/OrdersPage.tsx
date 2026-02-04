import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { orderService } from '@/services/orderService';
import type { Order } from '@/services/orderService';

export default function OrdersPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            loadOrders();
        }
    }, [user?.id]);

    const loadOrders = async () => {
        try {
            const data = await orderService.getOrders(user!.id);
            setOrders(data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'text-green-600 bg-green-100';
            case 'shipped':
                return 'text-blue-600 bg-blue-100';
            case 'processing':
                return 'text-yellow-600 bg-yellow-100';
            case 'cancelled':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-100 py-16">
                <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view your orders</h1>
                    <Link
                        to="/login?redirect=/orders"
                        className="inline-block bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium py-3 px-6 rounded-full"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 border-4 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-100 py-16">
                <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md">
                    <Package size={64} className="mx-auto text-gray-400 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h1>
                    <p className="text-gray-600 mb-6">
                        You haven't placed any orders. Start shopping to see them here!
                    </p>
                    <Link
                        to="/products"
                        className="inline-block bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium py-3 px-6 rounded-full"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen py-6">
            <div className="max-w-5xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>

                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-sm border-b">
                                <div className="flex gap-6">
                                    <div>
                                        <span className="text-gray-500">ORDER PLACED</span>
                                        <p className="font-medium">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">TOTAL</span>
                                        <p className="font-medium">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-gray-500">ORDER # </span>
                                    <span className="font-medium">{order.id}</span>
                                </div>
                            </div>

                            {/* Order Content */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                                    >
                                        {order.status}
                                    </span>
                                    <Link
                                        to={`/order/${order.id}`}
                                        className="text-[#007185] hover:text-[#C45500] text-sm flex items-center gap-1"
                                    >
                                        View order details
                                        <ChevronRight size={16} />
                                    </Link>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-3">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                                                <Package size={24} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Product #{item.productId}</p>
                                                <p className="text-sm text-gray-500">
                                                    Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
