# CloudForge 🔥

> *Where cloud-native applications are forged*

[![Build Status](https://img.shields.io/github/actions/workflow/status/yourusername/cloudforge/ci.yml?branch=main&style=flat-square)](https://github.com/yourusername/cloudforge/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg?style=flat-square)](https://hub.docker.com/r/yourusername/cloudforge)
[![Kubernetes](https://img.shields.io/badge/kubernetes-ready-326ce5.svg?style=flat-square)](docs/kubernetes-guide.md)

A production-grade **5-microservice e-commerce platform** demonstrating enterprise DevOps practices with 25+ tools across CI/CD, Kubernetes, observability, and security.

![Architecture](docs/assets/architecture-diagram.png)

---

## 🎯 What This Project Demonstrates

| Category | Technologies |
|----------|-------------|
| **Backend** | Java 17, Spring Boot 3, PostgreSQL, MongoDB, Redis, Kafka |
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS |
| **CI/CD** | GitHub Actions, SonarQube, Trivy, OWASP ZAP |
| **Containers** | Docker, Kubernetes, Helm, ArgoCD |
| **IaC** | Terraform, Ansible |
| **Observability** | Prometheus, Grafana, Loki, Zipkin, Alertmanager |
| **Security** | HashiCorp Vault, OpenLDAP, Trivy |
| **Cloud** | Azure AKS, Azure Database for PostgreSQL |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │    API Gateway    │
                    └─────────┬─────────┘
          ┌───────────┬───────┼───────┬───────────┐
          ▼           ▼       ▼       ▼           ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │   User   │ │ Product  │ │  Order   │ │ Payment  │ │  Notif   │
    │ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │
    └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
         │            │            │            │            │
    ┌────▼────┐  ┌────▼────┐  ┌────▼────┐  ┌────▼────┐       │
    │  LDAP   │  │ MongoDB │  │Postgres │  │  Redis  │   ◄───┘
    └─────────┘  └─────────┘  └─────────┘  └─────────┘   Kafka
```

**Microservices:**
- **User Service** - Authentication (LDAP), user management
- **Product Service** - Product catalog, inventory (MongoDB)
- **Order Service** - Order placement, cart, history
- **Payment Service** - Payment processing, refunds (Redis cache)
- **Notification Service** - Email/SMS notifications (Kafka consumer)

---

## 🚀 Quick Start

> **For detailed instructions, see the [Comprehensive Run Guide](docs/running-the-application.md).**

### Prerequisites
- Docker Desktop
- Java 17+
- Node.js 18+
- Make (optional)

### Local Development with Docker Compose

```bash
# Clone the repository
git clone https://github.com/yourusername/cloudforge.git
cd cloudforge

# Start all services (from infrastructure/docker directory)
cd infrastructure/docker
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost:3000
# API Gateway: http://localhost:8080
# Eureka Dashboard: http://localhost:8761
# Kafka UI: http://localhost:8091
# MailHog (Email Testing): http://localhost:8025
```

### Run Individual Services

```bash
# Backend services
cd services/user-service
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```
cloudforge/
├── services/                 # Backend microservices
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   └── notification-service/
├── frontend/                 # React application
├── infrastructure/
│   ├── docker/              # Docker Compose configs
│   ├── helm/                # Kubernetes Helm charts
│   ├── terraform/           # Azure IaC
│   └── ansible/             # Configuration management
├── observability/           # Prometheus, Grafana configs
├── security/                # Vault, LDAP configs
├── .github/workflows/       # CI/CD pipelines
├── argocd/                  # GitOps configs
├── mintlify/                # Documentation site
└── docs/                    # Project documentation
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Run Guide](docs/running-the-application.md) | **Step-by-step guide to run full app** |
| [Local Setup](docs/local-setup.md) | Development environment setup |
| [Docker Guide](docs/docker-guide.md) | Docker Compose deployment |
| [Kubernetes Guide](docs/kubernetes-guide.md) | K8s/Minikube deployment |
| [Azure Deployment](docs/azure-deployment.md) | Production AKS setup |
| [Architecture](docs/architecture.md) | System design & diagrams |
| [API Reference](docs/api/api-reference.md) | REST API documentation |
| [Authentication Guide](docs/api/authentication.md) | JWT authentication & security |
| [CI/CD Pipeline](docs/ci-cd-pipeline.md) | GitHub Actions workflows |
| [Monitoring](docs/monitoring.md) | Prometheus/Grafana setup |

---

## 🧪 Testing

```bash
# Run all backend tests
./mvnw test

# Run frontend tests
cd frontend && npm test

# Run E2E tests
cd frontend && npm run test:e2e

# Run with coverage
./mvnw verify -Pcoverage
```

---

## 🔧 Troubleshooting

### JWT Authentication Issues

**401 Unauthorized Errors:**
1. Check JWT secret matches between user-service and api-gateway:
   ```bash
   docker exec cloudforge-api-gateway env | grep JWT_SECRET
   docker exec cloudforge-user-service env | grep JWT_SECRET
   ```
2. Verify token hasn't expired (24-hour default)
3. Check Authorization header format: `Bearer <token>`

**Order Creation Fails:**
1. Verify API Gateway logs show JWT filter running:
   ```bash
   docker logs cloudforge-api-gateway --tail 50 | grep "JWT"
   ```
2. Check X-User-Id header is being added
3. Verify order service receives the header

**For more troubleshooting, see:**
- [Manual Testing Guide](.kiro/specs/payment-flow-fix/MANUAL_TESTING_GUIDE.md)
- [Authentication Guide](docs/api/authentication.md)

---

## 🔒 Security

### JWT Authentication

CloudForge uses JWT (JSON Web Token) based authentication with centralized validation at the API Gateway.

**Authentication Flow:**
1. User logs in with username/password
2. User service generates JWT token with user ID
3. Frontend stores token and includes it in Authorization header
4. API Gateway validates token and adds `X-User-Id` header
5. Downstream services use `X-User-Id` for user identification

**Configuration:**

```bash
# Set JWT secret (must be same for user-service and api-gateway)
export JWT_SECRET="your-secret-key-at-least-256-bits-long"
export JWT_EXPIRATION=86400000  # 24 hours
```

**Test Users (LDAP):**
- Username: `john.doe`, Password: `Password123!`
- Username: `jane.smith`, Password: `Password123!`
- Username: `bob.wilson`, Password: `Password123!`

For detailed authentication documentation, see [Authentication Guide](docs/api/authentication.md).

### Security Features

- All secrets managed via **HashiCorp Vault**
- Authentication via **OpenLDAP** and **JWT**
- Container scanning with **Trivy**
- DAST scanning with **OWASP ZAP**
- Centralized error handling with consistent error responses
- See [Security Guide](docs/security.md)

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file.

---

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)

---

⭐ **Star this repo** if you find it helpful!
