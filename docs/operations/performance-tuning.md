# Performance Tuning Guide

Optimization strategies for CloudForge.

---

## 🎯 Performance Goals

| Metric | Target | Current |
|--------|--------|---------|
| P95 Latency | <500ms | - |
| P99 Latency | <1000ms | - |
| Throughput | 1000 RPS | - |
| Error Rate | <0.1% | - |

---

## ☕ Java/Spring Boot Optimization

### JVM Tuning
```bash
# Recommended JVM flags
JAVA_OPTS="-Xms512m -Xmx1024m \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+UseStringDeduplication"
```

### Connection Pools
```yaml
# application.yml
spring:
  datasource:
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
      idle-timeout: 60000
      connection-timeout: 30000
```

### Caching
```java
@Cacheable(value = "products", key = "#id")
public Product findById(UUID id) {
    return productRepository.findById(id);
}
```

---

## 🗄️ Database Optimization

### PostgreSQL
```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_orders_user_status 
ON orders(user_id, status);

-- Analyze queries
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = '...';
```

### MongoDB
```javascript
// Create compound indexes
db.products.createIndex({ category: 1, price: 1 });

// Use projection
db.products.find({}, { name: 1, price: 1 });
```

---

## 💾 Redis Caching Strategy

| Data | TTL | Strategy |
|------|-----|----------|
| Session | 30 min | Cache-aside |
| Product list | 5 min | Cache-aside |
| User profile | 10 min | Write-through |
| Idempotency keys | 24 hours | Cache-aside |

---

## 🌐 Frontend Optimization

### Bundle Size
```bash
npm run build -- --analyze
```

### Lazy Loading
```typescript
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
```

### Image Optimization
- Use WebP format
- Implement lazy loading
- Use responsive images

---

## 📊 Profiling Tools

| Tool | Purpose |
|------|---------|
| Async Profiler | JVM CPU/memory profiling |
| pgBadger | PostgreSQL query analysis |
| Lighthouse | Frontend performance |
| k6 | Load testing |

---

## 📚 Related Docs

- [Monitoring](monitoring.md)
- [SLA/SLO](sla-slo.md)
