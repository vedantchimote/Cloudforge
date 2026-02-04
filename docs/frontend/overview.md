---
title: "Frontend Overview"
description: "React-based User Interface"
---

# Frontend Architecture

The CloudForge frontend is a modern Single Page Application (SPA) built with React 18, TypeScript, and Vite for an exceptional developer and user experience.

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18** | UI component framework |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Fast dev server and build tool |
| **TailwindCSS** | Utility-first styling |
| **Zustand** | Lightweight state management (Auth, Cart) |
| **TanStack Query** | Server state & caching |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client |
| **React Hook Form + Zod** | Form handling & validation |
| **Lucide React** | Icon library |
| **Razorpay** | Payment Gateway |

## Project Structure

```bash
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Header.tsx       # Amazon-style header
│   │   ├── Footer.tsx       # Site footer
│   │   ├── ProductCard.tsx  # Product listing component
│   │   └── CartItem.tsx     # Cart item component
│   ├── pages/          # Route page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── OrdersPage.tsx
│   │   └── OrderConfirmationPage.tsx
│   ├── services/       # API layer
│   │   ├── api.ts           # Axios instance
│   │   ├── authService.ts   # Auth API calls
│   │   ├── productService.ts # Product API calls
│   │   ├── orderService.ts  # Order API calls
│   │   └── paymentService.ts # Razorpay integration
│   ├── store/          # Zustand stores
│   │   ├── authStore.ts     # User session state
│   │   └── cartStore.ts     # Shopping cart state
│   ├── types/          # TypeScript definitions
│   │   └── index.ts
│   ├── App.tsx         # Root component with routing
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles & design system
├── vite.config.ts      # Vite configuration with proxy
└── package.json
```

## Routing

Defined in `App.tsx` using React Router:

| Path | Component | Description |
| :--- | :--- | :--- |
| `/` | HomePage | Amazon-style landing with hero, deals, categories |
| `/login` | LoginPage | Login/Register with light mode design |
| `/products` | ProductsPage | Product catalog with filters & sorting |
| `/products/:id` | ProductDetailPage | Details, image gallery, add to cart |
| `/cart` | CartPage | Shopping cart & summary |
| `/checkout` | CheckoutPage | Address form & Razorpay payment |
| `/orders` | OrdersPage | Order history & status |
| `/order/:id` | OrderConfirmationPage | Order details & success message |

## State Management

### Auth Store (Zustand)
Manages authentication state with localStorage persistence.

### Cart Store (Zustand)
Manages shopping cart state with localStorage persistence:

```typescript
interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}
```

## API Integration

### Axios Configuration (`api.ts`)
- Base URL set via Vite proxy
- Request interceptor adds JWT token
- Response interceptor handles 401 errors

### Services
- **AuthService**: Login, Register
- **ProductService**: List, Search, Details
- **OrderService**: Create, List, Cancel Orders
- **PaymentService**: Razorpay Order Creation & Verification

## Design System

The UI uses a **Light Mode Only** Amazon-inspired design system defined in `index.css`:

### Color Palette
```css
:root {
  --color-primary: #FF9900;      /* Amazon Orange */
  --color-primary-dark: #FF6600; /* Darker Orange */
  --color-background: #ffffff;   /* Pure White */
  --color-surface: #f9fafb;      /* Light Gray */
  --color-text-primary: #111827; /* Near Black */
  --color-link: #007185;         /* Amazon Link Blue */
}
```

### Key UI Elements
- **Header**: White background, orange search button, clear navigation
- **Buttons**: Yellow/Orange gradients for primary actions
- **Cards**: White cards with subtle shadows and hover effects
- **Typography**: Clean sans-serif fonts (Inter)
- **Badges**: Prime (Orange), Deals (Red), Stock (Green)
