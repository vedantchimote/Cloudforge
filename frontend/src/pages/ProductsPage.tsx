import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Grid, List, Package } from 'lucide-react';
import { productService } from '@/services/productService';
import type { Product } from '@/types';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'];

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');

    const category = searchParams.get('category') || 'All';
    const page = parseInt(searchParams.get('page') || '0');

    const { data, isLoading, error } = useQuery({
        queryKey: ['products', category, page],
        queryFn: () => productService.getProducts(page, 12),
    });

    const handleCategoryChange = (newCategory: string) => {
        setSearchParams({ category: newCategory, page: '0' });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Would trigger search query
        console.log('Searching:', search);
    };

    // Generate placeholder products for demo
    const demoProducts: Product[] = Array.from({ length: 8 }, (_, i) => ({
        id: `demo-${i}`,
        name: `Premium Product ${i + 1}`,
        description: 'High-quality product with amazing features',
        category: CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1],
        price: Math.floor(Math.random() * 200) + 29.99,
        stock: Math.floor(Math.random() * 100),
        sku: `SKU-${1000 + i}`,
        images: [],
        tags: ['featured', 'new'],
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }));

    const products = data?.content || demoProducts;

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="gradient-text">Products</span>
                    </h1>
                    <p className="text-[var(--text-muted)]">
                        Discover our amazing collection of products
                    </p>
                </div>

                {/* Filters Bar */}
                <div className="glass rounded-2xl p-4 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="relative w-full lg:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="input pl-10"
                            />
                        </form>

                        {/* Categories */}
                        <div className="flex gap-2 flex-wrap justify-center">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${category === cat
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'bg-[var(--surface)] text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-hover)]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* View Toggle */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setView('grid')}
                                className={`p-2 rounded-lg transition-all ${view === 'grid'
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-[var(--surface)] text-[var(--text-muted)]'
                                    }`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`p-2 rounded-lg transition-all ${view === 'list'
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-[var(--surface)] text-[var(--text-muted)]'
                                    }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="card">
                                <div className="skeleton h-48 mb-4" />
                                <div className="skeleton h-6 w-3/4 mb-2" />
                                <div className="skeleton h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        className={
                            view === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
                                : 'flex flex-col gap-4'
                        }
                    >
                        {products.map((product, index) => (
                            <Link
                                key={product.id}
                                to={`/products/${product.id}`}
                                className={`card group animate-fadeIn ${view === 'list' ? 'flex gap-6' : ''
                                    }`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {/* Product Image */}
                                <div
                                    className={`bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 rounded-xl flex items-center justify-center ${view === 'list' ? 'w-32 h-32' : 'h-48 mb-4'
                                        }`}
                                >
                                    <Package className="w-16 h-16 text-[var(--primary)] opacity-50 group-hover:scale-110 transition-transform" />
                                </div>

                                {/* Product Info */}
                                <div className={view === 'list' ? 'flex-1' : ''}>
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-lg group-hover:text-[var(--primary)] transition-colors">
                                            {product.name}
                                        </h3>
                                    </div>

                                    <p className="text-[var(--text-muted)] text-sm mb-3 line-clamp-2">
                                        {product.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold gradient-text">
                                            ${product.price.toFixed(2)}
                                        </span>
                                        <span
                                            className={`text-sm px-2 py-1 rounded-full ${product.stock > 0
                                                ? 'bg-[var(--success)]/20 text-[var(--success)]'
                                                : 'bg-[var(--error)]/20 text-[var(--error)]'
                                                }`}
                                        >
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: data.totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setSearchParams({ category, page: i.toString() })}
                                className={`w-10 h-10 rounded-lg font-medium transition-all ${page === i
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
