---
title: "Introduction"
description: "Welcome to CloudForge - A modern, cloud-native e-commerce platform"
---

# Welcome to CloudForge

CloudForge is a comprehensive reference architecture for building production-grade, microservices-based e-commerce applications. It demonstrates enterprise patterns using modern technologies like Spring Boot 3, React 18, and Docker.

<img
  className="block dark:hidden"
  src="/images/hero-light.png"
  alt="CloudForge Hero Light"
/>
<img
  className="hidden dark:block"
  src="/images/hero-dark.png"
  alt="CloudForge Hero Dark"
/>

## Key Features

<CardGroup cols={2}>
  <Card
    title="Microservices Architecture"
    icon="server"
    href="/getting-started/architecture"
  >
    Decoupled services for User Management, Product Catalog, and more, independently scalable.
  </Card>
  <Card
    title="Modern Frontend"
    icon="react"
    href="/frontend/overview"
  >
    Responsive UI built with React 18, TypeScript, TailwindCSS, and Zustand.
  </Card>
  <Card
    title="Enterprise Security"
    icon="shield-check"
    href="/services/user-service"
  >
    JWT-based stateless authentication and LDAP integration.
  </Card>
  <Card
    title="DevOps Ready"
    icon="docker"
    href="/infrastructure/docker-setup"
  >
    Fully containerized with Docker Compose, PostgreSQL, MongoDB, and Redis.
  </Card>
</CardGroup>

## Technology Stack

### Backend
*   **Java 21** / Spring Boot 3.2
*   **Spring Security** (OIDC/JWT)
*   **Spring Data JPA** & **MongoDB**
*   **Flyway** for Database Migrations

### Frontend
*   **React 18**
*   **TypeScript**
*   **Vite**
*   **TailwindCSS**

### Infrastructure
*   **Docker** & **Docker Compose**
*   **PostgreSQL** (User Service)
*   **MongoDB** (Product Service)
*   **Redis** (dCache)
*   **OpenLDAP**
