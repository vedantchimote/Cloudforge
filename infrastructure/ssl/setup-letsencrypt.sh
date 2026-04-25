#!/bin/bash

# Setup Let's Encrypt SSL Certificates for Production
# This script uses Certbot to obtain free SSL certificates from Let's Encrypt

set -e

echo "========================================="
echo "Let's Encrypt SSL Certificate Setup"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script must be run as root (use sudo)"
    exit 1
fi

# Configuration
DOMAIN="${SSL_DOMAIN:-cloudforgetech.in}"
EMAIL="${SSL_EMAIL:-admin@cloudforgetech.in}"
STAGING="${SSL_STAGING:-false}"

echo "Configuration:"
echo "  Domain: $DOMAIN"
echo "  Email: $EMAIL"
echo "  Staging: $STAGING"
echo ""

# Validate configuration
if [ "$DOMAIN" == "cloudforgetech.in" ] || [ "$EMAIL" == "admin@cloudforgetech.in" ]; then
    echo "⚠️  ERROR: Please set SSL_DOMAIN and SSL_EMAIL environment variables"
    echo ""
    echo "Example:"
    echo "  export SSL_DOMAIN=your-domain.com"
    echo "  export SSL_EMAIL=admin@your-domain.com"
    echo "  sudo -E ./setup-letsencrypt.sh"
    exit 1
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    apt-get update
    apt-get install -y certbot
fi

# Stop nginx if running (to free port 80)
if systemctl is-active --quiet nginx; then
    echo "Stopping nginx temporarily..."
    systemctl stop nginx
    RESTART_NGINX=true
fi

# Obtain certificate
echo ""
echo "Obtaining SSL certificate from Let's Encrypt..."
echo ""

CERTBOT_ARGS="certonly --standalone -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN --email $EMAIL --agree-tos --non-interactive"

if [ "$STAGING" == "true" ]; then
    echo "⚠️  Using Let's Encrypt STAGING environment (for testing)"
    CERTBOT_ARGS="$CERTBOT_ARGS --staging"
fi

certbot $CERTBOT_ARGS

# Restart nginx if it was running
if [ "$RESTART_NGINX" == "true" ]; then
    echo "Restarting nginx..."
    systemctl start nginx
fi

# Certificate paths
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"

echo ""
echo "========================================="
echo "✅ Certificates Obtained Successfully!"
echo "========================================="
echo ""
echo "Certificate files:"
echo "  - $CERT_PATH/fullchain.pem"
echo "  - $CERT_PATH/privkey.pem"
echo "  - $CERT_PATH/chain.pem"
echo ""

# Convert to PKCS12 for Java
echo "Converting to PKCS12 for API Gateway..."
mkdir -p api-gateway
openssl pkcs12 -export \
  -in $CERT_PATH/fullchain.pem \
  -inkey $CERT_PATH/privkey.pem \
  -out api-gateway/keystore.p12 \
  -name cloudforge \
  -passout pass:changeit

echo ""
echo "Next steps:"
echo "1. Copy api-gateway/keystore.p12 to services/api-gateway/src/main/resources/"
echo "2. Update docker-compose.yml to mount SSL certificates"
echo "3. Set SSL_KEYSTORE_PASSWORD environment variable to 'changeit'"
echo "4. Update nginx configuration to use certificates from $CERT_PATH"
echo ""
echo "Certificate renewal:"
echo "  Certificates will expire in 90 days."
echo "  Set up automatic renewal with:"
echo "    sudo certbot renew --dry-run  # Test renewal"
echo "    sudo crontab -e  # Add: 0 0 * * * certbot renew --quiet"
echo ""
