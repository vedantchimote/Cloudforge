# CloudForge Documentation

Complete documentation for the CloudForge DevOps platform.

---

## 📚 Documentation Index

### 🚀 Getting Started
| Document | Description |
|----------|-------------|
| [Implementation Plan](getting-started/implementation-plan.md) | Project roadmap and phases |
| [Local Setup](getting-started/local-setup.md) | Run CloudForge locally |
| [Architecture](getting-started/architecture.md) | System design overview |

### 💻 Development Guides
| Document | Description |
|----------|-------------|
| [Java/Spring Boot](development/java-development.md) | Backend development guide |
| [React/TypeScript](development/react-development.md) | Frontend development guide |
| [Code Style Guide](development/code-style-guide.md) | Coding standards |
| [Testing Strategy](development/testing-strategy.md) | Unit, integration, E2E testing |

### 🔌 API & Services
| Document | Description |
|----------|-------------|
| [API Reference](api/api-reference.md) | REST API documentation |
| [API Versioning](api/api-versioning.md) | Versioning strategy |
| [Database Schema](api/database-schema.md) | Data models and relations |
| [Service Guides](services/README.md) | Microservice documentation |

### 🏗️ Infrastructure
| Document | Description |
|----------|-------------|
| [Docker Guide](infrastructure/docker-guide.md) | Container setup |
| [Kubernetes Guide](infrastructure/kubernetes-guide.md) | K8s deployment |
| [Networking](infrastructure/networking.md) | Network configuration |
| [Azure Deployment](infrastructure/azure-deployment.md) | Cloud deployment |

### 🔄 DevOps & CI/CD
| Document | Description |
|----------|-------------|
| [DevOps Toolchain](devops/devops-toolchain.md) | Complete toolchain overview |
| [CI/CD Pipeline](devops/ci-cd-pipeline.md) | GitHub Actions setup |
| [GitOps](devops/gitops.md) | ArgoCD configuration |

### 📊 Observability
| Document | Description |
|----------|-------------|
| [Monitoring](observability/monitoring.md) | Prometheus & Grafana |
| [Logging](observability/logging.md) | Loki setup |

### 🔒 Security
| Document | Description |
|----------|-------------|
| [Security Overview](security/security.md) | Security practices |
| [Secrets Rotation](security/secrets-rotation.md) | Vault & secrets management |

### 🛠️ Operations
| Document | Description |
|----------|-------------|
| [Runbook](operations/runbook.md) | Operational procedures |
| [Troubleshooting](operations/troubleshooting.md) | Common issues & fixes |
| [Disaster Recovery](operations/disaster-recovery.md) | DR procedures |
| [SLA/SLO](operations/sla-slo.md) | Service level objectives |
| [Performance Tuning](operations/performance-tuning.md) | Optimization guide |
| [Cost Optimization](operations/cost-optimization.md) | Cloud cost management |

### 📅 Development Phases
| Document | Description |
|----------|-------------|
| [Phase Overview](phases/README.md) | Timeline and roadmap |
| [Phase 1: Application](phases/phase-1-application.md) | Microservices development |
| [Phase 2: Local Stack](phases/phase-2-local-stack.md) | Docker Compose setup |
| [Phase 3: CI Pipeline](phases/phase-3-ci-pipeline.md) | GitHub Actions |
| [Phase 4: Kubernetes](phases/phase-4-kubernetes.md) | Helm & ArgoCD |
| [Phase 5: Observability](phases/phase-5-observability.md) | Monitoring stack |
| [Phase 6: Security](phases/phase-6-security.md) | Vault & scanning |
| [Phase 7: Azure](phases/phase-7-azure.md) | Production deployment |
| [Phase 8: Documentation](phases/phase-8-documentation.md) | Showcase |

### 📐 Architecture Decision Records
| Document | Description |
|----------|-------------|
| [ADR Index](adr/README.md) | All architecture decisions |

---

## 📁 Folder Structure

```
docs/
├── README.md                    # This file
├── getting-started/             # Onboarding docs
│   ├── implementation-plan.md
│   ├── local-setup.md
│   └── architecture.md
├── development/                 # Development guides
│   ├── java-development.md
│   ├── react-development.md
│   ├── code-style-guide.md
│   └── testing-strategy.md
├── api/                         # API documentation
│   ├── api-reference.md
│   ├── api-versioning.md
│   └── database-schema.md
├── services/                    # Microservice guides
│   ├── README.md
│   ├── user-service-guide.md
│   ├── product-service-guide.md
│   ├── order-service-guide.md
│   ├── payment-service-guide.md
│   └── notification-service-guide.md
├── frontend/                    # Frontend docs
│   ├── README.md
│   ├── pages-guide.md
│   └── components.md
├── infrastructure/              # Infra docs
│   ├── docker-guide.md
│   ├── kubernetes-guide.md
│   ├── networking.md
│   └── azure-deployment.md
├── devops/                      # CI/CD docs
│   ├── devops-toolchain.md
│   ├── ci-cd-pipeline.md
│   └── gitops.md
├── observability/               # Monitoring docs
│   ├── monitoring.md
│   └── logging.md
├── security/                    # Security docs
│   ├── security.md
│   └── secrets-rotation.md
├── operations/                  # Ops runbooks
│   ├── runbook.md
│   ├── troubleshooting.md
│   ├── disaster-recovery.md
│   ├── sla-slo.md
│   ├── performance-tuning.md
│   └── cost-optimization.md
├── phases/                      # Development phases
│   ├── README.md
│   └── phase-1-8 guides
└── adr/                         # Architecture decisions
    └── ADR files
```

---

## 🔗 Quick Links

- **New Developer?** Start with [Local Setup](getting-started/local-setup.md)
- **Backend Dev?** See [Java Development](development/java-development.md)
- **Frontend Dev?** See [React Development](development/react-development.md)
- **DevOps?** See [DevOps Toolchain](devops/devops-toolchain.md)
- **Production Issues?** See [Troubleshooting](operations/troubleshooting.md)
