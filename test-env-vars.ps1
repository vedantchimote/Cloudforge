# Test Environment Variables Configuration
# This script verifies that environment variables are properly configured

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "CloudForge Environment Variables Test" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables from .env.production.secure
if (Test-Path ".env.production.secure") {
    Write-Host "✓ Found .env.production.secure" -ForegroundColor Green
    
    # Parse .env file
    $envVars = @{}
    Get-Content ".env.production.secure" | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $envVars[$matches[1].Trim()] = $matches[2].Trim()
        }
    }
} else {
    Write-Host "✗ .env.production.secure not found!" -ForegroundColor Red
    Write-Host "  Please create it from .env.production.example" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Testing Environment Variables:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Function to test if variable is set and not a placeholder
function Test-EnvVar {
    param(
        [string]$VarName,
        [string]$Placeholder
    )
    
    $varValue = $envVars[$VarName]
    
    if ([string]::IsNullOrEmpty($varValue)) {
        Write-Host "✗ $VarName : NOT SET" -ForegroundColor Red
        return $false
    } elseif ($varValue -eq $Placeholder) {
        Write-Host "✗ $VarName : STILL PLACEHOLDER" -ForegroundColor Red
        return $false
    } else {
        # Show first 20 characters only for security
        $preview = if ($varValue.Length -gt 20) { $varValue.Substring(0, 20) + "..." } else { $varValue }
        Write-Host "✓ $VarName : $preview" -ForegroundColor Green
        return $true
    }
}

# Test critical variables
Write-Host ""
Write-Host "Critical Security Variables:" -ForegroundColor Yellow
Write-Host "-----------------------------------------" -ForegroundColor Gray
$jwt = Test-EnvVar "JWT_SECRET" "REPLACE_WITH_STRONG_RANDOM_SECRET_FROM_COMMAND_ABOVE"
$pg = Test-EnvVar "POSTGRES_PASSWORD" "REPLACE_WITH_STRONG_RANDOM_PASSWORD"
$mongo = Test-EnvVar "MONGO_ROOT_PASSWORD" "REPLACE_WITH_STRONG_RANDOM_PASSWORD"
$redis = Test-EnvVar "REDIS_PASSWORD" "REPLACE_WITH_STRONG_RANDOM_PASSWORD"
$ldap = Test-EnvVar "LDAP_ADMIN_PASSWORD" "REPLACE_WITH_STRONG_RANDOM_PASSWORD"

Write-Host ""
Write-Host "Application Configuration:" -ForegroundColor Yellow
Write-Host "-----------------------------------------" -ForegroundColor Gray
$frontend = Test-EnvVar "FRONTEND_URL" ""
$api = Test-EnvVar "API_GATEWAY_URL" ""
$cors = Test-EnvVar "ALLOWED_ORIGINS" ""

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Docker Compose Environment Test" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Test if docker-compose can read the variables
Push-Location "infrastructure/docker"

Write-Host ""
Write-Host "Testing docker-compose configuration..." -ForegroundColor Yellow

try {
    $null = docker-compose config 2>&1
    Write-Host "✓ docker-compose configuration is valid" -ForegroundColor Green
} catch {
    Write-Host "✗ docker-compose configuration has errors" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host ""
Write-Host "Checking environment variable substitution:" -ForegroundColor Yellow
Write-Host "-----------------------------------------" -ForegroundColor Gray

# Set environment variables for docker-compose
foreach ($key in $envVars.Keys) {
    [Environment]::SetEnvironmentVariable($key, $envVars[$key], "Process")
}

# Check if variables are being substituted in docker-compose
$composeConfig = docker-compose config 2>&1 | Out-String

if ($composeConfig -match "JWT_SECRET.*cloudforge-super-secret") {
    Write-Host "⚠ WARNING: JWT_SECRET is using default value!" -ForegroundColor Yellow
} else {
    Write-Host "✓ JWT_SECRET is using environment variable" -ForegroundColor Green
}

if ($composeConfig -match "POSTGRES_PASSWORD.*cloudforge123") {
    Write-Host "⚠ WARNING: POSTGRES_PASSWORD is using default value!" -ForegroundColor Yellow
} else {
    Write-Host "✓ POSTGRES_PASSWORD is using environment variable" -ForegroundColor Green
}

if ($composeConfig -match "MONGO_ROOT_PASSWORD.*mongo123") {
    Write-Host "⚠ WARNING: MONGO_ROOT_PASSWORD is using default value!" -ForegroundColor Yellow
} else {
    Write-Host "✓ MONGO_ROOT_PASSWORD is using environment variable" -ForegroundColor Green
}

if ($composeConfig -match "REDIS_PASSWORD.*redis123") {
    Write-Host "⚠ WARNING: REDIS_PASSWORD is using default value!" -ForegroundColor Yellow
} else {
    Write-Host "✓ REDIS_PASSWORD is using environment variable" -ForegroundColor Green
}

Pop-Location

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Security Checks" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check if .env.production.secure is in .gitignore
$gitignoreContent = Get-Content ".gitignore" -Raw
if ($gitignoreContent -match "\.env\.production\.secure") {
    Write-Host "✓ .env.production.secure is in .gitignore" -ForegroundColor Green
} else {
    Write-Host "✗ .env.production.secure is NOT in .gitignore!" -ForegroundColor Red
    Write-Host "  Add it immediately to prevent committing secrets!" -ForegroundColor Yellow
}

# Check JWT secret strength
$jwtLength = $envVars["JWT_SECRET"].Length
if ($jwtLength -ge 64) {
    Write-Host "✓ JWT_SECRET length is adequate ($jwtLength characters)" -ForegroundColor Green
} else {
    Write-Host "⚠ WARNING: JWT_SECRET is too short ($jwtLength characters)" -ForegroundColor Yellow
    Write-Host "  Recommended: At least 64 characters (512 bits)" -ForegroundColor Yellow
}

# Check password strength
function Test-PasswordStrength {
    param(
        [string]$Password,
        [string]$Name
    )
    
    $length = $Password.Length
    
    if ($length -ge 32) {
        Write-Host "✓ $Name length is adequate ($length characters)" -ForegroundColor Green
    } else {
        Write-Host "⚠ WARNING: $Name is too short ($length characters)" -ForegroundColor Yellow
        Write-Host "  Recommended: At least 32 characters" -ForegroundColor Yellow
    }
}

Test-PasswordStrength $envVars["POSTGRES_PASSWORD"] "POSTGRES_PASSWORD"
Test-PasswordStrength $envVars["MONGO_ROOT_PASSWORD"] "MONGO_ROOT_PASSWORD"
Test-PasswordStrength $envVars["REDIS_PASSWORD"] "REDIS_PASSWORD"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review any warnings above" -ForegroundColor White
Write-Host "2. Fix any issues before deploying to production" -ForegroundColor White
Write-Host "3. Store .env.production.secure in a secure password manager" -ForegroundColor White
Write-Host "4. Follow PRODUCTION_DEPLOYMENT_GUIDE.md for deployment" -ForegroundColor White
Write-Host ""
