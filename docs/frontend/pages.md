---
title: "Frontend Pages"
description: "Complete guide to all CloudForge frontend pages"
---

# Frontend Pages

CloudForge features a comprehensive set of pages covering e-commerce functionality and informational content.

## Core Shopping Pages

### Home Page (`/`)

Amazon-style landing page with multiple sections.

**Features:**
- Hero banner with gradient background and CTA
- Category cards grid (Electronics, Fashion, Home & Kitchen, etc.)
- Today's Deals section with discounted products
- Featured products showcase
- Trust badges (Free Delivery, Secure Payment, Easy Returns)

**Key Components:**
- Responsive grid layout
- Product cards with hover effects
- Category navigation

---

### Products Page (`/products`)

Product catalog with advanced filtering and sorting.

**Features:**
- Sidebar filters:
  - Category selection
  - Price range slider
  - Star rating filter
  - Prime eligible toggle
- Sorting options:
  - Price: Low to High
  - Price: High to Low
  - Newest First
  - Featured
- Grid/List view toggle
- Search results header with count
- Pagination

**Query Parameters:**
- `?category=electronics` - Filter by category
- `?search=laptop` - Search products
- `?page=2` - Pagination

---

### Product Detail Page (`/products/:id`)

Detailed product information and purchase options.

**Features:**
- Image gallery with main view and thumbnails
- Product information:
  - Name and price
  - Star rating and review count
  - Detailed description
  - Stock availability
  - SKU and category
- Action buttons:
  - Add to Cart
  - Buy Now
- Quantity selector
- Trust badges (Free Delivery, Warranty, Easy Returns)

**API Integration:**
- Fetches product by ID from Product Service
- Real-time stock information
- Add to cart functionality

---

### Cart Page (`/cart`)

Shopping cart management and checkout preparation.

**Features:**
- List of cart items with:
  - Product image and name
  - Price per unit
  - Quantity controls (+/-)
  - Remove button
  - Subtotal per item
- Cart summary:
  - Subtotal
  - Estimated tax
  - Total amount
- "Proceed to Checkout" button
- Empty cart state with CTA

**State Management:**
- Zustand cart store with localStorage persistence
- Real-time total calculation
- Quantity validation

---

### Checkout Page (`/checkout`)

Secure checkout process with address and payment.

**Features:**
- Shipping address form:
  - Full name, phone, email
  - Address line 1 & 2
  - City, state, postal code
  - Form validation with Zod
- Order summary:
  - Items list
  - Subtotal, tax, shipping
  - Total amount
- Payment integration:
  - Razorpay payment gateway
  - Multiple payment methods
- Order placement

**Security:**
- Form validation
- Secure payment processing
- JWT authentication required

---

### Orders Page (`/orders`)

User's order history and tracking.

**Features:**
- List of all orders with:
  - Order ID and date
  - Order status badge (Processing, Shipped, Delivered, Cancelled)
  - Total amount
  - Number of items
  - View details link
- Filter by status
- Sort by date
- Empty state for new users

**Order Statuses:**
- 🟡 Processing
- 🔵 Shipped
- 🟢 Delivered
- 🔴 Cancelled

---

### Order Confirmation Page (`/order/:id`)

Order details and confirmation.

**Features:**
- Success message with order ID
- Order summary:
  - Items ordered
  - Quantities and prices
  - Shipping address
  - Payment method
  - Total amount
- Estimated delivery date
- Track order button
- Continue shopping CTA

---

### Account Page (`/account`)

User profile and account management.

**Features:**
- User information:
  - Username
  - Full name
  - Email address
  - Role (USER/ADMIN)
  - Member since date
  - Account status
- Quick actions:
  - View Orders button
  - Go to Cart button
  - Sign Out button
- Profile card with clean layout

**Authentication:**
- Requires login
- Displays LDAP user information
- JWT token validation

---

### Login Page (`/login`)

Authentication page for user login and registration.

**Features:**
- Login form:
  - Username field
  - Password field
  - Remember me checkbox
  - Login button
- LDAP authentication support
- Error handling and validation
- Redirect to home after login

**Authentication Methods:**
- Database users
- LDAP users (OpenLDAP integration)
- JWT token generation

---

## Informational Pages

### About Page (`/about`)

Company information and values.

**Sections:**
1. **Our Story**
   - Company founding and mission
   - Cloud-native e-commerce platform
   - Modern technology focus

2. **Our Mission**
   - Revolutionize online shopping
   - Leverage microservices architecture
   - Fast, reliable, secure transactions

3. **Technology Stack**
   - Backend: Spring Boot, MongoDB, PostgreSQL, Kafka, Redis
   - Frontend: React, TypeScript, Tailwind CSS, Zustand

4. **Our Values**
   - Innovation: Latest technologies
   - Reliability: 99.9% uptime
   - Security: Enterprise-grade with LDAP

---

### Careers Page (`/careers`)

Job openings and career opportunities.

**Features:**
- Why work with us section:
  - Cutting-edge tech stack
  - Remote-first culture
  - Growth opportunities
- Open positions list:
  - Senior Backend Engineer
  - Frontend Developer
  - DevOps Engineer
  - Product Manager
- Each position shows:
  - Title and department
  - Location (Remote/Hybrid)
  - Job type (Full-time)
  - Description
  - Apply Now button
- Contact for unlisted roles

---

### Press Page (`/press`)

Press releases and media information.

**Features:**
- Latest press releases:
  - Microservices architecture launch
  - 99.9% uptime milestone
  - Kafka integration announcement
- Each release includes:
  - Publication date
  - Title and excerpt
  - Read More link
- Media contact section:
  - Email: press@cloudforge.com

---

### Sell Page (`/sell`)

Seller program information and benefits.

**Features:**
- Why sell with us:
  - Large customer base
  - Easy fulfillment
  - Competitive fees
  - Analytics dashboard
- How it works (3 steps):
  1. Create your account
  2. List your products
  3. Start selling
- Registration CTA
- Benefits highlighted with icons

---

### Affiliate Page (`/affiliate`)

Affiliate program details and sign-up.

**Features:**
- Program benefits:
  - 10% commission rate
  - 30-day cookie tracking
  - $0 joining fee
- How it works (4 steps):
  1. Sign up
  2. Get your links
  3. Promote products
  4. Earn commissions
- Who can join:
  - Bloggers and content creators
  - Social media influencers
  - Website owners
  - Email marketers
- Join CTA button

---

### Advertise Page (`/advertise`)

Advertising solutions for businesses.

**Features:**
- Advertising solutions:
  - **Sponsored Products**: Pay-per-click, keyword targeting
  - **Display Ads**: Banner ads, brand awareness
- Why advertise:
  - Targeted reach
  - Measurable results
  - Easy management
- Getting started (3 steps):
  1. Set your budget
  2. Create your campaign
  3. Launch and optimize
- Create campaign CTA

---

### Shipping Page (`/shipping`)

Shipping rates, options, and policies.

**Features:**
- Shipping options:
  - **Standard Shipping**: $5.99 (5-7 days)
  - **Express Shipping**: $12.99 (2-3 days)
  - **FREE Shipping**: $0 on orders over $50
  - **Next-Day Delivery**: $24.99 (order by 2 PM)
- Shipping policies:
  - Processing time (1-2 business days)
  - Delivery areas (US only)
  - Order tracking
  - Shipping restrictions
  - Holiday schedules
- FAQs:
  - Change shipping address
  - Lost or damaged packages
  - International shipping

---

### Returns Page (`/returns`)

Return and replacement policies.

**Features:**
- 30-day return policy highlight
- How to return (4 steps):
  1. Start your return
  2. Print return label
  3. Ship your return
  4. Get your refund
- Return policy details:
  - Eligible items
  - Non-returnable items
  - Refund processing (5-7 days)
- Replacements:
  - Defective items
  - Wrong item received
  - Damaged in shipping
- FAQs:
  - Return shipping costs (FREE)
  - Exchanges
  - Lost receipts
  - Gift returns

---

### Help Page (`/help`)

Comprehensive help center with support options.

**Features:**
- Search functionality for help topics
- Browse help topics:
  - Orders & Tracking
  - Payment & Billing
  - Shipping & Delivery
  - Returns & Refunds
  - Account Settings
  - Product Information
- Frequently Asked Questions:
  - How to track orders
  - Payment methods
  - Shipping times
  - Return policy
  - Password reset
  - Order cancellation
- Contact options:
  - **Email Support**: support@cloudforge.com
  - **Phone Support**: 1-800-CLOUDFORGE (Mon-Fri, 9 AM - 6 PM EST)
  - **Live Chat**: Start chat button
- Icons from Lucide React

---

## Page Navigation

All pages are accessible through:

1. **Header Navigation**
   - Logo → Home
   - Search → Products
   - Account → Account/Login
   - Cart → Cart

2. **Footer Links**
   - Get to Know Us: About, Careers, Press
   - Connect with Us: Social media links
   - Make Money with Us: Sell, Affiliate, Advertise
   - Let Us Help You: Orders, Shipping, Returns, Help

3. **Direct URLs**
   - All pages support direct URL access
   - React Router handles client-side routing
   - Nginx serves index.html for all routes

---

## Design Consistency

All pages follow the CloudForge design system:

**Colors:**
- Primary: #FF9900 (Orange)
- Background: White and light gray
- Text: Dark gray (#111827)

**Layout:**
- Header and Footer on all pages (except Login)
- Consistent spacing and typography
- Responsive design (mobile, tablet, desktop)
- Tailwind CSS utility classes

**Components:**
- Buttons: Orange gradient for primary actions
- Cards: White with subtle shadows
- Forms: Clean inputs with validation
- Icons: Lucide React icon library

---

## Related Documentation

- [Frontend Overview](/frontend/overview)
- [Components Guide](/frontend/components)
- [React Development](/development/react-development)
- [Docker Setup](/infrastructure/docker-setup)
