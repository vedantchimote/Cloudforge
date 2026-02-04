import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, StarHalf, Heart, Share2, ShieldCheck, Truck, RotateCcw, Minus, Plus } from 'lucide-react';
import { productService } from '@/services/productService';
import { useCartStore } from '@/store/cartStore';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { addItem } = useCartStore();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getProductById(id!),
        enabled: !!id,
    });

    const handleAddToCart = () => {
        if (product) {
            addItem({
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity,
            });
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} size={18} className="fill-[#FF9900] text-[#FF9900]" />);
        }
        if (hasHalfStar) {
            stars.push(<StarHalf key="half" size={18} className="fill-[#FF9900] text-[#FF9900]" />);
        }
        for (let i = stars.length; i < 5; i++) {
            stars.push(<Star key={i} size={18} className="text-gray-300" />);
        }
        return stars;
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 border-4 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <p className="text-red-600 mb-4">Product not found</p>
                    <Link to="/products" className="text-[#007185] hover:underline">
                        Back to products
                    </Link>
                </div>
            </div>
        );
    }

    const rating = 4.5;
    const reviewCount = 1234;
    const originalPrice = product.price * 1.2;
    const discount = 20;

    // Generate mock images
    const images = [product.imageUrl, product.imageUrl, product.imageUrl];

    return (
        <div className="bg-white min-h-screen py-6">
            <div className="max-w-7xl mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="text-sm mb-6">
                    <ol className="flex items-center gap-2 text-gray-500">
                        <li><Link to="/" className="hover:text-[#C45500]">Home</Link></li>
                        <li>/</li>
                        <li><Link to="/products" className="hover:text-[#C45500]">Products</Link></li>
                        <li>/</li>
                        <li className="text-gray-900 truncate max-w-[200px]">{product.name}</li>
                    </ol>
                </nav>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Product Images */}
                    <div className="flex gap-4">
                        {/* Thumbnails */}
                        <div className="flex flex-col gap-2">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`w-16 h-16 border-2 rounded-md overflow-hidden ${selectedImage === index ? 'border-[#FF9900]' : 'border-gray-200'
                                        }`}
                                >
                                    <img src={img || '/placeholder-product.png'} alt="" className="w-full h-full object-contain" />
                                </button>
                            ))}
                        </div>

                        {/* Main Image */}
                        <div className="flex-1 bg-gray-50 rounded-lg p-4">
                            <img
                                src={images[selectedImage] || '/placeholder-product.png'}
                                alt={product.name}
                                className="w-full h-[400px] object-contain"
                            />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-2xl font-medium text-gray-900 mb-2">{product.name}</h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[#007185]">{rating}</span>
                            <div className="flex">{renderStars(rating)}</div>
                            <span className="text-[#007185] hover:text-[#C45500] cursor-pointer">
                                {reviewCount.toLocaleString()} ratings
                            </span>
                        </div>

                        <hr className="my-4" />

                        {/* Price */}
                        <div className="mb-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-red-700 text-sm">-{discount}%</span>
                                <span className="text-3xl font-medium text-gray-900">
                                    ₹{product.price.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">
                                M.R.P.: <span className="line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
                            </p>
                            <p className="text-sm text-gray-600 mt-1">Inclusive of all taxes</p>
                        </div>

                        {/* Prime Badge */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-[#232F3E] text-white text-xs px-2 py-0.5 rounded font-medium">
                                Prime
                            </span>
                            <span className="text-sm text-gray-600">FREE Delivery</span>
                        </div>

                        <hr className="my-4" />

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="font-bold text-gray-900 mb-2">About this item</h3>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {product.description || 'No description available for this product.'}
                            </p>
                        </div>

                        {/* Stock Status */}
                        <p className="text-lg text-green-700 font-medium mb-4">In Stock</p>

                        {/* Quantity */}
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-sm text-gray-700">Quantity:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-2 hover:bg-gray-100"
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="px-4 py-2 font-medium">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-2 hover:bg-gray-100"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 mb-6">
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium py-3 px-6 rounded-full"
                            >
                                Add to Cart
                            </button>
                            <Link
                                to="/checkout"
                                onClick={handleAddToCart}
                                className="w-full bg-[#FFA41C] hover:bg-[#FF8F00] text-gray-900 font-medium py-3 px-6 rounded-full text-center"
                            >
                                Buy Now
                            </Link>
                        </div>

                        {/* Wishlist & Share */}
                        <div className="flex items-center gap-4 mb-6">
                            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#C45500]">
                                <Heart size={18} />
                                Add to Wishlist
                            </button>
                            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#C45500]">
                                <Share2 size={18} />
                                Share
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Truck size={20} className="text-gray-600" />
                                <span>Free delivery on orders over ₹499</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <RotateCcw size={20} className="text-gray-600" />
                                <span>10 days return policy</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <ShieldCheck size={20} className="text-gray-600" />
                                <span>Secure transaction</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
