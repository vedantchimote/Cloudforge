# React/TypeScript Development Guide

Complete guide for developing the CloudForge frontend application.

---

## 🛠️ Development Environment Setup

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | [Node.js](https://nodejs.org/) |
| npm/pnpm | Latest | Comes with Node.js |
| IDE | VS Code | [VS Code](https://code.visualstudio.com/) |

### VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (optional)
- GitLens

### Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── features/        # Feature-specific components
│   │       ├── ProductCard.tsx
│   │       ├── CartItem.tsx
│   │       └── OrderSummary.tsx
│   ├── pages/               # Route pages
│   │   ├── HomePage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── OrdersPage.tsx
│   │   └── LoginPage.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useProducts.ts
│   │   └── useDebounce.ts
│   ├── services/            # API layer
│   │   ├── api.ts           # Axios instance
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   ├── orderService.ts
│   │   └── paymentService.ts
│   ├── types/               # TypeScript types
│   │   ├── user.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── api.ts
│   ├── context/             # React Context
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── utils/               # Utility functions
│   │   ├── formatCurrency.ts
│   │   ├── formatDate.ts
│   │   └── validators.ts
│   ├── styles/              # Global styles
│   │   └── globals.css
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
├── tests/
│   ├── unit/
│   └── e2e/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── .eslintrc.json
```

---

## 🚀 Running Locally

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

---

## 📝 Coding Patterns

### Component Pattern
```tsx
// src/components/features/ProductCard.tsx
import { FC } from 'react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatCurrency';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  loading?: boolean;
}

export const ProductCard: FC<ProductCardProps> = ({ 
  product, 
  onAddToCart,
  loading = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={product.imageUrl} 
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-600">
            {formatCurrency(product.price)}
          </span>
          <Button 
            onClick={() => onAddToCart(product.id)}
            disabled={loading || product.stock === 0}
            size="sm"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
};
```

### Custom Hook Pattern
```tsx
// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { Product, ProductFilters } from '@/types/product';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId: string) => productService.addToCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
```

### Service/API Pattern
```tsx
// src/services/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

```tsx
// src/services/productService.ts
import { api } from './api';
import { Product, ProductFilters, PaginatedResponse } from '@/types/product';

export const productService = {
  getProducts: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get('/products', { params: filters });
    return data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  addToCart: async (productId: string, quantity = 1): Promise<void> => {
    await api.post('/cart/items', { productId, quantity });
  },
};
```

### Types
```tsx
// src/types/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl: string;
  createdAt: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  page: number;
  size: number;
}
```

### Context Pattern
```tsx
// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getCurrentUser()
        .then(setUser)
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await authService.login(email, password);
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Page Component
```tsx
// src/pages/ProductsPage.tsx
import { FC, useState } from 'react';
import { useProducts, useAddToCart } from '@/hooks/useProducts';
import { ProductCard } from '@/components/features/ProductCard';
import { ProductFilters } from '@/components/features/ProductFilters';
import { Spinner } from '@/components/ui/Spinner';
import { ProductFilters as Filters } from '@/types/product';

export const ProductsPage: FC = () => {
  const [filters, setFilters] = useState<Filters>({ page: 0, size: 12 });
  const { data, isLoading, error } = useProducts(filters);
  const addToCart = useAddToCart();

  if (isLoading) return <Spinner />;
  if (error) return <div>Error loading products</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      
      <ProductFilters 
        filters={filters} 
        onChange={setFilters} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {data?.content.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={(id) => addToCart.mutate(id)}
            loading={addToCart.isPending}
          />
        ))}
      </div>

      {/* Pagination */}
    </div>
  );
};
```

### Router Setup
```tsx
// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      { path: 'login', element: <LoginPage /> },
    ],
  },
]);
```

---

## 🧪 Testing

### Unit Test (Vitest)
```tsx
// tests/unit/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/features/ProductCard';
import { vi, describe, it, expect } from 'vitest';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'A test product',
  price: 99.99,
  stock: 10,
  imageUrl: '/test.jpg',
};

describe('ProductCard', () => {
  it('renders product information', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={() => {}} 
      />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when button clicked', () => {
    const onAddToCart = vi.fn();
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={onAddToCart} 
      />
    );

    fireEvent.click(screen.getByText('Add to Cart'));
    expect(onAddToCart).toHaveBeenCalledWith('1');
  });

  it('disables button when out of stock', () => {
    render(
      <ProductCard 
        product={{ ...mockProduct, stock: 0 }} 
        onAddToCart={() => {}} 
      />
    );

    expect(screen.getByText('Out of Stock')).toBeDisabled();
  });
});
```

### E2E Test (Playwright)
```tsx
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('can complete checkout', async ({ page }) => {
    // Add product to cart
    await page.goto('/products');
    await page.click('text=Add to Cart');
    
    // Go to cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page).toHaveURL('/cart');
    
    // Proceed to checkout
    await page.click('text=Checkout');
    await expect(page).toHaveURL('/checkout');
    
    // Fill shipping
    await page.fill('[name="address"]', '123 Main St');
    await page.fill('[name="city"]', 'New York');
    await page.fill('[name="zipCode"]', '10001');
    
    // Place order
    await page.click('text=Place Order');
    
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });
});
```

### Run Tests
```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E in headed mode
npm run test:e2e:headed
```

---

## 🔧 Configuration Files

### vite.config.ts
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

### tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
    },
  },
  plugins: [],
};
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 🐳 Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📚 Related Docs

- [Code Style Guide](code-style-guide.md)
- [Testing Strategy](testing-strategy.md)
- [API Reference](api-reference.md)

---

## 🗄️ State Management

### React Query (Server State)
```tsx
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes (formerly cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

```tsx
// src/main.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
```

### Zustand (Client State)
```tsx
// src/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.productId === item.productId);
        if (existing) {
          return {
            items: state.items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),

      removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.productId !== productId),
      })),

      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce(
        (sum, i) => sum + i.price * i.quantity, 0
      ),
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

### Using Zustand in Components
```tsx
// src/components/features/CartIcon.tsx
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export const CartIcon = () => {
  const totalItems = useCartStore((state) => state.totalItems());

  return (
    <div className="relative">
      <ShoppingCart className="w-6 h-6" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white 
                         text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </div>
  );
};
```

---

## 📝 Form Handling

### React Hook Form + Zod
```tsx
// src/schemas/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
```

### Login Form Component
```tsx
// src/pages/LoginPage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginSchema, LoginFormData } from '@/schemas/auth';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data.email, data.password),
    onSuccess: (response) => {
      login(response.token, response.user);
      navigate('/');
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Sign in to CloudForge
          </h2>
        </div>

        {loginMutation.isError && (
          <Alert variant="error">
            {loginMutation.error?.message || 'Login failed. Please try again.'}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting || loginMutation.isPending}
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};
```

### Checkout Form (Multi-step)
```tsx
// src/pages/CheckoutPage.tsx
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, CheckoutFormData } from '@/schemas/checkout';
import { ShippingStep } from '@/components/checkout/ShippingStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { ReviewStep } from '@/components/checkout/ReviewStep';

const steps = ['Shipping', 'Payment', 'Review'];

export const CheckoutPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const methods = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Step Indicator */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center
              ${index <= currentStep ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
              {index + 1}
            </div>
            <span className="ml-2">{step}</span>
          </div>
        ))}
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          {currentStep === 0 && <ShippingStep onNext={nextStep} />}
          {currentStep === 1 && <PaymentStep onNext={nextStep} onBack={prevStep} />}
          {currentStep === 2 && <ReviewStep onBack={prevStep} />}
        </form>
      </FormProvider>
    </div>
  );
};
```

---

## 🔐 Authentication Flow

### Protected Route Component
```tsx
// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### Token Refresh Logic
```tsx
// src/services/api.ts
import axios from 'axios';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await api.post('/auth/refresh', { refreshToken });
        
        localStorage.setItem('token', data.token);
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        processQueue(null, data.token);
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

---

## ⚠️ Error Handling

### Error Boundary
```tsx
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Send to error tracking service (Sentry, LogRocket, etc.)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler
```tsx
// src/utils/errorHandler.ts
import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    
    // Handle validation errors
    if (apiError?.details) {
      const messages = Object.values(apiError.details).flat();
      messages.forEach((msg) => toast.error(msg));
      return messages[0];
    }
    
    // Handle known error codes
    switch (apiError?.code) {
      case 'USER_NOT_FOUND':
        return 'User not found';
      case 'INVALID_CREDENTIALS':
        return 'Invalid email or password';
      case 'INSUFFICIENT_STOCK':
        return 'Product is out of stock';
      default:
        return apiError?.message || 'An error occurred';
    }
  }
  
  return 'An unexpected error occurred';
};
```

### Query Error Handler
```tsx
// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { handleApiError } from '@/utils/errorHandler';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    onError: (error) => {
      const message = handleApiError(error);
      toast.error(message);
    },
  });
};
```

---

## ⚡ Performance Optimization

### React.memo for Lists
```tsx
// src/components/features/ProductCard.tsx
import { memo } from 'react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
}

export const ProductCard = memo<ProductCardProps>(({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      {/* ... */}
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
```

### useMemo and useCallback
```tsx
// src/pages/ProductsPage.tsx
import { useMemo, useCallback } from 'react';

export const ProductsPage = () => {
  const [filters, setFilters] = useState<Filters>({});
  const { data } = useProducts(filters);

  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    if (!data?.content) return [];
    return data.content.filter(p => p.stock > 0);
  }, [data]);

  // Memoize callback
  const handleAddToCart = useCallback((productId: string) => {
    addToCart.mutate(productId);
  }, [addToCart]);

  return (
    <div>
      {filteredProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
};
```

### Virtual Lists for Large Data
```tsx
// src/components/features/ProductList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export const VirtualProductList = ({ products }: { products: Product[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated row height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ProductCard product={products[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Image Lazy Loading
```tsx
// src/components/ui/LazyImage.tsx
import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholder = '/placeholder.jpg',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isInView ? src : placeholder}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity`}
      onLoad={() => setIsLoaded(true)}
      loading="lazy"
    />
  );
};
```

### Code Splitting with Suspense
```tsx
// src/App.tsx
import { Suspense, lazy } from 'react';
import { Spinner } from '@/components/ui/Spinner';

// Lazy load heavy components
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const Analytics = lazy(() => import('@/pages/admin/Analytics'));
const Reports = lazy(() => import('@/pages/admin/Reports'));

export const App = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/reports" element={<Reports />} />
      </Routes>
    </Suspense>
  );
};
```

---

## ♿ Accessibility

### Accessible Button
```tsx
// src/components/ui/Button.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        ghost: 'hover:bg-gray-100 focus:ring-gray-500',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### Accessible Modal
```tsx
// src/components/ui/Modal.tsx
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="text-xl font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};
```

### Skip to Content Link
```tsx
// src/components/layout/SkipLink.tsx
export const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
               bg-indigo-600 text-white px-4 py-2 rounded z-50"
  >
    Skip to main content
  </a>
);
```

---

## 🎨 UI Components Library

### Input Component
```tsx
// src/components/ui/Input.tsx
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            block w-full rounded-md border-gray-300 shadow-sm
            focus:border-indigo-500 focus:ring-indigo-500
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### Toast Notifications
```tsx
// src/components/ui/Toaster.tsx
import { Toaster as HotToaster } from 'react-hot-toast';

export const Toaster = () => (
  <HotToaster
    position="top-right"
    toastOptions={{
      duration: 4000,
      style: {
        background: '#333',
        color: '#fff',
      },
      success: {
        iconTheme: {
          primary: '#10B981',
          secondary: '#fff',
        },
      },
      error: {
        iconTheme: {
          primary: '#EF4444',
          secondary: '#fff',
        },
      },
    }}
  />
);
```

### Alert Component
```tsx
// src/components/ui/Alert.tsx
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cva, VariantProps } from 'class-variance-authority';

const alertVariants = cva(
  'p-4 rounded-md flex items-start gap-3',
  {
    variants: {
      variant: {
        info: 'bg-blue-50 text-blue-800',
        success: 'bg-green-50 text-green-800',
        warning: 'bg-yellow-50 text-yellow-800',
        error: 'bg-red-50 text-red-800',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

interface AlertProps extends VariantProps<typeof alertVariants> {
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'info', children }) => {
  const Icon = icons[variant];

  return (
    <div className={alertVariants({ variant })} role="alert">
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
};
```

---

## 🎬 Animations

### Framer Motion Animations
```tsx
// src/components/features/AnimatedProductCard.tsx
import { motion } from 'framer-motion';

export const AnimatedProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      {/* Card content */}
    </motion.div>
  );
};
```

### Page Transitions
```tsx
// src/components/layout/PageTransition.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
```

### Skeleton Loading
```tsx
// src/components/ui/Skeleton.tsx
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    aria-hidden="true"
  />
);

// Usage
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <Skeleton className="h-48 w-full mb-4" />
    <Skeleton className="h-6 w-3/4 mb-2" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);
```

---

## 📦 Package.json Dependencies

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@tanstack/react-query": "^5.17.0",
    "@tanstack/react-virtual": "^3.0.0",
    "axios": "^1.6.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "framer-motion": "^10.18.0",
    "lucide-react": "^0.312.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.3",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.21.3",
    "tailwind-merge": "^2.2.0",
    "zod": "^3.22.4",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.1",
    "@tanstack/react-query-devtools": "^5.17.0",
    "@testing-library/react": "^14.1.2",
    "@types/react": "^18.2.48",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12",
    "vitest": "^1.2.1"
  }
}
```

