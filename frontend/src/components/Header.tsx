import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export default function Header() {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuthStore();
    const { items } = useCartStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAccountMenu, setShowAccountMenu] = useState(false);

    const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            {/* Main Header */}
            <div className="flex items-center px-4 py-3 gap-4 max-w-7xl mx-auto">
                {/* Logo */}
                <Link to="/" className="flex items-center shrink-0">
                    <span className="text-2xl font-bold text-gray-900">Cloud</span>
                    <span className="text-2xl font-bold text-[#FF9900]">Forge</span>
                </Link>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex-1 flex max-w-2xl">
                    <div className="flex w-full rounded-lg overflow-hidden border-2 border-[#FF9900] focus-within:border-[#FF6600]">
                        <select className="bg-gray-100 text-gray-700 px-3 text-sm border-r border-gray-300 hidden sm:block">
                            <option>All</option>
                            <option>Electronics</option>
                            <option>Fashion</option>
                            <option>Home</option>
                        </select>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search CloudForge"
                            className="flex-1 px-4 py-2 text-gray-900 focus:outline-none min-w-0 bg-white"
                        />
                        <button type="submit" className="bg-[#FF9900] hover:bg-[#FF6600] px-4">
                            <Search size={22} className="text-white" />
                        </button>
                    </div>
                </form>

                {/* Account */}
                <div
                    className="relative hidden md:block"
                    onMouseEnter={() => setShowAccountMenu(true)}
                    onMouseLeave={() => setShowAccountMenu(false)}
                >
                    <div className="flex items-center gap-2 hover:text-[#FF9900] cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                        <User size={24} className="text-gray-700" />
                        <div className="text-sm">
                            <p className="text-gray-500 text-xs">Hello, {isAuthenticated ? user?.username : 'Sign in'}</p>
                            <p className="font-semibold text-gray-900 flex items-center">Account <ChevronDown size={14} /></p>
                        </div>
                    </div>

                    {showAccountMenu && (
                        <div className="absolute right-0 top-full bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px] z-50">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-50 text-gray-700">Your Orders</Link>
                                    <Link to="/account" className="block px-4 py-2 hover:bg-gray-50 text-gray-700">Your Account</Link>
                                    <hr className="my-2" />
                                    <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600">
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="block mx-4 my-2 bg-[#FF9900] hover:bg-[#FF6600] text-white text-center py-2 rounded-lg text-sm font-medium">
                                        Sign In
                                    </Link>
                                    <p className="text-xs text-center text-gray-500 pb-2">New customer? <Link to="/login" className="text-[#FF9900] hover:underline">Start here</Link></p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Orders */}
                <Link to="/orders" className="hidden md:flex flex-col p-2 rounded-lg hover:bg-gray-50">
                    <span className="text-xs text-gray-500">Returns</span>
                    <span className="text-sm font-semibold text-gray-900">& Orders</span>
                </Link>

                {/* Cart */}
                <Link to="/cart" className="flex items-center p-2 rounded-lg hover:bg-gray-50 relative">
                    <div className="relative">
                        <ShoppingCart size={28} className="text-gray-700" />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#FF9900] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {cartItemCount}
                            </span>
                        )}
                    </div>
                    <span className="hidden sm:block font-semibold text-sm ml-1 text-gray-900">Cart</span>
                </Link>

                {/* Mobile Menu */}
                <button className="md:hidden p-2 hover:bg-gray-50 rounded-lg">
                    <Menu size={24} className="text-gray-700" />
                </button>
            </div>

            {/* Sub Header / Navigation */}
            <div className="bg-gray-50 border-t border-gray-200">
                <div className="px-4 py-2 flex items-center gap-6 text-sm overflow-x-auto max-w-7xl mx-auto">
                    <Link to="/products?category=electronics" className="text-gray-700 hover:text-[#FF9900] whitespace-nowrap font-medium">Electronics</Link>
                    <Link to="/products?category=fashion" className="text-gray-700 hover:text-[#FF9900] whitespace-nowrap font-medium">Fashion</Link>
                    <Link to="/products?category=home" className="text-gray-700 hover:text-[#FF9900] whitespace-nowrap font-medium">Home & Kitchen</Link>
                    <Link to="/products?deals=true" className="text-[#FF9900] font-bold whitespace-nowrap">Today's Deals</Link>
                    <Link to="/products" className="text-gray-700 hover:text-[#FF9900] whitespace-nowrap font-medium">All Products</Link>
                </div>
            </div>
        </header>
    );
}
