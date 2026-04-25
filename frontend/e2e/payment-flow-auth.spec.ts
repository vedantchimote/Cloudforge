import { test, expect } from '@playwright/test';

/**
 * Payment Flow Authentication Integration Test
 * 
 * This test verifies the complete payment flow with JWT authentication:
 * 1. User login with LDAP credentials
 * 2. Browse products
 * 3. Add products to cart
 * 4. Proceed to checkout
 * 5. Fill shipping address
 * 6. Verify order creation with authentication
 */

test.describe('Payment Flow with Authentication', () => {
  
  test('should allow authenticated user to create order', async ({ page }) => {
    // 1. Navigate to home page
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/CloudForge/);
    
    // 2. Click Login button
    await page.click('text=Login');
    
    // 3. Fill login form with LDAP credentials
    await page.fill('input[name="username"], input[type="text"]', 'rajesh.kumar');
    await page.fill('input[name="password"], input[type="password"]', 'Password123!');
    
    // 4. Submit login form
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    
    // 5. Wait for successful login (check for username in header or redirect)
    await page.waitForTimeout(2000);
    
    // Verify login success by checking if username appears or login button is gone
    const isLoggedIn = await page.locator('text=rajesh.kumar, text=Rajesh, text=Logout').first().isVisible().catch(() => false);
    expect(isLoggedIn).toBeTruthy();
    
    // 6. Navigate to products (if not already there)
    await page.goto('http://localhost:3000');
    
    // 7. Wait for products to load
    await page.waitForSelector('text=MacBook, text=Product, [data-testid="product-card"]', { timeout: 10000 });
    
    // 8. Add first product to cart
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await addToCartButton.waitFor({ timeout: 5000 });
    await addToCartButton.click();
    
    // Wait for cart update
    await page.waitForTimeout(1000);
    
    // 9. Navigate to cart
    await page.click('text=Cart, [href="/cart"], button:has-text("Cart")');
    
    // 10. Verify cart has items
    await expect(page.locator('text=Shopping Cart, text=Cart')).toBeVisible();
    
    // 11. Proceed to checkout
    await page.click('button:has-text("Proceed to Checkout"), button:has-text("Checkout")');
    
    // 12. Wait for checkout page
    await page.waitForTimeout(1000);
    
    // 13. Fill shipping address form
    await page.fill('input[name="fullName"], input[placeholder*="name"]', 'Rajesh Kumar');
    await page.fill('input[name="phone"], input[placeholder*="phone"]', '+91 9876543210');
    await page.fill('input[name="addressLine1"], input[placeholder*="address"]', '123 Main Street, Apt 4B');
    await page.fill('input[name="city"], input[placeholder*="city"]', 'Mumbai');
    await page.fill('input[name="state"], input[placeholder*="state"]', 'Maharashtra');
    await page.fill('input[name="postalCode"], input[placeholder*="pin"], input[placeholder*="zip"]', '400001');
    
    // Country might be pre-filled or need to be filled
    const countryInput = page.locator('input[name="country"]');
    if (await countryInput.isVisible()) {
      await countryInput.fill('India');
    }
    
    // 14. Submit address form
    await page.click('button:has-text("Use this address"), button:has-text("Continue"), button:has-text("Next")');
    
    // 15. Wait for order creation
    await page.waitForTimeout(2000);
    
    // 16. Verify no authentication errors
    const hasAuthError = await page.locator('text=401, text=Unauthorized, text=Authentication').isVisible().catch(() => false);
    expect(hasAuthError).toBeFalsy();
    
    // 17. Check for success indicators (payment page, confirmation, or order details)
    const hasSuccess = await page.locator('text=Payment, text=Order, text=Success, text=Confirm').first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasSuccess).toBeTruthy();
  });
  
  test('should reject order creation without authentication', async ({ page }) => {
    // 1. Clear any existing auth tokens
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // 2. Try to access checkout directly without login
    await page.goto('http://localhost:3000/checkout');
    
    // 3. Should be redirected to login or show error
    await page.waitForTimeout(2000);
    
    // Verify either redirected to login or on login page
    const currentUrl = page.url();
    const isOnLoginPage = currentUrl.includes('/login') || currentUrl.includes('/auth');
    
    if (!isOnLoginPage) {
      // If not redirected, try to proceed and verify error
      const hasError = await page.locator('text=Login, text=Sign In, text=Authentication').isVisible();
      expect(hasError).toBeTruthy();
    } else {
      expect(isOnLoginPage).toBeTruthy();
    }
  });
  
  test('should display user-specific orders after authentication', async ({ page }) => {
    // 1. Login as first user
    await page.goto('http://localhost:3000');
    await page.click('text=Login');
    await page.fill('input[name="username"], input[type="text"]', 'rajesh.kumar');
    await page.fill('input[name="password"], input[type="password"]', 'Password123!');
    await page.click('button[type="submit"], button:has-text("Sign In")');
    
    // 2. Wait for login
    await page.waitForTimeout(2000);
    
    // 3. Navigate to orders page
    await page.goto('http://localhost:3000/orders');
    
    // 4. Wait for orders to load
    await page.waitForTimeout(2000);
    
    // 5. Verify orders page is accessible (not 401)
    const hasAuthError = await page.locator('text=401, text=Unauthorized').isVisible().catch(() => false);
    expect(hasAuthError).toBeFalsy();
    
    // 6. Verify page shows orders or empty state (not error)
    const hasContent = await page.locator('text=Orders, text=Order, text=No orders').first().isVisible();
    expect(hasContent).toBeTruthy();
  });
  
  test('should preserve authentication across page navigation', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:3000');
    await page.click('text=Login');
    await page.fill('input[name="username"], input[type="text"]', 'priya.sharma');
    await page.fill('input[name="password"], input[type="password"]', 'Password123!');
    await page.click('button[type="submit"], button:has-text("Sign In")');
    await page.waitForTimeout(2000);
    
    // 2. Navigate to different pages
    await page.goto('http://localhost:3000/products');
    await page.waitForTimeout(500);
    
    await page.goto('http://localhost:3000/orders');
    await page.waitForTimeout(500);
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    
    // 3. Verify still logged in (username visible or logout button present)
    const isStillLoggedIn = await page.locator('text=priya, text=Priya, text=Logout').first().isVisible().catch(() => false);
    expect(isStillLoggedIn).toBeTruthy();
  });
  
  test('should handle invalid credentials gracefully', async ({ page }) => {
    // 1. Navigate to login
    await page.goto('http://localhost:3000');
    await page.click('text=Login');
    
    // 2. Enter invalid credentials
    await page.fill('input[name="username"], input[type="text"]', 'invalid.user');
    await page.fill('input[name="password"], input[type="password"]', 'WrongPassword123!');
    
    // 3. Submit
    await page.click('button[type="submit"], button:has-text("Sign In")');
    
    // 4. Wait for error
    await page.waitForTimeout(2000);
    
    // 5. Verify error message is shown
    const hasError = await page.locator('text=Invalid, text=Error, text=Failed, text=incorrect').first().isVisible();
    expect(hasError).toBeTruthy();
    
    // 6. Verify still on login page (not logged in)
    const isOnLoginPage = page.url().includes('/login') || await page.locator('button:has-text("Sign In")').isVisible();
    expect(isOnLoginPage).toBeTruthy();
  });
});
