import { Link } from 'react-router-dom';
import { ShoppingBag, Zap, Shield, Truck, ArrowRight, Star } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const features = [
    {
        icon: Zap,
        title: 'Lightning Fast',
        description: 'Built with cutting-edge microservices for blazing performance',
    },
    {
        icon: Shield,
        title: 'Secure by Default',
        description: 'Enterprise-grade security with LDAP authentication',
    },
    {
        icon: Truck,
        title: 'Fast Delivery',
        description: 'Optimized logistics for quick order fulfillment',
    },
];

const categories = [
    { name: 'Electronics', image: '🎧', color: 'from-blue-500 to-purple-600' },
    { name: 'Clothing', image: '👕', color: 'from-pink-500 to-rose-600' },
    { name: 'Home & Garden', image: '🏡', color: 'from-green-500 to-emerald-600' },
    { name: 'Sports', image: '⚽', color: 'from-orange-500 to-amber-600' },
];

export default function HomePage() {
    const { isAuthenticated, user } = useAuthStore();

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 px-4 overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 via-transparent to-[var(--secondary)]/20" />

                {/* Floating shapes */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--primary)]/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--secondary)]/20 rounded-full blur-3xl animate-pulse" />

                <div className="relative max-w-6xl mx-auto text-center">
                    <div className="animate-fadeIn">
                        <span className="inline-block px-4 py-2 bg-[var(--primary)]/20 text-[var(--primary)] rounded-full text-sm font-medium mb-6">
                            🚀 Cloud-Native E-Commerce Platform
                        </span>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            Welcome to{' '}
                            <span className="gradient-text">CloudForge</span>
                        </h1>

                        <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-8">
                            Experience the future of e-commerce with our microservices-powered platform.
                            Built for scale, designed for developers.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                Browse Products
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            {!isAuthenticated && (
                                <Link to="/login" className="btn-secondary inline-flex items-center gap-2">
                                    Get Started
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Why Choose <span className="gradient-text">CloudForge</span>?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="card text-center animate-fadeIn"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-[var(--text-muted)]">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 px-4 bg-[var(--surface)]/50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Shop by Category
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.map((category, index) => (
                            <Link
                                key={category.name}
                                to={`/products?category=${category.name}`}
                                className="group relative overflow-hidden rounded-2xl p-6 text-center transition-all hover:scale-105 animate-fadeIn"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                                <div className="relative">
                                    <span className="text-5xl mb-4 block">{category.image}</span>
                                    <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="glass rounded-3xl p-12">
                        <div className="grid md:grid-cols-4 gap-8 text-center">
                            <div className="animate-fadeIn">
                                <div className="text-4xl font-bold gradient-text mb-2">5</div>
                                <div className="text-[var(--text-muted)]">Microservices</div>
                            </div>
                            <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                                <div className="text-4xl font-bold gradient-text mb-2">25+</div>
                                <div className="text-[var(--text-muted)]">DevOps Tools</div>
                            </div>
                            <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                                <div className="text-4xl font-bold gradient-text mb-2">100%</div>
                                <div className="text-[var(--text-muted)]">Cloud Native</div>
                            </div>
                            <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                                <div className="text-4xl font-bold gradient-text mb-2">∞</div>
                                <div className="text-[var(--text-muted)]">Scalability</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {!isAuthenticated && (
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
                        <p className="text-xl text-[var(--text-muted)] mb-8">
                            Join thousands of users who trust CloudForge for their e-commerce needs.
                        </p>
                        <Link to="/login" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                            Create Your Account
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold gradient-text">CloudForge</span>
                    </div>
                    <p className="text-[var(--text-muted)] text-sm">
                        © 2026 CloudForge. Built with ❤️ using microservices.
                    </p>
                </div>
            </footer>
        </div>
    );
}
