# System Architecture

CloudForge is a cloud-native e-commerce platform built using microservices architecture.

---

## 🏗️ High-Level Architecture

```mermaid
flowchart TB
    subgraph "Client Layer"
        WEB[🌐 React Frontend]
        MOBILE[📱 Mobile App]
    end

    subgraph "API Layer"
        GW[API Gateway]
    end

    subgraph "Service Layer"
        US[👤 User Service]
        PS[📦 Product Service]
        OS[🛒 Order Service]
        PY[💳 Payment Service]
        NS[📧 Notification Service]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL)]
        MG[(MongoDB)]
        RD[(Redis)]
    end

    subgraph "Messaging"
        KF[Apache Kafka]
    end

    subgraph "Identity"
        LDAP[(OpenLDAP)]
        VLT[HashiCorp Vault]
    end

    WEB --> GW
    MOBILE --> GW
    GW --> US & PS & OS & PY & NS
    US --> PG & LDAP
    PS --> MG
    OS --> PG
    PY --> PG & RD
    OS & PY --> KF --> NS
    US & PS & OS & PY --> VLT
```

---

## 🧩 Microservices

### User Service
- **Responsibility:** Authentication, authorization, user management
- **Database:** PostgreSQL
- **Dependencies:** OpenLDAP, Vault
- **Port:** 8081

### Product Service
- **Responsibility:** Product catalog, categories, inventory
- **Database:** MongoDB
- **Port:** 8082

### Order Service
- **Responsibility:** Cart, orders, order history
- **Database:** PostgreSQL
- **Dependencies:** Product Service, Payment Service, Kafka
- **Port:** 8083

### Payment Service
- **Responsibility:** Payment processing, refunds, transactions
- **Database:** PostgreSQL
- **Dependencies:** Redis (idempotency), Kafka
- **Port:** 8084

### Notification Service
- **Responsibility:** Email/SMS notifications
- **Dependencies:** Kafka (event consumer)
- **Port:** 8085

---

## 🔄 Communication Patterns

| Pattern | Use Case |
|---------|----------|
| **Synchronous (REST)** | Frontend → Services, Service → Service queries |
| **Asynchronous (Kafka)** | Order events, Payment events → Notifications |

---

## 🗄️ Data Architecture

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "is in"
    ORDER ||--o| PAYMENT : "has"
    
    USER {
        uuid id PK
        string email
        string password_hash
        string role
        timestamp created_at
    }
    
    PRODUCT {
        uuid id PK
        string name
        string description
        decimal price
        int stock
    }
    
    ORDER {
        uuid id PK
        uuid user_id FK
        string status
        decimal total
        timestamp created_at
    }
    
    PAYMENT {
        uuid id PK
        uuid order_id FK
        string status
        decimal amount
        string transaction_id
    }
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Layers                             │
├─────────────────────────────────────────────────────────────────┤
│  WAF / DDoS Protection (Azure Front Door)                       │
├─────────────────────────────────────────────────────────────────┤
│  TLS Termination (Ingress Controller)                           │
├─────────────────────────────────────────────────────────────────┤
│  Authentication (JWT + LDAP)                                    │
├─────────────────────────────────────────────────────────────────┤
│  Authorization (RBAC)                                           │
├─────────────────────────────────────────────────────────────────┤
│  Secrets Management (HashiCorp Vault)                           │
├─────────────────────────────────────────────────────────────────┤
│  Network Policies (K8s NetworkPolicy)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Observability Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Metrics | Prometheus | Collect & store metrics |
| Visualization | Grafana | Dashboards |
| Logging | Loki | Log aggregation |
| Tracing | Zipkin | Distributed tracing |
| Alerting | Alertmanager | Alert routing |

---

## 🚀 Deployment Architecture

See [Kubernetes Guide](kubernetes-guide.md) and [Azure Deployment](azure-deployment.md) for details.
