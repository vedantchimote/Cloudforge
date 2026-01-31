# Service Level Objectives (SLOs)

Reliability targets and SLIs for CloudForge.

---

## 📊 Key Metrics

### SLI (Service Level Indicators)

| SLI | Definition | Measurement |
|-----|------------|-------------|
| **Availability** | % of successful requests | `(total - 5xx) / total` |
| **Latency** | Response time | P50, P95, P99 percentiles |
| **Error Rate** | % of failed requests | `5xx / total` |
| **Throughput** | Requests per second | `rate(requests[5m])` |

---

## 🎯 SLOs (Service Level Objectives)

### Availability SLOs

| Service | SLO | Error Budget (monthly) |
|---------|-----|------------------------|
| API Gateway | 99.9% | 43.2 minutes |
| User Service | 99.9% | 43.2 minutes |
| Product Service | 99.5% | 3.6 hours |
| Order Service | 99.9% | 43.2 minutes |
| Payment Service | 99.99% | 4.3 minutes |

### Latency SLOs

| Endpoint Type | P50 | P95 | P99 |
|---------------|-----|-----|-----|
| Read (GET) | <100ms | <300ms | <500ms |
| Write (POST/PUT) | <200ms | <500ms | <1000ms |
| Search | <300ms | <800ms | <1500ms |

---

## 📈 Error Budget Policy

### Budget Consumption

| Consumed | Action |
|----------|--------|
| <50% | Normal development, new features |
| 50-75% | Caution, prioritize reliability |
| 75-90% | Freeze new features, focus on stability |
| >90% | All hands on reliability |

### Calculation

```promql
# Error budget remaining
1 - (
  sum(rate(http_requests_total{status=~"5.."}[30d]))
  /
  sum(rate(http_requests_total[30d]))
) / (1 - 0.999)
```

---

## 📋 SLA (External Promise)

| Tier | Availability | Support | Penalty |
|------|--------------|---------|---------|
| Enterprise | 99.9% | 24/7, 15min response | 10% credit |
| Business | 99.5% | 8x5, 4hr response | 5% credit |
| Free | Best effort | Community | None |

---

## 🔔 Alerting on SLO Burn Rate

```yaml
# Fast burn (2% of 30-day budget in 1 hour)
- alert: SLOBurnRateFast
  expr: |
    sum(rate(http_requests_total{status=~"5.."}[1h]))
    / sum(rate(http_requests_total[1h])) > 0.02 * 30
  for: 2m
  labels:
    severity: critical

# Slow burn (5% of 30-day budget in 6 hours)
- alert: SLOBurnRateSlow
  expr: |
    sum(rate(http_requests_total{status=~"5.."}[6h]))
    / sum(rate(http_requests_total[6h])) > 0.05 * 5
  for: 15m
  labels:
    severity: warning
```

---

## 📚 Related Docs

- [Monitoring](monitoring.md)
- [Runbook](runbook.md)
