# Manual End-to-End Testing Guide

## Overview
This guide provides step-by-step instructions for manually testing the payment flow fix, including JWT authentication, error handling, and order creation.

## Prerequisites

### 1. Services Running
Ensure all services are running:
```bash
docker ps
```

Expected containers:
- cloudforge-api-gateway
- cloudforge-user-service
- cloudforge-order-service
- cloudforge-product-service
- cloudforge-payment-service
- cloudforge-frontend
- cloudforge-postgres
- cloudforge-mongodb
- cloudforge-kafka
- cloudforge-zookeeper

### 2. Test User Accounts
Use one of these LDAP test users:
- Username: `john.doe`, Password: `Password123!`
- Username: `jane.smith`, Password: `Password123!`
- Username: `bob.wilson`, Password: `Password123!`

## Test Scenarios

### Scenario 1: Successful Order Creation (Happy Path)

**Objective**: Verify that a logged-in user can successfully create an order.

**Steps**:
1. Open browser and navigate to `http://localhost:3000`
2. Click "Login" in the header
3. Enter credentials:
   - Username: `john.doe`
   - Password: `Password123!`
4. Click "Sign In"
5. **Verify**: User is redirected to home page and username appears in header
6. Browse products and click "Add to Cart" on 2-3 products
7. Click the cart icon in the header
8. **Verify**: Cart shows selected products with correct quantities and prices
9. Click "Proceed to Checkout"
10. Fill in shipping address form:
    - Full Name: `John Doe`
    - Phone: `+91 9876543210`
    - Address Line 1: `123 Main Street, Apt 4B`
    - Address Line 2: `Near Central Park` (optional)
    - City: `Mumbai`
    - State: `Maharashtra`
    - PIN Code: `400001`
    - Country: `India` (pre-filled)
11. Click "Use this address"
12. **Verify**: Form advances to payment step
13. **Verify**: Address is displayed correctly in summary
14. Click "Pay ₹[amount]" button
15. **Verify**: Razorpay payment modal opens
16. In Razorpay modal, use test card:
    - Card Number: `4111 1111 1111 1111`
    - Expiry: Any future date (e.g., `12/25`)
    - CVV: `123`
    - Name: `Test User`
17. Click "Pay" in Razorpay modal
18. **Verify**: Payment succeeds and user is redirected to order confirmation page
19. **Verify**: Order details are displayed correctly
20. Navigate to "Orders" page
21. **Verify**: New order appears in the list

**Expected Results**:
- ✅ No 401 authentication errors
- ✅ No 500 server errors
- ✅ Order created successfully
- ✅ Order appears in database
- ✅ All data preserved correctly

### Scenario 2: Authentication Error - No Token

**Objective**: Verify that unauthenticated requests are rejected with proper error message.

**Steps**:
1. Open browser in incognito/private mode
2. Navigate to `http://localhost:3000/checkout`
3. **Verify**: User is redirected to login page with `?redirect=/checkout` parameter

**Expected Results**:
- ✅ User cannot access checkout without authentication
- ✅ Redirect to login page works correctly

### Scenario 3: Authentication Error - Expired Token

**Objective**: Verify that expired tokens are rejected with proper error message.

**Steps**:
1. Login as a user
2. Open browser DevTools (F12)
3. Go to Application/Storage tab
4. Find localStorage and locate the auth token
5. Manually modify the token to an expired one (or wait for token expiration)
6. Try to create an order
7. **Verify**: Error toast appears with "Authentication Required" message
8. **Verify**: User is redirected to login page after 2 seconds

**Expected Results**:
- ✅ Expired token rejected with 401 error
- ✅ Error toast displays clear message
- ✅ User redirected to login

### Scenario 4: Validation Error - Missing Required Fields

**Objective**: Verify that validation errors are displayed clearly.

**Steps**:
1. Login as a user
2. Add products to cart
3. Proceed to checkout
4. Leave some required fields empty (e.g., Full Name, Phone)
5. Click "Use this address"
6. **Verify**: Form validation errors appear below empty fields
7. Fill in all required fields
8. Click "Use this address"
9. **Verify**: Form advances to payment step

**Expected Results**:
- ✅ Client-side validation prevents submission
- ✅ Error messages are clear and actionable
- ✅ Form submission succeeds after fixing errors

### Scenario 5: Network Error Handling

**Objective**: Verify that network errors are handled gracefully.

**Steps**:
1. Login as a user
2. Add products to cart
3. Stop the API Gateway container:
   ```bash
   docker stop cloudforge-api-gateway
   ```
4. Try to proceed to checkout
5. **Verify**: Error toast appears with network error message
6. Start the API Gateway container:
   ```bash
   docker start cloudforge-api-gateway
   ```
7. Wait for service to be healthy (30 seconds)
8. Retry checkout
9. **Verify**: Checkout proceeds successfully

**Expected Results**:
- ✅ Network error displays user-friendly message
- ✅ No console errors or crashes
- ✅ Application recovers after service restart

### Scenario 6: Payment Gateway Loading Failure

**Objective**: Verify error handling when Razorpay script fails to load.

**Steps**:
1. Login as a user
2. Add products to cart
3. Proceed to checkout and fill address
4. Open browser DevTools Network tab
5. Block requests to `checkout.razorpay.com`
6. Click "Pay" button
7. **Verify**: Error toast appears: "Failed to load payment gateway"
8. Unblock Razorpay requests
9. Click "Pay" button again
10. **Verify**: Razorpay modal opens successfully

**Expected Results**:
- ✅ Payment gateway loading failure handled gracefully
- ✅ Clear error message displayed
- ✅ User can retry after fixing issue

### Scenario 7: Multiple Users - Concurrent Orders

**Objective**: Verify that JWT authentication works correctly for multiple users.

**Steps**:
1. Open two different browsers (e.g., Chrome and Firefox)
2. In Browser 1:
   - Login as `john.doe`
   - Add products to cart
   - Proceed to checkout
3. In Browser 2:
   - Login as `jane.smith`
   - Add different products to cart
   - Proceed to checkout
4. Complete checkout in both browsers
5. **Verify**: Each order is associated with the correct user
6. Check orders page in both browsers
7. **Verify**: Each user sees only their own orders

**Expected Results**:
- ✅ User IDs correctly extracted from respective JWT tokens
- ✅ No cross-user data leakage
- ✅ Orders associated with correct users

### Scenario 8: Saved Address Pre-fill

**Objective**: Verify that saved addresses are pre-filled on checkout.

**Steps**:
1. Login as a user
2. Complete an order with a shipping address
3. Add more products to cart
4. Proceed to checkout again
5. **Verify**: Address form is pre-filled with previously saved address
6. Modify the address
7. Complete checkout
8. Start a new checkout
9. **Verify**: Updated address is pre-filled

**Expected Results**:
- ✅ Address saved to user profile
- ✅ Address pre-filled on subsequent checkouts
- ✅ Address updates persist

## API Testing with cURL

### Test 1: Login and Get Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "password": "Password123!"
  }'
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "john.doe",
    "email": "john.doe@example.com"
  }
}
```

### Test 2: Create Order with Valid Token
```bash
# Replace <TOKEN> with actual token from login
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "items": [
      {
        "productId": "product-id-here",
        "quantity": 2
      }
    ],
    "shippingAddress": "123 Main St, Apt 4",
    "shippingCity": "Mumbai",
    "shippingState": "Maharashtra",
    "shippingZip": "400001",
    "shippingCountry": "India",
    "notes": "John Doe | +91 9876543210"
  }'
```

**Expected Response**: 200 OK with order details

### Test 3: Create Order without Token
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "product-id-here",
        "quantity": 2
      }
    ],
    "shippingAddress": "123 Main St",
    "shippingCity": "Mumbai",
    "shippingState": "Maharashtra",
    "shippingZip": "400001",
    "shippingCountry": "India"
  }'
```

**Expected Response**: 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authentication token",
  "status": 401,
  "path": "/api/orders",
  "timestamp": "2026-04-19T..."
}
```

### Test 4: Create Order with Invalid Token
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token-here" \
  -d '{
    "items": [
      {
        "productId": "product-id-here",
        "quantity": 2
      }
    ],
    "shippingAddress": "123 Main St",
    "shippingCity": "Mumbai",
    "shippingState": "Maharashtra",
    "shippingZip": "400001",
    "shippingCountry": "India"
  }'
```

**Expected Response**: 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired authentication token",
  "status": 401,
  "path": "/api/orders",
  "timestamp": "2026-04-19T..."
}
```

## Verification Checklist

### Backend Verification

#### API Gateway Logs
```bash
docker logs cloudforge-api-gateway --tail 100
```

**Look for**:
- ✅ "JWT Authentication Filter initialized"
- ✅ "JWT Filter processing request: /api/orders"
- ✅ "JWT token validation PASSED"
- ✅ "Added X-User-Id header: [user-id]"
- ❌ No "JWT token validation FAILED" for valid tokens

#### Order Service Logs
```bash
docker logs cloudforge-order-service --tail 100
```

**Look for**:
- ✅ "Creating order for user: [user-id]"
- ✅ "Order created successfully: [order-id]"
- ✅ X-User-Id header received
- ❌ No "User ID not found" errors

#### Database Verification
```bash
# Connect to PostgreSQL
docker exec -it cloudforge-postgres psql -U cloudforge -d cloudforge

# Check orders
SELECT id, user_id, status, total_amount, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

# Verify user_id matches JWT token
```

### Frontend Verification

#### Browser Console
**Look for**:
- ✅ No 401 errors for authenticated requests
- ✅ No 500 errors during checkout
- ✅ Successful order creation response
- ❌ No unhandled promise rejections

#### Network Tab
**Verify**:
- ✅ Authorization header present in order creation request
- ✅ Request payload matches expected format
- ✅ Response status is 200 for successful orders
- ✅ Response status is 401 for unauthenticated requests

#### Application State
**Verify**:
- ✅ Token stored in localStorage
- ✅ User data stored in auth state
- ✅ Cart cleared after successful order
- ✅ Order appears in orders list

## Common Issues and Troubleshooting

### Issue 1: 401 Unauthorized for Valid Token
**Symptoms**: User is logged in but gets 401 errors

**Possible Causes**:
- JWT secret mismatch between user service and API gateway
- Token expired
- Token format incorrect

**Debug Steps**:
1. Check JWT secret in both services:
   ```bash
   docker exec cloudforge-api-gateway env | grep JWT_SECRET
   docker exec cloudforge-user-service env | grep JWT_SECRET
   ```
2. Verify secrets match
3. Check token expiration in browser DevTools
4. Verify token format: `Bearer <token>`

### Issue 2: Order Created but User ID is NULL
**Symptoms**: Order created but user_id is null in database

**Possible Causes**:
- X-User-Id header not added by API Gateway
- JWT token missing userId claim

**Debug Steps**:
1. Check API Gateway logs for "Added X-User-Id header"
2. Decode JWT token at jwt.io to verify userId claim
3. Check order service logs for X-User-Id header value

### Issue 3: Error Toast Not Appearing
**Symptoms**: Errors occur but no toast notification

**Possible Causes**:
- Error state not set in component
- Toast component not rendered
- CSS animation not working

**Debug Steps**:
1. Check browser console for errors
2. Verify ErrorToast component is imported
3. Check error state in React DevTools
4. Verify CSS animation classes exist

## Test Results Template

```markdown
## Test Execution Results

**Date**: [Date]
**Tester**: [Name]
**Environment**: Local Docker

### Scenario Results

| Scenario | Status | Notes |
|----------|--------|-------|
| 1. Successful Order Creation | ✅ Pass | |
| 2. Authentication Error - No Token | ✅ Pass | |
| 3. Authentication Error - Expired Token | ✅ Pass | |
| 4. Validation Error - Missing Fields | ✅ Pass | |
| 5. Network Error Handling | ✅ Pass | |
| 6. Payment Gateway Loading Failure | ✅ Pass | |
| 7. Multiple Users - Concurrent Orders | ✅ Pass | |
| 8. Saved Address Pre-fill | ✅ Pass | |

### Issues Found
- [List any issues discovered during testing]

### Recommendations
- [List any recommendations for improvements]
```

## Next Steps After Testing

1. Document any issues found
2. Create bug reports for failures
3. Update test cases based on findings
4. Run automated tests to verify fixes
5. Perform regression testing
6. Sign off on implementation

## Date Created
April 19, 2026
