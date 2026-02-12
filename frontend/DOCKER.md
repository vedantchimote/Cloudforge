# Frontend Docker Setup

This document explains the Docker configuration for the CloudForge React frontend.

## 🐳 Docker Architecture

The frontend uses a **multi-stage build** approach:

1. **Build Stage**: Uses Node.js 18 Alpine to build the React application
2. **Production Stage**: Uses Nginx Alpine to serve the static files

## 📁 Files

- `Dockerfile` - Multi-stage Docker build configuration
- `nginx.conf` - Nginx server configuration with API proxy
- `.dockerignore` - Files to exclude from Docker build context

## 🏗️ Build & Run

### Build the Image

```bash
# From the frontend directory
docker build -t cloudforge-frontend:latest .

# Or from the project root
docker build -f frontend/Dockerfile -t cloudforge-frontend:latest ./frontend
```

### Run Standalone Container

```bash
docker run -d \
  --name cloudforge-frontend \
  -p 3000:80 \
  cloudforge-frontend:latest
```

Access at: http://localhost:3000

### Run with Docker Compose

```bash
# From infrastructure/docker directory
docker-compose up -d frontend

# Or start all services
docker-compose up -d
```

## 🔧 Configuration

### Nginx Configuration

The `nginx.conf` file includes:

- **API Proxy**: Routes `/api/*` requests to the API Gateway at `http://api-gateway:8080`
- **React Router Support**: Serves `index.html` for all routes (SPA routing)
- **Static Asset Caching**: 1-year cache for JS, CSS, images
- **Gzip Compression**: Enabled for text-based files
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **Health Check Endpoint**: `/health` for container health monitoring

### Environment Variables

The frontend doesn't require environment variables at runtime since the API proxy is handled by Nginx.

If you need to configure the API Gateway URL, modify the `nginx.conf`:

```nginx
location /api/ {
    proxy_pass http://your-api-gateway:8080;
    # ... other proxy settings
}
```

## 🔍 Health Checks

The container includes a health check that verifies Nginx is responding:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' cloudforge-frontend

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' cloudforge-frontend
```

## 📊 Image Size Optimization

The multi-stage build keeps the final image small:

- **Build stage**: ~1.2GB (includes Node.js and build tools)
- **Final image**: ~50MB (only Nginx + static files)

## 🔒 Security Features

1. **Non-root User**: Runs as `appuser` (not root)
2. **Minimal Base Image**: Uses Alpine Linux
3. **Security Headers**: Configured in Nginx
4. **No Sensitive Data**: No environment secrets in the image

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker logs cloudforge-frontend

# Check if port 3000 is already in use
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac
```

### API calls failing

1. Ensure API Gateway is running:
   ```bash
   docker ps | grep api-gateway
   ```

2. Check network connectivity:
   ```bash
   docker exec cloudforge-frontend wget -O- http://api-gateway:8080/actuator/health
   ```

3. Verify nginx configuration:
   ```bash
   docker exec cloudforge-frontend nginx -t
   ```

### Build fails

1. Clear Docker cache:
   ```bash
   docker build --no-cache -t cloudforge-frontend:latest .
   ```

2. Check Node.js version compatibility:
   ```bash
   # Ensure package.json engines match Dockerfile Node version
   ```

## 📝 Development vs Production

### Development (Vite Dev Server)

```bash
# Run locally with hot reload
npm run dev
```

- Port: 5173
- Hot Module Replacement (HMR)
- Source maps enabled
- API proxy configured in `vite.config.ts`

### Production (Docker + Nginx)

```bash
# Build and run with Docker
docker-compose up -d frontend
```

- Port: 3000 (mapped to container port 80)
- Optimized build
- Gzip compression
- Static file caching
- API proxy configured in `nginx.conf`

## 🚀 Deployment

### Docker Hub

```bash
# Tag the image
docker tag cloudforge-frontend:latest yourusername/cloudforge-frontend:latest
docker tag cloudforge-frontend:latest yourusername/cloudforge-frontend:1.0.0

# Push to Docker Hub
docker push yourusername/cloudforge-frontend:latest
docker push yourusername/cloudforge-frontend:1.0.0
```

### Kubernetes

The Docker image is ready for Kubernetes deployment. See the Helm charts in `infrastructure/helm/` for K8s configuration.

## 📚 Related Documentation

- [Main README](../README.md)
- [Docker Compose Guide](../docs/infrastructure/docker-guide.md)
- [Kubernetes Guide](../docs/infrastructure/kubernetes-guide.md)
