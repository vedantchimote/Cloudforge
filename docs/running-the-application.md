# Running the CloudForge Application 🚀

This guide provides step-by-step instructions to run the complete CloudForge application stack, including all backend microservices, frontend, and infrastructure components.

## Prerequisites

Before you begin, ensure you have the following installed:

- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**: Required for running all services (backend, frontend, and databases)
- **At least 8GB RAM** allocated to Docker
- **Git**: To clone the repository

---

## Quick Start (Recommended) 🎯

The **easiest way** to run CloudForge is using Docker Compose, which starts all 16 containers including the frontend.

### 1. Start All Services

```bash
# Navigate to docker directory
cd infrastructure/docker

# Start all containers (frontend + backend + infrastructure)
docker-compose up -d

# View logs
docker-compose logs -f
```

### 2. Access the Application

Once all containers are running (takes 2-3 minutes on first run):

👉 **Frontend**: [http://localhost:3000](http://localhost:3000)

That's it! The complete application is now running.

---

## Service Access Points 🌐

| Component | URL | Description |
| :--- | :--- | :--- |
| **Frontend App** | `http://localhost:3000` | Main user interface (React + Nginx) |
| **API Gateway** | `http://localhost:8080` | Entry point for all backend APIs |
| **Eureka Discovery** | `http://localhost:8761` | Service registry dashboard (eureka/eureka123) |
| **Kafka UI** | `http://localhost:8091` | Kafka topics and messages viewer |
| **LDAP Admin** | `http://localhost:8090` | LDAP management interface |
| **User Service** | `http://localhost:8081` | User management API + Swagger |
| **Product Service** | `http://localhost:8082` | Product catalog API + Swagger |
| **Order Service** | `http://localhost:8083` | Order processing API + Swagger |
| **Payment Service** | `http://localhost:8084` | Payment processing API + Swagger |
| **Notification Service** | `http://localhost:8085` | Notification API |

---

## Container Status 📊

Check if all containers are running:

```bash
# View all containers
docker ps

# Or use docker-compose
cd infrastructure/docker
docker-compose ps

# Check health status
docker inspect cloudforge-frontend --format='{{.State.Health.Status}}'
```

You should see **16 containers** running:

**Application Services (8):**
- cloudforge-frontend
- cloudforge-api-gateway
- cloudforge-discovery-server
- cloudforge-user-service
- cloudforge-product-service
- cloudforge-order-service
- cloudforge-payment-service
- cloudforge-notification-service

**Infrastructure Services (8):**
- cloudforge-postgres
- cloudforge-mongodb
- cloudforge-redis
- cloudforge-kafka
- cloudforge-zookeeper
- cloudforge-kafka-ui
- cloudforge-ldap
- cloudforge-ldapadmin

---

## Alternative: Development Mode 💻

If you want to develop the frontend with hot reload, you can run it separately:

### 1. Start Backend Services Only

```bash
cd infrastructure/docker

# Start all services except frontend
docker-compose up -d postgres mongodb redis kafka zookeeper \
  discovery-server api-gateway user-service product-service \
  order-service payment-service notification-service
```

### 2. Run Frontend in Development Mode

```bash
# Open a new terminal
cd frontend

# Install dependencies (first time only)
npm install

# Start development server with HMR
npm run dev
```

### 3. Access Development Frontend

👉 **[http://localhost:5173](http://localhost:5173)** (Vite dev server)

This mode provides:
- Hot Module Replacement (HMR)
- Faster refresh on code changes
- Source maps for debugging
- Better development experience

---

## Verify Installation ✅

### 1. Check Frontend

```bash
# Test frontend health
curl http://localhost:3000/health

# Should return: healthy
```

### 2. Check Backend Services

```bash
# Test API Gateway
curl http://localhost:8080/actuator/health

# Test User Service
curl http://localhost:8081/actuator/health

# Test Product Service
curl http://localhost:8082/actuator/health
```

All should return `{"status":"UP"}` or similar.

### 3. Check Service Discovery

Open Eureka Dashboard: http://localhost:8761

You should see all services registered:
- API-GATEWAY
- USER-SERVICE
- PRODUCT-SERVICE
- ORDER-SERVICE
- PAYMENT-SERVICE
- NOTIFICATION-SERVICE

---

## Using the Application 🎮

### 1. Register a New User

1. Go to http://localhost:3000
2. Click "Sign In" → "Create Account"
3. Fill in the registration form
4. Submit

### 2. Browse Products

1. Navigate to "Products" or search
2. View product details
3. Add items to cart

### 3. Place an Order

1. Go to cart
2. Proceed to checkout
3. Enter shipping details
4. Complete payment (test mode)

---

## Management Commands 🛠️

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart frontend

# View logs
docker-compose logs -f frontend
docker-compose logs -f api-gateway

# Rebuild and restart
docker-compose up -d --build frontend
```

### Using Makefile (Convenience)

```bash
# From project root

# Start all services
make up

# Stop all services
make down

# View frontend logs
make logs-frontend

# View backend logs
make logs-backend

# Run health checks
make test

# Clean up (remove volumes)
make clean
```

---

## Troubleshooting 🔧

### Frontend Not Accessible

**Issue**: Cannot access http://localhost:3000

**Solutions**:
```bash
# Check if container is running
docker ps | grep frontend

# Check logs
docker logs cloudforge-frontend

# Restart frontend
docker-compose restart frontend

# Check port availability
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac
```

### Backend Services Unhealthy

**Issue**: Services showing as unhealthy

**Solutions**:
```bash
# Check specific service logs
docker logs cloudforge-user-service

# Check dependencies are ready
docker ps | grep postgres
docker ps | grep mongodb

# Restart service
docker restart cloudforge-user-service

# Check health endpoint
curl http://localhost:8081/actuator/health
```

### Notification Service Unhealthy

**Note**: The notification service may show as unhealthy without email configuration. This is **expected** in development and doesn't affect core functionality.

**Why**: The service tries to connect to Gmail SMTP but no valid credentials are configured.

**Impact**: Emails won't be sent, but the service still processes events and logs notifications.

**Solution**: See [Notification Service Status](https://github.com/yourusername/cloudforge/blob/main/NOTIFICATION_SERVICE_STATUS.md) for configuration options.

### Port Conflicts

**Issue**: Port already in use

**Solutions**:
```bash
# Find what's using the port (Windows)
netstat -ano | findstr :3000

# Kill the process or change port in docker-compose.yml
ports:
  - "3001:80"  # Change 3000 to 3001
```

### Database Connection Issues

```bash
# Check PostgreSQL
docker exec cloudforge-postgres pg_isready -U cloudforge

# Check MongoDB
docker exec cloudforge-mongodb mongosh --eval "db.adminCommand('ping')"

# Check Redis
docker exec cloudforge-redis redis-cli -a redis123 ping
```

### Container Build Failures

```bash
# Clear Docker cache and rebuild
docker-compose build --no-cache

# Remove old images
docker system prune -a

# Restart Docker Desktop
```

---

## Stopping the Application 🛑

### Stop All Services

```bash
cd infrastructure/docker
docker-compose down
```

### Stop and Remove Volumes (Clean Slate)

```bash
docker-compose down -v
```

### Stop Specific Service

```bash
docker-compose stop frontend
```

---

## Performance Tips ⚡

### Allocate More Resources to Docker

1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase:
   - **CPUs**: 4-8 cores
   - **Memory**: 8-16 GB
   - **Disk**: 50 GB

### Speed Up Builds

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1
docker-compose build

# Or enable in Docker Desktop settings
```

### Monitor Resource Usage

```bash
# View resource consumption
docker stats

# View specific container
docker stats cloudforge-frontend
```

---

## Next Steps 📚

- **Explore the API**: Visit http://localhost:8081/swagger-ui.html
- **View Service Discovery**: http://localhost:8761
- **Monitor Kafka**: http://localhost:8091
- **Read Documentation**: See [Docker Setup Guide](/infrastructure/docker-setup)
- **Start Development**: See [Development Guides](/development/java-development)

---

## Additional Resources 🔗

- [Docker Setup Guide](/infrastructure/docker-setup) - Detailed Docker documentation
- [Frontend Docker Details](https://github.com/yourusername/cloudforge/blob/main/frontend/DOCKER.md)
- [Testing Guide](https://github.com/yourusername/cloudforge/blob/main/infrastructure/docker/TESTING.md)
- [Kubernetes Deployment](/infrastructure/kubernetes-guide)
- [CI/CD Pipeline](/devops/ci-cd-pipeline)
