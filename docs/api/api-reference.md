---
title: "API Reference"
description: "Complete REST API documentation for CloudForge microservices"
icon: "book"
---

# API Reference

Complete REST API documentation for all CloudForge microservices.

---

## 🔗 Base URLs

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:8080` |
| Development | `https://dev-api.cloudforge.io` |
| Production | `https://api.cloudforge.io` |

---

## 🔐 Authentication

CloudForge uses JWT (JSON Web Token) based authentication. The API Gateway handles authentication and adds user context to downstream requests.

### Authentication Flow

1. **Login**: User authenticates with username/password
2. **Token Generation**: User service generates JWT token with user ID
3. **Token Storage**: Frontend stores token in localStorage
4. **Request Authentication**: Frontend includes token in Authorization header
5. **Gateway Validation**: API Gateway validates token and extracts user ID
6. **Header Injection**: Gateway adds `X-User-Id` header to downstream requests
7. **Service Processing**: Downstream services use `X-User-Id` for user context

### JWT Token Structure

```json
{
  "sub": "username",
  "userId": "user-uuid",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Authentication Header

All authenticated endpoints require the JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

**Example:**
```http
GET /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### X-User-Id Header (Internal)

The API Gateway automatically adds the `X-User-Id` header to all authenticated requests before forwarding to downstream services. This header contains the user ID extracted from the JWT token.

**Note**: This header is added by the API Gateway and should not be included in client requests. Downstream services can rely on this header for user identification.

```http
X-User-Id: 550e8400-e29b-41d4-a716-446655440000
```

### Public Endpoints (No Authentication Required)

The following endpoints do not require authentication:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/products` - Browse products
- `GET /api/products/{id}` - View product details
- `GET /swagger-ui/**` - API documentation
- `GET /v3/api-docs/**` - OpenAPI specification

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john.doe",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }
}
```

### Token Expiration

JWT tokens expire after 24 hours (86400000 milliseconds). After expiration, users must re-authenticate to obtain a new token.

### Authentication Errors

#### 401 Unauthorized - Missing Token
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authentication token",
  "status": 401,
  "path": "/api/orders",
  "timestamp": "2026-04-19T10:30:00Z"
}
```

#### 401 Unauthorized - Invalid Token
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired authentication token",
  "status": 401,
  "path": "/api/orders",
  "timestamp": "2026-04-19T10:30:00Z"
}
```

#### 401 Unauthorized - Expired Token
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired authentication token",
  "status": 401,
  "path": "/api/orders",
  "timestamp": "2026-04-19T10:30:00Z"
}
```

---

## 👤 User Service (Port 8081)

### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

### Register User
```http
POST /api/users
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Update User
```http
PUT /api/users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe"
}
```

---

## 📦 Product Service (Port 8082)

### List Products
```http
GET /api/products?page=0&size=20&sort=name,asc
```

**Response:**
```json
{
  "content": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "Description",
      "price": 99.99,
      "stock": 100,
      "category": "Electronics"
    }
  ],
  "totalPages": 5,
  "totalElements": 100
}
```

### Get Product
```http
GET /api/products/{id}
```

### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 149.99,
  "stock": 50,
  "categoryId": "uuid"
}
```

### List Categories
```http
GET /api/categories
```

---

## 🛒 Order Service (Port 8083)

### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 2
    }
  ],
  "shippingAddress": "123 Main St, Apt 4B",
  "shippingCity": "Mumbai",
  "shippingState": "Maharashtra",
  "shippingZip": "400001",
  "shippingCountry": "India",
  "notes": "John Doe | +91 9876543210"
}
```

**Note**: The `userId` is automatically extracted from the JWT token by the API Gateway and added as the `X-User-Id` header. Do not include `userId` in the request body.

**Response:**
```json
{
  "id": "order-uuid",
  "userId": "user-uuid",
  "status": "PENDING",
  "totalAmount": 299.98,
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "price": 149.99
    }
  ],
  "shippingAddress": "123 Main St, Apt 4B",
  "shippingCity": "Mumbai",
  "shippingState": "Maharashtra",
  "shippingZip": "400001",
  "shippingCountry": "India",
  "notes": "John Doe | +91 9876543210",
  "createdAt": "2026-04-19T10:30:00Z"
}
```

### Get Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

### Add to Cart
```http
POST /api/cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "uuid",
  "quantity": 2
}
```

### Get User Orders
```http
GET /api/orders/user/{userId}
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "order-uuid",
    "userId": "user-uuid",
    "status": "COMPLETED",
    "totalAmount": 299.98,
    "createdAt": "2026-04-19T10:30:00Z"
  }
]
```

### Get Order Details
```http
GET /api/orders/{id}
Authorization: Bearer <token>
```

---

## 💳 Payment Service (Port 8084)

### Process Payment
```http
POST /api/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "uuid",
  "amount": 199.99,
  "paymentMethod": "CREDIT_CARD"
}
```

### Get Payment Status
```http
GET /api/payments/{id}
Authorization: Bearer <token>
```

### Request Refund
```http
POST /api/refunds
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentId": "uuid",
  "reason": "Product damaged"
}
```

---

## 🔔 Notification Service (Port 8085)

### Send Notification
```http
POST /api/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "uuid",
  "type": "ORDER_CONFIRMATION",
  "channel": "EMAIL",
  "recipient": "user@example.com",
  "subject": "Order Confirmed",
  "content": "Your order #123 has been placed."
}
```

### Get Notification
```http
GET /api/notifications/{id}
Authorization: Bearer <token>
```

### Get User Notifications
```http
GET /api/notifications/user/{userId}?page=0&size=10
Authorization: Bearer <token>
```

### Get User Notifications by Type
```http
GET /api/notifications/user/{userId}/type/{type}
Authorization: Bearer <token>
```

### Send Welcome Email (Test)
```http
POST /api/notifications/welcome?userId={uuid}&email={email}&name={name}
Authorization: Bearer <token>
```

---

## ❌ Error Responses

All errors follow a consistent format provided by the API Gateway:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "errors": ["Optional array of validation errors"],
  "path": "/api/endpoint",
  "status": 400,
  "timestamp": "2026-04-19T10:30:00Z"
}
```

### Common Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    "shippingAddress: must not be blank",
    "items: must not be empty"
  ],
  "path": "/api/orders",
  "status": 400,
  "timestamp": "2026-04-19T10:30:00Z"
}
```

#### 401 Unauthorized - Authentication Required
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authentication token",
  "path": "/api/orders",
  "status": 401,
  "timestamp": "2026-04-19T10:30:00Z"
}
```

#### 403 Forbidden - Access Denied
```json
{
  "error": "Forbidden",
  "message": "Access denied",
  "path": "/api/admin/users",
  "status": 403,
  "timestamp": "2026-04-19T10:30:00Z"
}
```

#### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found",
  "path": "/api/orders/invalid-id",
  "status": 404,
  "timestamp": "2026-04-19T10:30:00Z"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "path": "/api/orders",
  "status": 500,
  "timestamp": "2026-04-19T10:30:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data or validation failure |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Authenticated but not authorized for this resource |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Service temporarily unavailable |

---

## 📄 OpenAPI/Swagger

Access interactive API documentation:
- Local: `http://localhost:8081/swagger-ui.html`
