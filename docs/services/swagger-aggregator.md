---
title: "Swagger Aggregator"
sidebarTitle: "Swagger Aggregator"
description: "Centralized API documentation for all CloudForge microservices."
icon: "book-open"
---

## Overview

The Swagger Aggregator is a specialized service that provides a unified interface for exploring and testing the APIs of all backend microservices. It aggregates OpenAPI definitions from individual services into a single Swagger UI.

### Key Features

*   **Unified UI**: Access documentation for User, Product, Order, Payment, and Notification services from one place.
*   **CORS Handling**: Proxies API documentation requests prevents Cross-Origin Resource Sharing (CORS) issues.
*   **Dynamic Discovery**: Automatically fetches the latest API definitions from running services.

## Architecture

The service runs as a lightweight Spring Boot application that:
1.  Hosts the Swagger UI static resources.
2.  Exposes a proxy controller (`/api-docs/{service}`) to fetch JSON definitions from backend services server-side.
3.  Configures Swagger UI to load these proxied definitions.

## Configuration

| Property | Value | Description |
| :--- | :--- | :--- |
| `server.port` | `8086` | Port where the service runs. |
| `springdoc.swagger-ui.path` | `/swagger-ui.html` | Path to access the UI. |

## Accessing the UI

Once the service is running, you can access the dashboard at:

[http://localhost:8086/swagger-ui.html](http://localhost:8086/swagger-ui.html)

### Available APIs

Use the dropdown in the top bar to switch between services:
*   **User Service** (`/api-docs/user-service`)
*   **Product Service** (`/api-docs/product-service`)
*   **Order Service** (`/api-docs/order-service`)
*   **Payment Service** (`/api-docs/payment-service`)
*   **Notification Service** (`/api-docs/notification-service`)

## Troubleshooting

<AccordionGroup>
  <Accordion title="Service definitions failing to load">
    Ensure that the target microservice is running. The aggregator cannot fetch definitions if the service is down.
  </Accordion>

  <Accordion title="CORS Errors">
    If you see CORS errors in the console, verify that you are accessing the UI via `http://localhost:8086` and not `127.0.0.1`. The proxy controller handles CORS for the API definitions, but the browser context must match.
  </Accordion>
</AccordionGroup>
