# Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying CloudForge to production with proper security configurations.

## Prerequisites

- Docker and Docker Compose installed
- Access to production server
- SSL/TLS certificates (for HTTPS)
- Production domain configured
- Secure password manager or secrets vault

---

## Step 1: Environment Variables Setup

### 1.1 Copy Environment Template

```bash
cp .env.production.example .env.production
```

### 1.2 Generate Strong Secrets

**Generate JWT Secret (512-bit):**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Generate Database Passwords (256-bit):**
```bash
# PostgreSQL
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# MongoDB
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Redis
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# LDAP Admin
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Eureka
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 1.3 Update .env.production

Edit `.env.production` and replace all placeholder values:

```bash
# CRITICAL: Replace these with generated values
JWT_SECRET=<your-generated-jwt-secret>
POSTGRES_PASSWORD=<your-generated-postgres-password>
MONGO_ROOT_PASSWORD=<your-generated-mongo-password>
REDIS_PASSWORD=<your-generated-redis-password>
LDAP_ADMIN_PASSWORD=<your-generated-ldap-password>
EUREKA_PASSWORD=<your-generated-eureka-password>

# Update with your production domain
FRONTEND_URL=https://your-domain.com
API_GATEWAY_URL=https://api.your-domain.com
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Update with your email provider
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=noreply@your-domain.com
MAIL_PASSWORD=<your-app-specific-password>

# Update with your Razorpay production keys
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
```

### 1.4 Secure the Environment File

```bash
# Set restrictive permissions
chmod 600 .env.production

# Verify it's in .gitignore
grep ".env.production" .gitignore
```

**CRITICAL:** Store a backup of `.env.production` in a secure password manager or secrets vault!

---

## Step 2: HTTPS/TLS Configuration

### 2.1 Obtain SSL Certificates

**Option A: Let's Encrypt (Recommended for production)**
```bash
# Install certbot
sudo apt-get install certbot

# Obtain certificates
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com -d api.your-domain.com
```

**Option B: Commercial CA**
- Purchase SSL certificate from a trusted CA
- Follow CA's instructions for certificate generation

**Option C: Self-Signed (Development/Testing only)**
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout selfsigned.key -out selfsigned.crt
```

### 2.2 Configure API Gateway for HTTPS

Create `services/api-gateway/src/main/resources/application-prod.yml`:

```yaml
server:
  port: 8443
  ssl:
    enabled: true
    key-store: classpath:keystore.p12
    key-store-password: ${SSL_KEYSTORE_PASSWORD}
    key-store-type: PKCS12
    key-alias: cloudforge
```

Convert certificates to PKCS12 format:
```bash
openssl pkcs12 -export \
  -in /etc/letsencrypt/live/your-domain.com/fullchain.pem \
  -inkey /etc/letsencrypt/live/your-domain.com/privkey.pem \
  -out keystore.p12 \
  -name cloudforge
```

### 2.3 Configure Frontend (Nginx) for HTTPS

Update `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass https://api-gateway:8443;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Step 3: Update CORS Configuration

Edit `services/api-gateway/src/main/resources/application.yml`:

```yaml
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins:
              - "${ALLOWED_ORIGINS:https://your-domain.com}"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
            allowedHeaders:
              - Content-Type
              - Authorization
              - X-Requested-With
            allowCredentials: true
            maxAge: 3600
```

---

## Step 4: Production Logging Configuration

### 4.1 Update Logging Levels

For each service, update `application.yml`:

```yaml
logging:
  level:
    io.cloudforge: INFO
    org.springframework: WARN
    org.hibernate: WARN
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
  file:
    name: /var/log/cloudforge/${spring.application.name}.log
    max-size: 10MB
    max-history: 30
```

### 4.2 Set Up Log Rotation

Create `/etc/logrotate.d/cloudforge`:

```
/var/log/cloudforge/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
}
```

---

## Step 5: Deploy with Docker Compose

### 5.1 Load Environment Variables

```bash
# Export environment variables
export $(cat .env.production | xargs)

# Verify variables are loaded
echo $JWT_SECRET | head -c 20
```

### 5.2 Build and Start Services

```bash
cd infrastructure/docker

# Build images
docker-compose build

# Start services
docker-compose up -d

# Check service health
docker-compose ps
```

### 5.3 Verify Services

```bash
# Check logs
docker-compose logs -f api-gateway
docker-compose logs -f user-service

# Test health endpoints
curl https://api.your-domain.com/actuator/health
```

---

## Step 6: Database Initialization

### 6.1 Verify Database Connections

```bash
# PostgreSQL
docker exec -it cloudforge-postgres psql -U cloudforge -d cloudforge -c "\l"

# MongoDB
docker exec -it cloudforge-mongodb mongosh -u root -p $MONGO_ROOT_PASSWORD --authenticationDatabase admin

# Redis
docker exec -it cloudforge-redis redis-cli -a $REDIS_PASSWORD ping
```

### 6.2 Run Migrations

Flyway migrations run automatically on service startup. Verify:

```bash
docker-compose logs user-service | grep "Flyway"
docker-compose logs order-service | grep "Flyway"
```

---

## Step 7: LDAP User Setup

### 7.1 Add Production Users

```bash
# Copy LDIF file to container
docker cp infrastructure/docker/ldap-indian-users.ldif cloudforge-ldap:/tmp/

# Import users
docker exec cloudforge-ldap ldapadd -x -D "cn=admin,dc=cloudforge,dc=io" \
  -w $LDAP_ADMIN_PASSWORD -f /tmp/ldap-indian-users.ldif
```

### 7.2 Verify Users

```bash
docker exec cloudforge-ldap ldapsearch -x -b "dc=cloudforge,dc=io" \
  -D "cn=admin,dc=cloudforge,dc=io" -w $LDAP_ADMIN_PASSWORD "(uid=*)"
```

---

## Step 8: Security Hardening

### 8.1 Enable Firewall

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirect to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 8.2 Disable Unnecessary Services

```bash
# Stop and disable unused services
sudo systemctl stop <unused-service>
sudo systemctl disable <unused-service>
```

### 8.3 Set Up Fail2Ban

```bash
# Install fail2ban
sudo apt-get install fail2ban

# Configure for SSH and web services
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## Step 9: Monitoring Setup

### 9.1 Health Check Monitoring

Create a monitoring script `monitor-services.sh`:

```bash
#!/bin/bash

SERVICES=(
  "https://api.your-domain.com/actuator/health"
  "https://your-domain.com/health"
)

for service in "${SERVICES[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" $service)
  if [ $status -ne 200 ]; then
    echo "ALERT: $service returned $status"
    # Send alert (email, Slack, PagerDuty, etc.)
  fi
done
```

### 9.2 Set Up Cron Job

```bash
# Add to crontab
crontab -e

# Check every 5 minutes
*/5 * * * * /path/to/monitor-services.sh
```

---

## Step 10: Backup Strategy

### 10.1 Database Backups

Create backup script `backup-databases.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/cloudforge"
DATE=$(date +%Y%m%d_%H%M%S)

# PostgreSQL backup
docker exec cloudforge-postgres pg_dumpall -U cloudforge > \
  $BACKUP_DIR/postgres_$DATE.sql

# MongoDB backup
docker exec cloudforge-mongodb mongodump --username root \
  --password $MONGO_ROOT_PASSWORD --authenticationDatabase admin \
  --out /tmp/mongo_backup
docker cp cloudforge-mongodb:/tmp/mongo_backup $BACKUP_DIR/mongo_$DATE

# Compress backups
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/*_$DATE*

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete
```

### 10.2 Schedule Backups

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup-databases.sh
```

---

## Step 11: Testing Production Deployment

### 11.1 Smoke Tests

```bash
# Test authentication
curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"rajesh.kumar","password":"Password123!"}'

# Test product listing
curl https://api.your-domain.com/api/products

# Test order creation (with JWT token)
curl -X POST https://api.your-domain.com/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"items":[{"productId":"<product-id>","quantity":1}]}'
```

### 11.2 Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test with 100 concurrent users
ab -n 1000 -c 100 https://your-domain.com/
```

---

## Step 12: Post-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] HTTPS/TLS configured and working
- [ ] HTTP redirects to HTTPS
- [ ] CORS configured for production domain only
- [ ] Logging level set to INFO or WARN
- [ ] Database backups scheduled
- [ ] Monitoring and alerts configured
- [ ] Firewall rules applied
- [ ] Fail2Ban configured
- [ ] SSL certificates will auto-renew (if using Let's Encrypt)
- [ ] All services healthy and running
- [ ] Smoke tests passed
- [ ] Load tests passed
- [ ] Documentation updated
- [ ] Team trained on production procedures

---

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Check environment variables
docker exec <container-name> env | grep JWT_SECRET

# Restart specific service
docker-compose restart <service-name>
```

### Database Connection Issues

```bash
# Check database is running
docker-compose ps postgres

# Test connection
docker exec cloudforge-postgres pg_isready -U cloudforge

# Check password
echo $POSTGRES_PASSWORD
```

### HTTPS Certificate Issues

```bash
# Test certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Renew Let's Encrypt certificate
sudo certbot renew
```

---

## Security Maintenance

### Monthly Tasks

- [ ] Review access logs for suspicious activity
- [ ] Update dependencies (npm audit, mvn versions:display-dependency-updates)
- [ ] Review and rotate API keys if needed
- [ ] Test backup restoration
- [ ] Review monitoring alerts

### Quarterly Tasks

- [ ] Rotate database passwords
- [ ] Rotate JWT secret (requires user re-authentication)
- [ ] Security audit and penetration testing
- [ ] Review and update firewall rules
- [ ] Update SSL certificates if needed

---

## Emergency Procedures

### Rollback Deployment

```bash
# Stop current deployment
docker-compose down

# Checkout previous version
git checkout <previous-tag>

# Rebuild and restart
docker-compose build
docker-compose up -d
```

### Restore from Backup

```bash
# Stop services
docker-compose down

# Restore PostgreSQL
docker exec -i cloudforge-postgres psql -U cloudforge < backup.sql

# Restore MongoDB
docker cp mongo_backup cloudforge-mongodb:/tmp/
docker exec cloudforge-mongodb mongorestore --username root \
  --password $MONGO_ROOT_PASSWORD --authenticationDatabase admin \
  /tmp/mongo_backup

# Restart services
docker-compose up -d
```

---

## Support and Contacts

- **DevOps Team**: devops@your-domain.com
- **Security Team**: security@your-domain.com
- **On-Call**: +1-XXX-XXX-XXXX

---

**Last Updated**: April 19, 2026  
**Version**: 1.0  
**Maintained By**: CloudForge DevOps Team
