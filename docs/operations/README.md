# Operations Documentation

Runbooks, troubleshooting, and operational procedures.

---

## 📚 Documents

| Document | Description |
|----------|-------------|
| [Runbook](runbook.md) | Standard operating procedures |
| [Troubleshooting](troubleshooting.md) | Common issues and fixes |
| [Disaster Recovery](disaster-recovery.md) | DR procedures |
| [SLA/SLO](sla-slo.md) | Service level objectives |
| [Performance Tuning](performance-tuning.md) | Optimization guide |
| [Cost Optimization](cost-optimization.md) | Cloud cost management |

---

## 🚨 On-Call Procedures

1. Check Grafana dashboards
2. Review Loki logs
3. Check pod status: `kubectl get pods -n cloudforge`
4. Follow runbook for specific issues

---

## 📖 Related Docs

- [Observability](../observability/README.md)
- [Infrastructure](../infrastructure/README.md)
