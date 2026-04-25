# Payment Flow Fix - Verification Checklist

## Overview
This checklist provides a systematic approach to verify that the payment flow fix is working correctly in all scenarios.

## Pre-Verification Requirements

### 1. Services Running
Verify all required services are running:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**Expected Services:**
- ✅ cloudforge-api-gateway (port 8080)
- ✅ cloudforge-user-service (port 8082)
- ✅ cloudforge-order-service (port 8083)
- ✅ cloudforge-product-service (port 8081)
- ✅ cloudforge-payment-service (port 8084)
- ✅ cloudforge-frontend (port 3000)
- ✅ cloudforge-postgres
- ✅ cloudforge-mongodb
- ✅ cloudforge-kafka
- ✅ cloudforge-zookeeper

### 2. Service Health Checks

```bash
# API Gateway
curl http://localhost:8080/actuator/health

# User Service
curl http://localhost:8082/actuator/health

# Order Service
curl http://localhost:8083/actuator/health

# Product Service
curl http://localhost:8081/actuator/health
```

**Expected Response:**
```json
{
  "status": "UP"
}
```

### 3. JWT Configuration Verification

```bash
# Check JWT secret matches between services
docker exec cloudforge-api-gateway env | grep JWT_SECRET
docker exec cloudforge-user-service env | grep JWT_SECRET
```

**Expected:** Both should show the same JWT_SECRET value.

## Verification Tasks

### Task 8.1: Verify Order Creation Works

#### Test 1: Successful Order Creation with Valid Token

**Steps:**
1. Login and obtain JWT token:
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john.doe","password":"Password123!"}' \
  | jq -r '.token')

echo "Token: $TOKEN"
```

2. Get a product ID:
```bash
PRODUCT_ID=$(curl -s http://localhost:8080/api/products \
  | jq -r '.content[0].id')

echo "Product ID: $PRODUCT_ID"
```

3. Create an order:
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"items\": [
      {
        \"productId\": \"$PRODUCT_ID\",
        \"quantity\": 2
      }
    ],
    \"shippingAddress\": \"123 Main St, Apt 4B\",
    \"shippingCity\": \"Mumbai\",
    \"shippingState\": \"Maharashtra\",
    \"shippingZip\": \"400001\",
    \"shippingCountry\": \"India\",
    \"notes\": \"John Doe | +91 9876543210\"
  }" | jq
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Response contains order ID
- ✅ Response contains user ID
- ✅ Response contains order items
- ✅ Response contains shipping address

**Verification:**
```bash
# Check API Gateway logs
docker logs cloudforge-api-gateway --tail 20 | grep "JWT"

# Check Order Service logs
docker logs cloudforge-order-service --tail 20 | grep "Creating order"

# Verify in database
docker exec -it cloudforge-postgres psql -U cloudforge -d cloudforge \
  -c "SELECT id, user_id, status, total_amount FROM orders ORDER BY created_at DESC LIMIT 1;"
```

#### Test 2: Order Creation Fails Without Token

**Steps:**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "test-id", "quantity": 1}],
    "shippingAddress": "123 Main St",
    "shippingCity": "Mumbai",
    "shippingState": "Maharashtra",
    "shippingZip": "400001",
    "shippingCountry": "India"
  }' | jq
```

**Expected Result:**
- ✅ Status: 401 Unauthorized
- ✅ Error response with proper format:
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authentication token",
  "status": 401,
  "path": "/api/orders",
  "timestamp": "..."
}
```

#### Test 3: Order Creation with Multiple Users

**Steps:**
1. Login as first user:
```bash
TOKEN1=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john.doe","password":"Password123!"}' \
  | jq -r '.token')
```

2. Login as second user:
```bash
TOKEN2=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jane.smith","password":"Password123!"}' \
  | jq -r '.token')
```

3. Create orders with both tokens
4. Verify each order is associated with correct user

**Expected Result:**
- ✅ Each order has correct user_id
- ✅ No cross-user data leakage

#### Test 4: Order Creation with Different Addresses

**Test Data:**
```json
[
  {
    "shippingAddress": "456 Oak Ave",
    "shippingCity": "Delhi",
    "shippingState": "Delhi",
    "shippingZip": "110001",
    "shippingCountry": "India"
  },
  {
    "shippingAddress": "789 Pine Rd, Suite 100",
    "shippingCity": "Bangalore",
    "shippingState": "Karnataka",
    "shippingZip": "560001",
    "shippingCountry": "India"
  }
]
```

**Expected Result:**
- ✅ All address fields preserved correctly
- ✅ No data truncation
- ✅ Special characters handled properly

**Checklist:**
- [ ] Order created successfully with valid token
- [ ] Order creation fails without token (401)
- [ ] Multiple users can create orders independently
- [ ] Different addresses are preserved correctly
- [ ] Orders appear in database with correct user_id
- [ ] API Gateway logs show JWT validation
- [ ] Order Service logs show X-User-Id header received

---

### Task 8.2: Check Logs for Errors

#### API Gateway Logs

```bash
# View recent logs
docker logs cloudforge-api-gateway --tail 100

# Filter for errors
docker logs cloudforge-api-gateway --tail 500 | grep -i "error"

# Filter for JWT-related logs
docker logs cloudforge-api-gateway --tail 500 | grep "JWT"

# Filter for authentication failures
docker logs cloudforge-api-gateway --tail 500 | grep "401"
```

**What to Look For:**
- ✅ "JWT Authentication Filter initialized"
- ✅ "JWT token validation PASSED"
- ✅ "Added X-User-Id header"
- ❌ No "JWT token validation FAILED" for valid tokens
- ❌ No unexpected exceptions or stack traces

#### Order Service Logs

```bash
# View recent logs
docker logs cloudforge-order-service --tail 100

# Filter for errors
docker logs cloudforge-order-service --tail 500 | grep -i "error"

# Filter for order creation
docker logs cloudforge-order-service --tail 500 | grep "Creating order"

# Filter for X-User-Id header
docker logs cloudforge-order-service --tail 500 | grep "X-User-Id"
```

**What to Look For:**
- ✅ "Creating order for user: [user-id]"
- ✅ "Order created successfully: [order-id]"
- ✅ X-User-Id header received
- ❌ No "User ID not found" errors
- ❌ No null pointer exceptions

#### User Service Logs

```bash
# View recent logs
docker logs cloudforge-user-service --tail 100

# Filter for authentication
docker logs cloudforge-user-service --tail 500 | grep "Authentication"

# Filter for token generation
docker logs cloudforge-user-service --tail 500 | grep "token"
```

**What to Look For:**
- ✅ Successful login attempts
- ✅ JWT tokens generated with userId claim
- ❌ No authentication failures for valid credentials

**Checklist:**
- [ ] API Gateway logs show JWT filter initialization
- [ ] API Gateway logs show successful token validation
- [ ] API Gateway logs show X-User-Id header addition
- [ ] Order Service logs show order creation
- [ ] Order Service logs show X-User-Id header received
- [ ] User Service logs show successful authentication
- [ ] No unexpected errors in any service logs

---

### Task 8.3: Test Error Scenarios

#### Scenario 1: Expired Token

**Steps:**
1. Create an expired token (manually or wait for expiration)
2. Attempt to create order with expired token

**Expected Result:**
- ✅ Status: 401 Unauthorized
- ✅ Error message: "Invalid or expired authentication token"

#### Scenario 2: Invalid Token Signature

**Steps:**
1. Modify a valid token (change last few characters)
2. Attempt to create order with modified token

**Expected Result:**
- ✅ Status: 401 Unauthorized
- ✅ Error message: "Invalid or expired authentication token"

#### Scenario 3: Malformed Token

**Steps:**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer not-a-valid-jwt-token" \
  -d '{
    "items": [{"productId": "test-id", "quantity": 1}],
    "shippingAddress": "123 Main St",
    "shippingCity": "Mumbai",
    "shippingState": "Maharashtra",
    "shippingZip": "400001",
    "shippingCountry": "India"
  }' | jq
```

**Expected Result:**
- ✅ Status: 401 Unauthorized
- ✅ Error message: "Invalid or expired authentication token"

#### Scenario 4: Missing Required Fields

**Steps:**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [{"productId": "test-id", "quantity": 1}]
  }' | jq
```

**Expected Result:**
- ✅ Status: 400 Bad Request
- ✅ Error message lists missing fields
- ✅ Validation errors array populated

#### Scenario 5: Invalid Authorization Header Format

**Steps:**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: InvalidFormat $TOKEN" \
  -d '{
    "items": [{"productId": "test-id", "quantity": 1}],
    "shippingAddress": "123 Main St",
    "shippingCity": "Mumbai",
    "shippingState": "Maharashtra",
    "shippingZip": "400001",
    "shippingCountry": "India"
  }' | jq
```

**Expected Result:**
- ✅ Status: 401 Unauthorized
- ✅ Error message: "Invalid Authorization header format"

**Checklist:**
- [ ] Expired token returns 401
- [ ] Invalid signature returns 401
- [ ] Malformed token returns 401
- [ ] Missing required fields returns 400 with validation errors
- [ ] Invalid header format returns 401
- [ ] All error responses follow consistent format
- [ ] Error messages are clear and actionable

---

## Database Verification

### Check Orders Table

```sql
-- Connect to database
docker exec -it cloudforge-postgres psql -U cloudforge -d cloudforge

-- View recent orders
SELECT 
    id, 
    user_id, 
    status, 
    total_amount, 
    shipping_city,
    shipping_state,
    created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- Verify user_id is not null
SELECT COUNT(*) as orders_with_null_user_id 
FROM orders 
WHERE user_id IS NULL;

-- Check order items
SELECT 
    o.id as order_id,
    o.user_id,
    oi.product_id,
    oi.quantity,
    oi.price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
ORDER BY o.created_at DESC
LIMIT 10;
```

**Expected Results:**
- ✅ All orders have non-null user_id
- ✅ Shipping address fields populated correctly
- ✅ Order items associated correctly
- ✅ Timestamps are recent

**Checklist:**
- [ ] All orders have valid user_id (not null)
- [ ] Shipping address fields are populated
- [ ] Order items are correctly associated
- [ ] Total amounts are calculated correctly
- [ ] Timestamps are accurate

---

## Frontend Verification

### Browser Testing

1. **Open Application:**
   - Navigate to http://localhost:3000
   - Open browser DevTools (F12)

2. **Login:**
   - Click "Login"
   - Enter credentials: john.doe / Password123!
   - Verify successful login

3. **Browse Products:**
   - Verify products load
   - Check console for errors

4. **Add to Cart:**
   - Add 2-3 products to cart
   - Verify cart updates

5. **Checkout:**
   - Click cart icon
   - Click "Proceed to Checkout"
   - Fill shipping address
   - Click "Use this address"
   - Verify payment step appears

6. **Network Tab Verification:**
   - Check order creation request
   - Verify Authorization header present
   - Verify request payload format
   - Check response status (should be 200)

7. **Console Verification:**
   - No 401 errors
   - No 500 errors
   - No unhandled promise rejections

**Checklist:**
- [ ] Login works successfully
- [ ] Products load without errors
- [ ] Cart functionality works
- [ ] Checkout flow completes
- [ ] Authorization header included in requests
- [ ] No console errors
- [ ] Order appears in Orders page

---

## Performance Verification

### Response Time Testing

```bash
# Test order creation response time
time curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [{"productId": "'"$PRODUCT_ID"'", "quantity": 1}],
    "shippingAddress": "123 Main St",
    "shippingCity": "Mumbai",
    "shippingState": "Maharashtra",
    "shippingZip": "400001",
    "shippingCountry": "India"
  }'
```

**Expected:**
- ✅ Response time < 2 seconds
- ✅ No timeout errors

### Load Testing (Optional)

```bash
# Simple load test with Apache Bench
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  -p order-payload.json \
  -T application/json \
  http://localhost:8080/api/orders
```

**Expected:**
- ✅ All requests succeed
- ✅ No 500 errors under load
- ✅ Consistent response times

**Checklist:**
- [ ] Order creation completes in < 2 seconds
- [ ] No timeout errors
- [ ] System handles concurrent requests
- [ ] No performance degradation

---

## Security Verification

### JWT Secret Security

```bash
# Verify JWT secret is not default value
docker exec cloudforge-api-gateway env | grep JWT_SECRET

# Should NOT be:
# - "your-secret-key"
# - "default-secret"
# - Any obvious/weak value
```

### Token Validation

```bash
# Verify token validation is working
# Try with obviously invalid token
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer invalid-token-12345" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"test","quantity":1}],"shippingAddress":"test","shippingCity":"test","shippingState":"test","shippingZip":"test","shippingCountry":"test"}' \
  | jq
```

**Expected:**
- ✅ Returns 401 Unauthorized
- ✅ Does not process the order

**Checklist:**
- [ ] JWT secret is strong (not default)
- [ ] Invalid tokens are rejected
- [ ] Token expiration is enforced
- [ ] No sensitive data in error messages

---

## Final Verification Summary

### Success Criteria

All of the following must be true:

- ✅ Users can successfully create orders with valid JWT tokens
- ✅ Order creation fails appropriately without authentication (401)
- ✅ All orders have correct user_id in database
- ✅ Shipping address data is preserved correctly
- ✅ Error messages are clear and consistent
- ✅ No errors in service logs for valid requests
- ✅ Frontend checkout flow works end-to-end
- ✅ Performance is acceptable (< 2 seconds)
- ✅ Security measures are in place

### Sign-Off

**Verified By:** ___________________  
**Date:** ___________________  
**Environment:** Local Docker  
**Version:** 1.0.0  

**Notes:**
_______________________________________
_______________________________________
_______________________________________

---

## Troubleshooting

If any verification fails, refer to:
- [Manual Testing Guide](./MANUAL_TESTING_GUIDE.md)
- [Authentication Guide](../docs/api/authentication.md)
- [Error Handling Implementation](./ERROR_HANDLING_IMPLEMENTATION.md)

## Date Created
April 19, 2026
