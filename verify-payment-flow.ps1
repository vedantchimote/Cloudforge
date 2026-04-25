# Payment Flow Verification Script
Write-Host "=== Payment Flow Comprehensive Verification ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Login and Get Token
Write-Host "Test 1: Login and obtain JWT token..." -ForegroundColor Yellow
$loginBody = @{
    username = "john.doe"
    password = "Password123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    
    $token = $loginResponse.token
    Write-Host "✓ Login successful! Token obtained." -ForegroundColor Green
    Write-Host "  Token (first 50 chars): $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Get Products
Write-Host "Test 2: Fetch products (public endpoint)..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Method Get
    $productId = $products.content[0].id
    Write-Host "✓ Products fetched successfully!" -ForegroundColor Green
    Write-Host "  First product ID: $productId" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to fetch products: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Create Order WITH Token (Should Succeed)
Write-Host "Test 3: Create order WITH valid token..." -ForegroundColor Yellow
$orderBody = @{
    items = @(
        @{
            productId = $productId
            quantity = 2
        }
    )
    shippingAddress = "123 Main St, Apt 4B"
    shippingCity = "Mumbai"
    shippingState = "Maharashtra"
    shippingZip = "400001"
    shippingCountry = "India"
    notes = "John Doe | +91 9876543210"
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $orderResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/orders" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $orderBody
    
    Write-Host "✓ Order created successfully!" -ForegroundColor Green
    Write-Host "  Order ID: $($orderResponse.id)" -ForegroundColor Gray
    Write-Host "  User ID: $($orderResponse.userId)" -ForegroundColor Gray
    Write-Host "  Status: $($orderResponse.status)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Order creation failed: $_" -ForegroundColor Red
    Write-Host "  Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Create Order WITHOUT Token (Should Fail with 401)
Write-Host "Test 4: Create order WITHOUT token (should fail)..." -ForegroundColor Yellow
try {
    $failResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/orders" `
        -Method Post `
        -ContentType "application/json" `
        -Body $orderBody
    
    Write-Host "✗ UNEXPECTED: Order created without token!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✓ Correctly rejected with 401 Unauthorized" -ForegroundColor Green
    } else {
        Write-Host "✗ Wrong status code: $statusCode (expected 401)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 5: Create Order with Invalid Token (Should Fail with 401)
Write-Host "Test 5: Create order with INVALID token (should fail)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer invalid-token-12345"
    }
    $failResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/orders" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $orderBody
    
    Write-Host "✗ UNEXPECTED: Order created with invalid token!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✓ Correctly rejected with 401 Unauthorized" -ForegroundColor Green
    } else {
        Write-Host "✗ Wrong status code: $statusCode (expected 401)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Verification Complete ===" -ForegroundColor Cyan
