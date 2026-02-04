import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import CartItemComponent from '@/components/CartItem';

export default function CartPage() {
    const { items, getTotal, clearCart } = useCartStore();
    const total = getTotal();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-100 py-16">
                <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md">
                    <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
                    <p className="text-gray-600 mb-6">
                        Looks like you haven't added any items to your cart yet.
                    </p>
                    <Link
                        to="/products"
                        className="inline-block bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium py-3 px-6 rounded-full"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen py-6">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Cart Items */}
                    <div className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between border-b pb-4 mb-4">
                                <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                                <button
                                    onClick={clearCart}
                                    className="text-sm text-[#007185] hover:text-[#C45500] hover:underline"
                                >
                                    Clear all items
                                </button>
                            </div>

                            <div className="text-right text-sm text-gray-500 mb-4">Price</div>

                            {items.map((item) => (
                                <CartItemComponent key={item.productId} item={item} />
                            ))}

                            <div className="text-right mt-6">
                                <span className="text-lg">
                                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):{' '}
                                    <span className="font-bold text-gray-900">
                                        ₹{total.toLocaleString('en-IN')}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:w-80">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                            <div className="flex items-center gap-2 text-green-700 text-sm mb-4">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Your order qualifies for FREE Delivery
                            </div>

                            <p className="text-lg mb-4">
                                Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):{' '}
                                <span className="font-bold">₹{total.toLocaleString('en-IN')}</span>
                            </p>

                            <Link
                                to="/checkout"
                                className="block w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium py-3 px-4 rounded-full text-center mb-4"
                            >
                                Proceed to Checkout
                            </Link>

                            <div className="border-t pt-4 mt-4">
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>EMI Available</span>
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
