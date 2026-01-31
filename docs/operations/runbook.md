# Runbook - Incident Response

Operational procedures for handling incidents in CloudForge.

---

## 🚨 Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P1 - Critical** | Complete outage, data loss risk | 15 minutes | All services down, DB corruption |
| **P2 - High** | Major feature impacted | 1 hour | Payment service down, auth failures |
| **P3 - Medium** | Degraded performance | 4 hours | Slow response times, minor feature broken |
| **P4 - Low** | Minor issue | 24 hours | UI glitch, non-critical bug |

---

## 📞 Escalation Matrix

| Role | Contact | Escalation Trigger |
|------|---------|-------------------|
| On-Call Engineer | PagerDuty | Automated alert |
| Tech Lead | Slack @channel | P1/P2 not resolved in 30 min |
| Engineering Manager | Phone | P1 not resolved in 1 hour |
| VP Engineering | Phone | P1 > 2 hours, customer impact |

---

## 🔥 Common Incidents

### Service Not Responding

**Symptoms:** 5xx errors, health check failures

**Diagnosis:**
```bash
# Check pod status
kubectl get pods -n cloudforge

# Check logs
kubectl logs -f deployment/<service> -n cloudforge --tail=100

# Check resources
kubectl top pods -n cloudforge
```

**Resolution:**
1. **OOMKilled:** Increase memory limits
2. **CrashLoopBackOff:** Check logs for startup errors
3. **ImagePullBackOff:** Verify image exists and credentials

```bash
# Restart deployment
kubectl rollout restart deployment/<service> -n cloudforge

# Scale up if needed
kubectl scale deployment/<service> --replicas=3 -n cloudforge
```

---

### Database Connection Issues

**Symptoms:** Connection refused, timeout errors

**Diagnosis:**
```bash
# Check DB pod
kubectl get pods -l app=postgres -n cloudforge

# Check connections
kubectl exec -it <postgres-pod> -- psql -U cloudforge -c "SELECT count(*) FROM pg_stat_activity;"
```

**Resolution:**
1. Check connection pool exhaustion
2. Verify network policies
3. Check DB resource utilization
4. Restart DB if necessary (with caution!)

---

### High Latency

**Symptoms:** Slow API responses, timeout errors

**Diagnosis:**
```bash
# Check resource usage
kubectl top pods -n cloudforge

# Check Grafana dashboards
# - Request latency
# - DB query times
# - External API calls
```

**Resolution:**
1. Identify slow endpoint via Zipkin traces
2. Check database indexes
3. Scale up replicas
4. Clear Redis cache if stale

---

### Authentication Failures

**Symptoms:** 401/403 errors, login failures

**Diagnosis:**
```bash
# Check LDAP
kubectl logs deployment/ldap -n cloudforge

# Check Vault
kubectl logs deployment/vault -n cloudforge
```

**Resolution:**
1. Verify LDAP is running
2. Check Vault token expiration
3. Verify JWT secret configuration
4. Check clock sync between services

---

## 📊 Key Dashboards

| Dashboard | Purpose | URL |
|-----------|---------|-----|
| Service Overview | All services health | Grafana → CloudForge Overview |
| Error Rates | 4xx/5xx errors | Grafana → Error Dashboard |
| Latency | P50/P95/P99 latency | Grafana → Latency Dashboard |
| Resources | CPU/Memory usage | Grafana → Resources |

---

## 🔄 Rollback Procedures

### Helm Rollback
```bash
# List revisions
helm history cloudforge -n cloudforge

# Rollback to previous
helm rollback cloudforge <revision> -n cloudforge
```

### ArgoCD Rollback
```bash
argocd app history cloudforge
argocd app rollback cloudforge <revision>
```

### Database Rollback
```bash
# Restore from backup
./scripts/restore-db.sh <backup-timestamp>

# Rollback Flyway migration
./mvnw flyway:undo
```

---

## 📝 Post-Incident Review

After every P1/P2 incident:

1. **Timeline:** Document what happened when
2. **Root Cause:** Identify the underlying issue
3. **Impact:** Users affected, duration
4. **Resolution:** How it was fixed
5. **Prevention:** Action items to prevent recurrence

Template: `docs/templates/post-incident-template.md`

---

## 📚 Related Docs

- [Monitoring](monitoring.md)
- [Logging](logging.md)
- [Troubleshooting](troubleshooting.md)
