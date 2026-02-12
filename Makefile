.PHONY: help build up down restart logs clean test

# Default target
help:
	@echo "CloudForge - Docker Management Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  build          Build all Docker images"
	@echo "  build-frontend Build only frontend image"
	@echo "  build-backend  Build all backend services"
	@echo "  up             Start all services"
	@echo "  down           Stop all services"
	@echo "  restart        Restart all services"
	@echo "  logs           View logs from all services"
	@echo "  logs-frontend  View frontend logs"
	@echo "  logs-backend   View backend service logs"
	@echo "  clean          Stop services and remove volumes"
	@echo "  clean-all      Remove all containers, images, and volumes"
	@echo "  test           Run health checks on all services"
	@echo "  ps             Show running containers"
	@echo "  stats          Show container resource usage"

# Build targets
build:
	cd infrastructure/docker && docker-compose build

build-frontend:
	cd infrastructure/docker && docker-compose build frontend

build-backend:
	cd infrastructure/docker && docker-compose build \
		discovery-server api-gateway user-service product-service \
		order-service payment-service notification-service

# Service management
up:
	cd infrastructure/docker && docker-compose up -d

down:
	cd infrastructure/docker && docker-compose down

restart:
	cd infrastructure/docker && docker-compose restart

# Logs
logs:
	cd infrastructure/docker && docker-compose logs -f

logs-frontend:
	cd infrastructure/docker && docker-compose logs -f frontend

logs-backend:
	cd infrastructure/docker && docker-compose logs -f \
		user-service product-service order-service payment-service notification-service

logs-infra:
	cd infrastructure/docker && docker-compose logs -f \
		postgres mongodb redis kafka

# Cleanup
clean:
	cd infrastructure/docker && docker-compose down -v

clean-all:
	cd infrastructure/docker && docker-compose down -v --rmi all

# Testing
test:
	@echo "Testing service health..."
	@curl -f http://localhost:3000/health && echo "✓ Frontend healthy" || echo "✗ Frontend unhealthy"
	@curl -f http://localhost:8080/actuator/health && echo "✓ API Gateway healthy" || echo "✗ API Gateway unhealthy"
	@curl -f http://localhost:8081/actuator/health && echo "✓ User Service healthy" || echo "✗ User Service unhealthy"
	@curl -f http://localhost:8082/actuator/health && echo "✓ Product Service healthy" || echo "✗ Product Service unhealthy"
	@curl -f http://localhost:8083/actuator/health && echo "✓ Order Service healthy" || echo "✗ Order Service unhealthy"
	@curl -f http://localhost:8084/actuator/health && echo "✓ Payment Service healthy" || echo "✗ Payment Service unhealthy"
	@curl -f http://localhost:8085/actuator/health && echo "✓ Notification Service healthy" || echo "✗ Notification Service unhealthy"

# Monitoring
ps:
	cd infrastructure/docker && docker-compose ps

stats:
	docker stats --no-stream

# Development helpers
dev-frontend:
	cd frontend && npm run dev

dev-user-service:
	cd services/user-service && ./mvnw spring-boot:run

dev-product-service:
	cd services/product-service && ./mvnw spring-boot:run

# Database access
db-postgres:
	docker exec -it cloudforge-postgres psql -U cloudforge -d cloudforge

db-mongo:
	docker exec -it cloudforge-mongodb mongosh -u root -p mongo123 --authenticationDatabase admin

db-redis:
	docker exec -it cloudforge-redis redis-cli -a redis123
