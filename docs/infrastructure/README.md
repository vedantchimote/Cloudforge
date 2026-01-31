# Infrastructure Documentation

Container, Kubernetes, and cloud deployment documentation.

---

## 📚 Documents

| Document | Description |
|----------|-------------|
| [Docker Guide](docker-guide.md) | Container setup and configuration |
| [Kubernetes Guide](kubernetes-guide.md) | K8s deployment patterns |
| [Networking](networking.md) | Network configuration |
| [Azure Deployment](azure-deployment.md) | Cloud deployment on AKS |

---

## 🏗️ Infrastructure Components

```
┌─────────────────────────────────────────────────┐
│                 Azure Cloud                      │
├─────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐              │
│  │    AKS      │  │  Azure DB   │              │
│  │  Cluster    │  │  PostgreSQL │              │
│  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐              │
│  │    ACR      │  │  Key Vault  │              │
│  │  Registry   │  │   Secrets   │              │
│  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────┘
```

---

## 📖 Related Docs

- [DevOps Toolchain](../devops/devops-toolchain.md)
- [Phase 7: Azure](../phases/phase-7-azure.md)
