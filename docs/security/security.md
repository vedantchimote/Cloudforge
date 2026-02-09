---
title: "Security Guide"
description: "Security configuration including Vault, LDAP, and security scanning"
icon: "shield"
---

# Security Guide

Security configuration for CloudForge including Vault, LDAP, and security scanning.

---

## 🔐 Security Architecture

```mermaid
graph TD
    subgraph Security_Layers [Security Layers]
        direction TB
        L1[TLS/HTTPS Ingress] --- L2[Authentication JWT + LDAP]
        L2 --- L3[Authorization RBAC]
        L3 --- L4[Secrets HashiCorp Vault]
        L4 --- L5[Container Scanning Trivy]
        L5 --- L6[DAST OWASP ZAP]
    end
    style Security_Layers fill:#f9f9f9,stroke:#333,stroke-width:2px
```

---

## 🔑 HashiCorp Vault

### Access Vault UI
- URL: http://localhost:8200
- Token: `dev-token` (development only)

### Store Secrets
```bash
vault kv put secret/cloudforge/database \
  username=cloudforge \
  password=secret123
```

### Read Secrets
```bash
vault kv get secret/cloudforge/database
```

---

## 👤 LDAP Configuration

### Default Users
| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| user | user123 | USER |

### LDAP Structure
```mermaid
graph TD
    DC[dc=cloudforge,dc=io]
    OU_USERS[ou=users]
    OU_GROUPS[ou=groups]
    
    CN_ADMIN[cn=admin]
    CN_USER[cn=user]
    CN_ADMINS[cn=admins]
    CN_USERS[cn=users]

    DC --> OU_USERS
    DC --> OU_GROUPS
    
    OU_USERS --> CN_ADMIN
    OU_USERS --> CN_USER
    
    OU_GROUPS --> CN_ADMINS
    OU_GROUPS --> CN_USERS
```

---

## 🛡️ Security Scanning

### Trivy (Container Scanning)
```bash
# Scan image
trivy image cloudforge/user-service:latest

# CI integration
trivy image --exit-code 1 --severity HIGH,CRITICAL <image>
```

### OWASP ZAP (DAST)
```bash
# Baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:8080
```

---

## ✅ Security Checklist

- [ ] All secrets in Vault
- [ ] TLS enabled
- [ ] JWT tokens validated
- [ ] RBAC configured
- [ ] Container images scanned
- [ ] Dependencies updated
- [ ] Network policies applied

---

## 📚 Next Steps

- [CI/CD Pipeline](ci-cd-pipeline.md) - Security in CI
- [Troubleshooting](troubleshooting.md) - Security issues
