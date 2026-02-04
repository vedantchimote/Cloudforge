import { Link } from 'react-router-dom';
import { Star, StarHalf } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    rating: number;
    reviewCount: number;
    category?: string;
    isPrime?: boolean;
    dealBadge?: string;
}

export default function ProductCard({
    id,
    name,
    price,
    originalPrice,
    imageUrl,
    rating,
    reviewCount,
    category,
    isPrime = false,
    dealBadge,
}: ProductCardProps) {
    const { addItem } = useCartStore();

    const discount = originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} size={14} className="fill-[#FF9900] text-[#FF9900]" />);
        }
        if (hasHalfStar) {
            stars.push(<StarHalf key="half" size={14} className="fill-[#FF9900] text-[#FF9900]" />);
        }
        for (let i = stars.length; i < 5; i++) {
            stars.push(<Star key={i} size={14} className="text-gray-300" />);
        }
        return stars;
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            productId: id,
            name,
            price,
            imageUrl,
            quantity: 1,
        });
    };

    return (
        <Link
            to={`/products/${id}`}
            className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col"
        >
            {/* Image */}
            <div className="relative aspect-square bg-gray-50 p-4">
                <img
                    src={imageUrl || '/placeholder-product.png'}
                    alt={name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
                {dealBadge && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {dealBadge}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Category */}
                {category && (
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">{category}</span>
                )}

                {/* Name */}
                <h3 className="text-sm text-gray-900 group-hover:text-[#C45500] line-clamp-2 mb-2">
                    {name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex">{renderStars(rating)}</div>
                    <span className="text-xs text-[#007185]">({reviewCount.toLocaleString()})</span>
                </div>

                {/* Price */}
                <div className="mt-auto">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xs">₹</span>
                        <span className="text-xl font-medium text-gray-900">{price.toLocaleString('en-IN')}</span>
                    </div>
                    {originalPrice && discount > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
                            <span className="text-sm text-red-600 font-medium">({discount}% off)</span>
                        </div>
                    )}
                </div>

                {/* Prime Badge */}
                {isPrime && (
                    <div className="mt-2">
                        <span className="text-xs bg-[#FF9900] text-white px-2 py-0.5 rounded font-medium">
                            Prime
                        </span>
                    </div>
                )}

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    className="mt-3 w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium py-2 px-4 rounded-full text-sm transition-colors"
                >
                    Add to Cart
                </button>
            </div>
        </Link>
    );
}
