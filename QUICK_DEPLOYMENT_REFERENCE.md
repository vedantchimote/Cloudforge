# Quick Deployment Reference Card

**CloudForge Production Deployment - Quick Reference**

---

## 🚀 5-Minute Deployment

### 1. Generate Certificates (Choose One)

**Production (Let's Encrypt):**
```bash
cd infrastructure/ssl
export SSL_DOMAIN=your-domain.com
export SSL_EMAIL=admin@your-domain.com
sudo -E ./setup-letsencrypt.sh
```

**Testing (Self-Signed):**
```bash
cd infrastructure/ssl
./generate-self-signed-certs.sh
```

### 2. Copy Certificates
```bash
cp infrastructure/ssl/api-gateway/keystore.p12 services/api-gateway/src/main/resources/
```

### 3. Update Domain
Edit `.env.production.secure`:
```bash
FRONTEND_URL=https://your-domain.com
API_GATEWAY_URL=https://api.your-domain.com
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 4. Deploy
```bash
export $(cat .env.production.secure | xargs)
cd infrastructure/docker
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 5. Verify
```bash
curl -I https://your-domain.com
curl https://api.your-domain.com/actuator/health
```

---

## 🔑 Production Secrets

**Location**: `.env.production.secure`

```
JWT_SECRET=SsQIb/NPgf4aRZgVUWneJ6X4Kug3NOypDtTdG7Looc83NgSHZQvL9RmwswEuiNwlcdXxJUggCPG0YqLiOi7/oQ==
POSTGRES_PASSWORD=MJrMNisC2pjkgTSIUBFQuc++riWKSJ8003JmsutqpKo=
MONGO_ROOT_PASSWORD=GVXAysIge7ef3cOA0JFeo8fys2Gdg6loV47zSp9VVO0=
REDIS_PASSWORD=q8UKDLLTokc0TWfmfQVCrLws7pzxchQTMoUTUmrzSlE=
LDAP_ADMIN_PASSWORD=Ako5KCD3qUDEO4RL9Z4v38PGjZrvkFJk+F5PhCy1mlc=
SSL_KEYSTORE_PASSWORD=changeit
```

**⚠️ BACKUP THESE IMMEDIATELY!**

---

## 🔍 Quick Tests

```bash
# Frontend
curl -I https://your-domain.com

# API Health
curl https://api.your-domain.com/actuator/health

# Login
curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"rajesh.kumar","password":"Password123!"}'

# HTTP Redirect
curl -I http://your-domain.com  # Should redirect to HTTPS
```

---

## 📊 Service Ports

| Service | HTTP | HTTPS |
|---------|------|-------|
| Frontend | 80 (redirect) | 443 |
| API Gateway | 8080 (redirect) | 8443 |
| PostgreSQL | 5432 | - |
| MongoDB | 27017 | - |
| Redis | 6379 | - |

---

## 🛠️ Common Commands

```bash
# View logs
docker-compose logs -f api-gateway

# Restart service
docker-compose restart api-gateway

# Check service status
docker-compose ps

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Certificate not found | `cp infrastructure/ssl/api-gateway/keystore.p12 services/api-gateway/src/main/resources/` |
| Wrong password | `export SSL_KEYSTORE_PASSWORD=changeit` |
| CORS errors | Verify ALLOWED_ORIGINS uses HTTPS |
| Mixed content | Update API calls to HTTPS |
| Service won't start | Check logs: `docker-compose logs <service>` |

---

## 📚 Documentation

- **Full Guide**: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **HTTPS Setup**: `HTTPS_SETUP_GUIDE.md`
- **Security Report**: `SECURITY_FIXES_COMPLETE.md`
- **Summary**: `PRODUCTION_READY_SUMMARY.md`

---

## ✅ Pre-Deployment Checklist

- [ ] SSL certificates generated
- [ ] Domain configured in `.env.production.secure`
- [ ] Certificates copied to correct locations
- [ ] Environment variables loaded
- [ ] Firewall rules configured (ports 80, 443)
- [ ] DNS pointing to server
- [ ] Backup of `.env.production.secure` in password manager

---

## 📞 Emergency Contacts

- **DevOps**: devops@your-domain.com
- **Security**: security@your-domain.com
- **On-Call**: +1-XXX-XXX-XXXX

---

**Last Updated**: April 19, 2026  
**Version**: 1.0
