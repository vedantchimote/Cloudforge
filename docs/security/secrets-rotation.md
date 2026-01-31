# Secrets Rotation Guide

Managing and rotating secrets in CloudForge.

---

## 🔐 Secrets Inventory

| Secret | Storage | Rotation Period | Owner |
|--------|---------|-----------------|-------|
| DB passwords | Vault | 90 days | Platform |
| API keys | Vault | 90 days | Platform |
| JWT secret | Vault | 30 days | Platform |
| LDAP admin | Vault | 90 days | Security |
| TLS certs | Cert-manager | Auto (90 days) | Platform |

---

## 🔄 Rotation Procedures

### Database Passwords

1. **Generate new password**
   ```bash
   vault kv put secret/cloudforge/postgres password=$(openssl rand -base64 32)
   ```

2. **Update in database**
   ```sql
   ALTER USER cloudforge WITH PASSWORD 'new-password';
   ```

3. **Restart services** (to pick up new secret)
   ```bash
   kubectl rollout restart deployment -n cloudforge
   ```

4. **Verify** connections working

---

### JWT Secret

1. **Generate new secret**
   ```bash
   vault kv put secret/cloudforge/jwt secret=$(openssl rand -base64 64)
   ```

2. **Rolling restart**
   ```bash
   kubectl rollout restart deployment/user-service -n cloudforge
   ```

3. **Note:** Users will need to re-login

---

### TLS Certificates

Handled automatically by cert-manager:
```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
spec:
  renewBefore: 720h  # 30 days before expiry
```

---

## 📅 Rotation Schedule

| Week | Action |
|------|--------|
| 1st of month | Review expiring secrets |
| 15th of month | Rotate scheduled secrets |
| Quarterly | Full secrets audit |

---

## 🚨 Emergency Rotation

If a secret is compromised:

1. **Immediate:** Generate new secret in Vault
2. **Rotate:** Update all services
3. **Revoke:** Remove old secret
4. **Audit:** Check for unauthorized access
5. **Document:** Post-incident report

---

## 📚 Related Docs

- [Security](security.md)
- [Runbook](runbook.md)
