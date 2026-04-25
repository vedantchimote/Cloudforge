#!/bin/bash

# Test Environment Variables Configuration
# This script verifies that environment variables are properly configured

echo "========================================="
echo "CloudForge Environment Variables Test"
echo "========================================="
echo ""

# Load environment variables from .env.production.secure
if [ -f ".env.production.secure" ]; then
    echo "✓ Found .env.production.secure"
    export $(cat .env.production.secure | grep -v '^#' | xargs)
else
    echo "✗ .env.production.secure not found!"
    echo "  Please create it from .env.production.example"
    exit 1
fi

echo ""
echo "Testing Environment Variables:"
echo "========================================="

# Function to test if variable is set and not a placeholder
test_var() {
    var_name=$1
    var_value=${!var_name}
    placeholder=$2
    
    if [ -z "$var_value" ]; then
        echo "✗ $var_name: NOT SET"
        return 1
    elif [ "$var_value" == "$placeholder" ]; then
        echo "✗ $var_name: STILL PLACEHOLDER"
        return 1
    else
        # Show first 20 characters only for security
        echo "✓ $var_name: ${var_value:0:20}..."
        return 0
    fi
}

# Test critical variables
echo ""
echo "Critical Security Variables:"
echo "-----------------------------------------"
test_var "JWT_SECRET" "REPLACE_WITH_STRONG_RANDOM_SECRET_FROM_COMMAND_ABOVE"
test_var "POSTGRES_PASSWORD" "REPLACE_WITH_STRONG_RANDOM_PASSWORD"
test_var "MONGO_ROOT_PASSWORD" "REPLACE_WITH_STRONG_RANDOM_PASSWORD"
test_var "REDIS_PASSWORD" "REPLACE_WITH_STRONG_RANDOM_PASSWORD"
test_var "LDAP_ADMIN_PASSWORD" "REPLACE_WITH_STRONG_RANDOM_PASSWORD"

echo ""
echo "Application Configuration:"
echo "-----------------------------------------"
test_var "FRONTEND_URL" ""
test_var "API_GATEWAY_URL" ""
test_var "ALLOWED_ORIGINS" ""

echo ""
echo "========================================="
echo "Docker Compose Environment Test"
echo "========================================="

# Test if docker-compose can read the variables
cd infrastructure/docker

echo ""
echo "Testing docker-compose configuration..."
if docker-compose config > /dev/null 2>&1; then
    echo "✓ docker-compose configuration is valid"
else
    echo "✗ docker-compose configuration has errors"
    exit 1
fi

echo ""
echo "Checking environment variable substitution:"
echo "-----------------------------------------"

# Check if variables are being substituted in docker-compose
docker-compose config | grep -q "JWT_SECRET.*cloudforge-super-secret" && \
    echo "⚠ WARNING: JWT_SECRET is using default value!" || \
    echo "✓ JWT_SECRET is using environment variable"

docker-compose config | grep -q "POSTGRES_PASSWORD.*cloudforge123" && \
    echo "⚠ WARNING: POSTGRES_PASSWORD is using default value!" || \
    echo "✓ POSTGRES_PASSWORD is using environment variable"

docker-compose config | grep -q "MONGO_ROOT_PASSWORD.*mongo123" && \
    echo "⚠ WARNING: MONGO_ROOT_PASSWORD is using default value!" || \
    echo "✓ MONGO_ROOT_PASSWORD is using environment variable"

docker-compose config | grep -q "REDIS_PASSWORD.*redis123" && \
    echo "⚠ WARNING: REDIS_PASSWORD is using default value!" || \
    echo "✓ REDIS_PASSWORD is using environment variable"

echo ""
echo "========================================="
echo "Security Checks"
echo "========================================="

cd ../..

# Check if .env.production.secure is in .gitignore
if grep -q ".env.production.secure" .gitignore; then
    echo "✓ .env.production.secure is in .gitignore"
else
    echo "✗ .env.production.secure is NOT in .gitignore!"
    echo "  Add it immediately to prevent committing secrets!"
fi

# Check file permissions
if [ -f ".env.production.secure" ]; then
    perms=$(stat -c "%a" .env.production.secure 2>/dev/null || stat -f "%A" .env.production.secure 2>/dev/null)
    if [ "$perms" == "600" ] || [ "$perms" == "400" ]; then
        echo "✓ .env.production.secure has secure permissions ($perms)"
    else
        echo "⚠ WARNING: .env.production.secure has permissions $perms"
        echo "  Recommended: chmod 600 .env.production.secure"
    fi
fi

# Check JWT secret strength
jwt_length=${#JWT_SECRET}
if [ $jwt_length -ge 64 ]; then
    echo "✓ JWT_SECRET length is adequate ($jwt_length characters)"
else
    echo "⚠ WARNING: JWT_SECRET is too short ($jwt_length characters)"
    echo "  Recommended: At least 64 characters (512 bits)"
fi

# Check password strength
check_password_strength() {
    password=$1
    name=$2
    length=${#password}
    
    if [ $length -ge 32 ]; then
        echo "✓ $name length is adequate ($length characters)"
    else
        echo "⚠ WARNING: $name is too short ($length characters)"
        echo "  Recommended: At least 32 characters"
    fi
}

check_password_strength "$POSTGRES_PASSWORD" "POSTGRES_PASSWORD"
check_password_strength "$MONGO_ROOT_PASSWORD" "MONGO_ROOT_PASSWORD"
check_password_strength "$REDIS_PASSWORD" "REDIS_PASSWORD"

echo ""
echo "========================================="
echo "Test Complete"
echo "========================================="
echo ""
echo "Next Steps:"
echo "1. Review any warnings above"
echo "2. Fix any issues before deploying to production"
echo "3. Store .env.production.secure in a secure password manager"
echo "4. Follow PRODUCTION_DEPLOYMENT_GUIDE.md for deployment"
echo ""
