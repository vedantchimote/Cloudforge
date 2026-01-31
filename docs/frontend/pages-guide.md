# Frontend Pages Guide

Detailed documentation for all CloudForge frontend pages.

---

## 📋 Page Overview

| Page | Route | Auth Required | Description |
|------|-------|---------------|-------------|
| Home | `/` | ❌ | Landing page with featured products |
| Products | `/products` | ❌ | Product listing with filters |
| Product Detail | `/products/:id` | ❌ | Single product view |
| Cart | `/cart` | ❌ | Shopping cart |
| Checkout | `/checkout` | ✅ | Multi-step checkout |
| Orders | `/orders` | ✅ | Order history |
| Order Detail | `/orders/:id` | ✅ | Single order view |
| Profile | `/profile` | ✅ | User profile settings |
| Login | `/login` | ❌ | Authentication |
| Register | `/register` | ❌ | New user registration |

---

## 🏠 HomePage

### Purpose
Landing page showcasing featured products, categories, and promotional content.

### Component Structure
```tsx
HomePage/
├── HeroSection        # Main banner with CTA
├── FeaturedProducts   # Top products carousel
├── CategoryGrid       # Product categories
├── PromoBanner        # Special offers
└── NewsletterSignup   # Email subscription
```

### Implementation
```tsx
// src/pages/HomePage.tsx
import { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { PromoBanner } from '@/components/home/PromoBanner';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';

export const HomePage: FC = () => {
  const { data: featured, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productService.getFeatured(8),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  });

  return (
    <main className="min-h-screen">
      <HeroSection />
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Featured Products
          </h2>
          <FeaturedProducts 
            products={featured?.content ?? []} 
            loading={isLoading} 
          />
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Shop by Category
          </h2>
          <CategoryGrid categories={categories ?? []} />
        </div>
      </section>

      <PromoBanner />
      <NewsletterSignup />
    </main>
  );
};

export default HomePage;
```

### Hero Section
```tsx
// src/components/home/HeroSection.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const HeroSection = () => (
  <section className="relative h-[600px] bg-gradient-to-r from-indigo-600 to-purple-600">
    <div className="absolute inset-0 bg-black/20" />
    <div className="relative container mx-auto px-4 h-full flex items-center">
      <div className="max-w-xl text-white">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to CloudForge
        </h1>
        <p className="text-xl mb-8 text-white/90">
          Discover premium products at unbeatable prices.
          Shop the latest trends with free shipping on orders over $50.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg" variant="secondary">
            <Link to="/products">Shop Now</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-white border-white">
            <Link to="/categories">Browse Categories</Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);
```

---

## 🛍️ ProductsPage

### Purpose
Browse and filter product catalog with pagination.

### Features
- Category filtering
- Price range filter
- Search
- Sort options
- Grid/List view toggle
- Infinite scroll or pagination

### Implementation
```tsx
// src/pages/ProductsPage.tsx
import { FC, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/features/ProductGrid';
import { ProductFilters } from '@/components/features/ProductFilters';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { ProductFilters as Filters } from '@/types/product';

export const ProductsPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const filters: Filters = {
    category: searchParams.get('category') || undefined,
    search: searchParams.get('q') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sort: searchParams.get('sort') || 'createdAt,desc',
    page: Number(searchParams.get('page')) || 0,
    size: 12,
  };

  const { data, isLoading, error } = useProducts(filters);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    params.set('page', '0'); // Reset to first page
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600">Failed to load products. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilters
            filters={filters}
            onChange={handleFilterChange}
          />
        </aside>

        {/* Product Listing */}
        <main className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {data ? `${data.totalElements} products found` : 'Loading...'}
            </p>
            <div className="flex items-center gap-4">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange({ sort: e.target.value })}
                className="border rounded-md px-3 py-2"
              >
                <option value="createdAt,desc">Newest</option>
                <option value="price,asc">Price: Low to High</option>
                <option value="price,desc">Price: High to Low</option>
                <option value="name,asc">Name: A-Z</option>
              </select>
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>
          </div>

          {/* Products */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : (
            <ProductGrid 
              products={data?.content ?? []} 
              viewMode={viewMode}
            />
          )}

          {/* Pagination */}
          {data && (
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
              className="mt-8"
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
```

---

## 📦 ProductDetailPage

### Purpose
Display complete product information with add-to-cart functionality.

### Features
- Image gallery with zoom
- Product variants
- Quantity selector
- Add to cart
- Related products
- Reviews section

### Implementation
```tsx
// src/pages/ProductDetailPage.tsx
import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProduct } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { ImageGallery } from '@/components/features/ImageGallery';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { Button } from '@/components/ui/Button';
import { RelatedProducts } from '@/components/features/RelatedProducts';
import { ProductReviews } from '@/components/features/ProductReviews';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { formatCurrency } from '@/utils/formatCurrency';
import { toast } from 'react-hot-toast';

export const ProductDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id!);
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrls[0],
    });
    
    toast.success(`${product.name} added to cart!`);
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: product.category, href: `/products?category=${product.categoryId}` },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
        {/* Image Gallery */}
        <ImageGallery images={product.imageUrls} alt={product.name} />

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          
          <div className="mt-4 flex items-center gap-4">
            <span className="text-3xl font-bold text-indigo-600">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xl text-gray-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="mt-4">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          <p className="mt-6 text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity & Add to Cart */}
          <div className="mt-8 flex items-center gap-4">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={product.stock}
            />
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              size="lg"
              className="flex-1"
            >
              Add to Cart
            </Button>
          </div>

          {/* Product Details */}
          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg font-semibold mb-4">Product Details</h3>
            <dl className="space-y-2">
              {Object.entries(product.attributes || {}).map(([key, value]) => (
                <div key={key} className="flex">
                  <dt className="w-32 text-gray-500">{key}:</dt>
                  <dd className="text-gray-900">{value as string}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts categoryId={product.categoryId} excludeId={product.id} />

      {/* Reviews */}
      <ProductReviews productId={product.id} />
    </div>
  );
};

export default ProductDetailPage;
```

---

## 🛒 CartPage

### Purpose
Manage shopping cart items before checkout.

### Features
- Item quantity adjustment
- Remove items
- Cart summary
- Shipping estimate
- Continue to checkout

### Implementation
```tsx
// src/pages/CartPage.tsx
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from '@/components/features/CartItem';
import { CartSummary } from '@/components/features/CartSummary';
import { Button } from '@/components/ui/Button';
import { ShoppingBag } from 'lucide-react';

export const CartPage: FC = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-600 mb-8">
          Looks like you haven't added anything yet.
        </p>
        <Button asChild>
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow divide-y">
            {items.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onUpdateQuantity={(quantity) => updateQuantity(item.productId, quantity)}
                onRemove={() => removeItem(item.productId)}
              />
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <Button variant="ghost" onClick={clearCart}>
              Clear Cart
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <CartSummary
            subtotal={totalPrice()}
            shipping={totalPrice() >= 50 ? 0 : 5.99}
            tax={totalPrice() * 0.08}
          />
          <Button asChild className="w-full mt-4" size="lg">
            <Link to="/checkout">Proceed to Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
```

---

## 💳 CheckoutPage

### Purpose
Multi-step checkout process.

### Steps
1. **Shipping** - Address information
2. **Payment** - Payment method selection
3. **Review** - Order confirmation

### Implementation
```tsx
// src/pages/CheckoutPage.tsx
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { checkoutSchema, CheckoutFormData } from '@/schemas/checkout';
import { orderService } from '@/services/orderService';
import { useCartStore } from '@/store/cartStore';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { ShippingStep } from '@/components/checkout/ShippingStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { ReviewStep } from '@/components/checkout/ReviewStep';
import { OrderConfirmation } from '@/components/checkout/OrderConfirmation';

const steps = ['Shipping', 'Payment', 'Review'] as const;

export const CheckoutPage: FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { items, clearCart, totalPrice } = useCartStore();

  const methods = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
    defaultValues: {
      shipping: {},
      payment: { method: 'card' },
    },
  });

  const createOrder = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: (order) => {
      setOrderId(order.id);
      clearCart();
    },
  });

  const nextStep = async () => {
    const stepFields = {
      0: ['shipping.firstName', 'shipping.lastName', 'shipping.address', 'shipping.city', 'shipping.zipCode'],
      1: ['payment.method', 'payment.cardNumber'],
    };

    const fields = stepFields[currentStep as keyof typeof stepFields];
    if (fields) {
      const isValid = await methods.trigger(fields as any);
      if (!isValid) return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: CheckoutFormData) => {
    await createOrder.mutateAsync({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      shippingAddress: `${data.shipping.address}, ${data.shipping.city}, ${data.shipping.zipCode}`,
      paymentMethod: data.payment.method,
    });
  };

  // Order confirmed
  if (orderId) {
    return <OrderConfirmation orderId={orderId} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CheckoutProgress steps={steps} currentStep={currentStep} />

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="mt-8">
              {currentStep === 0 && (
                <ShippingStep onNext={nextStep} />
              )}
              {currentStep === 1 && (
                <PaymentStep onNext={nextStep} onBack={prevStep} />
              )}
              {currentStep === 2 && (
                <ReviewStep
                  onBack={prevStep}
                  isSubmitting={createOrder.isPending}
                />
              )}
            </form>
          </FormProvider>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <CheckoutSidebar items={items} total={totalPrice()} />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
```

---

## 📜 OrdersPage

### Purpose
Display user's order history.

### Implementation
```tsx
// src/pages/OrdersPage.tsx
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/orderService';
import { OrderCard } from '@/components/features/OrderCard';
import { Spinner } from '@/components/ui/Spinner';
import { Package } from 'lucide-react';

export const OrdersPage: FC = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getMyOrders,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No orders yet
        </h2>
        <p className="text-gray-600 mb-8">
          Start shopping to see your orders here.
        </p>
        <Link to="/products" className="text-indigo-600 hover:underline">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
```

---

## 📚 Related Docs

- [React Development Guide](react-development.md)
- [Component Library](components.md)
- [Testing Strategy](testing-strategy.md)
