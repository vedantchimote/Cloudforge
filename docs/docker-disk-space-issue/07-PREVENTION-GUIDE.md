# Prevention Guide: Avoiding Future VHDX Bloat

## Overview

This guide provides best practices and strategies to prevent Docker VHDX disk space bloat from occurring again.

## Root Causes to Avoid

### 1. Excessive `--no-cache` Builds

**Problem**: Each `--no-cache` build creates entirely new layers, multiplying disk usage by 5x.

**Solution**:

```powershell
# ❌ BAD: Always using --no-cache
docker-compose build --no-cache frontend
docker-compose build --no-cache user-service

# ✅ GOOD: Use cache by default
docker-compose build frontend
docker-compose build user-service

# ✅ GOOD: Use --no-cache only when necessary
# (e.g., after changing base image or dependencies)
docker-compose build --no-cache frontend  # Only when needed
```

**When to use `--no-cache`**:
- After updating base image (FROM line)
- After changing package.json or pom.xml
- When debugging cache-related issues
- Maximum once per day per service

**When NOT to use `--no-cache`**:
- For code changes only
- For configuration changes
- For debugging application logic
- For routine rebuilds

### 2. Build Cache Accumulation

**Problem**: Build cache accumulates over time, especially with multi-stage builds.

**Solution**:

```powershell
# Weekly: Remove old build cache (7+ days)
docker builder prune --filter "until=168h" -f

# Monthly: Remove all unused build cache
docker builder prune -a -f
```

**Automated Cleanup** (Task Scheduler):

```powershell
# Create weekly cleanup task
$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument '-Command "docker builder prune --filter \"until=168h\" -f"'
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 2am
Register-ScheduledTask -TaskName "Docker Weekly Cleanup" `
    -Action $action -Trigger $trigger
```

### 3. VHDX Not Compacted

**Problem**: VHDX grows but never shrinks automatically.

**Solution**:

```powershell
# Monthly: Compact VHDX
.\compact-docker-vhdx.ps1
```

**Automated Compaction** (Task Scheduler):

```powershell
# Create monthly compaction task
$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument '-File "C:\Programs\Prof\cloudforge\docs\docker-disk-space-issue\compact-docker-vhdx.ps1"'
$trigger = New-ScheduledTaskTrigger -Monthly -DaysOfMonth 1 -At 2am
Register-ScheduledTask -TaskName "Docker Monthly Compaction" `
    -Action $action -Trigger $trigger -RunLevel Highest
```

### 4. Lack of Monitoring

**Problem**: Disk usage not tracked, issues discovered too late.

**Solution**:

```powershell
# Create monitoring script
$script = @'
$vhdxSize = (Get-Item "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx").Length / 1GB
$buildCache = (docker system df --format "{{.BuildCache}}" | Select-String -Pattern "(\d+\.?\d*)GB" | ForEach-Object { $_.Matches.Groups[1].Value })

Write-Host "VHDX Size: $([math]::Round($vhdxSize, 2)) GB"
Write-Host "Build Cache: $buildCache GB"

if ($vhdxSize -gt 100) {
    Write-Host "WARNING: VHDX size exceeds 100 GB!" -ForegroundColor Red
}
if ([double]$buildCache -gt 10) {
    Write-Host "WARNING: Build cache exceeds 10 GB!" -ForegroundColor Yellow
}
'@

$script | Out-File -FilePath "C:\Programs\Prof\cloudforge\monitor-docker.ps1"
```

**Weekly Monitoring** (Task Scheduler):

```powershell
# Create weekly monitoring task
$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument '-File "C:\Programs\Prof\cloudforge\monitor-docker.ps1"'
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 9am
Register-ScheduledTask -TaskName "Docker Weekly Monitor" `
    -Action $action -Trigger $trigger
```

## Best Practices

### 1. Docker Desktop Settings

**Enable Auto-Cleanup**:
1. Open Docker Desktop
2. Settings → Resources → Disk image size
3. Enable "Automatically clean up unused resources"
4. Set cleanup frequency to "Weekly"

**Limit VHDX Size**:
1. Settings → Resources → Disk image size
2. Set maximum size to 150 GB (prevents runaway growth)

**Enable Resource Saver**:
1. Settings → General
2. Enable "Resource Saver" (stops Docker when idle)

### 2. Build Optimization

**Use .dockerignore**:

```
# .dockerignore
node_modules
dist
build
target
*.log
.git
.env
```

**Multi-Stage Build Optimization**:

```dockerfile
# ❌ BAD: Large build stage
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install  # Downloads everything
RUN npm run build

# ✅ GOOD: Optimized build stage
FROM node:18-alpine AS build  # Smaller base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production  # Only production deps
COPY . .
RUN npm run build
```

**Layer Caching**:

```dockerfile
# ❌ BAD: Cache invalidated on every code change
FROM node:18-alpine
WORKDIR /app
COPY . .  # Copies everything, invalidates cache
RUN npm install
RUN npm run build

# ✅ GOOD: Cache dependencies separately
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./  # Only copy package files
RUN npm ci  # Cache this layer
COPY . .  # Code changes don't invalidate npm install
RUN npm run build
```

### 3. Development Workflow

**Use Docker Compose Efficiently**:

```powershell
# ❌ BAD: Rebuild everything
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# ✅ GOOD: Rebuild only what changed
docker-compose build frontend  # Only rebuild changed service
docker-compose up -d frontend  # Only restart changed service
```

**Use Volume Mounts for Development**:

```yaml
# docker-compose.yml
services:
  frontend:
    build: ./frontend
    volumes:
      - ./frontend/src:/app/src  # Mount source code
    # No need to rebuild for code changes
```

### 4. Cleanup Routines

**Daily** (Automated):
```powershell
# Remove stopped containers
docker container prune -f
```

**Weekly** (Automated):
```powershell
# Remove dangling images
docker image prune -f

# Remove old build cache (7+ days)
docker builder prune --filter "until=168h" -f
```

**Monthly** (Manual):
```powershell
# Remove all unused build cache
docker builder prune -a -f

# Compact VHDX
.\compact-docker-vhdx.ps1
```

**Quarterly** (Manual):
```powershell
# Full cleanup (careful!)
docker system prune -a -f  # Removes all unused images

# Compact VHDX
.\compact-docker-vhdx.ps1
```

## Monitoring and Alerts

### 1. Disk Usage Dashboard

Create a monitoring script:

```powershell
# monitor-docker-dashboard.ps1
function Get-DockerDiskUsage {
    $vhdxPath = "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx"
    $vhdxSize = (Get-Item $vhdxPath).Length / 1GB
    
    $dockerDf = docker system df --format "{{json .}}" | ConvertFrom-Json
    
    Write-Host "=== Docker Disk Usage Dashboard ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "VHDX File:" -ForegroundColor Yellow
    Write-Host "  Size: $([math]::Round($vhdxSize, 2)) GB"
    Write-Host "  Path: $vhdxPath"
    Write-Host ""
    Write-Host "Docker Data:" -ForegroundColor Yellow
    Write-Host "  Images: $($dockerDf.Images.Size)"
    Write-Host "  Containers: $($dockerDf.Containers.Size)"
    Write-Host "  Volumes: $($dockerDf.Volumes.Size)"
    Write-Host "  Build Cache: $($dockerDf.BuildCache.Size)"
    Write-Host ""
    
    # Alerts
    if ($vhdxSize -gt 100) {
        Write-Host "⚠ ALERT: VHDX size exceeds 100 GB!" -ForegroundColor Red
        Write-Host "  Action: Run cleanup and compaction" -ForegroundColor Yellow
    }
    
    $buildCacheGB = [double]($dockerDf.BuildCache.Size -replace '[^\d.]', '') / 1GB
    if ($buildCacheGB -gt 10) {
        Write-Host "⚠ ALERT: Build cache exceeds 10 GB!" -ForegroundColor Yellow
        Write-Host "  Action: Run 'docker builder prune -f'" -ForegroundColor Yellow
    }
}

Get-DockerDiskUsage
```

### 2. Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| VHDX Size | 80 GB | 100 GB | Cleanup + Compact |
| Build Cache | 5 GB | 10 GB | Prune cache |
| Stopped Containers | 10 | 20 | Prune containers |
| Dangling Images | 5 GB | 10 GB | Prune images |

### 3. Automated Alerts

```powershell
# alert-docker-disk.ps1
$vhdxSize = (Get-Item "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx").Length / 1GB

if ($vhdxSize -gt 100) {
    # Send email alert (configure SMTP)
    Send-MailMessage -To "admin@example.com" `
        -From "docker-monitor@example.com" `
        -Subject "Docker VHDX Alert: Size exceeds 100 GB" `
        -Body "VHDX size: $([math]::Round($vhdxSize, 2)) GB. Please run cleanup and compaction." `
        -SmtpServer "smtp.example.com"
}
```

## Maintenance Schedule

### Weekly Maintenance (Sundays, 2 AM)

```powershell
# weekly-maintenance.ps1
Write-Host "Starting weekly Docker maintenance..." -ForegroundColor Cyan

# 1. Remove dangling images
Write-Host "Removing dangling images..." -ForegroundColor Yellow
docker image prune -f

# 2. Remove stopped containers
Write-Host "Removing stopped containers..." -ForegroundColor Yellow
docker container prune -f

# 3. Remove old build cache (7+ days)
Write-Host "Removing old build cache..." -ForegroundColor Yellow
docker builder prune --filter "until=168h" -f

# 4. Check disk usage
Write-Host "Current disk usage:" -ForegroundColor Yellow
docker system df

Write-Host "Weekly maintenance complete!" -ForegroundColor Green
```

### Monthly Maintenance (1st of month, 2 AM)

```powershell
# monthly-maintenance.ps1
Write-Host "Starting monthly Docker maintenance..." -ForegroundColor Cyan

# 1. Remove all unused build cache
Write-Host "Removing all unused build cache..." -ForegroundColor Yellow
docker builder prune -a -f

# 2. Compact VHDX
Write-Host "Compacting VHDX..." -ForegroundColor Yellow
& "C:\Programs\Prof\cloudforge\docs\docker-disk-space-issue\compact-docker-vhdx.ps1"

# 3. Check disk usage
Write-Host "Current disk usage:" -ForegroundColor Yellow
docker system df

Write-Host "Monthly maintenance complete!" -ForegroundColor Green
```

## Team Guidelines

### 1. Development Guidelines

**For Developers**:

1. **Avoid `--no-cache`** unless absolutely necessary
2. **Use `.dockerignore`** to exclude unnecessary files
3. **Optimize Dockerfiles** for layer caching
4. **Clean up after yourself**: Remove stopped containers

**Code Review Checklist**:

- [ ] Dockerfile uses multi-stage builds
- [ ] .dockerignore excludes unnecessary files
- [ ] Dependencies copied before source code
- [ ] No `--no-cache` in CI/CD scripts (unless needed)

### 2. CI/CD Guidelines

**GitHub Actions / Azure Pipelines**:

```yaml
# ❌ BAD: Always use --no-cache
- name: Build Docker image
  run: docker build --no-cache -t myapp .

# ✅ GOOD: Use cache by default
- name: Build Docker image
  run: docker build -t myapp .

# ✅ GOOD: Use --no-cache only for releases
- name: Build Docker image (Release)
  if: github.ref == 'refs/heads/main'
  run: docker build --no-cache -t myapp .
```

### 3. Documentation

**Update Team Wiki**:

1. Link to this prevention guide
2. Document cleanup procedures
3. Share monitoring dashboard
4. Establish maintenance schedule

## Quick Reference

### Daily Commands

```powershell
# Check disk usage
docker system df
```

### Weekly Commands

```powershell
# Cleanup
docker image prune -f
docker container prune -f
docker builder prune --filter "until=168h" -f
```

### Monthly Commands

```powershell
# Full cleanup
docker builder prune -a -f

# Compact VHDX
.\compact-docker-vhdx.ps1
```

### Emergency Commands

```powershell
# If VHDX > 150 GB
docker system prune -a -f  # Remove all unused data
.\compact-docker-vhdx.ps1  # Compact VHDX
```

## Success Metrics

Track these metrics monthly:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| VHDX Size | < 80 GB | 74.96 GB | ✓ |
| Build Cache | < 5 GB | 0 GB | ✓ |
| Stopped Containers | 0 | 0 | ✓ |
| Dangling Images | < 1 GB | 0 GB | ✓ |

## Conclusion

By following these prevention guidelines:

✓ **Avoid `--no-cache`** unless necessary
✓ **Regular cleanup** (weekly/monthly)
✓ **Monitor disk usage** (weekly)
✓ **Compact VHDX** (monthly)
✓ **Optimize Dockerfiles** (always)

You can prevent VHDX bloat and maintain a healthy Docker environment.

---

**Next**: See `08-MONTHLY-MAINTENANCE.md` for detailed maintenance routine
