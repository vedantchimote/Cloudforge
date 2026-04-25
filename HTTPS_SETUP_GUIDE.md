# HTTPS/TLS Setup Guide

This guide provides step-by-step instructions for configuring HTTPS/TLS for CloudForge in both development and production environments.

---

## Table of Contents

1. [Overview](#overview)
2. [Development Setup (Self-Signed Certificates)](#development-setup-self-signed-certificates)
3. [Production Setup (Let's Encrypt)](#production-setup-lets-encrypt)
4. [Production Setup (Commercial CA)](#production-setup-commercial-ca)
5. [Testing HTTPS Configuration](#testing-https-configuration)
6. [Troubleshooting](#troubleshooting)
7. [Certificate Renewal](#certificate-renewal)

---

## Overview

CloudForge supports HTTPS/TLS for secure communication between:
- Frontend (Nginx) - Serves the React application over HTTPS
- API Gateway (Spring Cloud Gateway) - Handles API requests over HTTPS
- Internal services - Communicate over HTTP within Docker network

### Architecture

```
Internet → HTTPS (443) → Frontend (Nginx) → HTTPS (8443) → API Gateway → HTTP → Services
```

---

## Development Setup (Self-Signed Certificates)

For local development and testing, use self-signed certificates.

### Step 1: Generate Self-Signed Certificates

**On Linux/Mac:**
```bash
cd infrastructure/ssl
chmod +x generate-self-signed-certs.sh
./generate-self-signed-certs.sh
```

**On Windows:**
```powershell
cd infrastructure\ssl
.\generate-self-signed-certs.ps1
```

This generates:
- `api-gateway/keystore.p12` - Java keystore for API Gateway
- `frontend/fullchain.pem` - Certificate for Nginx
- `frontend/privkey.pem` - Private key for Nginx
- `frontend/chain.pem` - Certificate chain for Nginx

### Step 2: Copy Certificates

```bash
# Copy API Gateway keystore
cp infrastructure/ssl/api-gateway/keystore.p12 services/api-gateway/src/main/resources/

# Frontend certificates are already in the right place
```

### Step 3: Set Environment Variables

Add to `.env.production.secure`:
```bash
SSL_KEYSTORE_PASSWORD=changeit
ALLOWED_ORIGINS=https://localhost,https://127.0.0.1
```

### Step 4: Start Services with HTTPS

```bash
cd infrastructure/docker

# Start with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Step 5: Access the Application

- Frontend: https://localhost (or https://localhost:443)
- API Gateway: https://localhost:8443
- Swagger UI: https://localhost:8443/webjars/swagger-ui/index.html

**Note**: Your browser will show a security warning because the certificate is self-signed. Click "Advanced" and "Proceed" to continue.

---

## Production Setup (Let's Encrypt)

Let's Encrypt provides free SSL certificates that are trusted by all major browsers.

### Prerequisites

- Domain name pointing to your server (e.g., cloudforgetech.in)
- Server with ports 80 and 443 open
- Root access to the server

### Step 1: Install Certbot

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y certbot
```

**CentOS/RHEL:**
```bash
sudo yum install -y certbot
```

### Step 2: Obtain Certificates

**Option A: Using the provided script**
```bash
cd infrastructure/ssl
chmod +x setup-letsencrypt.sh

# Set your domain and email
export SSL_DOMAIN=cloudforgetech.in
export SSL_EMAIL=admin@cloudforgetech.in

# Run the script
sudo -E ./setup-letsencrypt.sh
```

**Option B: Manual setup**
```bash
# Stop nginx if running
sudo systemctl stop nginx

# Obtain certificate
sudo certbot certonly --standalone \
  -d cloudforgetech.in \
  -d www.cloudforgetech.in \
  -d api.cloudforgetech.in \
  --email admin@cloudforgetech.in \
  --agree-tos \
  --non-interactive

# Restart nginx
sudo systemctl start nginx
```

### Step 3: Convert Certificate for API Gateway

```bash
cd infrastructure/ssl
mkdir -p api-gateway

# Convert to PKCS12 format
sudo openssl pkcs12 -export \
  -in /etc/letsencrypt/live/cloudforgetech.in/fullchain.pem \
  -inkey /etc/letsencrypt/live/cloudforgetech.in/privkey.pem \
  -out api-gateway/keystore.p12 \
  -name cloudforge \
  -passout pass:changeit
```

### Step 4: Copy Certificates

```bash
# Copy API Gateway keystore
sudo cp infrastructure/ssl/api-gateway/keystore.p12 services/api-gateway/src/main/resources/

# Create symlinks for frontend (or copy files)
mkdir -p infrastructure/ssl/frontend
sudo ln -s /etc/letsencrypt/live/cloudforgetech.in/fullchain.pem infrastructure/ssl/frontend/fullchain.pem
sudo ln -s /etc/letsencrypt/live/cloudforgetech.in/privkey.pem infrastructure/ssl/frontend/privkey.pem
sudo ln -s /etc/letsencrypt/live/cloudforgetech.in/chain.pem infrastructure/ssl/frontend/chain.pem
```

### Step 5: Update Environment Variables

Update `.env.production.secure`:
```bash
SSL_KEYSTORE_PASSWORD=changeit
ALLOWED_ORIGINS=https://cloudforgetech.in,https://www.cloudforgetech.in
FRONTEND_URL=https://cloudforgetech.in
API_GATEWAY_URL=https://api.cloudforgetech.in
```

### Step 6: Update Nginx Configuration

Edit `frontend/nginx-prod.conf` and update the domain:
```nginx
server_name cloudforgetech.in www.cloudforgetech.in;
```

### Step 7: Deploy

```bash
cd infrastructure/docker

# Load environment variables
export $(cat ../../.env.production.secure | xargs)

# Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Step 8: Set Up Automatic Renewal

Let's Encrypt certificates expire after 90 days. Set up automatic renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab
sudo crontab -e

# Add this line to renew daily at midnight
0 0 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

---

## Production Setup (Commercial CA)

If you have certificates from a commercial CA (GoDaddy, DigiCert, etc.):

### Step 1: Obtain Certificate Files

You should have:
- `certificate.crt` - Your domain certificate
- `private.key` - Private key
- `ca_bundle.crt` - CA bundle/chain

### Step 2: Create Full Chain

```bash
cat certificate.crt ca_bundle.crt > fullchain.pem
cp private.key privkey.pem
cp ca_bundle.crt chain.pem
```

### Step 3: Convert for API Gateway

```bash
openssl pkcs12 -export \
  -in fullchain.pem \
  -inkey privkey.pem \
  -out keystore.p12 \
  -name cloudforge \
  -passout pass:changeit
```

### Step 4: Copy Certificates

```bash
# API Gateway
cp keystore.p12 services/api-gateway/src/main/resources/

# Frontend
mkdir -p infrastructure/ssl/frontend
cp fullchain.pem infrastructure/ssl/frontend/
cp privkey.pem infrastructure/ssl/frontend/
cp chain.pem infrastructure/ssl/frontend/
```

### Step 5: Deploy

Follow steps 5-7 from the Let's Encrypt section above.

---

## Testing HTTPS Configuration

### Test SSL Certificate

```bash
# Test certificate validity
openssl s_client -connect cloudforgetech.in:443 -servername cloudforgetech.in

# Check certificate expiration
echo | openssl s_client -connect cloudforgetech.in:443 -servername cloudforgetech.in 2>/dev/null | openssl x509 -noout -dates
```

### Test HTTPS Endpoints

```bash
# Test frontend
curl -I https://cloudforgetech.in

# Test API Gateway
curl -I https://api.cloudforgetech.in/actuator/health

# Test with authentication
curl -X POST https://api.cloudforgetech.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"rajesh.kumar","password":"Password123!"}'
```

### Test HTTP to HTTPS Redirect

```bash
# Should redirect to HTTPS
curl -I http://cloudforgetech.in
```

### SSL Labs Test

For production, test your SSL configuration:
https://www.ssllabs.com/ssltest/analyze.html?d=cloudforgetech.in

---

## Troubleshooting

### Certificate Not Found

**Error**: `java.io.FileNotFoundException: class path resource [keystore.p12] cannot be opened`

**Solution**:
```bash
# Verify keystore exists
ls -la services/api-gateway/src/main/resources/keystore.p12

# If missing, copy it
cp infrastructure/ssl/api-gateway/keystore.p12 services/api-gateway/src/main/resources/
```

### Wrong Password

**Error**: `java.io.IOException: keystore password was incorrect`

**Solution**:
```bash
# Verify password in environment
echo $SSL_KEYSTORE_PASSWORD

# Should be: changeit
# If not, set it:
export SSL_KEYSTORE_PASSWORD=changeit
```

### Certificate Expired

**Error**: `certificate has expired`

**Solution**:
```bash
# For Let's Encrypt, renew certificate
sudo certbot renew

# Regenerate keystore
sudo openssl pkcs12 -export \
  -in /etc/letsencrypt/live/cloudforgetech.in/fullchain.pem \
  -inkey /etc/letsencrypt/live/cloudforgetech.in/privkey.pem \
  -out infrastructure/ssl/api-gateway/keystore.p12 \
  -name cloudforge \
  -passout pass:changeit

# Restart services
docker-compose restart api-gateway frontend
```

### Browser Shows "Not Secure"

**For Self-Signed Certificates**:
- This is expected. Click "Advanced" → "Proceed to site"
- Or add certificate to your browser's trusted certificates

**For Production Certificates**:
- Verify certificate is valid: `openssl s_client -connect your-domain.com:443`
- Check certificate chain is complete
- Verify domain matches certificate CN/SAN

### CORS Errors After Enabling HTTPS

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
```bash
# Verify ALLOWED_ORIGINS includes HTTPS URLs
echo $ALLOWED_ORIGINS

# Should be: https://cloudforgetech.in,https://www.cloudforgetech.in
# NOT: http://cloudforgetech.in (HTTP won't work with HTTPS)
```

### Mixed Content Warnings

**Error**: `Mixed Content: The page was loaded over HTTPS, but requested an insecure resource`

**Solution**:
- Ensure all API calls use HTTPS
- Update `VITE_API_URL` to use HTTPS
- Check for hardcoded HTTP URLs in frontend code

---

## Certificate Renewal

### Let's Encrypt (Automatic)

Certificates renew automatically if you set up the cron job:
```bash
# Check renewal status
sudo certbot certificates

# Manual renewal
sudo certbot renew

# After renewal, update keystore
sudo openssl pkcs12 -export \
  -in /etc/letsencrypt/live/cloudforgetech.in/fullchain.pem \
  -inkey /etc/letsencrypt/live/cloudforgetech.in/privkey.pem \
  -out infrastructure/ssl/api-gateway/keystore.p12 \
  -name cloudforge \
  -passout pass:changeit

# Restart services
docker-compose restart api-gateway frontend
```

### Commercial CA

1. Renew certificate with your CA before expiration
2. Download new certificate files
3. Follow "Production Setup (Commercial CA)" steps above
4. Restart services

---

## Security Best Practices

1. **Use Strong Ciphers**: The nginx-prod.conf already includes strong cipher configuration
2. **Enable HSTS**: Strict-Transport-Security header is enabled in nginx-prod.conf
3. **Disable Old TLS Versions**: Only TLS 1.2 and 1.3 are enabled
4. **Regular Updates**: Keep OpenSSL and nginx updated
5. **Monitor Expiration**: Set up alerts for certificate expiration (60 days before)
6. **Secure Private Keys**: 
   ```bash
   chmod 600 infrastructure/ssl/frontend/privkey.pem
   chmod 600 infrastructure/ssl/api-gateway/keystore.p12
   ```

---

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/)
- [Spring Boot SSL Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.webserver.configure-ssl)

---

**Last Updated**: April 19, 2026  
**Version**: 1.0  
**Maintained By**: CloudForge DevOps Team
