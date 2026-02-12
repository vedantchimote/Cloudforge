# Running the CloudForge Application 🚀

This guide provides step-by-step instructions to run the complete CloudForge application stack, including all backend microservices and the frontend web application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**: Required for running backend services and databases.
- **[Node.js](https://nodejs.org/)** (v18 or higher) & **npm**: Required for running the frontend.
- **Git**: To clone the repository.

---

## 1. Start Backend Services 🛠️

The backend microservices and infrastructure components (PostgreSQL, MongoDB, Kafka, Redis, etc.) are containerized and managed via Docker Compose.

1.  **Open your terminal** and navigate to the docker infrastructure directory:
    ```bash
    cd infrastructure/docker
    ```

2.  **Start the services**:
    Run the following command to build and start all containers in detached mode:
    ```bash
    docker-compose up -d --build
    ```
    *Note: The first run may take a few minutes as it downloads docker images and builds the Java microservices.*

3.  **Verify the status**:
    Check if all containers are up and healthy:
    ```bash
    docker-compose ps
    ```
    or
    ```bash
    docker ps
    ```

---

## 2. Start Frontend Application 💻

The frontend is a React application built with Vite.

1.  **Open a new terminal window** (keep the backend running) and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  **Install dependencies** (only needed for the first time):
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```

4.  **Access the application**:
    Open your browser and go to:
    👉 **[http://localhost:5173](http://localhost:5173)**

---

## 3. Service Access Points 🌐

| Component | URL / Port | Description |
| :--- | :--- | :--- |
| **Frontend App** | `http://localhost:5173` | Main user interface |
| **API Gateway** | `http://localhost:8080` | Entry point for all backend APIs |
| **Eureka Discovery** | `http://localhost:8761` | Service registry dashboard |
| **Kafka UI** | `http://localhost:8091` | Kafka topics and messages viewer |
| **User Service** | `http://localhost:8081` | User management API |
| **Product Service** | `http://localhost:8082` | Product catalog API |
| **Order Service** | `http://localhost:8083` | Order processing API |
| **Payment Service** | `http://localhost:8084` | Payment processing API |
| **Notification Service** | `http://localhost:8085` | Notification API |

---

## 4. Troubleshooting 🔧

### Common Issues

-   **Frontend Connection Refused**:
    -   Ensure the backend API Gateway is running on `http://localhost:8080`.
    -   Check the frontend console for errors.

-   **Services Unhealthy**:
    -   If a service (like `notification-service`) shows as unhealthy/exited, view its logs:
        ```bash
        docker logs cloudforge-notification-service
        ```
    -   It might be waiting for a dependency (Db or Kafka) to be fully ready. Restarting the specific container often helps:
        ```bash
        docker restart cloudforge-notification-service
        ```

-   **Port Conflicts**:
    -   Ensure ports `8080`, `5173`, `5432`, `27017` are not used by other applications on your machine.

### Stopping the Application

To stop all backend services:
```bash
cd infrastructure/docker
docker-compose down
```
To stop the frontend, simply press `Ctrl + C` in the terminal where it is running.
