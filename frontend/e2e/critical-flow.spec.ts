import { test, expect } from '@playwright/test';

test('critical user flow: view product -> add to cart -> checkout', async ({ page }) => {
    // 1. Visit Home Page
    await page.goto('/');
    await expect(page).toHaveTitle(/CloudForge/);

    // 2. Click on a product (assuming dynamic products are loaded)
    // We'll wait for products to load and click the first one
    const firstProduct = page.locator('a[href^="/products/"]').first();
    await firstProduct.waitFor();
    await firstProduct.click();

    // 3. Verify Product Details Page
    await expect(page.locator('h1')).toBeVisible(); // Product title
    await expect(page.getByText('Add to Cart')).toBeVisible();

    // 4. Add to Cart
    await page.getByText('Add to Cart').click();

    // 5. Go to Cart
    await page.getByRole('link', { name: /cart/i }).click();
    await expect(page.locator('h1')).toContainText('Shopping Cart');

    // 6. Proceed to Checkout
    await page.getByText('Proceed to Checkout').click();

    // 7. Verify Checkout Page
    await expect(page.locator('h2')).toContainText('Checkout');

    // 8. Fill Shipping Details
    await page.getByLabel('Address').fill('123 Test St');
    await page.getByLabel('City').fill('Test City');
    await page.getByLabel('State').fill('TS');
    await page.getByLabel('ZIP Code').fill('12345');
    await page.getByLabel('Country').fill('Test Country');

    // 9. Place Order
    await page.getByText('Place Order').click();

    // 10. Verify Order Confirmation
    // This assumes successful order placement redirects to an order confirmation or shows a success message
    await expect(page.getByText(/Order Placed Successfully/i)).toBeVisible();
});
