# Payment Flow Fix - Design

## Architecture Overview

The payment flow involves three main components:
1. **Frontend (React)**: Collects shipping address and initiates order creation
2. **API Gateway**: Routes requests and handles JWT authentication
3. **Order Service**: Creates and manages orders

## Current Flow (Broken)
```
Frontend → API Gateway → Order Service
  (JWT in Authorization header)
                ↓
         Order Service expects X-User-Id header
                ↓
           500 Error (missing header)
```

## Proposed Flow (Fixed)
```
Frontend → API Gateway → Order Service
  (JWT in Authorization header)
       ↓
  JWT Filter extracts user ID
       ↓
  Adds X-User-Id header
       ↓
  Order Service receives X-User-Id
       ↓
  Order created successfully
```

## Design Decisions

### 1. JWT Authentication in API Gateway

**Decision**: Add JWT authentication filter to API Gateway that extracts user ID and adds it as a header to downstream requests.

**Rationale**:
- Centralized authentication logic
- Downstream services don't need to validate JWT
- Consistent user identification across all services
- Follows microservices best practices (authentication at gateway)

**Implementation**:
- Create `JwtAuthenticationFilter` in API Gateway
- Extract user ID from JWT token claims
- Add `X-User-Id` header to request
- Configure filter to run for all authenticated routes

### 2. Request Structure Handling

**Decision**: Update frontend to send shipping address in flat structure matching backend expectations.

**Rationale**:
- Backend OrderRequest DTO expects flat fields (shippingAddress, shippingCity, etc.)
- Simpler to change frontend than to modify backend DTO and database schema
- Maintains backward compatibility with existing order data

**Frontend Changes**:
```typescript
// Current (nested)
{
  userId: "...",
  items: [...],
  shippingAddress: {
    fullName: "...",
    phone: "...",
    addressLine1: "...",
    city: "...",
    state: "...",
    postalCode: "...",
    country: "..."
  }
}

// New (flat)
{
  items: [...],
  shippingAddress: "123 Main St, Apt 4",  // Combined address
  shippingCity: "Mumbai",
  shippingState: "Maharashtra",
  shippingZip: "400001",
  shippingCountry: "India",
  notes: "Full Name: John Doe, Phone: +91 9876543210"
}
```

### 3. JWT Token Structure

**Assumption**: JWT token from user service contains:
```json
{
  "sub": "user-id-uuid",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234567890
}
```

The `sub` claim contains the user ID that will be extracted.

## Component Design

### API Gateway JWT Filter

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) {
        // 1. Extract JWT from Authorization header
        // 2. Validate JWT signature and expiration
        // 3. Extract user ID from 'sub' claim
        // 4. Add X-User-Id header to request
        // 5. Continue filter chain
    }
}
```

**Key Methods**:
- `extractToken(HttpServletRequest)`: Get JWT from Authorization header
- `validateToken(String)`: Verify JWT signature and expiration
- `extractUserId(String)`: Get user ID from token claims
- `addUserIdHeader(HttpServletRequest, String)`: Add X-User-Id header

### Frontend Order Service Update

```typescript
export const orderService = {
    createOrder: async (data: CreateOrderRequest): Promise<Order> => {
        // Transform nested address to flat structure
        const flatRequest = {
            items: data.items,
            shippingAddress: `${data.shippingAddress.addressLine1}${
                data.shippingAddress.addressLine2 
                    ? ', ' + data.shippingAddress.addressLine2 
                    : ''
            }`,
            shippingCity: data.shippingAddress.city,
            shippingState: data.shippingAddress.state,
            shippingZip: data.shippingAddress.postalCode,
            shippingCountry: data.shippingAddress.country,
            notes: `${data.shippingAddress.fullName} | ${data.shippingAddress.phone}`
        };
        
        const response = await api.post('/orders', flatRequest);
        return response.data;
    }
};
```

## Error Handling

### Authentication Errors (401)
- Missing Authorization header
- Invalid JWT token
- Expired JWT token
- Malformed JWT token

**Response**:
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired authentication token",
  "timestamp": "2024-02-16T10:30:00Z"
}
```

### Validation Errors (400)
- Missing required fields
- Invalid field formats
- Empty items array

**Response**:
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    "shippingAddress: must not be blank",
    "items: must not be empty"
  ],
  "timestamp": "2024-02-16T10:30:00Z"
}
```

### Server Errors (500)
- Database connection failures
- External service failures
- Unexpected exceptions

**Response**:
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "timestamp": "2024-02-16T10:30:00Z"
}
```

## Security Considerations

1. **JWT Secret**: Must be shared between user service and API gateway
2. **Token Expiration**: Validate token expiration before processing
3. **User ID Validation**: Ensure user ID is valid UUID format
4. **HTTPS**: All communication should use HTTPS in production
5. **Rate Limiting**: Consider adding rate limiting to prevent abuse

## Testing Strategy

### Unit Tests
- JWT token extraction and validation
- User ID extraction from claims
- Header addition logic
- Request transformation logic

### Integration Tests
- End-to-end order creation flow
- Authentication failure scenarios
- Invalid request handling
- Token expiration handling

### Manual Testing
1. Login as LDAP user
2. Add products to cart
3. Proceed to checkout
4. Fill shipping address
5. Click "Pay" button
6. Verify order is created
7. Check order appears in Orders page

## Rollout Plan

1. **Phase 1**: Add JWT filter to API Gateway
2. **Phase 2**: Update frontend request structure
3. **Phase 3**: Test end-to-end flow
4. **Phase 4**: Monitor for errors and fix issues

## Monitoring

- Log all authentication failures
- Track order creation success/failure rates
- Monitor API Gateway response times
- Alert on high error rates

## Correctness Properties

### Property 1: JWT Authentication
**Property**: All authenticated requests to order service must include valid X-User-Id header
**Test**: Generate random JWT tokens with valid user IDs, verify X-User-Id header is added

### Property 2: Request Transformation
**Property**: Shipping address transformation preserves all information
**Test**: Generate random shipping addresses, verify no data loss after transformation

### Property 3: Authentication Rejection
**Property**: Invalid or expired JWT tokens are rejected with 401 status
**Test**: Generate invalid/expired tokens, verify 401 response

## Dependencies

- Spring Cloud Gateway
- JWT library (io.jsonwebtoken:jjwt)
- User service for JWT secret configuration

## Configuration

### API Gateway application.yml
```yaml
jwt:
  secret: ${JWT_SECRET:your-secret-key}
  expiration: 86400000  # 24 hours
```

### Environment Variables
- `JWT_SECRET`: Shared secret for JWT validation (must match user service)

## Alternatives Considered

### Alternative 1: Add JWT validation to each service
**Rejected**: Duplicates authentication logic across services, harder to maintain

### Alternative 2: Use Spring Security OAuth2
**Rejected**: Overkill for current requirements, adds complexity

### Alternative 3: Keep nested address structure, update backend
**Rejected**: Requires database migration and more extensive changes
