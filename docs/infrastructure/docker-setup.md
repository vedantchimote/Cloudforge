---
title: "Docker Setup"
description: "Running CloudForge with Docker Compose"
---

# Infrastructure Setup

CloudForge uses Docker Compose to orchestrate its dependencies, making it easy to spin up the entire environment locally.

## Prerequisite
*   Docker Desktop installed and running.

## Services Configuration

The `docker-compose.yml` defines the following services:

### 1. PostgreSQL (`cloudforge-postgres`)
- **Port**: 5432
- **Purpose**: Primary data store for User Service.
- **Volume**: `postgres_data`

### 2. MongoDB (`cloudforge-mongodb`)
- **Port**: 27017
- **Purpose**: Document store for Product Service.
- **Volume**: `mongodb_data`

### 3. Redis (`cloudforge-redis`)
- **Port**: 6379
- **Purpose**: Caching layer.

### 4. OpenLDAP (`cloudforge-ldap`)
- **Port**: 389, 636
- **Purpose**: Directory service for enterprise authentication.

## Commands

### Start All Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f [service_name]
```
