import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
    username: z.string().min(1, 'Please enter your username'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
    username: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    const { setAuth } = useAuthStore();

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const registerForm = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onLoginSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await authService.login(data);
            setAuth(response.token, response.user);
            navigate(redirect);
        } catch {
            setError('Invalid username or password');
        } finally {
            setIsLoading(false);
        }
    };

    const onRegisterSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await authService.register(data);
            setAuth(response.token, response.user);
            navigate(redirect);
        } catch {
            setError('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Logo */}
            <div className="pt-8 pb-4 text-center">
                <Link to="/" className="inline-block">
                    <span className="text-3xl font-bold text-gray-900">Cloud</span>
                    <span className="text-3xl font-bold text-[#FF9900]">Forge</span>
                </Link>
            </div>

            {/* Form Container */}
            <div className="flex-1 flex items-start justify-center px-4 pb-8">
                <div className="w-full max-w-[350px]">
                    <div className="border border-gray-300 rounded-lg p-6">
                        <h1 className="text-2xl font-normal mb-4">
                            {isLogin ? 'Sign in' : 'Create account'}
                        </h1>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        {isLogin ? (
                            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        {...loginForm.register('username')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-[#FF9900]"
                                    />
                                    {loginForm.formState.errors.username && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {loginForm.formState.errors.username.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            {...loginForm.register('password')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-[#FF9900]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {loginForm.formState.errors.password && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {loginForm.formState.errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-[#FF9900] disabled:opacity-50"
                                >
                                    {isLoading ? 'Signing in...' : 'Sign in'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">
                                        Your name
                                    </label>
                                    <input
                                        type="text"
                                        {...registerForm.register('username')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-[#FF9900]"
                                    />
                                    {registerForm.formState.errors.username && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {registerForm.formState.errors.username.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        {...registerForm.register('email')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-[#FF9900]"
                                    />
                                    {registerForm.formState.errors.email && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {registerForm.formState.errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        {...registerForm.register('password')}
                                        placeholder="At least 6 characters"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-[#FF9900]"
                                    />
                                    {registerForm.formState.errors.password && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {registerForm.formState.errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">
                                        Re-enter password
                                    </label>
                                    <input
                                        type="password"
                                        {...registerForm.register('confirmPassword')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-[#FF9900]"
                                    />
                                    {registerForm.formState.errors.confirmPassword && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {registerForm.formState.errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-[#FF9900] disabled:opacity-50"
                                >
                                    {isLoading ? 'Creating account...' : 'Create your CloudForge account'}
                                </button>
                            </form>
                        )}

                        <p className="text-xs text-gray-600 mt-4">
                            By continuing, you agree to CloudForge's{' '}
                            <a href="#" className="text-[#007185] hover:text-[#C45500] hover:underline">
                                Conditions of Use
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-[#007185] hover:text-[#C45500] hover:underline">
                                Privacy Notice
                            </a>
                            .
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-4 text-gray-500">
                                    {isLogin ? 'New to CloudForge?' : 'Already have an account?'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="mt-4 w-full border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-900 font-medium py-2 px-4 rounded"
                        >
                            {isLogin ? 'Create your CloudForge account' : 'Sign in'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-gradient-to-b from-transparent to-gray-100 py-6">
                <div className="flex justify-center gap-4 text-xs text-[#007185]">
                    <a href="#" className="hover:text-[#C45500] hover:underline">Conditions of Use</a>
                    <a href="#" className="hover:text-[#C45500] hover:underline">Privacy Notice</a>
                    <a href="#" className="hover:text-[#C45500] hover:underline">Help</a>
                </div>
                <p className="text-center text-xs text-gray-500 mt-2">
                    © 2026, CloudForge
                </p>
            </div>
        </div>
    );
}
