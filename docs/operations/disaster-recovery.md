# Disaster Recovery Guide

Business continuity and disaster recovery procedures for CloudForge.

---

## 🎯 Recovery Objectives

| Metric | Target | Description |
|--------|--------|-------------|
| **RTO** (Recovery Time Objective) | 4 hours | Max acceptable downtime |
| **RPO** (Recovery Point Objective) | 1 hour | Max acceptable data loss |

---

## 💾 Backup Strategy

### PostgreSQL Backups

| Type | Frequency | Retention | Location |
|------|-----------|-----------|----------|
| Full backup | Daily 2 AM | 30 days | Azure Blob Storage |
| WAL archiving | Continuous | 7 days | Azure Blob Storage |
| Point-in-time | On-demand | 24 hours | Local snapshot |

```bash
# Manual backup
kubectl exec -it <postgres-pod> -- pg_dump -U cloudforge cloudforge > backup.sql

# Automated backup (CronJob)
kubectl apply -f infrastructure/k8s/postgres-backup-cronjob.yaml
```

### MongoDB Backups

```bash
# Manual backup
kubectl exec -it <mongo-pod> -- mongodump --out /backup

# Restore
kubectl exec -it <mongo-pod> -- mongorestore /backup
```

### Redis
- Redis is used for caching only
- No disaster recovery needed (cache can be rebuilt)

---

## 🔄 Recovery Procedures

### Full Cluster Recovery

1. **Infrastructure**
   ```bash
   cd infrastructure/terraform/azure
   terraform apply
   ```

2. **Get Kubeconfig**
   ```bash
   az aks get-credentials --resource-group cloudforge-rg --name cloudforge-aks
   ```

3. **Restore Databases**
   ```bash
   ./scripts/restore-postgres.sh <backup-date>
   ./scripts/restore-mongo.sh <backup-date>
   ```

4. **Deploy Application**
   ```bash
   helm install cloudforge ./infrastructure/helm/cloudforge -n cloudforge
   ```

5. **Verify**
   ```bash
   kubectl get pods -n cloudforge
   curl https://api.cloudforge.io/actuator/health
   ```

---

### Database Recovery Only

```bash
# Postgres
kubectl exec -it <postgres-pod> -- psql -U cloudforge cloudforge < backup.sql

# MongoDB
kubectl exec -it <mongo-pod> -- mongorestore /backup
```

---

### Single Service Recovery

```bash
# Redeploy single service
helm upgrade cloudforge ./infrastructure/helm/cloudforge \
  -n cloudforge \
  --set userService.image.tag=<last-good-version>
```

---

## 🌍 Multi-Region Failover

### Active-Passive Setup

```
┌─────────────────┐         ┌─────────────────┐
│  Primary (East) │◄───────►│ Secondary (West)│
│     (Active)    │  Async  │   (Standby)     │
└─────────────────┘  Repl   └─────────────────┘
```

### Failover Steps

1. Confirm primary is down
2. Promote secondary database
3. Update DNS to point to secondary
4. Notify users of potential data loss

---

## ✅ DR Testing Schedule

| Test | Frequency | Last Test | Next Test |
|------|-----------|-----------|-----------|
| Backup verification | Weekly | - | - |
| Single service recovery | Monthly | - | - |
| Full cluster recovery | Quarterly | - | - |
| Multi-region failover | Annually | - | - |

---

## 📋 Checklist

- [ ] Daily backups running
- [ ] Backups tested monthly
- [ ] Recovery procedures documented
- [ ] DR contacts up to date
- [ ] Runbook reviewed quarterly

---

## 📚 Related Docs

- [Runbook](runbook.md)
- [Azure Deployment](azure-deployment.md)
