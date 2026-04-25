# Payment Flow Fix - Implementation Tasks

## 1. Setup and Dependencies
- [x] 1.1 Add JWT dependency to API Gateway pom.xml
- [x] 1.2 Verify JWT secret configuration in user service
- [x] 1.3 Add JWT secret to API Gateway configuration

## 2. API Gateway JWT Authentication
- [x] 2.1 Create JwtTokenProvider utility class
  - Extract token from Authorization header
  - Validate JWT signature
  - Extract user ID from claims
  - Handle token expiration
- [x] 2.2 Create JwtAuthenticationFilter
  - Implement OncePerRequestFilter
  - Extract and validate JWT token
  - Add X-User-Id header to request
  - Handle authentication errors
- [x] 2.3 Configure filter in API Gateway
  - Register filter bean
  - Configure filter order
  - Set up exception handling
- [x] 2.4 Add JWT configuration properties
  - Add jwt.secret to application.yml
  - Add jwt.expiration configuration
  - Document environment variables

## 3. Frontend Request Structure Update
- [x] 3.1 Update orderService.createOrder method
  - Transform nested shippingAddress to flat structure
  - Combine addressLine1 and addressLine2
  - Map city, state, postalCode, country to flat fields
  - Add fullName and phone to notes field
- [x] 3.2 Update TypeScript interfaces
  - Keep CreateOrderRequest interface for frontend use
  - Add internal transformation logic
  - Ensure type safety
- [x] 3.3 Test request transformation
  - Verify all address fields are included
  - Check notes field contains contact info
  - Validate no data loss

## 4. Error Handling
- [x] 4.1 Add global error handler to API Gateway
  - Handle JWT validation errors (401)
  - Handle malformed requests (400)
  - Return consistent error format
- [x] 4.2 Update frontend error handling
  - Display authentication errors
  - Show validation errors
  - Handle network errors gracefully

## 5. Testing
- [x] 5.1 Unit test JwtTokenProvider
  - Test token extraction
  - Test token validation
  - Test user ID extraction
  - Test error cases
- [x] 5.2 Unit test JwtAuthenticationFilter
  - Test filter logic
  - Test header addition
  - Test authentication failures
- [x] 5.3 Integration test order creation flow
  - Test with valid JWT token
  - Test with invalid token
  - Test with expired token
  - Test with missing token
- [x] 5.4 Manual end-to-end testing
  - Login as LDAP user
  - Add products to cart
  - Complete checkout flow
  - Verify order creation
  - Check order in database

## 6. Docker and Deployment
- [x] 6.1 Rebuild API Gateway Docker image
  - Build with new JWT filter
  - Update docker-compose if needed
- [x] 6.2 Rebuild frontend Docker image
  - Build with updated order service
  - Clear browser cache for testing
- [x] 6.3 Update environment variables
  - Add JWT_SECRET to docker-compose
  - Ensure same secret for user service and gateway
- [x] 6.4 Restart containers
  - Stop all containers
  - Start with updated images
  - Verify all services healthy

## 7. Documentation
- [x] 7.1 Update API documentation
  - Document X-User-Id header requirement
  - Update order creation endpoint docs
  - Add authentication section
- [x] 7.2 Update README
  - Document JWT configuration
  - Add troubleshooting section
  - Update environment variables list
- [x] 7.3 Update Mintlify docs
  - Update API Gateway documentation
  - Update order service documentation
  - Add authentication flow diagram

## 8. Verification and Monitoring
- [x] 8.1 Verify order creation works
  - Test with multiple users
  - Test with different addresses
  - Verify orders in database
- [x] 8.2 Check logs for errors
  - Review API Gateway logs
  - Review order service logs
  - Fix any issues found
- [x] 8.3 Test error scenarios
  - Test with expired token
  - Test with invalid token
  - Test with missing fields
  - Verify appropriate error messages

## Task Dependencies
- Task 2 depends on Task 1 (JWT dependencies must be added first)
- Task 3 can be done in parallel with Task 2
- Task 4 depends on Tasks 2 and 3
- Task 5 depends on Tasks 2, 3, and 4
- Task 6 depends on Task 5 (test before deploying)
- Task 7 can be done in parallel with Task 6
- Task 8 depends on Task 6 (verify after deployment)

## Estimated Effort
- Setup and Dependencies: 30 minutes
- API Gateway JWT Authentication: 2 hours
- Frontend Request Structure Update: 1 hour
- Error Handling: 1 hour
- Testing: 2 hours
- Docker and Deployment: 1 hour
- Documentation: 1 hour
- Verification: 30 minutes

**Total: ~9 hours**

## Success Criteria
- ✅ Users can successfully create orders through checkout
- ✅ JWT authentication works correctly
- ✅ No 404 or 500 errors during checkout
- ✅ Orders appear in database with correct data
- ✅ Error messages are clear and actionable
- ✅ All tests pass
- ✅ Documentation is updated
