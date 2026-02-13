# Swagger UI Access Guide

Complete guide to accessing API documentation for all CloudForge microservices.

## 📚 Swagger Aggregator (Recommended)

The **Swagger Aggregator** provides a unified interface to browse all microservice APIs in one place.

| Service | URL | Description |
|---------|-----|-------------|
| **Swagger Aggregator** | http://localhost:8086/swagger-ui.html | Unified API documentation for all services |
| **API Docs JSON** | http://localhost:8086/v3/api-docs | OpenAPI 3.0 specification (JSON) |

### Features
- Single interface for all microservices
- Dropdown to switch between services
- Consistent documentation format
- Easy API testing

---

## 🔧 Individual Service Swagger UIs

Each microservice has its own Swagger UI for detailed API documentation and testing.

### Working Services ✅

| Service | Swagger UI URL | Port | Description |
|---------|---------------|------|-------------|
| **User Service** | http://localhost:8081/swagger-ui.html | 8081 | User management, authentication, LDAP integration |
| **Product Service** | http://localhost:8082/swagger-ui.html | 8082 | Product catalog, inventory, search, caching |
| **Order Service** | http://localhost:8083/swagger-ui.html | 8083 | Order management, cart operations |
| **Payment Service** | http://localhost:8084/swagger-ui.html | 8084 | Payment processing, Razorpay integration |
| **Notification Service** | http://localhost:8085/swagger-ui.html | 8085 | Email notifications, event handling |

### API Documentation Endpoints

Each service also exposes OpenAPI 3.0 JSON documentation:

| Service | API Docs URL |
|---------|-------------|
| User Service | http://localhost:8081/v3/api-docs |
| Product Service | http://localhost:8082/v3/api-docs |
| Order Service | http://localhost:8083/v3/api-docs |
| Payment Service | http://localhost:8084/v3/api-docs |
| Notification Service | http://localhost:8085/v3/api-docs |

---

## 🌐 Access via API Gateway

You can also access individual service docs through the API Gateway (port 8080):

| Service | Gateway URL |
|---------|------------|
| User Service | http://localhost:8080/user-service/swagger-ui.html |
| Product Service | http://localhost:8080/product-service/swagger-ui.html |
| Order Service | http://localhost:8080/order-service/swagger-ui.html |
| Payment Service | http://localhost:8080/payment-service/swagger-ui.html |
| Notification Service | http://localhost:8080/notification-service/swagger-ui.html |

---

## 🚀 Quick Start

### 1. Ensure All Services Are Running

```powershell
# Check running containers
docker ps --format "table {{.Names}}\t{{.Status}}"

# Start missing services
docker-compose -f infrastructure/docker/docker-compose.yml up -d
```

### 2. Access Swagger Aggregator

Open your browser and navigate to:
```
http://localhost:8086/swagger-ui.html
```

### 3. Select a Service

Use the dropdown in the top-right corner to switch between services:
- User Service
- Product Service
- Order Service
- Payment Service
- Notification Service

### 4. Test APIs

1. Expand an endpoint
2. Click "Try it out"
3. Fill in parameters
4. Click "Execute"
5. View the response

---

## 🔐 Authentication

Some endpoints require authentication. To test protected endpoints:

### 1. Get JWT Token

```bash
# Login via User Service
curl -X POST "http://localhost:8081/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "password": "Password123!"
  }'
```

### 2. Use Token in Swagger

1. Copy the `token` from the response
2. Click the "Authorize" button in Swagger UI
3. Enter: `Bearer <your-token>`
4. Click "Authorize"

Now you can test protected endpoints!

---

## 📊 Service Status Check

### Health Endpoints

| Service | Health Check URL |
|---------|-----------------|
| User Service | http://localhost:8081/actuator/health |
| Product Service | http://localhost:8082/actuator/health |
| Order Service | http://localhost:8083/actuator/health |
| Payment Service | http://localhost:8084/actuator/health |
| Notification Service | http://localhost:8085/actuator/health |
| Swagger Aggregator | http://localhost:8086/actuator/health |

All should return `{"status":"UP"}` or similar.

---

## 🛠️ Troubleshooting

### Service Not Accessible

**Issue**: Cannot access Swagger UI for a service

**Solutions**:

```powershell
# Check if container is running
docker ps | findstr "service-name"

# Check container logs
docker logs cloudforge-order-service

# Restart service
docker-compose -f infrastructure/docker/docker-compose.yml restart order-service

# Check health
curl http://localhost:8083/actuator/health
```

### Swagger Aggregator Not Loading

**Issue**: Aggregator shows empty or doesn't load services

**Solutions**:

```powershell
# Restart swagger-aggregator
docker restart cloudforge-swagger-aggregator

# Check logs
docker logs cloudforge-swagger-aggregator

# Verify Eureka registration
# Open http://localhost:8761 and check if all services are registered
```

### 404 Not Found

**Issue**: Swagger UI returns 404

**Possible causes**:
- Service not fully started (wait 30-60 seconds)
- Wrong URL path (use `/swagger-ui.html` not `/swagger-ui/`)
- Service crashed (check logs)

---

## 📝 API Documentation Features

### What You Can Do in Swagger UI

1. **Browse APIs**: See all available endpoints
2. **View Schemas**: Understand request/response models
3. **Test Endpoints**: Execute API calls directly
4. **See Examples**: View sample requests and responses
5. **Download Spec**: Export OpenAPI JSON/YAML

### Swagger UI Sections

- **Schemas**: Data models and DTOs
- **Controllers**: Grouped endpoints by functionality
- **Authorize**: Set authentication tokens
- **Servers**: Switch between dev/prod environments

---

## 🔗 Related Resources

- [Running the Application Guide](docs/running-the-application.md)
- [Docker Setup Guide](docs/infrastructure/docker-setup.md)
- [Service Documentation](docs/services/)
- [API Reference](docs/api/api-reference.md)

---

## 📦 Container Summary

Total containers: **18**

**Application Services (9)**:
- cloudforge-frontend (3000)
- cloudforge-api-gateway (8080)
- cloudforge-discovery-server (8761)
- cloudforge-user-service (8081)
- cloudforge-product-service (8082)
- cloudforge-order-service (8083)
- cloudforge-payment-service (8084)
- cloudforge-notification-service (8085)
- cloudforge-swagger-aggregator (8086)

**Infrastructure Services (9)**:
- cloudforge-postgres (5432)
- cloudforge-mongodb (27017)
- cloudforge-redis (6379)
- cloudforge-kafka (9092)
- cloudforge-zookeeper (2181)
- cloudforge-kafka-ui (8091)
- cloudforge-ldap (389)
- cloudforge-ldapadmin (8090)
- cloudforge-mailhog (1025, 8025)

---

## ✅ Quick Test

Test all Swagger UIs are accessible:

```powershell
# Test individual services
$urls = @(
    "http://localhost:8081/swagger-ui.html",
    "http://localhost:8082/swagger-ui.html",
    "http://localhost:8083/swagger-ui.html",
    "http://localhost:8084/swagger-ui.html",
    "http://localhost:8085/swagger-ui.html",
    "http://localhost:8086/swagger-ui.html"
)

foreach($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        Write-Host "$url - ✅ Status: $($response.StatusCode)"
    } catch {
        Write-Host "$url - ❌ Error: $($_.Exception.Message)"
    }
}
```

All should return `Status: 200` ✅

---

**Last Updated**: February 13, 2026
