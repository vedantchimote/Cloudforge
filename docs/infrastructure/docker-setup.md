---
title: "Docker Setup"
description: "Complete Docker and Docker Compose setup for CloudForge"
icon: "docker"
---

# Docker Setup Guide

CloudForge is fully containerized with Docker, including all microservices, frontend, and infrastructure components.

## 🎯 Overview

The CloudForge Docker setup includes **17 containers**:

- **8 Application Services**: Frontend, API Gateway, Discovery Server, and 5 microservices
- **9 Infrastructure Services**: PostgreSQL, MongoDB, Redis, Kafka, Zookeeper, OpenLDAP, MailHog, and management UIs

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- At least 8GB RAM allocated to Docker
- Ports 3000, 8080-8085, 8090-8091, 5432, 27017, 6379, 9092 available

### Start All Services

```bash
# Navigate to docker directory
cd infrastructure/docker

# Start all containers
docker-compose up -d

# View logs
docker-compose logs -f
```

### Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | - |
| **API Gateway** | http://localhost:8080 | - |
| **Eureka Dashboard** | http://localhost:8761 | eureka / eureka123 |
| **Kafka UI** | http://localhost:8091 | - |
| **LDAP Admin** | http://localhost:8090 | cn=admin,dc=cloudforge,dc=io / admin123 |
| **MailHog (Email Testing)** | http://localhost:8025 | - |

## 📦 Container Architecture

### Frontend Container

The frontend uses a **multi-stage Docker build**:

**Stage 1: Build**
- Base: Node.js 18 Alpine
- Installs dependencies
- Builds React application with Vite
- Optimizes for production

**Stage 2: Production**
- Base: Nginx 1.25 Alpine
- Serves static files
- Proxies API requests to backend
- Final image size: ~50MB

#### Key Features

- ✅ Production-optimized build
- ✅ Gzip compression enabled
- ✅ Static asset caching (1 year)
- ✅ API proxy to backend
- ✅ React Router support
- ✅ Security headers configured
- ✅ Health check endpoint
- ✅ Non-root user execution

### Backend Services

All backend services use:
- Base: Eclipse Temurin 17 JRE Alpine
- Framework: Spring Boot 3.2
- Multi-stage build (Maven build + JRE runtime)
- Health checks via Spring Actuator
- Service discovery with Eureka

## 🏗️ Docker Compose Structure

```yaml
services:
  # Frontend
  frontend:
    build: ../../frontend
    ports: ["3000:80"]
    depends_on: [api-gateway]
    
  # API Gateway
  api-gateway:
    build: ../../services/api-gateway
    ports: ["8080:8080"]
    depends_on: [discovery-server]
    
  # Microservices
  user-service:
    build: ../../services/user-service
    ports: ["8081:8081"]
    
  # ... other services
  
  # Infrastructure
  postgres:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    
  # ... other infrastructure
```

## 🔧 Configuration

### Environment Variables

Services are configured via environment variables in `docker-compose.yml`:

```yaml
frontend:
  # No environment variables needed
  # API proxy configured in nginx.conf

user-service:
  environment:
    SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/cloudforge
    SPRING_LDAP_URLS: ldap://openldap:389
    JWT_SECRET: cloudforge-super-secret-key...
    EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka:eureka123@discovery-server:8761/eureka/
```

### Custom Configuration

Create a `.env` file in `infrastructure/docker/`:

```env
# Razorpay (Payment Service)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Email (Notification Service)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

## 🔍 Service Details

### Application Services

#### Frontend (Port 3000)
- **Technology**: React 18 + TypeScript + Nginx
- **Features**: SPA routing, API proxy, gzip compression
- **Health Check**: `/health`
- **Image Size**: ~50MB

#### API Gateway (Port 8080)
- **Technology**: Spring Cloud Gateway
- **Features**: Request routing, load balancing, CORS
- **Health Check**: `/actuator/health`

#### Discovery Server (Port 8761)
- **Technology**: Eureka Server
- **Features**: Service registration and discovery
- **Dashboard**: http://localhost:8761

#### User Service (Port 8081)
- **Database**: PostgreSQL
- **Features**: LDAP auth, JWT tokens, user management
- **Swagger**: http://localhost:8081/swagger-ui.html

#### Product Service (Port 8082)
- **Database**: MongoDB + Redis cache
- **Features**: Product catalog, search, inventory
- **Swagger**: http://localhost:8082/swagger-ui.html

#### Order Service (Port 8083)
- **Database**: PostgreSQL + Redis
- **Features**: Cart, orders, Kafka events
- **Swagger**: http://localhost:8083/swagger-ui.html

#### Payment Service (Port 8084)
- **Database**: PostgreSQL + Redis
- **Features**: Razorpay integration, idempotency
- **Swagger**: http://localhost:8084/swagger-ui.html

#### Notification Service (Port 8085)
- **Database**: PostgreSQL
- **Messaging**: Kafka consumer
- **Features**: Email/SMS notifications, Thymeleaf templates
- **Email**: Configured with MailHog for development testing
- **Swagger**: http://localhost:8085/swagger-ui.html
- **Test Endpoint**: `POST /api/notifications/welcome` for testing emails

### Infrastructure Services

#### PostgreSQL (Port 5432)
- **Image**: postgres:15-alpine
- **Databases**: cloudforge, cloudforge_orders, cloudforge_payments, cloudforge_notifications
- **Credentials**: cloudforge / cloudforge123

#### MongoDB (Port 27017)
- **Image**: mongo:7
- **Database**: products
- **Credentials**: root / mongo123

#### Redis (Port 6379)
- **Image**: redis:7-alpine
- **Password**: redis123
- **Usage**: Caching, cart storage

#### Kafka (Port 9092)
- **Image**: confluentinc/cp-kafka:7.5.0
- **Topics**: Auto-created
- **UI**: http://localhost:8091

#### OpenLDAP (Port 389)
- **Image**: osixia/openldap:1.5.0
- **Domain**: cloudforge.io
- **Admin**: cn=admin,dc=cloudforge,dc=io / admin123

#### MailHog (Ports 1025, 8025)
- **Image**: mailhog/mailhog:latest
- **SMTP Port**: 1025 (for sending emails)
- **Web UI**: http://localhost:8025 (for viewing emails)
- **Purpose**: Email testing in development
- **Features**: 
  - Captures all outgoing emails
  - No authentication required
  - Web interface to view emails
  - API for automated testing
- **Usage**: All emails sent by the notification service are captured here

## 🧪 Testing

### Health Checks

```bash
# Frontend
curl http://localhost:3000/health

# API Gateway
curl http://localhost:8080/actuator/health

# User Service
curl http://localhost:8081/actuator/health

# All services
make test  # Using Makefile
```

### Email Testing with MailHog

MailHog captures all emails sent by the notification service for testing:

```bash
# Send a test welcome email
curl -X POST "http://localhost:8085/api/notifications/welcome?userId=550e8400-e29b-41d4-a716-446655440001&email=test@example.com&name=Test User"

# View emails in browser
open http://localhost:8025

# Check emails via API
curl http://localhost:8025/api/v2/messages

# Using Makefile
make mailhog  # Opens MailHog UI
```

**MailHog Features:**
- View all sent emails in real-time
- No configuration or credentials needed
- HTML and plain text email viewing
- Search and filter emails
- Delete emails or restart container to clear

**Test Email Types:**
- Welcome emails (new user registration)
- Order confirmations
- Payment confirmations
- Payment failure notifications

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker logs -f cloudforge-frontend
docker logs -f cloudforge-api-gateway

# Using Makefile
make logs-frontend
make logs-backend
```

### Container Status

```bash
# View all containers
docker ps

# Check health status
docker inspect cloudforge-frontend --format='{{.State.Health.Status}}'

# Using Makefile
make ps
```

## 🛠️ Management Commands

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Rebuild and start
docker-compose up -d --build

# View resource usage
docker stats
```

### Using Makefile

```bash
# Build all images
make build

# Build only frontend
make build-frontend

# Start services
make up

# Stop services
make down

# View logs
make logs

# Run health checks
make test

# Clean up (remove volumes)
make clean
```

## 🔄 Development Workflow

### Update Frontend

```bash
# Rebuild frontend
docker-compose build frontend

# Restart frontend
docker-compose up -d frontend

# Or use Makefile
make build-frontend
docker-compose up -d frontend
```

### Update Backend Service

```bash
# Example: Update user-service
docker-compose build user-service
docker-compose up -d user-service
```

### Reset Everything

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Start fresh
docker-compose up -d
```

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs cloudforge-frontend

# Check dependencies
docker-compose ps

# Rebuild without cache
docker-compose build --no-cache frontend
```

### Port Already in Use

```bash
# Windows - Check port usage
netstat -ano | findstr :3000

# Stop the process or change port in docker-compose.yml
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

### Network Issues

```bash
# Inspect network
docker network inspect docker_cloudforge-net

# Test connectivity
docker exec cloudforge-frontend wget -O- http://api-gateway:8080/actuator/health
```

## 📊 Resource Requirements

### Minimum Requirements
- **CPU**: 4 cores
- **RAM**: 8GB
- **Disk**: 20GB free space

### Recommended Requirements
- **CPU**: 8 cores
- **RAM**: 16GB
- **Disk**: 50GB free space

### Resource Usage (Typical)
- **Frontend**: ~20MB RAM, <1% CPU
- **Backend Services**: ~300-500MB RAM each, 1-5% CPU
- **PostgreSQL**: ~100MB RAM
- **MongoDB**: ~200MB RAM
- **Redis**: ~10MB RAM
- **Kafka**: ~500MB RAM

## 🔐 Security Notes

### Default Credentials (Development Only)

⚠️ **WARNING**: Never use these in production!

| Service | Username | Password |
|---------|----------|----------|
| PostgreSQL | cloudforge | cloudforge123 |
| MongoDB | root | mongo123 |
| Redis | - | redis123 |
| LDAP | cn=admin,dc=cloudforge,dc=io | admin123 |
| Eureka | eureka | eureka123 |

### Security Features

- ✅ Non-root users in containers
- ✅ Minimal Alpine base images
- ✅ Security headers in Nginx
- ✅ Health checks enabled
- ✅ Network isolation
- ⚠️ Secrets in environment variables (use Vault in production)

## 🚀 Production Deployment

This Docker Compose setup is for **local development only**.

For production, use:
- **Kubernetes** with Helm charts
- **Managed databases** (Azure Database, MongoDB Atlas)
- **Managed Kafka** (Confluent Cloud, Azure Event Hubs)
- **Secrets management** (HashiCorp Vault, Azure Key Vault)
- **TLS/HTTPS** enabled
- **Proper resource limits**
- **Monitoring and logging**

See [Kubernetes Guide](/infrastructure/kubernetes-guide) for production deployment.

## 📚 Related Documentation

- [Frontend Docker Setup](https://github.com/yourusername/cloudforge/blob/main/frontend/DOCKER.md)
- [Docker Compose README](https://github.com/yourusername/cloudforge/blob/main/infrastructure/docker/README.md)
- [Testing Guide](https://github.com/yourusername/cloudforge/blob/main/infrastructure/docker/TESTING.md)
- [Kubernetes Guide](/infrastructure/kubernetes-guide)
- [CI/CD Pipeline](/devops/ci-cd-pipeline)

## 🎉 Success Criteria

Your Docker setup is working correctly when:

- ✅ All 16 containers are running
- ✅ Frontend accessible at http://localhost:3000
- ✅ All health checks pass (except notification service without email config)
- ✅ Eureka shows all services registered
- ✅ You can register a user and login
- ✅ Products are visible
- ✅ Orders can be placed

---

**Next Steps**: Once your Docker environment is running, explore the [API Reference](/api/api-reference) or start [developing](/development/java-development).
