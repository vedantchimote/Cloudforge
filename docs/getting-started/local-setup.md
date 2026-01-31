# Local Development Setup

This guide walks you through setting up the CloudForge development environment on your local machine.

---

## 📋 Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Java** | 17+ | Backend services |
| **Maven** | 3.8+ | Build tool |
| **Node.js** | 18+ | Frontend |
| **Docker Desktop** | Latest | Containerization |
| **Git** | 2.30+ | Version control |

### Optional (for Kubernetes)

| Software | Version | Purpose |
|----------|---------|---------|
| **Minikube** | Latest | Local K8s cluster |
| **kubectl** | Latest | K8s CLI |
| **Helm** | 3.x | K8s package manager |

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cloudforge.git
cd cloudforge
```

### 2. Start Infrastructure (Docker Compose)

```bash
# Start databases and infrastructure only
docker-compose up -d postgres mongodb redis kafka ldap

# Wait for services to be healthy
docker-compose ps
```

### 3. Run Backend Services

Open separate terminals for each service:

```bash
# Terminal 1 - User Service
cd services/user-service
./mvnw spring-boot:run

# Terminal 2 - Product Service
cd services/product-service
./mvnw spring-boot:run

# Terminal 3 - Order Service
cd services/order-service
./mvnw spring-boot:run

# Terminal 4 - Payment Service
cd services/payment-service
./mvnw spring-boot:run

# Terminal 5 - Notification Service
cd services/notification-service
./mvnw spring-boot:run
```

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| User Service | http://localhost:8081 |
| Product Service | http://localhost:8082 |
| Order Service | http://localhost:8083 |
| Payment Service | http://localhost:8084 |

---

## 🐳 Docker Compose (Full Stack)

Run everything with Docker:

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
POSTGRES_USER=cloudforge
POSTGRES_PASSWORD=cloudforge123
POSTGRES_DB=cloudforge

# MongoDB
MONGO_ROOT_USER=root
MONGO_ROOT_PASSWORD=mongo123

# Redis
REDIS_PASSWORD=redis123

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# LDAP
LDAP_ADMIN_PASSWORD=admin123

# Vault
VAULT_TOKEN=dev-token
```

---

## 🧪 Running Tests

```bash
# All backend tests
./mvnw test

# Specific service
cd services/user-service && ./mvnw test

# Frontend tests
cd frontend && npm test

# E2E tests
cd frontend && npm run test:e2e
```

---

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Find process using port 8080
netstat -ano | findstr :8080
# Kill the process
taskkill /PID <PID> /F
```

### Docker Issues
```bash
# Reset Docker Desktop
docker system prune -a
docker-compose down -v
```

### Database Connection Issues
```bash
# Check if databases are running
docker-compose ps
# View database logs
docker-compose logs postgres
docker-compose logs mongodb
```

---

## 📚 Next Steps

- [Docker Guide](docker-guide.md) - Full Docker deployment
- [Kubernetes Guide](kubernetes-guide.md) - K8s deployment
- [API Reference](api-reference.md) - API documentation
