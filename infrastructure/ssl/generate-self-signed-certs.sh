#!/bin/bash

# Generate Self-Signed SSL Certificates for Testing
# WARNING: Do NOT use self-signed certificates in production!
# Use Let's Encrypt or a commercial CA for production.

set -e

echo "========================================="
echo "Generating Self-Signed SSL Certificates"
echo "========================================="
echo ""
echo "⚠️  WARNING: These certificates are for TESTING ONLY!"
echo "⚠️  Use Let's Encrypt or a commercial CA for production."
echo ""

# Configuration
DOMAIN="${SSL_DOMAIN:-cloudforgetech.in}"
DAYS="${SSL_DAYS:-365}"
COUNTRY="${SSL_COUNTRY:-IN}"
STATE="${SSL_STATE:-Maharashtra}"
CITY="${SSL_CITY:-Mumbai}"
ORG="${SSL_ORG:-CloudForge}"
OU="${SSL_OU:-IT}"

echo "Configuration:"
echo "  Domain: $DOMAIN"
echo "  Valid for: $DAYS days"
echo "  Country: $COUNTRY"
echo "  State: $STATE"
echo "  City: $CITY"
echo "  Organization: $ORG"
echo ""

# Create directories
mkdir -p certs
mkdir -p api-gateway
mkdir -p frontend

echo "Step 1: Generating private key..."
openssl genrsa -out certs/privkey.pem 2048

echo "Step 2: Generating certificate signing request..."
openssl req -new -key certs/privkey.pem -out certs/cert.csr \
  -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$OU/CN=$DOMAIN"

echo "Step 3: Generating self-signed certificate..."
openssl x509 -req -days $DAYS -in certs/cert.csr \
  -signkey certs/privkey.pem -out certs/cert.pem \
  -extfile <(printf "subjectAltName=DNS:$DOMAIN,DNS:www.$DOMAIN,DNS:api.$DOMAIN,DNS:localhost")

echo "Step 4: Creating fullchain.pem..."
cp certs/cert.pem certs/fullchain.pem

echo "Step 5: Creating chain.pem..."
cp certs/cert.pem certs/chain.pem

echo "Step 6: Converting to PKCS12 for Java (API Gateway)..."
openssl pkcs12 -export \
  -in certs/cert.pem \
  -inkey certs/privkey.pem \
  -out api-gateway/keystore.p12 \
  -name cloudforge \
  -passout pass:changeit

echo "Step 7: Copying certificates for frontend..."
cp certs/fullchain.pem frontend/fullchain.pem
cp certs/privkey.pem frontend/privkey.pem
cp certs/chain.pem frontend/chain.pem

echo ""
echo "========================================="
echo "✅ Certificates Generated Successfully!"
echo "========================================="
echo ""
echo "Generated files:"
echo "  - certs/privkey.pem (Private key)"
echo "  - certs/cert.pem (Certificate)"
echo "  - certs/fullchain.pem (Full chain)"
echo "  - certs/chain.pem (Chain)"
echo "  - api-gateway/keystore.p12 (Java keystore)"
echo "  - frontend/fullchain.pem (Nginx certificate)"
echo "  - frontend/privkey.pem (Nginx private key)"
echo ""
echo "Next steps:"
echo "1. Copy api-gateway/keystore.p12 to services/api-gateway/src/main/resources/"
echo "2. Copy frontend/*.pem to your nginx SSL directory"
echo "3. Update docker-compose.yml to mount SSL certificates"
echo "4. Set SSL_KEYSTORE_PASSWORD environment variable to 'changeit'"
echo ""
echo "⚠️  IMPORTANT: These are self-signed certificates!"
echo "   Browsers will show security warnings."
echo "   For production, use Let's Encrypt or a commercial CA."
echo ""
