# Payment Flow Debugging

## Issue
Users are getting logged out immediately when clicking on payment or accessing authenticated pages like Orders.

## Root Cause Analysis
The JWT authentication filter in the API Gateway is blocking all authenticated requests because:
1. The filter is returning 401 Unauthorized for requests with valid JWT tokens
2. The frontend's axios interceptor catches 401 responses and logs the user out
3. This creates a loop where any authenticated request logs the user out

## Changes Made

### 1. Updated JWT Filter Excluded Paths
Changed from specific paths to broader path prefixes:
- `/api/auth/login` → `/api/auth` (covers all auth endpoints)
- `/api/auth/register` → (covered by `/api/auth`)
- Added `/actuator` to excluded paths

### 2. Added INFO Level Logging
Changed logging from DEBUG to INFO to see what's happening:
- Log every request that comes through the filter
- Log when paths are excluded
- Log when user ID is extracted and added to headers
- Log all authentication failures

### 3. Updated Logging Configuration
Added `io.cloudforge.apigateway: INFO` to application.yml

## Testing Steps

1. **Clear browser cache** (Ctrl+Shift+Delete) and do a hard refresh (Ctrl+Shift+R)
2. **Login** with LDAP credentials (john.doe / Password123!)
3. **Check browser console** for any 401 errors
4. **Check API Gateway logs** for JWT filter messages:
   ```powershell
   docker logs cloudforge-api-gateway --tail 100 -f
   ```
5. **Try accessing Orders page** - should not log out
6. **Try checkout flow** - should work without logging out

## Expected Behavior

### Successful Authentication Flow
```
1. User logs in → Gets JWT token
2. Frontend stores token in state
3. User clicks "Orders" or "Pay"
4. Frontend sends request with Authorization: Bearer <token>
5. API Gateway JWT filter:
   - Logs: "JWT Filter processing request: /api/orders"
   - Validates token
   - Extracts user ID
   - Logs: "Added X-User-Id header: <user-id> for path: /api/orders"
   - Forwards request to order service
6. Order service receives request with X-User-Id header
7. Order service processes request
8. Response sent back to frontend
9. User stays logged in
```

### Failed Authentication (Expected for Invalid Token)
```
1. User sends request with invalid/expired token
2. API Gateway JWT filter:
   - Logs: "JWT Filter processing request: /api/orders"
   - Logs: "Invalid or expired JWT token for path: /api/orders"
   - Returns 401 Unauthorized
3. Frontend logs user out
```

## Debugging Commands

### Check API Gateway Logs
```powershell
# Real-time logs
docker logs cloudforge-api-gateway -f

# Last 100 lines
docker logs cloudforge-api-gateway --tail 100

# Filter for JWT-related logs
docker logs cloudforge-api-gateway --tail 200 | Select-String -Pattern "JWT|userId|401|Unauthorized"
```

### Check User Service Logs (Token Generation)
```powershell
docker logs cloudforge-user-service --tail 100 | Select-String -Pattern "JWT|token|userId"
```

### Test JWT Token Manually
```powershell
# 1. Login and get token
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"john.doe","password":"Password123!"}'

$token = $response.token
Write-Host "Token: $token"

# 2. Test authenticated endpoint
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/orders/user/<user-id>" `
  -Method GET `
  -Headers $headers
```

## Next Steps

1. Wait for API Gateway to fully start (15-20 seconds)
2. Test login flow
3. Check logs for JWT filter messages
4. If still failing, check:
   - JWT token format
   - JWT secret matches between user service and API Gateway
   - Token expiration
   - User ID claim in token

## Status
- API Gateway: ✅ Rebuilt with updated filter
- Logging: ✅ Enabled INFO level
- Excluded paths: ✅ Updated to broader prefixes
- Ready for testing: ✅
