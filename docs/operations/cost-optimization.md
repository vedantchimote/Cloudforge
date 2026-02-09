---
title: "Cost Optimization"
description: "Managing cloud costs for CloudForge"
icon: "money-bill-wave"
---

# Cost Optimization Guide

Managing cloud costs for CloudForge.

---

## 💰 Cost Breakdown

| Category | Est. Monthly (Dev) | Est. Monthly (Prod) |
|----------|-------------------|---------------------|
| AKS Cluster | $70 | $350 |
| PostgreSQL | $25 | $100 |
| Redis | $15 | $50 |
| Storage | $10 | $30 |
| Networking | $5 | $20 |
| **Total** | **~$125** | **~$550** |

---

## 💡 Optimization Strategies

### Compute

| Strategy | Savings | Implementation |
|----------|---------|----------------|
| Spot instances (non-prod) | 60-80% | Enable spot node pools |
| Right-size VMs | 20-30% | Analyze usage, downsize |
| Auto-scaling | Variable | HPA for peak only |
| Reserved instances | 30-40% | 1-year commitment |

### Kubernetes
```yaml
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### Database
- Use Basic tier for dev
- Auto-pause dev databases
- Right-size production

### Storage
- Use lifecycle policies
- Delete old logs/backups
- Use cheaper tiers for archives

---

## 📊 Monitoring Costs

```bash
# Azure Cost Analysis
az consumption usage list --query "[].{Name:instanceName, Cost:pretaxCost}"
```

### Grafana Dashboard
Create a cost dashboard showing:
- Daily spend trend
- Cost by service
- Cost by environment

---

## ✅ Cost Checklist

- [ ] Spot instances enabled for dev
- [ ] Auto-scaling configured
- [ ] Unused resources deleted
- [ ] Right-sized VMs
- [ ] Storage lifecycle policies

---

## 📚 Related Docs

- [Azure Deployment](azure-deployment.md)
- [Kubernetes Guide](kubernetes-guide.md)
