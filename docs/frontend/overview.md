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


## Docker Deployment

The frontend is fully containerized using a **multi-stage Docker build** for optimal production deployment.

### Docker Architecture

**Stage 1: Build (Node.js 18 Alpine)**
- Installs dependencies with `npm ci`
- Builds production-optimized React bundle with Vite
- Generates static assets in `/dist`

**Stage 2: Production (Nginx 1.25 Alpine)**
- Serves static files with Nginx
- Proxies `/api/*` requests to API Gateway
- Includes security headers and gzip compression
- Final image size: ~50MB (96% smaller than build stage)

### Key Features

✅ **Production-Optimized**
- Minified JavaScript and CSS
- Tree-shaking for smaller bundles
- Code splitting for faster loads

✅ **Nginx Configuration**
- API proxy to backend (`/api/*` → `http://api-gateway:8080`)
- React Router support (serves `index.html` for all routes)
- Static asset caching (1 year for JS/CSS/images)
- Gzip compression enabled

✅ **Security**
- Non-root user execution
- Security headers (X-Frame-Options, CSP, etc.)
- Minimal Alpine base image

✅ **Health Monitoring**
- Health check endpoint at `/health`
- Container health monitoring
- Automatic restart on failure

### Running with Docker

```bash
# Build the image
docker build -t cloudforge-frontend:latest ./frontend

# Run standalone
docker run -d -p 3000:80 cloudforge-frontend:latest

# Or use Docker Compose (recommended)
cd infrastructure/docker
docker-compose up -d frontend
```

### Access Points

- **Frontend**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Proxy**: http://localhost:3000/api/* → Backend

### Docker Compose Integration

The frontend is integrated with all backend services in `docker-compose.yml`:

```yaml
frontend:
  build:
    context: ../../frontend
    dockerfile: Dockerfile
  container_name: cloudforge-frontend
  ports:
    - "3000:80"
  depends_on:
    api-gateway:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/health"]
    interval: 30s
    timeout: 10s
    retries: 3
  networks:
    - cloudforge-net
```

### CI/CD Pipeline

GitHub Actions workflow automatically:
1. Builds the Docker image
2. Runs container tests
3. Scans for vulnerabilities with Trivy
4. Pushes to Docker Hub (on main branch)

See `.github/workflows/frontend-docker.yml` for details.

## Development vs Production

### Development Mode (Vite Dev Server)

```bash
cd frontend
npm install
npm run dev
```

- Port: 5173
- Hot Module Replacement (HMR)
- Source maps enabled
- API proxy in `vite.config.ts`

### Production Mode (Docker + Nginx)

```bash
cd infrastructure/docker
docker-compose up -d frontend
```

- Port: 3000 (mapped to container port 80)
- Optimized build
- Gzip compression
- Static file caching
- API proxy in `nginx.conf`

## Performance Optimizations

### Build Optimizations
- Code splitting by route
- Tree-shaking unused code
- Minification of JS/CSS
- Image optimization

### Runtime Optimizations
- React Query caching (5 min stale time)
- Lazy loading of routes
- Memoization of expensive computations
- Debounced search inputs

### Nginx Optimizations
- Gzip compression (text files)
- Static asset caching (1 year)
- HTTP/2 support
- Connection keep-alive

## Testing

### Unit Tests (Vitest)

```bash
npm test
```

Tests for:
- Component rendering
- User interactions
- State management
- API service functions

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

Tests for:
- User registration/login flow
- Product browsing and search
- Cart operations
- Checkout process
- Order placement

## Related Documentation

- [Docker Setup Guide](/infrastructure/docker-setup)
- [Frontend Docker Details](https://github.com/yourusername/cloudforge/blob/main/frontend/DOCKER.md)
- [React Development Guide](/development/react-development)
- [Testing Strategy](/development/testing-strategy)
