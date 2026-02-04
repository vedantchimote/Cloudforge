import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import type { CartItem } from '@/store/cartStore';
import { Link } from 'react-router-dom';

interface CartItemProps {
    item: CartItem;
}

export default function CartItemComponent({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCartStore();

    return (
        <div className="flex gap-4 py-4 border-b border-gray-200">
            {/* Product Image */}
            <Link to={`/products/${item.productId}`} className="shrink-0">
                <img
                    src={item.imageUrl || '/placeholder-product.png'}
                    alt={item.name}
                    className="w-24 h-24 object-contain bg-gray-50 rounded"
                />
            </Link>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
                <Link to={`/products/${item.productId}`}>
                    <h3 className="text-sm font-medium text-gray-900 hover:text-[#C45500] line-clamp-2">
                        {item.name}
                    </h3>
                </Link>

                <p className="text-xs text-green-600 mt-1">In Stock</p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                            disabled={item.quantity <= 1}
                        >
                            <Minus size={14} />
                        </button>
                        <span className="px-4 py-1 text-sm font-medium bg-gray-50 border-x border-gray-300">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <span className="text-gray-300">|</span>

                    <button
                        onClick={() => removeItem(item.productId)}
                        className="text-[#007185] hover:text-[#C45500] text-sm flex items-center gap-1"
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>
            </div>

            {/* Price */}
            <div className="text-right shrink-0">
                <p className="text-lg font-bold text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </p>
                {item.quantity > 1 && (
                    <p className="text-xs text-gray-500">
                        ₹{item.price.toLocaleString('en-IN')} each
                    </p>
                )}
            </div>
        </div>
    );
}
