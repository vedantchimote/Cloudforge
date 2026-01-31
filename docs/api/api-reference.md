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

All endpoints (except login) require JWT authentication.

```http
Authorization: Bearer <jwt_token>
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "USER"
  }
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

### Place Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "paymentMethodId": "uuid"
}
```

### Get Orders
```http
GET /api/orders
Authorization: Bearer <token>
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

## ❌ Error Responses

All errors follow this format:

```json
{
  "timestamp": "2026-01-31T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/users",
  "errors": [
    {
      "field": "email",
      "message": "must be a valid email"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 📄 OpenAPI/Swagger

Access interactive API documentation:
- Local: `http://localhost:8081/swagger-ui.html`
