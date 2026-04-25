# Generate Self-Signed SSL Certificates for Testing (PowerShell)
# WARNING: Do NOT use self-signed certificates in production!
# Use Let's Encrypt or a commercial CA for production.

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Generating Self-Signed SSL Certificates" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  WARNING: These certificates are for TESTING ONLY!" -ForegroundColor Yellow
Write-Host "⚠️  Use Let's Encrypt or a commercial CA for production." -ForegroundColor Yellow
Write-Host ""

# Configuration
$Domain = if ($env:SSL_DOMAIN) { $env:SSL_DOMAIN } else { "cloudforgetech.in" }
$Days = if ($env:SSL_DAYS) { $env:SSL_DAYS } else { 365 }
$Country = if ($env:SSL_COUNTRY) { $env:SSL_COUNTRY } else { "IN" }
$State = if ($env:SSL_STATE) { $env:SSL_STATE } else { "Maharashtra" }
$City = if ($env:SSL_CITY) { $env:SSL_CITY } else { "Mumbai" }
$Org = if ($env:SSL_ORG) { $env:SSL_ORG } else { "CloudForge" }
$OU = if ($env:SSL_OU) { $env:SSL_OU } else { "IT" }

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Domain: $Domain"
Write-Host "  Valid for: $Days days"
Write-Host "  Country: $Country"
Write-Host "  State: $State"
Write-Host "  City: $City"
Write-Host "  Organization: $Org"
Write-Host ""

# Create directories
New-Item -ItemType Directory -Force -Path "certs" | Out-Null
New-Item -ItemType Directory -Force -Path "api-gateway" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend" | Out-Null

Write-Host "Step 1: Generating private key..." -ForegroundColor Green
& openssl genrsa -out certs/privkey.pem 2048

Write-Host "Step 2: Generating certificate signing request..." -ForegroundColor Green
& openssl req -new -key certs/privkey.pem -out certs/cert.csr `
  -subj "/C=$Country/ST=$State/L=$City/O=$Org/OU=$OU/CN=$Domain"

Write-Host "Step 3: Generating self-signed certificate..." -ForegroundColor Green
$extFile = "subjectAltName=DNS:$Domain,DNS:www.$Domain,DNS:api.$Domain,DNS:localhost"
$extFile | Out-File -FilePath "certs/ext.cnf" -Encoding ASCII

& openssl x509 -req -days $Days -in certs/cert.csr `
  -signkey certs/privkey.pem -out certs/cert.pem `
  -extfile certs/ext.cnf

Remove-Item "certs/ext.cnf"

Write-Host "Step 4: Creating fullchain.pem..." -ForegroundColor Green
Copy-Item "certs/cert.pem" "certs/fullchain.pem"

Write-Host "Step 5: Creating chain.pem..." -ForegroundColor Green
Copy-Item "certs/cert.pem" "certs/chain.pem"

Write-Host "Step 6: Converting to PKCS12 for Java (API Gateway)..." -ForegroundColor Green
& openssl pkcs12 -export `
  -in certs/cert.pem `
  -inkey certs/privkey.pem `
  -out api-gateway/keystore.p12 `
  -name cloudforge `
  -passout pass:changeit

Write-Host "Step 7: Copying certificates for frontend..." -ForegroundColor Green
Copy-Item "certs/fullchain.pem" "frontend/fullchain.pem"
Copy-Item "certs/privkey.pem" "frontend/privkey.pem"
Copy-Item "certs/chain.pem" "frontend/chain.pem"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Certificates Generated Successfully!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Generated files:" -ForegroundColor Yellow
Write-Host "  - certs/privkey.pem (Private key)"
Write-Host "  - certs/cert.pem (Certificate)"
Write-Host "  - certs/fullchain.pem (Full chain)"
Write-Host "  - certs/chain.pem (Chain)"
Write-Host "  - api-gateway/keystore.p12 (Java keystore)"
Write-Host "  - frontend/fullchain.pem (Nginx certificate)"
Write-Host "  - frontend/privkey.pem (Nginx private key)"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy api-gateway/keystore.p12 to services/api-gateway/src/main/resources/"
Write-Host "2. Copy frontend/*.pem to your nginx SSL directory"
Write-Host "3. Update docker-compose.yml to mount SSL certificates"
Write-Host "4. Set SSL_KEYSTORE_PASSWORD environment variable to 'changeit'"
Write-Host ""
Write-Host "⚠️  IMPORTANT: These are self-signed certificates!" -ForegroundColor Yellow
Write-Host "   Browsers will show security warnings."
Write-Host "   For production, use Let's Encrypt or a commercial CA."
Write-Host ""
