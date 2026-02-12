# CloudForge Docker Compose Setup

Complete Docker Compose configuration for running CloudForge locally.

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- At least 8GB RAM allocated to Docker
- Ports 3000, 8080-8085, 8090-8091, 5432, 27017, 6379, 9092 available

### Start All Services

```bash
# From this directory (infrastructure/docker)
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f api-gateway
```

### Access the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | - |
| **API Gateway** | http://localhost:8080 | - |
| **Eureka Dashboard** | http://localhost:8761 | eureka / eureka123 |
| **LDAP Admin** | http://localhost:8090 | cn=admin,dc=cloudforge,dc=io / admin123 |
| **Kafka UI** | http://localhost:8091 | - |

### Stop All Services

```bash
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## 📦 Services Overview

### Application Services

- **frontend** (port 3000) - React + Nginx
- **api-gateway** (port 8080) - Spring Cloud Gateway
- **discovery-server** (port 8761) - Eureka Server
- **user-service** (port 8081) - User management & auth
- **product-service** (port 8082) - Product catalog
- **order-service** (port 8083) - Order management
- **payment-service** (port 8084) - Payment processing
- **notification-service** (port 8085) - Email/SMS notifications

### Infrastructure Services

- **postgres** (port 5432) - PostgreSQL database
- **mongodb** (port 27017) - MongoDB database
- **redis** (port 6379) - Redis cache
- **kafka** (port 9092) - Apache Kafka
- **zookeeper** (port 2181) - Kafka Zookeeper
- **openldap** (port 389) - LDAP authentication
- **ldapadmin** (port 8090) - LDAP management UI
- **kafka-ui** (port 8091) - Kafka management UI

## 🔧 Build Services

### Build All Services

```bash
docker-compose build
```

### Build Specific Service

```bash
docker-compose build frontend
docker-compose build user-service
```

### Build Without Cache

```bash
docker-compose build --no-cache
```

## 🐛 Troubleshooting

### Check Service Health

```bash
# Check all containers
docker-compose ps

# Check specific service health
docker inspect --format='{{.State.Health.Status}}' cloudforge-frontend
docker inspect --format='{{.State.Health.Status}}' cloudforge-api-gateway
```

### View Service Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs frontend
docker-compose logs user-service

# Follow logs (real-time)
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 frontend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart frontend
docker-compose restart api-gateway
```

### Service Won't Start

1. **Check dependencies are healthy:**
   ```bash
   docker-compose ps
   ```

2. **Check logs for errors:**
   ```bash
   docker-compose logs service-name
   ```

3. **Verify port availability:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```

4. **Rebuild the service:**
   ```bash
   docker-compose build --no-cache service-name
   docker-compose up -d service-name
   ```

### Database Connection Issues

```bash
# Check PostgreSQL is ready
docker exec cloudforge-postgres pg_isready -U cloudforge

# Check MongoDB is ready
docker exec cloudforge-mongodb mongosh --eval "db.adminCommand('ping')"

# Check Redis is ready
docker exec cloudforge-redis redis-cli -a redis123 ping
```

### Network Issues

```bash
# Inspect the network
docker network inspect docker_cloudforge-net

# Check if services can communicate
docker exec cloudforge-frontend wget -O- http://api-gateway:8080/actuator/health
```

## 🔄 Development Workflow

### Update Frontend Code

```bash
# Rebuild and restart frontend
docker-compose build frontend
docker-compose up -d frontend

# Or use --build flag
docker-compose up -d --build frontend
```

### Update Backend Service

```bash
# Example: Update user-service
docker-compose build user-service
docker-compose up -d user-service
```

### Reset Everything

```bash
# Stop all services and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up -d
```

## 📊 Resource Usage

### View Resource Consumption

```bash
# All containers
docker stats

# Specific container
docker stats cloudforge-frontend
```

### Recommended Resources

- **CPU**: 4 cores minimum
- **RAM**: 8GB minimum (16GB recommended)
- **Disk**: 20GB free space

## 🔐 Security Notes

### Default Credentials

**PostgreSQL:**
- User: `cloudforge`
- Password: `cloudforge123`
- Database: `cloudforge`

**MongoDB:**
- User: `root`
- Password: `mongo123`

**Redis:**
- Password: `redis123`

**LDAP:**
- Admin DN: `cn=admin,dc=cloudforge,dc=io`
- Admin Password: `admin123`

**Eureka:**
- Username: `eureka`
- Password: `eureka123`

⚠️ **WARNING**: These are development credentials. Never use these in production!

## 🌐 Environment Variables

Create a `.env` file in this directory for custom configuration:

```env
# Razorpay (Payment Service)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email (Notification Service)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
NOTIFICATION_FROM_EMAIL=noreply@cloudforge.io
NOTIFICATION_FROM_NAME=CloudForge
```

## 📝 Service Startup Order

The `depends_on` configuration ensures services start in the correct order:

1. Infrastructure (postgres, mongodb, redis, kafka, zookeeper, openldap)
2. Discovery Server (eureka)
3. API Gateway
4. Microservices (user, product, order, payment, notification)
5. Frontend

Health checks ensure dependent services are ready before starting.

## 🚀 Production Deployment

This Docker Compose setup is for **local development only**. For production:

- Use Kubernetes with Helm charts (see `infrastructure/helm/`)
- Use managed databases (Azure Database for PostgreSQL, MongoDB Atlas)
- Use managed Kafka (Confluent Cloud, Azure Event Hubs)
- Use proper secrets management (HashiCorp Vault, Azure Key Vault)
- Enable TLS/HTTPS
- Configure proper resource limits
- Set up monitoring and logging

See [Kubernetes Guide](../../docs/infrastructure/kubernetes-guide.md) for production deployment.

## 📚 Related Documentation

- [Frontend Docker Setup](../../frontend/DOCKER.md)
- [Architecture Overview](../../docs/getting-started/architecture.md)
- [Local Setup Guide](../../docs/getting-started/local-setup.md)
- [Kubernetes Guide](../../docs/infrastructure/kubernetes-guide.md)
