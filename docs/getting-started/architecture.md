---
title: "Architecture"
description: "High-level system architecture of CloudForge"
---

# System Architecture

CloudForge follows a microservices architecture pattern with an API Gateway for routing and service discovery.

## High-Level Diagram

```mermaid
graph TB
    subgraph Frontend
        A[React App - Vite]
    end

    subgraph API Gateway
        G[Spring Cloud Gateway]
    end

    subgraph Discovery
        E[Eureka Server]
    end

    subgraph Backend Services
        US[User Service]
        PS[Product Service]
        OS[Order Service]
        PY[Payment Service]
        NS[Notification Service]
    end

    subgraph Message Broker
        K[Apache Kafka]
    end

    subgraph Persistence
        PG[(PostgreSQL)]
        MG[(MongoDB)]
        RD[(Redis)]
    end

    subgraph External
        RZ[Razorpay API]
    end
    
    A --> G
    G --> E
    G --> US
    G --> PS
    G --> OS
    G --> PY
    
    US --> E
    PS --> E
    OS --> E
    PY --> E
    NS --> E
    
    US --> PG
    OS --> PG
    PY --> PG
    PS --> MG
    PS --> RD
    
    OS --> K
    PY --> K
    NS --> K
    
    PY --> RZ
```

## Services Overview

| Service | Port | Technology | Database | Description |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway** | 8080 | Spring Cloud Gateway | - | Routes requests, load balancing |
| **Discovery Server** | 8761 | Eureka Server | - | Service registration & discovery |
| **User Service** | 8081 | Spring Boot | PostgreSQL | Auth, JWT, user profiles |
| **Product Service** | 8082 | Spring Boot | MongoDB + Redis | Product catalog, inventory |
| **Order Service** | 8083 | Spring Boot | PostgreSQL | Order management |
| **Payment Service** | 8084 | Spring Boot | PostgreSQL | Razorpay integration |
| **Notification Service** | 8085 | Spring Boot | - | Email/SMS notifications |
| **Frontend** | 5173 | React + Vite | - | Amazon-style SPA |

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **TailwindCSS** for styling
- **Zustand** for state management
- **TanStack Query** for data fetching
- **Razorpay** for payments

### Backend
- **Spring Boot 3** microservices
- **Spring Cloud Gateway** for API routing
- **Eureka** for service discovery
- **Apache Kafka** for async messaging
- **PostgreSQL** for relational data
- **MongoDB** for product documents
- **Redis** for caching

## Data Flow

1. **Request Routing**: All requests go through API Gateway which routes to appropriate services via Eureka
2. **Authentication**: User Service issues JWT tokens validated by all services
3. **Order Flow**: Orders → Kafka → Payment/Notification services
4. **Caching**: Product data cached in Redis for performance
