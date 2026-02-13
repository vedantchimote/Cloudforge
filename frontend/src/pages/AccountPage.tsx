import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Shield, LogOut } from 'lucide-react';

export default function AccountPage() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    if (!user) {
        navigate('/login?redirect=/account');
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#232F3E] to-[#37475A] text-white p-6">
                    <h1 className="text-3xl font-bold mb-2">Your Account</h1>
                    <p className="text-gray-300">Manage your profile and preferences</p>
                </div>

                {/* Account Information */}
                <div className="p-6">
                    <div className="space-y-6">
                        {/* Profile Section */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <User className="mr-2" size={24} />
                                Profile Information
                            </h2>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div className="flex items-start">
                                    <span className="text-gray-600 font-medium w-32">Username:</span>
                                    <span className="text-gray-900">{user.username}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-gray-600 font-medium w-32">Full Name:</span>
                                    <span className="text-gray-900">
                                        {user.firstName} {user.lastName}
                                    </span>
                                </div>
                                <div className="flex items-start">
                                    <Mail className="text-gray-400 mr-2 mt-1" size={16} />
                                    <div>
                                        <span className="text-gray-600 font-medium">Email:</span>
                                        <span className="text-gray-900 ml-2">{user.email}</span>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Shield className="text-gray-400 mr-2 mt-1" size={16} />
                                    <div>
                                        <span className="text-gray-600 font-medium">Role:</span>
                                        <span className="ml-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.role === 'ADMIN' 
                                                    ? 'bg-purple-100 text-purple-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Calendar className="text-gray-400 mr-2 mt-1" size={16} />
                                    <div>
                                        <span className="text-gray-600 font-medium">Member Since:</span>
                                        <span className="text-gray-900 ml-2">
                                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-gray-600 font-medium w-32">Status:</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user.enabled 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {user.enabled ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => navigate('/orders')}
                                    className="flex items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-[#FF9900] hover:shadow-md transition-all"
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">📦</div>
                                        <div className="font-semibold text-gray-900">Your Orders</div>
                                        <div className="text-sm text-gray-600">Track, return, or buy again</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="flex items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-[#FF9900] hover:shadow-md transition-all"
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">🛒</div>
                                        <div className="font-semibold text-gray-900">Your Cart</div>
                                        <div className="text-sm text-gray-600">View and manage items</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <div className="pt-4 border-t border-gray-200">
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                            >
                                <LogOut className="mr-2" size={20} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
