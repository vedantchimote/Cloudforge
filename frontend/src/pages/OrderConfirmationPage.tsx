import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, Truck } from 'lucide-react';

export default function OrderConfirmationPage() {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="bg-gray-100 min-h-screen py-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    {/* Success Icon */}
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} className="text-green-600" />
                    </div>

                    {/* Success Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
                    <p className="text-gray-600 mb-6">
                        Thank you for your order. We've sent a confirmation email with order details.
                    </p>

                    {/* Order ID */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-8 inline-block">
                        <p className="text-sm text-gray-500">Order Number</p>
                        <p className="text-xl font-bold text-gray-900">#{id}</p>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                                <CheckCircle size={20} />
                            </div>
                            <p className="text-xs mt-2">Confirmed</p>
                        </div>
                        <div className="w-16 h-1 bg-gray-300" />
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                                <Package size={20} />
                            </div>
                            <p className="text-xs mt-2 text-gray-500">Packed</p>
                        </div>
                        <div className="w-16 h-1 bg-gray-300" />
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                                <Truck size={20} />
                            </div>
                            <p className="text-xs mt-2 text-gray-500">Delivered</p>
                        </div>
                    </div>

                    {/* Estimated Delivery */}
                    <div className="border-t border-b py-4 mb-8">
                        <p className="text-sm text-gray-500">Estimated Delivery</p>
                        <p className="text-lg font-medium text-gray-900">
                            {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                            })}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/orders"
                            className="bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium py-3 px-8 rounded-full"
                        >
                            View Your Orders
                        </Link>
                        <Link
                            to="/products"
                            className="border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium py-3 px-8 rounded-full"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
