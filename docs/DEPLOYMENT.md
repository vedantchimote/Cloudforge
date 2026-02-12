---
title: "Deployment Guide"
description: "How to deploy CloudForge in various environments"
---

# Deployment Guide

CloudForge supports multiple deployment strategies, from local development with Docker Compose to production-grade orchestration with Kubernetes.

## 🚀 Local Development (Docker Compose)

For local development and testing, we use Docker Compose to spin up all microservices and infrastructure components.

### Prerequisites
- Docker & Docker Compose
- Java 17+
- Node.js 18+ (for frontend)

### Quick Start
1. **Build all services:**
   ```bash
   mvn clean install -DskipTests
   ```

2. **Start Infrastructure & Services:**
   ```bash
   docker-compose up -d
   ```

3. **Verify Status:**
   ```bash
   docker-compose ps
   ```

See [Docker Setup Guide](/infrastructure/docker-setup) for detailed container configurations.

## ☸️ Kubernetes (Production)

For production environments, we utilize Kubernetes for scalability and resilience.

### Architecture
- **Ingress Controller**: Manages external access.
- **Service Mesh (Istio)**: Optional, for advanced traffic management.
- **StatefulSets**: For databases (PostgreSQL, Redis, Kafka).
- **Deployments**: For stateless microservices.

### Deployment Steps
1. **Build Docker Images:**
   ```bash
   docker build -t cloudforge/order-service ./services/order-service
   # Repeat for all services
   ```

2. **Apply Manifests:**
   ```bash
   kubectl apply -f k8s/
   ```

See [Kubernetes Guide](/infrastructure/kubernetes-guide) for full cluster setup and manifest details.

## ☁️ Cloud Providers

### Azure
We have specific guides for deploying to Azure Kubernetes Service (AKS) and using Azure Container Registry (ACR).

See [Azure Deployment](/infrastructure/azure-deployment).
