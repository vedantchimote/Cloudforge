---
title: "Discovery Server"
description: "Service Registration and Discovery with Netflix Eureka"
---

# Discovery Server

The Discovery Server is the phonebook of the CloudForge microservices architecture. Powered by **Netflix Eureka**, it allows microservices to register themselves and discover other services without hardcoding hostnames or ports.

## Architecture

All microservices register with the Eureka Server upon startup. The API Gateway and other services query Eureka to find the current IP address and port of the services they need to communicate with.

```mermaid
sequenceDiagram
    participant Service as Microservice
    participant Eureka as Discovery Server
    participant Gateway as API Gateway

    Service->>Eureka: Register (Application Name, IP, Port)
    Note over Service, Eureka: Heartbeats sent every 30s
    
    Gateway->>Eureka: Fetch Registry
    Eureka-->>Gateway: List of Active Services
    
    Note over Gateway: Gateway caches registry locally
```

## Dashboard

The Eureka Dashboard provides a visual interface to view registered instances and their health status.

- **URL**: `http://localhost:8761`
- **Credentials**: `eureka` / `eureka123`

## Service Registration

To register a service with Eureka, the `spring-cloud-starter-netflix-eureka-client` dependency is added, and the following configuration is used:

```yaml
eureka:
  client:
    service-url:
      defaultZone: http://eureka:eureka123@discovery-server:8761/eureka/
    registry-fetch-interval-seconds: 5
  instance:
    prefer-ip-address: true
    instance-id: ${spring.application.name}:${random.value}
```

## Health Checks

Eureka requires services to send regular heartbeats (default every 30 seconds). If a service fails to send a heartbeat, Eureka will remove it from the registry, preventing traffic from being routed to an unhealthy instance.
