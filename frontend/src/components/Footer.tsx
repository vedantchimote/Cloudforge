import { Link } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-gray-100 text-gray-700 mt-auto">
            {/* Back to Top */}
            <button
                onClick={scrollToTop}
                className="w-full bg-gray-200 hover:bg-gray-300 py-3 text-sm font-medium flex items-center justify-center gap-1 transition-colors"
            >
                <ChevronUp size={18} />
                Back to top
            </button>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Column 1 */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Get to Know Us</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/about" className="hover:text-[#FF9900]">About CloudForge</Link></li>
                            <li><Link to="/careers" className="hover:text-[#FF9900]">Careers</Link></li>
                            <li><Link to="/press" className="hover:text-[#FF9900]">Press Releases</Link></li>
                        </ul>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Connect with Us</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-[#FF9900]">Facebook</a></li>
                            <li><a href="#" className="hover:text-[#FF9900]">Twitter</a></li>
                            <li><a href="#" className="hover:text-[#FF9900]">Instagram</a></li>
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Make Money with Us</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/sell" className="hover:text-[#FF9900]">Sell on CloudForge</Link></li>
                            <li><Link to="/affiliate" className="hover:text-[#FF9900]">Become an Affiliate</Link></li>
                            <li><Link to="/advertise" className="hover:text-[#FF9900]">Advertise Your Products</Link></li>
                        </ul>
                    </div>

                    {/* Column 4 */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Let Us Help You</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/orders" className="hover:text-[#FF9900]">Your Orders</Link></li>
                            <li><Link to="/shipping" className="hover:text-[#FF9900]">Shipping Rates & Policies</Link></li>
                            <li><Link to="/returns" className="hover:text-[#FF9900]">Returns & Replacements</Link></li>
                            <li><Link to="/help" className="hover:text-[#FF9900]">Help</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-300 py-6">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <Link to="/" className="flex items-center">
                        <span className="text-xl font-bold text-gray-900">Cloud</span>
                        <span className="text-xl font-bold text-[#FF9900]">Forge</span>
                    </Link>
                    <p className="text-xs text-gray-500">
                        © 2026, CloudForge. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
