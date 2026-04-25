# Authentication Guide

## Overview

CloudForge uses JWT (JSON Web Token) based authentication with centralized validation at the API Gateway. This guide explains how authentication works and how to implement it in your applications.

## Architecture

```
Client → API Gateway → Downstream Services
         (JWT Validation)
         (Add X-User-Id Header)
```

### Components

1. **User Service**: Generates and validates JWT tokens
2. **API Gateway**: Validates tokens and adds user context headers
3. **Downstream Services**: Use X-User-Id header for user identification

## Authentication Flow

### 1. User Login

**Request:**
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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huLmRvZSIsInVzZXJJZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTcxMzUyMDgwMCwiZXhwIjoxNzEzNjA3MjAwfQ.signature",
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

### 2. Store Token

Store the JWT token securely on the client side:
- **Web**: localStorage or sessionStorage
- **Mobile**: Secure storage (Keychain/Keystore)
- **Server**: Memory or secure cache

**Example (JavaScript):**
```javascript
localStorage.setItem('authToken', response.token);
localStorage.setItem('user', JSON.stringify(response.user));
```

### 3. Include Token in Requests

Add the token to the Authorization header for all authenticated requests:

```http
GET /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example (JavaScript with Axios):**
```javascript
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 4. API Gateway Validation

The API Gateway automatically:
1. Extracts the JWT token from the Authorization header
2. Validates the token signature and expiration
3. Extracts the user ID from the token claims
4. Adds the `X-User-Id` header to the request
5. Forwards the request to the downstream service

### 5. Downstream Service Processing

Downstream services receive the request with the `X-User-Id` header:

```http
GET /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-User-Id: 550e8400-e29b-41d4-a716-446655440000
```

Services can use the `X-User-Id` header for user identification without validating the JWT token.

## JWT Token Structure

### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload (Claims)
```json
{
  "sub": "john.doe",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "role": "USER",
  "iat": 1713520800,
  "exp": 1713607200
}
```

### Claims Explanation

| Claim | Description |
|-------|-------------|
| `sub` | Subject (username) |
| `userId` | User's unique identifier (UUID) |
| `email` | User's email address |
| `role` | User's role (USER, ADMIN) |
| `iat` | Issued at (timestamp) |
| `exp` | Expiration time (timestamp) |

## Token Expiration

- **Default Expiration**: 24 hours (86400000 milliseconds)
- **Refresh**: Not currently implemented (users must re-login)
- **Validation**: Checked on every request by API Gateway

## Public Endpoints

The following endpoints do not require authentication:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/products` | GET | Browse products |
| `/api/products/{id}` | GET | View product details |
| `/swagger-ui/**` | GET | API documentation |
| `/v3/api-docs/**` | GET | OpenAPI specification |
| `/actuator/**` | GET | Health checks |

## Error Handling

### Missing Authorization Header

**Request:**
```http
GET /api/orders
```

**Response:** 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authentication token",
  "status": 401,
  "path": "/api/orders",
  "timestamp": "2026-04-19T10:30:00Z"
}
```

### Invalid Token Format

**Request:**
```http
GET /api/orders
Authorization: InvalidFormat token
```

**Response:** 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid Authorization header format. Expected: Bearer <token>",
  "status": 401,
  "path": "/api/orders",
  "timestamp": "2026-04-19T10:30:00Z"
}
```

### Expired Token

**Request:**
```http
GET /api/orders
Authorization: Bearer <expired-token>
```

**Response:** 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired authentication token",
  "status": 401,
  "path": "/api/orders",
  "timestamp": "2026-04-19T10:30:00Z"
}
```

### Invalid Signature

**Request:**
```http
GET /api/orders
Authorization: Bearer <tampered-token>
```

**Response:** 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired authentication token",
  "status": 401,
  "path": "/api/orders",
  "timestamp": "2026-04-19T10:30:00Z"
}
```

## Client Implementation Examples

### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Python (Requests)

```python
import requests

class APIClient:
    def __init__(self, base_url, token=None):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
        
    def set_token(self, token):
        self.token = token
        self.session.headers.update({
            'Authorization': f'Bearer {token}'
        })
    
    def login(self, username, password):
        response = self.session.post(
            f'{self.base_url}/auth/login',
            json={'username': username, 'password': password}
        )
        response.raise_for_status()
        data = response.json()
        self.set_token(data['token'])
        return data
    
    def get_orders(self):
        response = self.session.get(f'{self.base_url}/orders')
        response.raise_for_status()
        return response.json()

# Usage
client = APIClient('http://localhost:8080/api')
client.login('john.doe', 'Password123!')
orders = client.get_orders()
```

### Java (Spring RestTemplate)

```java
@Component
public class APIClient {
    private final RestTemplate restTemplate;
    private String token;
    
    public APIClient() {
        this.restTemplate = new RestTemplate();
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public <T> T get(String url, Class<T> responseType) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<T> response = restTemplate.exchange(
            url, 
            HttpMethod.GET, 
            entity, 
            responseType
        );
        
        return response.getBody();
    }
}
```

## Security Best Practices

### Client-Side

1. **Store tokens securely**: Use httpOnly cookies or secure storage
2. **Never log tokens**: Avoid logging tokens in console or analytics
3. **Clear tokens on logout**: Remove tokens from storage
4. **Handle 401 errors**: Redirect to login on authentication failure
5. **Use HTTPS**: Always use HTTPS in production

### Server-Side

1. **Use strong secrets**: JWT secret should be at least 256 bits
2. **Rotate secrets**: Periodically rotate JWT secrets
3. **Validate thoroughly**: Check signature, expiration, and claims
4. **Use short expiration**: Balance security and user experience
5. **Implement refresh tokens**: For better security (future enhancement)

## Troubleshooting

### Token Not Working

1. **Check token format**: Must be `Bearer <token>`
2. **Verify token expiration**: Check `exp` claim
3. **Validate JWT secret**: Must match between services
4. **Check token structure**: Decode at jwt.io

### 401 Errors for Valid Token

1. **JWT secret mismatch**: Verify secrets match across services
2. **Token expired**: Check expiration time
3. **Clock skew**: Ensure server clocks are synchronized
4. **Token modified**: Token may have been tampered with

### X-User-Id Header Missing

1. **Check API Gateway logs**: Verify filter is running
2. **Verify token has userId claim**: Decode token and check
3. **Check filter order**: JWT filter should run early (-100)

## Configuration

### Environment Variables

```bash
# User Service
JWT_SECRET=your-secret-key-at-least-256-bits-long
JWT_EXPIRATION=86400000

# API Gateway
JWT_SECRET=your-secret-key-at-least-256-bits-long  # Must match user service
JWT_EXPIRATION=86400000
```

### Application Configuration

**User Service (application.yml):**
```yaml
jwt:
  secret: ${JWT_SECRET:default-secret-key-change-in-production}
  expiration: ${JWT_EXPIRATION:86400000}
```

**API Gateway (application.yml):**
```yaml
jwt:
  secret: ${JWT_SECRET:default-secret-key-change-in-production}
  expiration: ${JWT_EXPIRATION:86400000}
```

## Future Enhancements

1. **Refresh Tokens**: Implement refresh token mechanism
2. **Token Revocation**: Add ability to revoke tokens
3. **Role-Based Access Control**: Implement fine-grained permissions
4. **OAuth2 Integration**: Support OAuth2 providers (Google, GitHub)
5. **Multi-Factor Authentication**: Add MFA support

## Related Documentation

- [API Reference](./api-reference.md)
- [Error Handling](./error-handling.md)
- [Security Best Practices](../security/security.md)
