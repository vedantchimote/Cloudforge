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
| **Zustand** | Lightweight state management |
| **TanStack Query** | Server state & caching |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client |
| **React Hook Form + Zod** | Form handling & validation |
| **Lucide React** | Icon library |

## Project Structure

```bash
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   └── Navbar.tsx
│   ├── pages/          # Route page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProductsPage.tsx
│   │   └── ProductDetailPage.tsx
│   ├── services/       # API layer
│   │   ├── api.ts           # Axios instance with interceptors
│   │   ├── authService.ts   # Auth API calls
│   │   └── productService.ts # Product API calls
│   ├── store/          # Zustand stores
│   │   └── authStore.ts
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
| `/` | HomePage | Landing page with hero, features, categories |
| `/login` | LoginPage | Login/Register forms |
| `/products` | ProductsPage | Product catalog with filters |
| `/products/:id` | ProductDetailPage | Single product view |

## State Management

### Auth Store (Zustand)
Manages authentication state with localStorage persistence:

```typescript
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}
```

### Server State (React Query)
Product data is fetched and cached using TanStack Query:

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['products', category, page],
  queryFn: () => productService.getProducts(page, 12),
});
```

## API Integration

### Axios Configuration (`api.ts`)
- Base URL set via Vite proxy (see below)
- Request interceptor adds JWT token from auth store
- Response interceptor handles 401 errors (auto-logout)

### Vite Proxy (`vite.config.ts`)
API requests are proxied to avoid CORS issues in development:

```typescript
proxy: {
  '/api/users': { target: 'http://localhost:8081' },
  '/api/auth': { target: 'http://localhost:8081' },
  '/api/products': { target: 'http://localhost:8082' },
}
```

## Design System

The UI uses a custom dark theme with glassmorphism effects defined in `index.css`:

### CSS Variables
```css
:root {
  --primary: #6366f1;
  --secondary: #8b5cf6;
  --accent: #06b6d4;
  --background: #0f172a;
  --surface: #1e293b;
  --text: #f8fafc;
  --text-muted: #94a3b8;
}
```

### Utility Classes
- `.glass` - Glassmorphism card effect with blur backdrop
- `.gradient-text` - Gradient text effect
- `.btn-primary` - Primary action button with gradient and hover effects
- `.btn-secondary` - Secondary button with border
- `.input` - Styled form input
- `.card` - Surface card with hover animation
- `.skeleton` - Loading skeleton animation
