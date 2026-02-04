---
title: "Components"
description: "Reusable UI Components"
---

# Frontend Components

This page documents the key reusable components and page components in the CloudForge frontend.

## Layout Components

### Navbar

A responsive navigation bar with authentication awareness.

**Features:**
- Logo with gradient text
- Desktop navigation links (Home, Products)
- Auth state display (Welcome message or Sign In button)
- Logout functionality
- Mobile hamburger menu

**Usage:**
```tsx
<Navbar />
```

The Navbar is rendered on all pages except the login page, configured in `App.tsx`.

---

## Page Components

### LoginPage

Combined login and registration page with form validation.

**Features:**
- Tab toggle between Sign In and Sign Up
- Form validation using `react-hook-form` + `zod`
- Password visibility toggle
- Error message display
- Loading spinner during submission
- Auto-redirect on successful auth

**Forms:**
| Form | Fields |
| :--- | :--- |
| Login | username, password |
| Register | firstName, lastName, username, email, password |

---

### HomePage

Landing page showcasing the platform.

**Sections:**
1. **Hero** - Gradient headline, tagline, CTA buttons
2. **Features** - 3 feature cards (Fast, Secure, Delivery)
3. **Categories** - 4 category cards with gradient backgrounds
4. **Stats** - Platform statistics in glass card
5. **CTA** - Call to action for non-authenticated users
6. **Footer** - Branding and copyright

---

### ProductsPage

Product catalog with filtering and search.

**Features:**
- Search input
- Category filter buttons (All, Electronics, Clothing, etc.)
- Grid/List view toggle
- Product cards with hover effects
- Skeleton loading state
- Pagination (when API returns multiple pages)

**Product Card displays:**
- Product image placeholder
- Name
- Description (truncated)
- Price (gradient text)
- Stock status badge

---

### ProductDetailPage

Single product view with full details.

**Layout:**
- Back navigation link
- Image gallery (main image + thumbnails)
- Product tags
- Title and rating stars
- Price
- Description (multi-line)
- Stock status indicator
- Action buttons (Add to Cart, Wishlist, Share)
- Feature badges (Free Shipping, Warranty, Returns)
- SKU and Category info

---

## Type Definitions

Located in `src/types/index.ts`:

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'USER' | 'ADMIN';
  enabled: boolean;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  images: string[];
  tags: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
```
