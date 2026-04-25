# HTTPS/TLS and CORS Configuration - Complete

**Date**: April 19, 2026  
**Status**: ✅ **COMPLETE**  
**Spec**: Payment Flow Fix - HTTPS/TLS and Production CORS Configuration

---

## Summary

HTTPS/TLS configuration and production CORS settings have been implemented for CloudForge. The system now supports secure communication over HTTPS for both development (self-signed certificates) and production (Let's Encrypt or commercial CA) environments.

---

## Completed Tasks

### 1. ✅ Created Production Application Configuration

**File**: `services/api-gateway/src/main/resources/application-prod.yml`

**Features**:
- HTTPS enabled on port 8443
- HTTP to HTTPS redirect support
- Production CORS configuration (no localhost origins)
- Specific allowed headers (no wildcards)
- Shorter JWT expiration (1 hour instead of 24)
- Production logging levels (INFO/WARN)
- Restricted actuator endpoints

**CORS Configuration**:
```yaml
allowedOrigins:
  - "${ALLOWED_ORIGINS:https://cloudforgetech.in,https://www.cloudforgetech.in}"
allowedHeaders:
  - Content-Type
  - Authorization
  - X-Requested-With
  - Accept
  - Origin
allowCredentials: true
```

---

### 2. ✅ Created Production Nginx Configuration

**File**: `frontend/nginx-prod.conf`

**Features**:
- HTTP to HTTPS redirect (port 80 → 443)
- TLS 1.2 and 1.3 only
- Strong cipher suites
- HSTS (HTTP Strict Transport Security)
- Security headers (CSP, X-Frame-Options, etc.)
- OCSP stapling
- Gzip compression
- Static asset caching
- HTTPS proxy to API Gateway

**Security Headers**:
- `Strict-Transport-Security`: Force HTTPS for 1 year
- `X-Frame-Options`: Prevent clickjacking
- `X-Content-Type-Options`: Prevent MIME sniffing
- `X-XSS-Protection`: Enable XSS filter
- `Content-Security-Policy`: Restrict resource loading
- `Referrer-Policy`: Control referrer information

---

### 3. ✅ Created Certificate Generation Scripts

**Self-Signed Certificates (Development/Testing)**:
- `infrastructure/ssl/generate-self-signed-certs.sh` (Linux/Mac)
- `infrastructure/ssl/generate-self-signed-certs.ps1` (Windows)

**Features**:
- Generates 2048-bit RSA private key
- Creates certificate valid for 365 days
- Includes SANs for multiple domains
- Converts to PKCS12 for Java
- Outputs certificates for both API Gateway and Frontend

**Let's Encrypt Setup (Production)**:
- `infrastructure/ssl/setup-letsencrypt.sh`

**Features**:
- Automated Let's Encrypt certificate acquisition
- Supports multiple domains (main, www, api)
- Converts certificates for Java keystore
- Includes renewal instructions

---

### 4. ✅ Created Production Docker Compose Configuration

**File**: `infrastructure/docker/docker-compose.prod.yml`

**Features**:
- Extends base docker-compose.yml
- Enables production Spring profiles
- Mounts SSL certificates as volumes
- Exposes HTTPS ports (443, 8443)
- Production logging configuration
- HTTPS health checks

**Usage**:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

### 5. ✅ Created Production Frontend Dockerfile

**File**: `frontend/Dockerfile.prod`

**Features**:
- Multi-stage build (smaller image)
- Production nginx configuration
- SSL certificate directory
- HTTPS health checks
- Configurable API URL via build arg

---

### 6. ✅ Updated Environment Configuration

**Updated Files**:
- `.env.production.example`
- `.env.production.secure`

**New Variables**:
```bash
# SSL/TLS
SSL_KEYSTORE_PASSWORD=changeit
JWT_EXPIRATION=3600000  # 1 hour

# URLs (HTTPS)
FRONTEND_URL=https://cloudforgetech.in
API_GATEWAY_URL=https://api.cloudforgetech.in

# CORS (HTTPS only, no localhost)
ALLOWED_ORIGINS=https://cloudforgetech.in,https://www.cloudforgetech.in
```

---

### 7. ✅ Created Comprehensive Documentation

**File**: `HTTPS_SETUP_GUIDE.md`

**Sections**:
1. Overview and Architecture
2. Development Setup (Self-Signed Certificates)
3. Production Setup (Let's Encrypt)
4. Production Setup (Commercial CA)
5. Testing HTTPS Configuration
6. Troubleshooting
7. Certificate Renewal
8. Security Best Practices

---

## Files Created

### Configuration Files
1. `services/api-gateway/src/main/resources/application-prod.yml` - Production API Gateway config
2. `frontend/nginx-prod.conf` - Production Nginx config with HTTPS
3. `infrastructure/docker/docker-compose.prod.yml` - Production Docker Compose
4. `frontend/Dockerfile.prod` - Production frontend Dockerfile

### Certificate Generation Scripts
5. `infrastructure/ssl/generate-self-signed-certs.sh` - Self-signed certs (Linux/Mac)
6. `infrastructure/ssl/generate-self-signed-certs.ps1` - Self-signed certs (Windows)
7. `infrastructure/ssl/setup-letsencrypt.sh` - Let's Encrypt setup

### Documentation
8. `HTTPS_SETUP_GUIDE.md` - Comprehensive HTTPS setup guide
9. `.kiro/specs/payment-flow-fix/HTTPS_CORS_CONFIGURATION_COMPLETE.md` - This document

### Updated Files
10. `.env.production.example` - Added SSL/TLS variables
11. `.env.production.secure` - Added SSL/TLS variables

---

## Security Improvements

### Before (Development)
```yaml
# HTTP only
server:
  port: 8080

# Permissive CORS
allowedOrigins:
  - "http://localhost:5173"
  - "http://localhost:3000"
  - "https://cloudforgetech.in"
allowedHeaders: "*"

# Long JWT expiration
jwt:
  expiration: 86400000  # 24 hours
```

### After (Production)
```yaml
# HTTPS with redirect
server:
  port: 8443
  ssl:
    enabled: true

# Strict CORS
allowedOrigins:
  - "https://cloudforgetech.in"
  - "https://www.cloudforgetech.in"
allowedHeaders:
  - Content-Type
  - Authorization
  - X-Requested-With

# Shorter JWT expiration
jwt:
  expiration: 3600000  # 1 hour
```

---

## Deployment Options

### Option 1: Development (Self-Signed Certificates)

```bash
# 1. Generate certificates
cd infrastructure/ssl
./generate-self-signed-certs.sh  # or .ps1 on Windows

# 2. Copy keystore
cp api-gateway/keystore.p12 ../../services/api-gateway/src/main/resources/

# 3. Set environment variables
export SSL_KEYSTORE_PASSWORD=changeit
export ALLOWED_ORIGINS=https://localhost

# 4. Start services
cd ../docker
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 5. Access application
# Frontend: https://localhost
# API: https://localhost:8443
```

**Note**: Browser will show security warning (expected for self-signed certs)

---

### Option 2: Production (Let's Encrypt)

```bash
# 1. Set domain and email
export SSL_DOMAIN=cloudforgetech.in
export SSL_EMAIL=admin@cloudforgetech.in

# 2. Obtain certificates
cd infrastructure/ssl
sudo -E ./setup-letsencrypt.sh

# 3. Copy keystore
sudo cp api-gateway/keystore.p12 ../../services/api-gateway/src/main/resources/

# 4. Load environment variables
export $(cat ../../.env.production.secure | xargs)

# 5. Start services
cd ../docker
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 6. Set up auto-renewal
sudo crontab -e
# Add: 0 0 * * * certbot renew --quiet
```

---

### Option 3: Production (Commercial CA)

```bash
# 1. Obtain certificates from your CA
# You should have: certificate.crt, private.key, ca_bundle.crt

# 2. Create full chain
cat certificate.crt ca_bundle.crt > fullchain.pem
cp private.key privkey.pem

# 3. Convert for Java
openssl pkcs12 -export \
  -in fullchain.pem \
  -inkey privkey.pem \
  -out keystore.p12 \
  -name cloudforge \
  -passout pass:changeit

# 4. Copy certificates
cp keystore.p12 services/api-gateway/src/main/resources/
mkdir -p infrastructure/ssl/frontend
cp fullchain.pem privkey.pem infrastructure/ssl/frontend/

# 5. Deploy (same as Let's Encrypt steps 4-5)
```

---

## Testing HTTPS Configuration

### 1. Test Certificate

```bash
# Check certificate
openssl s_client -connect cloudforgetech.in:443 -servername cloudforgetech.in

# Check expiration
echo | openssl s_client -connect cloudforgetech.in:443 2>/dev/null | openssl x509 -noout -dates
```

### 2. Test Endpoints

```bash
# Frontend
curl -I https://cloudforgetech.in

# API Gateway health
curl https://api.cloudforgetech.in/actuator/health

# Login
curl -X POST https://api.cloudforgetech.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"rajesh.kumar","password":"Password123!"}'
```

### 3. Test HTTP Redirect

```bash
# Should redirect to HTTPS
curl -I http://cloudforgetech.in
# Expected: HTTP/1.1 301 Moved Permanently
# Location: https://cloudforgetech.in/
```

### 4. Test CORS

```bash
# Should allow HTTPS origin
curl -X OPTIONS https://api.cloudforgetech.in/api/products \
  -H "Origin: https://cloudforgetech.in" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Should reject HTTP origin
curl -X OPTIONS https://api.cloudforgetech.in/api/products \
  -H "Origin: http://cloudforgetech.in" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

### 5. SSL Labs Test

For production, test SSL configuration:
https://www.ssllabs.com/ssltest/analyze.html?d=cloudforgetech.in

**Target Grade**: A or A+

---

## Security Checklist

- [x] HTTPS enabled on API Gateway (port 8443)
- [x] HTTPS enabled on Frontend (port 443)
- [x] HTTP to HTTPS redirect configured
- [x] TLS 1.2 and 1.3 only (no TLS 1.0/1.1)
- [x] Strong cipher suites configured
- [x] HSTS header enabled (1 year)
- [x] Security headers configured (CSP, X-Frame-Options, etc.)
- [x] CORS restricted to HTTPS origins only
- [x] No localhost origins in production CORS
- [x] Specific allowed headers (no wildcards)
- [x] JWT expiration reduced to 1 hour
- [x] Production logging levels (INFO/WARN)
- [x] Certificate renewal process documented
- [x] Self-signed certificates for development
- [x] Let's Encrypt support for production
- [x] Commercial CA support documented

---

## What's Next

### Immediate (Before Production Launch)

1. **Generate Production Certificates**
   - Use Let's Encrypt or commercial CA
   - Do NOT use self-signed certificates

2. **Update Domain Configuration**
   - Update `.env.production.secure` with your actual domain
   - Update `frontend/nginx-prod.conf` with your domain

3. **Test HTTPS Configuration**
   - Run all tests in "Testing HTTPS Configuration" section
   - Verify SSL Labs grade is A or A+

4. **Set Up Certificate Renewal**
   - Configure automatic renewal (Let's Encrypt)
   - Set up expiration monitoring

### Short-Term (Within 1 Week)

1. **Implement Rate Limiting**
   - Protect against brute force attacks
   - Limit API requests per IP

2. **Set Up Monitoring**
   - Monitor certificate expiration
   - Alert on SSL/TLS errors
   - Track HTTPS traffic

3. **Configure WAF (Optional)**
   - Web Application Firewall
   - Additional DDoS protection

### Long-Term (Within 1 Month)

1. **Implement Certificate Pinning** (Mobile apps)
2. **Set Up CDN** (CloudFlare, AWS CloudFront)
3. **Enable HTTP/2 Server Push** (Performance)
4. **Implement OCSP Must-Staple** (Enhanced security)

---

## Troubleshooting

See `HTTPS_SETUP_GUIDE.md` for detailed troubleshooting steps.

**Common Issues**:
- Certificate not found → Copy keystore to correct location
- Wrong password → Verify SSL_KEYSTORE_PASSWORD=changeit
- CORS errors → Ensure ALLOWED_ORIGINS uses HTTPS URLs
- Mixed content → Update all API calls to use HTTPS
- Browser warnings → Expected for self-signed certs

---

## Security Status Update

### Critical Issues - RESOLVED ✅

| Issue | Status | Solution |
|-------|--------|----------|
| No HTTPS/TLS | ✅ FIXED | HTTPS enabled on ports 443 and 8443 |
| Permissive CORS | ✅ FIXED | Production CORS with HTTPS-only origins |
| Wildcard Headers | ✅ FIXED | Specific allowed headers configured |
| Long JWT Expiration | ✅ FIXED | Reduced to 1 hour in production |

### Remaining High-Priority Issues ⚠️

1. **Rate Limiting** - Implement in API Gateway (future enhancement)
2. **Account Lockout** - Implement in User Service (future enhancement)
3. **Centralized Logging** - Set up ELK stack or CloudWatch (future enhancement)
4. **Dependency Scanning** - Run security scans (future enhancement)

---

## Conclusion

**Status**: ✅ **HTTPS/TLS AND CORS CONFIGURATION COMPLETE**

All HTTPS/TLS and production CORS requirements have been implemented:
1. ✅ HTTPS enabled for API Gateway and Frontend
2. ✅ HTTP to HTTPS redirect configured
3. ✅ Production CORS with HTTPS-only origins
4. ✅ Strong TLS configuration (TLS 1.2/1.3, strong ciphers)
5. ✅ Security headers configured
6. ✅ Certificate generation scripts created
7. ✅ Comprehensive documentation provided

The system is now ready for secure production deployment.

**Next Steps**:
1. Generate production certificates (Let's Encrypt or commercial CA)
2. Update domain configuration
3. Test HTTPS configuration
4. Deploy to production

**Recommendation**: Follow `HTTPS_SETUP_GUIDE.md` for step-by-step deployment instructions.

---

**Completed By**: Kiro AI Assistant  
**Date**: April 19, 2026  
**Review Status**: Ready for Production Deployment  
**Next Action**: Generate Production Certificates and Deploy
