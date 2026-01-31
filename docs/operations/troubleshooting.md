# Troubleshooting Guide

Common issues and solutions for CloudForge.

---

## 🐳 Docker Issues

### Container won't start
```bash
# Check logs
docker-compose logs <service-name>

# Check container status
docker-compose ps

# Restart container
docker-compose restart <service-name>
```

### Port already in use
```bash
# Find process
netstat -ano | findstr :<PORT>

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Out of disk space
```bash
docker system prune -a
docker volume prune
```

---

## 🗄️ Database Issues

### Cannot connect to PostgreSQL
```bash
# Check if running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U cloudforge -d cloudforge
```

### MongoDB connection refused
```bash
# Check if running
docker-compose logs mongodb

# Test connection
docker-compose exec mongodb mongosh
```

---

## ☸️ Kubernetes Issues

### Pod not starting
```bash
# Check pod status
kubectl get pods -n cloudforge

# Describe pod
kubectl describe pod <pod-name> -n cloudforge

# Check logs
kubectl logs <pod-name> -n cloudforge
```

### Service not reachable
```bash
# Check service
kubectl get svc -n cloudforge

# Port forward
kubectl port-forward svc/<service> <local-port>:<service-port> -n cloudforge
```

---

## 🔐 Authentication Issues

### JWT token invalid
- Check token expiration
- Verify secret key matches
- Check clock sync between services

### LDAP connection failed
```bash
# Test LDAP connection
docker-compose exec ldap ldapsearch -x -H ldap://localhost -b "dc=cloudforge,dc=io"
```

---

## 📊 Monitoring Issues

### Prometheus not scraping
- Check `/actuator/prometheus` endpoint
- Verify service discovery config
- Check network policies

### Grafana dashboard empty
- Verify Prometheus data source
- Check time range
- Verify metric names

---

## 🆘 Getting Help

1. Check logs first
2. Search existing issues on GitHub
3. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
