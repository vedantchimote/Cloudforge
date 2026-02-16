# Payment Flow Fix - Requirements

## Overview
Fix the payment flow to enable users to successfully create orders and process payments. Currently, the checkout process fails with a 500 Internal Server Error when attempting to create an order.

## Problem Statement
The payment flow is broken due to:
1. Missing JWT authentication in the order service - the service expects `X-User-Id` header but receives JWT token in Authorization header
2. Request structure mismatch between frontend and backend for shipping address
3. No mechanism to extract user ID from JWT token and pass it to downstream services

## User Stories

### 1. As a logged-in user, I want to complete checkout successfully
**Acceptance Criteria:**
- User can fill out shipping address form
- User can proceed to payment step
- Order is created successfully in the backend
- User receives order confirmation
- No 404 or 500 errors during checkout

### 2. As a system, I want to authenticate requests using JWT tokens
**Acceptance Criteria:**
- API Gateway extracts user ID from JWT token
- API Gateway adds `X-User-Id` header to downstream requests
- Order service receives authenticated user ID
- Invalid or missing JWT tokens are rejected with 401

### 3. As a developer, I want consistent request/response formats
**Acceptance Criteria:**
- Frontend shipping address structure matches backend expectations
- Order creation request validation works correctly
- Error messages are clear and actionable

## Technical Requirements

### 1. JWT Authentication in API Gateway
- Add JWT token validation filter to API Gateway
- Extract user ID from JWT token claims
- Add `X-User-Id` header to all downstream service requests
- Handle authentication failures gracefully

### 2. Request Structure Alignment
- Update frontend to send shipping address in the format expected by backend
- OR update backend to accept nested shipping address object
- Ensure all required fields are included

### 3. Error Handling
- Return appropriate HTTP status codes (401 for auth, 400 for validation, 500 for server errors)
- Include meaningful error messages in responses
- Log errors for debugging

## Out of Scope
- Razorpay payment gateway integration (already implemented in frontend)
- Payment verification logic (already implemented)
- Order status updates
- Email notifications

## Dependencies
- JWT token structure from user service
- Order service API contract
- Frontend checkout flow

## Success Metrics
- Users can successfully create orders
- 0% checkout failure rate due to authentication issues
- Clear error messages for validation failures
