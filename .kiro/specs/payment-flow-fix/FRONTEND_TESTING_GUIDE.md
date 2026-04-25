# Frontend Integration Testing Guide

**Date**: April 19, 2026  
**Purpose**: Manual testing guide for verifying payment flow with JWT authentication through the browser UI

## Prerequisites

- All Docker services running
- Frontend accessible at http://localhost:3000
- Test user credentials available (see below)

## Test User Credentials

| Username | Password | User ID |
|----------|----------|---------|
| rajesh.kumar | Password123! | 5b3fd39f-ce6f-4e57-b434-7100837274a8 |
| priya.sharma | Password123! | a814a124-eca5-4a06-94d5-0b1cd96a85f8 |
| amit.patel | Password123! | Available |
| sneha.reddy | Password123! | Available |

---

## Test 1: Complete Checkout Flow with Authentication

### Objective
Verify that an authenticated user can successfully complete the entire checkout process.

### Steps

1. **Open Browser**
   - Navigate to `http://localhost:3000`
   - Open Developer Tools (F12)
   - Go to Console tab

2. **Login**
   - Click "Login" button in header
   - Enter credentials:
     - Username: `rajesh.kumar`
     - Password: `Password123!`
   - Click "Sign In" or "Login" button
   - **Verify**: User is redirected to home page
   - **Verify**: Username or "Logout" button appears in header

3. **Browse Products**
   - **Verify**: Products are displayed on home page
   - **Verify**: No console errors
   - Click on a product to view details (optional)

4. **Add to Cart**
   - Click "Add to Cart" on 2-3 products
   - **Verify**: Cart icon updates with item count
   - **Verify**: No console errors

5. **View Cart**
   - Click cart icon in header
   - **Verify**: Cart page shows selected products
   - **Verify**: Quantities and prices are correct
   - **Verify**: Total amount is calculated correctly

6. **Proceed to Checkout**
   - Click "Proceed to Checkout" button
   - **Verify**: Redirected to checkout page
   - **Verify**: No 401 errors in console
   - **Verify**: No "Unauthorized" messages

7. **Fill Shipping Address**
   - Fill in the form:
     - Full Name: `Rajesh Kumar`
     - Phone: `+91 9876543210`
     - Address Line 1: `123 Main Street, Apt 4B`
     - Address Line 2: `Near Central Park` (optional)
     - City: `Mumbai`
     - State: `Maharashtra`
     - PIN Code: `400001`
     - Country: `India` (may be pre-filled)
   - Click "Use this address" or "Continue"

8. **Verify Order Creation**
   - **Check Network Tab**:
     - Look for POST request to `/api/orders`
     - **Verify**: Request includes `Authorization: Bearer <token>` header
     - **Verify**: Response status is 200 OK
     - **Verify**: Response contains order ID and user ID
   - **Check Console**:
     - **Verify**: No 401 errors
     - **Verify**: No "Unauthorized" errors
     - **Verify**: No unhandled promise rejections

9. **Payment Step** (if applicable)
   - **Verify**: Payment page or Razorpay modal appears
   - **Verify**: Order details are displayed correctly
   - (Optional) Complete payment with test card if needed

10. **Verify Order in Orders Page**
    - Navigate to Orders page
    - **Verify**: New order appears in the list
    - **Verify**: Order shows correct status
    - **Verify**: Order details match what was entered

### Expected Results

✅ User can login successfully  
✅ Products load without errors  
✅ Cart functionality works  
✅ Checkout page is accessible  
✅ Authorization header is included in order creation request  
✅ Order is created successfully (200 OK)  
✅ No 401 authentication errors  
✅ Order appears in Orders page  

---

## Test 2: Unauthenticated Access Prevention

### Objective
Verify that unauthenticated users cannot access protected routes.

### Steps

1. **Clear Authentication**
   - Open browser in Incognito/Private mode
   - OR clear localStorage:
     ```javascript
     localStorage.clear();
     sessionStorage.clear();
     ```

2. **Try to Access Checkout**
   - Navigate directly to `http://localhost:3000/checkout`
   - **Verify**: Redirected to login page
   - OR **Verify**: Error message displayed

3. **Try to Access Orders**
   - Navigate to `http://localhost:3000/orders`
   - **Verify**: Redirected to login page
   - OR **Verify**: 401 error or "Please login" message

4. **Try to Create Order via API**
   - Open Console
   - Run:
     ```javascript
     fetch('http://localhost:8080/api/orders', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         items: [{ productId: 'test', quantity: 1 }],
         shippingAddress: '123 Test St',
         shippingCity: 'Mumbai',
         shippingState: 'Maharashtra',
         shippingZip: '400001',
         shippingCountry: 'India'
       })
     }).then(r => r.json()).then(console.log);
     ```
   - **Verify**: Response is 401 Unauthorized
   - **Verify**: Error message indicates missing authentication

### Expected Results

✅ Unauthenticated users cannot access checkout  
✅ Unauthenticated users cannot access orders  
✅ API requests without token return 401  
✅ Users are redirected to login page  

---

## Test 3: Multi-User Isolation

### Objective
Verify that each user only sees their own orders.

### Steps

1. **Login as User 1**
   - Login as `rajesh.kumar` / `Password123!`
   - Create an order (follow Test 1 steps 3-8)
   - Note the order ID from Network tab response

2. **Check Orders Page**
   - Navigate to Orders page
   - **Verify**: Order created by rajesh.kumar is visible
   - Note the orders displayed

3. **Logout**
   - Click "Logout" button
   - **Verify**: Redirected to home or login page

4. **Login as User 2**
   - Login as `priya.sharma` / `Password123!`
   - Navigate to Orders page

5. **Verify Isolation**
   - **Verify**: Orders from rajesh.kumar are NOT visible
   - **Verify**: Only priya.sharma's orders are shown (or empty if none)

6. **Create Order as User 2**
   - Create an order as priya.sharma
   - **Verify**: Order is created successfully
   - **Verify**: Order appears in priya.sharma's orders list

7. **Verify in Database**
   - Check database:
     ```sql
     SELECT id, user_id, shipping_address 
     FROM orders 
     ORDER BY created_at DESC 
     LIMIT 5;
     ```
   - **Verify**: Each order has correct user_id
   - **Verify**: rajesh.kumar's orders have user_id: `5b3fd39f-ce6f-4e57-b434-7100837274a8`
   - **Verify**: priya.sharma's orders have user_id: `a814a124-eca5-4a06-94d5-0b1cd96a85f8`

### Expected Results

✅ Each user only sees their own orders  
✅ No cross-user data leakage  
✅ Orders are correctly associated with user_id in database  
✅ Multiple users can create orders independently  

---

## Test 4: Token Persistence

### Objective
Verify that authentication persists across page navigation and browser refresh.

### Steps

1. **Login**
   - Login as `rajesh.kumar`
   - **Verify**: Login successful

2. **Navigate Between Pages**
   - Go to Products page
   - Go to Orders page
   - Go to Home page
   - **Verify**: User remains logged in on all pages
   - **Verify**: Username/Logout button visible on all pages

3. **Refresh Page**
   - Press F5 or Ctrl+R to refresh
   - **Verify**: User is still logged in
   - **Verify**: No redirect to login page

4. **Check localStorage**
   - Open Console
   - Run: `localStorage.getItem('token')` or `localStorage.getItem('auth')`
   - **Verify**: Token is stored
   - **Verify**: Token is a valid JWT (starts with `eyJ`)

5. **Create Order After Navigation**
   - Add products to cart
   - Proceed to checkout
   - **Verify**: Order creation works without re-login
   - **Verify**: Authorization header is still included

### Expected Results

✅ Authentication persists across page navigation  
✅ Authentication persists after page refresh  
✅ Token is stored in localStorage  
✅ User doesn't need to re-login for each action  

---

## Test 5: Error Handling

### Objective
Verify that authentication errors are handled gracefully.

### Steps

1. **Invalid Credentials**
   - Try to login with:
     - Username: `invalid.user`
     - Password: `WrongPassword123!`
   - **Verify**: Error message is displayed
   - **Verify**: User remains on login page
   - **Verify**: No console errors or crashes

2. **Expired Token** (if token expiration is short)
   - Login and wait for token to expire
   - OR manually modify token in localStorage to be expired
   - Try to create an order
   - **Verify**: 401 error is caught
   - **Verify**: Error toast/message is displayed
   - **Verify**: User is redirected to login page

3. **Invalid Token**
   - Login successfully
   - Open Console and run:
     ```javascript
     localStorage.setItem('token', 'invalid-token-12345');
     ```
   - Refresh page
   - Try to create an order
   - **Verify**: 401 error occurs
   - **Verify**: User is prompted to login again

4. **Network Error**
   - Login successfully
   - Stop API Gateway: `docker stop cloudforge-api-gateway`
   - Try to create an order
   - **Verify**: Network error is displayed
   - **Verify**: User-friendly error message shown
   - **Verify**: No application crash
   - Start API Gateway: `docker start cloudforge-api-gateway`

### Expected Results

✅ Invalid credentials show clear error message  
✅ Expired tokens trigger re-authentication  
✅ Invalid tokens are handled gracefully  
✅ Network errors show user-friendly messages  
✅ Application doesn't crash on errors  

---

## Test 6: Browser DevTools Verification

### Objective
Verify authentication implementation details using browser DevTools.

### Steps

1. **Login and Inspect Network**
   - Open DevTools → Network tab
   - Login as `rajesh.kumar`
   - Find the POST request to `/api/auth/login`
   - **Verify**: Response contains `token` field
   - **Verify**: Response contains `user` object with `id`
   - Copy the token value

2. **Decode JWT Token**
   - Go to https://jwt.io
   - Paste the token
   - **Verify**: Payload contains:
     - `sub`: username (rajesh.kumar)
     - `userId`: user ID
     - `iat`: issued at timestamp
     - `exp`: expiration timestamp

3. **Inspect Order Creation Request**
   - Create an order
   - Find the POST request to `/api/orders`
   - Click on the request
   - Go to "Headers" tab
   - **Verify**: `Authorization` header is present
   - **Verify**: Value is `Bearer <token>`
   - Go to "Response" tab
   - **Verify**: Response contains `userId` matching the logged-in user

4. **Check localStorage**
   - Go to Application/Storage tab
   - Expand "Local Storage"
   - Click on `http://localhost:3000`
   - **Verify**: Token is stored (key might be `token`, `auth`, or `authToken`)
   - **Verify**: User data is stored

5. **Monitor Console for Errors**
   - Keep Console tab open during entire flow
   - **Verify**: No 401 errors for authenticated requests
   - **Verify**: No unhandled promise rejections
   - **Verify**: No CORS errors

### Expected Results

✅ JWT token is properly formatted  
✅ Token contains userId claim  
✅ Authorization header is included in protected requests  
✅ Token is stored in localStorage  
✅ No console errors during normal flow  

---

## Troubleshooting

### Issue: 401 Errors Despite Being Logged In

**Possible Causes**:
- Token not being sent with requests
- Token expired
- JWT secret mismatch between services

**Debug Steps**:
1. Check Network tab for Authorization header
2. Verify token in localStorage is valid
3. Check API Gateway logs for JWT validation errors
4. Verify JWT_SECRET matches between user-service and api-gateway

### Issue: Orders Not Appearing

**Possible Causes**:
- Order creation failed silently
- User ID not being extracted from token
- Database connection issue

**Debug Steps**:
1. Check Network tab for order creation response
2. Check Order Service logs for "Creating order for user"
3. Query database to verify order exists
4. Verify user_id in database matches logged-in user

### Issue: Redirect Loop

**Possible Causes**:
- Authentication check failing
- Token not being stored
- Protected route configuration issue

**Debug Steps**:
1. Clear localStorage and try again
2. Check Console for errors
3. Verify token is being stored after login
4. Check route protection logic in frontend code

---

## Success Criteria

All of the following must be true:

- ✅ Users can login with LDAP credentials
- ✅ JWT token is generated and stored
- ✅ Token is included in protected API requests
- ✅ Orders are created successfully with authentication
- ✅ Orders are associated with correct user_id
- ✅ Unauthenticated users cannot access protected routes
- ✅ Each user only sees their own orders
- ✅ Authentication persists across navigation
- ✅ Errors are handled gracefully
- ✅ No console errors during normal flow

---

## Automated Test

An automated Playwright test has been created at:
`frontend/e2e/payment-flow-auth.spec.ts`

To run the automated test (when execution policy allows):
```bash
cd frontend
npx playwright test payment-flow-auth.spec.ts --headed
```

---

## Next Steps After Frontend Testing

1. Performance testing under load
2. Security testing (token manipulation, XSS, etc.)
3. Accessibility testing
4. Cross-browser testing
5. Mobile responsive testing
6. Production deployment preparation

