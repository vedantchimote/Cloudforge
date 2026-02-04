---
title: "Logging"
description: "Centralized logging with Loki and Grafana"
icon: "scroll"
---

# Logging Guide

Centralized logging with Loki and Grafana.

---

## 🏗️ Logging Stack

```
Microservices ──▶ Promtail ──▶ Loki ──▶ Grafana
```

---

## 🚀 Setup

### Docker Compose
```bash
docker-compose up -d loki promtail
```

### Kubernetes
```bash
helm install loki grafana/loki-stack -n monitoring --set grafana.enabled=false
```

---

## 🔍 Querying Logs

### LogQL Examples
```logql
# All logs from user-service
{app="user-service"}

# Errors only
{app="user-service"} |= "ERROR"

# JSON parsing
{app="user-service"} | json | level="error"

# Rate of errors
rate({app="user-service"} |= "ERROR" [5m])
```

---

## 📝 Log Format

All services use JSON logging:
```json
{
  "timestamp": "2026-01-31T10:00:00Z",
  "level": "INFO",
  "service": "user-service",
  "traceId": "abc123",
  "message": "User login successful",
  "userId": "uuid"
}
```

---

## 🔗 Correlation

Logs are correlated with traces using `traceId`:
- View logs → Click traceId → Jump to Zipkin trace

---

## 📚 Next Steps

- [Monitoring](monitoring.md) - Metrics
- [Security](security.md) - Audit logging
