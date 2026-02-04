import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Truck, Shield, CreditCard, Headphones } from 'lucide-react';
import { productService } from '@/services/productService';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
    const { data: products, isLoading } = useQuery({
        queryKey: ['products', 'featured'],
        queryFn: () => productService.getAllProducts(),
    });

    const featuredProducts = products?.slice(0, 8) || [];
    const dealProducts = products?.slice(0, 4) || [];

    return (
        <div className="bg-white">
            {/* Hero Banner */}
            <div className="relative bg-gradient-to-br from-orange-50 via-white to-orange-100">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        <div className="flex-1 text-center lg:text-left">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Welcome to <span className="text-[#FF9900]">CloudForge</span>
                            </h1>
                            <p className="text-lg text-gray-600 mb-6 max-w-xl">
                                Discover amazing products at unbeatable prices. Shop now and enjoy fast, free delivery on eligible orders.
                            </p>
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#FF6600] text-white font-medium py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                            >
                                Shop Now
                                <ChevronRight size={20} />
                            </Link>
                        </div>
                        <div className="hidden lg:block flex-1">
                            <div className="w-80 h-80 bg-gradient-to-br from-[#FF9900] to-[#FFD814] rounded-full opacity-30 blur-3xl mx-auto" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Cards */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { title: 'Electronics', image: '🎧', link: '/products?category=electronics' },
                        { title: 'Fashion', image: '👕', link: '/products?category=fashion' },
                        { title: 'Home & Kitchen', image: '🏠', link: '/products?category=home' },
                        { title: 'Deals', image: '🏷️', link: '/products?category=deals' },
                    ].map((category) => (
                        <Link
                            key={category.title}
                            to={category.link}
                            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#FF9900] hover:shadow-lg transition-all"
                        >
                            <div className="text-4xl mb-3">{category.image}</div>
                            <h3 className="font-bold text-gray-900 mb-1">{category.title}</h3>
                            <span className="text-sm text-[#FF9900] font-medium">
                                Shop now →
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Today's Deals */}
            <section className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Today's Deals</h2>
                        <Link to="/products?deals=true" className="text-[#FF9900] hover:underline text-sm font-medium">
                            See all deals →
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {dealProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    price={product.price * 0.8}
                                    originalPrice={product.price}
                                    imageUrl={product.imageUrl}
                                    rating={4.5}
                                    reviewCount={Math.floor(Math.random() * 1000) + 100}
                                    category={product.category}
                                    dealBadge="Limited Deal"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Products */}
            <section className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
                        <Link to="/products" className="text-[#FF9900] hover:underline text-sm font-medium">
                            See all →
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {featuredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    price={product.price}
                                    imageUrl={product.imageUrl}
                                    rating={4 + Math.random()}
                                    reviewCount={Math.floor(Math.random() * 500) + 50}
                                    category={product.category}
                                    isPrime={Math.random() > 0.5}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Trust Badges */}
            <section className="max-w-7xl mx-auto px-4 py-8 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: Truck, title: 'Free Delivery', desc: 'On orders over ₹499' },
                        { icon: Shield, title: 'Secure Payments', desc: '100% protected' },
                        { icon: CreditCard, title: 'Easy Returns', desc: '10-day return policy' },
                        { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support' },
                    ].map((badge, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                                <badge.icon size={24} className="text-[#FF9900]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{badge.title}</h3>
                                <p className="text-sm text-gray-500">{badge.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
