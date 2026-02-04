---
title: "Monitoring"
description: "Prometheus and Grafana setup for observability"
icon: "chart-line"
---

# Monitoring Guide

Setting up Prometheus and Grafana for CloudForge observability.

---

## 🏗️ Monitoring Stack

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Microservices│────▶│  Prometheus  │────▶│   Grafana    │
│  /metrics    │     │   Scrape     │     │  Dashboards  │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐     ┌──────────────┐
                     │ Alertmanager │────▶│    Slack     │
                     └──────────────┘     └──────────────┘
```

---

## 🚀 Quick Start

### Docker Compose
```bash
docker-compose up -d prometheus grafana alertmanager
```

### Kubernetes
```bash
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring
```

---

## 📊 Access Dashboards

| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana | http://localhost:3001 | admin / admin |
| Prometheus | http://localhost:9090 | - |
| Alertmanager | http://localhost:9093 | - |

---

## 📈 Key Metrics

### Application Metrics
```promql
# Request rate
rate(http_server_requests_seconds_count[5m])

# Error rate
rate(http_server_requests_seconds_count{status=~"5.."}[5m])

# Latency (p99)
histogram_quantile(0.99, rate(http_server_requests_seconds_bucket[5m]))
```

### JVM Metrics
```promql
# Memory usage
jvm_memory_used_bytes{area="heap"}

# GC time
rate(jvm_gc_pause_seconds_sum[5m])
```

---

## 🚨 Alerts

### Alert Rules (alertmanager.yml)
```yaml
groups:
  - name: cloudforge
    rules:
      - alert: HighErrorRate
        expr: rate(http_server_requests_seconds_count{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.service }}"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
```

### Slack Integration
```yaml
receivers:
  - name: 'slack'
    slack_configs:
      - channel: '#alerts'
        api_url: 'https://hooks.slack.com/services/xxx'
```

---

## 📚 Next Steps

- [Logging](logging.md) - Loki setup
- [Troubleshooting](troubleshooting.md) - Common issues
