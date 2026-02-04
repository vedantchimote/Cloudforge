import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, ShoppingCart, Heart, Share2, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { productService } from '@/services/productService';
import type { Product } from '@/types';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getProductById(id!),
        enabled: !!id,
    });

    // Demo product for display
    const demoProduct: Product = {
        id: id || 'demo-1',
        name: 'Premium Wireless Headphones',
        description: `Experience unparalleled audio quality with our Premium Wireless Headphones. 
    
Features:
• Active Noise Cancellation
• 40-hour battery life
• Premium leather ear cushions
• Hi-Res Audio certified
• Multi-device connectivity
• Touch controls

Perfect for music lovers, gamers, and professionals who demand the best in audio technology.`,
        category: 'Electronics',
        price: 299.99,
        stock: 42,
        sku: 'WH-1000XM5',
        images: [],
        tags: ['featured', 'bestseller', 'new'],
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const displayProduct = product || demoProduct;

    if (isLoading) {
        return (
            <div className="min-h-screen py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="skeleton h-96 rounded-2xl" />
                        <div className="space-y-4">
                            <div className="skeleton h-10 w-3/4" />
                            <div className="skeleton h-6 w-1/2" />
                            <div className="skeleton h-32" />
                            <div className="skeleton h-12 w-40" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Products
                </Link>

                <div className="grid md:grid-cols-2 gap-12 animate-fadeIn">
                    {/* Product Image */}
                    <div className="glass rounded-3xl p-8">
                        <div className="bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 rounded-2xl h-96 flex items-center justify-center">
                            <Package className="w-32 h-32 text-[var(--primary)] opacity-50" />
                        </div>

                        {/* Thumbnail Gallery */}
                        <div className="flex gap-4 mt-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-20 h-20 rounded-xl bg-[var(--surface)] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[var(--primary)] transition-all"
                                >
                                    <Package className="w-8 h-8 text-[var(--text-muted)]" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        {/* Tags */}
                        <div className="flex gap-2 mb-4">
                            {displayProduct.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-[var(--primary)]/20 text-[var(--primary)] rounded-full text-sm font-medium capitalize"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-4xl font-bold mb-2">{displayProduct.name}</h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-5 h-5 ${star <= 4
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-[var(--text-muted)]'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-[var(--text-muted)]">(128 reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="text-4xl font-bold gradient-text mb-6">
                            ${displayProduct.price.toFixed(2)}
                        </div>

                        {/* Description */}
                        <p className="text-[var(--text-muted)] mb-6 whitespace-pre-line">
                            {displayProduct.description}
                        </p>

                        {/* Stock Status */}
                        <div className="mb-6">
                            <span
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${displayProduct.stock > 0
                                    ? 'bg-[var(--success)]/20 text-[var(--success)]'
                                    : 'bg-[var(--error)]/20 text-[var(--error)]'
                                    }`}
                            >
                                {displayProduct.stock > 0 ? (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                                        {displayProduct.stock} in stock
                                    </>
                                ) : (
                                    'Out of stock'
                                )}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mb-8">
                            <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </button>
                            <button className="btn-secondary p-3">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="btn-secondary p-3">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-[var(--surface)] rounded-xl">
                                <Truck className="w-6 h-6 mx-auto mb-2 text-[var(--primary)]" />
                                <p className="text-sm text-[var(--text-muted)]">Free Shipping</p>
                            </div>
                            <div className="text-center p-4 bg-[var(--surface)] rounded-xl">
                                <Shield className="w-6 h-6 mx-auto mb-2 text-[var(--primary)]" />
                                <p className="text-sm text-[var(--text-muted)]">2 Year Warranty</p>
                            </div>
                            <div className="text-center p-4 bg-[var(--surface)] rounded-xl">
                                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-[var(--primary)]" />
                                <p className="text-sm text-[var(--text-muted)]">30 Day Returns</p>
                            </div>
                        </div>

                        {/* SKU & Category */}
                        <div className="mt-6 pt-6 border-t border-[var(--border)]">
                            <p className="text-sm text-[var(--text-muted)]">
                                SKU: <span className="text-white">{displayProduct.sku}</span>
                            </p>
                            <p className="text-sm text-[var(--text-muted)]">
                                Category: <span className="text-white">{displayProduct.category}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
