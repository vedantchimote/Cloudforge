# Docker Setup Testing Guide

This guide helps you verify that the Docker setup is working correctly.

## 🧪 Quick Health Check

### Using Make (Recommended)

```bash
# From project root
make test
```

### Manual Health Checks

```bash
# Frontend
curl http://localhost:3000/health

# API Gateway
curl http://localhost:8080/actuator/health

# User Service
curl http://localhost:8081/actuator/health

# Product Service
curl http://localhost:8082/actuator/health

# Order Service
curl http://localhost:8083/actuator/health

# Payment Service
curl http://localhost:8084/actuator/health

# Notification Service
curl http://localhost:8085/actuator/health
```

Expected response: `{"status":"UP"}` or `healthy`

## 🔍 Detailed Testing

### 1. Infrastructure Services

#### PostgreSQL
```bash
# Check if PostgreSQL is ready
docker exec cloudforge-postgres pg_isready -U cloudforge

# Connect to database
docker exec -it cloudforge-postgres psql -U cloudforge -d cloudforge

# List databases
\l

# Exit
\q
```

#### MongoDB
```bash
# Check if MongoDB is ready
docker exec cloudforge-mongodb mongosh --eval "db.adminCommand('ping')"

# Connect to MongoDB
docker exec -it cloudforge-mongodb mongosh -u root -p mongo123 --authenticationDatabase admin

# Show databases
show dbs

# Exit
exit
```

#### Redis
```bash
# Check if Redis is ready
docker exec cloudforge-redis redis-cli -a redis123 ping

# Connect to Redis
docker exec -it cloudforge-redis redis-cli -a redis123

# Test set/get
SET test "Hello CloudForge"
GET test

# Exit
exit
```

#### Kafka
```bash
# List Kafka topics
docker exec cloudforge-kafka kafka-topics --bootstrap-server localhost:9092 --list

# Check Kafka UI
# Open browser: http://localhost:8091
```

### 2. Service Discovery

#### Eureka Dashboard
```bash
# Open browser: http://localhost:8761
# Login: eureka / eureka123
```

Verify all services are registered:
- API-GATEWAY
- USER-SERVICE
- PRODUCT-SERVICE
- ORDER-SERVICE
- PAYMENT-SERVICE
- NOTIFICATION-SERVICE

### 3. Frontend Tests

#### Basic Connectivity
```bash
# Test frontend is serving
curl -I http://localhost:3000/

# Test health endpoint
curl http://localhost:3000/health

# Test static assets
curl -I http://localhost:3000/assets/
```

#### API Proxy Test
```bash
# Test API proxy (should route to API Gateway)
curl http://localhost:3000/api/actuator/health
```

### 4. API Gateway Tests

#### Health Check
```bash
curl http://localhost:8080/actuator/health
```

#### Service Routing
```bash
# User Service through Gateway
curl http://localhost:8080/api/users/health

# Product Service through Gateway
curl http://localhost:8080/api/products/health

# Order Service through Gateway
curl http://localhost:8080/api/orders/health
```

### 5. Microservice Tests

#### User Service
```bash
# Health check
curl http://localhost:8081/actuator/health

# Swagger UI
# Open browser: http://localhost:8081/swagger-ui.html

# Test registration endpoint
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Product Service
```bash
# Health check
curl http://localhost:8082/actuator/health

# Get products (may be empty initially)
curl http://localhost:8082/api/products

# Swagger UI
# Open browser: http://localhost:8082/swagger-ui.html
```

#### Order Service
```bash
# Health check
curl http://localhost:8083/actuator/health

# Swagger UI
# Open browser: http://localhost:8083/swagger-ui.html
```

#### Payment Service
```bash
# Health check
curl http://localhost:8084/actuator/health

# Swagger UI
# Open browser: http://localhost:8084/swagger-ui.html
```

#### Notification Service
```bash
# Health check
curl http://localhost:8085/actuator/health

# Check Kafka consumer is running
docker logs cloudforge-notification-service | grep "Kafka"
```

### 6. End-to-End Flow Test

#### Complete User Journey
```bash
# 1. Register a user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# 2. Login
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "password": "SecurePass123"
  }' | jq -r '.token')

echo "Token: $TOKEN"

# 3. Get user profile
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Browse products
curl http://localhost:8080/api/products

# 5. Add to cart (requires product ID)
curl -X POST http://localhost:8080/api/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID_HERE",
    "quantity": 2
  }'

# 6. View cart
curl http://localhost:8080/api/cart \
  -H "Authorization: Bearer $TOKEN"
```

### 7. LDAP Authentication Test

```bash
# Access LDAP Admin UI
# Open browser: http://localhost:8090
# Login DN: cn=admin,dc=cloudforge,dc=io
# Password: admin123

# Test LDAP connection
docker exec cloudforge-ldap ldapsearch -x -H ldap://localhost -b dc=cloudforge,dc=io -D "cn=admin,dc=cloudforge,dc=io" -w admin123
```

## 🐛 Troubleshooting Tests

### Container Status
```bash
# Check all containers are running
docker-compose ps

# Check specific container
docker inspect cloudforge-frontend --format='{{.State.Status}}'
```

### Container Health
```bash
# Check health status
docker inspect cloudforge-frontend --format='{{.State.Health.Status}}'
docker inspect cloudforge-api-gateway --format='{{.State.Health.Status}}'

# View health check logs
docker inspect cloudforge-frontend --format='{{range .State.Health.Log}}{{.Output}}{{end}}'
```

### Network Connectivity
```bash
# Test frontend can reach API Gateway
docker exec cloudforge-frontend wget -O- http://api-gateway:8080/actuator/health

# Test API Gateway can reach User Service
docker exec cloudforge-api-gateway wget -O- http://user-service:8081/actuator/health

# Test Order Service can reach Product Service
docker exec cloudforge-order-service wget -O- http://product-service:8082/actuator/health
```

### Resource Usage
```bash
# Check resource consumption
docker stats --no-stream

# Check disk usage
docker system df
```

### Logs Analysis
```bash
# Check for errors in frontend
docker logs cloudforge-frontend | grep -i error

# Check for errors in API Gateway
docker logs cloudforge-api-gateway | grep -i error

# Check for errors in User Service
docker logs cloudforge-user-service | grep -i error

# Check startup logs
docker logs cloudforge-frontend --tail=50
```

## ✅ Success Criteria

All tests should pass with the following results:

- [ ] All containers are running (`docker-compose ps` shows "Up")
- [ ] All health checks return healthy status
- [ ] Eureka dashboard shows all 6 microservices registered
- [ ] Frontend is accessible at http://localhost:3000
- [ ] API Gateway routes requests correctly
- [ ] User registration and login work
- [ ] Products can be retrieved
- [ ] Database connections are working
- [ ] Kafka is running and topics are created
- [ ] LDAP authentication is functional

## 📊 Performance Benchmarks

### Expected Response Times (Local Docker)

| Endpoint | Expected Time |
|----------|---------------|
| Frontend (/) | < 100ms |
| API Gateway Health | < 50ms |
| User Service Health | < 50ms |
| Product List | < 200ms |
| User Registration | < 500ms |
| User Login | < 300ms |

### Load Testing (Optional)

```bash
# Install Apache Bench
# Windows: Download from Apache website
# Linux: sudo apt-get install apache2-utils
# Mac: brew install ab

# Test frontend
ab -n 1000 -c 10 http://localhost:3000/

# Test API Gateway
ab -n 1000 -c 10 http://localhost:8080/actuator/health

# Test product listing
ab -n 100 -c 5 http://localhost:8080/api/products
```

## 🔄 Continuous Testing

### Automated Health Check Script

Create `test-health.sh`:

```bash
#!/bin/bash

echo "Testing CloudForge Docker Setup..."

services=(
  "http://localhost:3000/health:Frontend"
  "http://localhost:8080/actuator/health:API Gateway"
  "http://localhost:8081/actuator/health:User Service"
  "http://localhost:8082/actuator/health:Product Service"
  "http://localhost:8083/actuator/health:Order Service"
  "http://localhost:8084/actuator/health:Payment Service"
  "http://localhost:8085/actuator/health:Notification Service"
)

failed=0

for service in "${services[@]}"; do
  IFS=':' read -r url name <<< "$service"
  if curl -f -s "$url" > /dev/null; then
    echo "✓ $name is healthy"
  else
    echo "✗ $name is unhealthy"
    ((failed++))
  fi
done

if [ $failed -eq 0 ]; then
  echo ""
  echo "All services are healthy! ✓"
  exit 0
else
  echo ""
  echo "$failed service(s) failed health check ✗"
  exit 1
fi
```

Run with:
```bash
chmod +x test-health.sh
./test-health.sh
```

## 📚 Related Documentation

- [Docker Compose README](README.md)
- [Frontend Docker Setup](../../frontend/DOCKER.md)
- [Troubleshooting Guide](../../docs/operations/troubleshooting.md)
