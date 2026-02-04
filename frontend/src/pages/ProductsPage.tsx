import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Filter, ChevronDown, Grid, List } from 'lucide-react';
import { productService } from '@/services/productService';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';

export default function ProductsPage() {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const [sortBy, setSortBy] = useState('featured');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

    const { data: products, isLoading, error } = useQuery<Product[]>({
        queryKey: ['products', searchQuery, category],
        queryFn: () => productService.getAllProducts(),
    });

    // Filter and sort products
    const filteredProducts = products
        ?.filter((product) => {
            if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            if (category && product.category?.toLowerCase() !== category.toLowerCase()) {
                return false;
            }
            if (product.price < priceRange[0] || product.price > priceRange[1]) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'newest':
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                default:
                    return 0;
            }
        }) || [];

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Search Results Header */}
                {searchQuery && (
                    <div className="mb-4">
                        <h1 className="text-xl">
                            Results for "<span className="text-[#C45500] font-medium">{searchQuery}</span>"
                        </h1>
                    </div>
                )}

                {/* Category Header */}
                {category && !searchQuery && (
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 capitalize">{category}</h1>
                    </div>
                )}

                <div className="flex gap-6">
                    {/* Filters Sidebar */}
                    <aside className={`w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <h2 className="font-bold text-gray-900 mb-4">Filters</h2>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <h3 className="font-medium text-sm text-gray-700 mb-2">Category</h3>
                                <ul className="space-y-2 text-sm">
                                    {['Electronics', 'Fashion', 'Home', 'Sports', 'Books'].map((cat) => (
                                        <li key={cat}>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-[#FF9900] focus:ring-[#FF9900]"
                                                    checked={category.toLowerCase() === cat.toLowerCase()}
                                                    onChange={() => { }}
                                                />
                                                {cat}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-6">
                                <h3 className="font-medium text-sm text-gray-700 mb-2">Price</h3>
                                <ul className="space-y-2 text-sm">
                                    {[
                                        { label: 'Under ₹500', range: [0, 500] },
                                        { label: '₹500 - ₹1,000', range: [500, 1000] },
                                        { label: '₹1,000 - ₹5,000', range: [1000, 5000] },
                                        { label: 'Over ₹5,000', range: [5000, 100000] },
                                    ].map((option) => (
                                        <li key={option.label}>
                                            <button
                                                onClick={() => setPriceRange(option.range as [number, number])}
                                                className={`hover:text-[#C45500] ${priceRange[0] === option.range[0] && priceRange[1] === option.range[1]
                                                    ? 'text-[#C45500] font-medium'
                                                    : 'text-gray-600'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Rating Filter */}
                            <div className="mb-6">
                                <h3 className="font-medium text-sm text-gray-700 mb-2">Customer Rating</h3>
                                <ul className="space-y-2 text-sm">
                                    {[4, 3, 2, 1].map((rating) => (
                                        <li key={rating}>
                                            <button className="flex items-center gap-1 text-gray-600 hover:text-[#C45500]">
                                                {'★'.repeat(rating)}
                                                {'☆'.repeat(5 - rating)}
                                                <span className="ml-1">& Up</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Prime Filter */}
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-[#FF9900] focus:ring-[#FF9900]"
                                    />
                                    <span className="text-sm bg-[#232F3E] text-white px-2 py-0.5 rounded font-medium">
                                        Prime
                                    </span>
                                    <span className="text-sm text-gray-600">Eligible</span>
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="lg:hidden flex items-center gap-1 text-sm"
                                >
                                    <Filter size={18} />
                                    Filters
                                </button>
                                <span className="text-sm text-gray-600">
                                    {filteredProducts.length} results
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Sort Dropdown */}
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none bg-gray-50 border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="newest">Newest Arrivals</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                                </div>

                                {/* View Mode Toggle */}
                                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-4 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <p className="text-red-600">Failed to load products. Please try again.</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && !error && filteredProducts.length === 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <p className="text-gray-600">No products found matching your criteria.</p>
                            </div>
                        )}

                        {/* Products Grid */}
                        {!isLoading && !error && filteredProducts.length > 0 && (
                            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                                {filteredProducts.map((product) => (
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
                </div>
            </div>
        </div>
    );
}
