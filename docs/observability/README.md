# Observability Documentation

Monitoring, logging, and tracing documentation.

---

## 📚 Documents

| Document | Description |
|----------|-------------|
| [Monitoring](monitoring.md) | Prometheus & Grafana setup |
| [Logging](logging.md) | Loki centralized logging |

---

## 📊 Observability Stack

| Component | Purpose | Port |
|-----------|---------|------|
| Prometheus | Metrics collection | 9090 |
| Grafana | Visualization | 3000 |
| Loki | Log aggregation | 3100 |
| Promtail | Log shipping | - |
| Zipkin | Distributed tracing | 9411 |
| Alertmanager | Alert routing | 9093 |

---

## 📈 Key Metrics

- Request Rate (RPS)
- Error Rate (%)
- P99 Latency (ms)
- JVM Heap Usage
- CPU Utilization
- Database Connections

---

## 📖 Related Docs

- [Phase 5: Observability](../phases/phase-5-observability.md)
- [Operations Runbook](../operations/runbook.md)
