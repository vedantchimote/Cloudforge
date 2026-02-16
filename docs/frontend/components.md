---
title: "Components"
description: "Reusable UI Components"
---

# Frontend Components

This page documents the key reusable components and page components in the CloudForge frontend.

## Layout Components

### Header

A comprehensive Amazon-style navigation bar.

**Features:**
- Logo with orange accent
- Search bar with category dropdown
- Delivery location indicator
- Account & Lists dropdown menu
- Returns & Orders link
- Shopping Cart with item count badge
- Secondary navigation bar with categories

### Footer

Feature-rich footer with site links and utilities.

**Features:**
- Back to top button
- Categorized links (Get to Know Us, Connect with Us, etc.)
- Copyright and branding

---

## Page Components

### HomePage

Landing page with Amazon-style layout.

**Sections:**
1. **Hero Banner** - Gradient background with CTA
2. **Category Cards** - Grid of product categories
3. **Today's Deals** - Horizontal list of discounted products
4. **Featured Products** - Grid of promote products
5. **Trust Badges** - Icons for delivery, secure payment, returns

### ProductsPage

Product catalog with advanced filtering.

**Features:**
- Sidebar filters (Category, Price Range, Rating, Prime)
- Sorting options (Price Low/High, Newest, Featured)
- Grid/List view toggle
- Search results header
- Responsive layout with mobile filter drawer

### ProductDetailPage

Detailed product view.

**Features:**
- Image gallery with main view and thumbnails
- Product details (Price, Rating, Description)
- "Add to Cart" and "Buy Now" buttons
- Quantity selector
- Trust badges (Free Delivery, Warranty)

### CartPage

Shopping cart management.

**Features:**
- List of added items with images and prices
- Quantity updates and item removal
- Cart subtotal calculation
- "Proceed to Buy" button

### CheckoutPage

Secure checkout process.

**Steps:**
1. **Shipping Address** - Form with validation
2. **Payment** - Razorpay integration options
3. **Order Summary** - Final cost breakdown

### OrdersPage

User's order history.

**Features:**
- List of past orders
- Order status badges (Processing, Shipped, Delivered)
- Order totals and dates
- Link to order details

### AccountPage

User account management and profile.

**Features:**
- User profile information (username, email, role)
- Account status and member since date
- Quick action buttons (Orders, Cart)
- Sign out functionality

---

## Informational Pages

### AboutPage

Company information and values.

**Sections:**
- Company story and mission
- Technology stack showcase
- Core values (Innovation, Reliability, Security)
- Backend and frontend tech details

### CareersPage

Career opportunities at CloudForge.

**Features:**
- Why work with us section
- Open positions with job details
- Apply now buttons
- Contact for unlisted roles

### PressPage

Press releases and media information.

**Features:**
- Latest press releases with dates
- Read more links for each release
- Media contact information

### SellPage

Seller program information.

**Features:**
- Benefits of selling on CloudForge
- How it works (3-step process)
- Large customer base highlights
- Registration CTA

### AffiliatePage

Affiliate program details.

**Features:**
- 10% commission rate highlight
- 30-day cookie tracking
- How it works (4-step process)
- Who can join section

### AdvertisePage

Advertising solutions for businesses.

**Features:**
- Sponsored products and display ads
- Why advertise section
- Getting started guide
- Campaign creation CTA

### ShippingPage

Shipping information and policies.

**Features:**
- Shipping options with rates (Standard, Express, Free, Next-Day)
- Processing time and delivery areas
- Order tracking information
- FAQs section

### ReturnsPage

Return and replacement policies.

**Features:**
- 30-day return policy highlight
- Step-by-step return process
- Eligible and non-returnable items
- Replacement process for defective items
- FAQs section

### HelpPage

Comprehensive help center.

**Features:**
- Search functionality
- Browse help topics by category
- Frequently asked questions
- Contact options (Email, Phone, Live Chat)
- Icons from Lucide React

---

## Reusable Components

### ProductCard

Standard product display component.

**Props:**
- `id`, `name`, `price`, `imageUrl`
- `rating`: Displays star rating
- `dealBadge`: Optional text for deals
- `isPrime`: Boolean to show Prime badge

### CartItem

Row component for the shopping cart.

**Features:**
- Product thumbnail and title
- Quantity +/- controls
- Delete action
- Price calculation

### RazorpayButton

Wrapper component for the Razorpay checkout modal.

**Props:**
- `amount`: Transaction amount
- `onSuccess`: Callback for successful payment
- `onFailure`: Callback for failed/cancelled payment

### AddressForm

Reusable form for capturing shipping/billing addresses with validation.

**Features:**
- Zod schema validation
- Indian state/city selection help
- Integrated with React Hook Form

---

## Type Definitions

Key interfaces in `src/types/index.ts`:

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  // ...
}

interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: Address;
  // ...
}
```
