---
title: "Architecture"
description: "High-level system architecture of CloudForge"
---

# System Architecture

CloudForge follows a microservices architecture pattern, where the application is decomposed into loosely coupled services.

## High-Level Diagram

```mermaid
graph LR
    subgraph Frontend
        A[React App (Port 5173)]
    end

    subgraph API Gateway / Load Balancer
        G[Reverse Proxy (Planned)]
    end

    subgraph Backend Services
        B[User Service (Port 8081)]
        C[Product Service (Port 8082)]
    end

    subgraph Persistence Layer
        D[(PostgreSQL)]
        E[(MongoDB)]
        F[(Redis)]
    end
    
    A --> B
    A --> C
    B --> D
    C --> E
    C --> F
```

## Services Overview

| Service | Port | Technology | DB | Description |
| :--- | :--- | :--- | :--- | :--- |
| **User Service** | 8081 | Spring Boot | PostgreSQL | Handles user registration, authentication (JWT/LDAP), and profile management. |
| **Product Service** | 8082 | Spring Boot | MongoDB | Manages product catalog, inventory, and categories. Caches data in Redis. |
| **Frontend** | 5173 | React/Vite | N/A | Single Page Application (SPA) providing the user interface. |

## Data Flow

1.  **Authentication**: Users log in via the Frontend. The User Service validates credentials against the database or LDAP and issues a JWT.
2.  **Product Browsing**: Frontend fetches product lists from the Product Service. Frequently accessed data (like product details) is cached in Redis for performance.
3.  **Data Persistence**: 
    - Structured user data (accounts, roles) resides in **PostgreSQL**.
    - Flexible product documents reside in **MongoDB**.
