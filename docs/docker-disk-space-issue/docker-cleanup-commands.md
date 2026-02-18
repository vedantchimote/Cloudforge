# Docker Cleanup Commands Reference

## Quick Reference

### Safe Commands (Recommended)

```powershell
# Remove dangling images
docker image prune -f

# Remove stopped containers
docker container prune -f

# Remove unused networks
docker network prune -f

# Remove old build cache (7+ days)
docker builder prune --filter "until=168h" -f

# Remove all unused build cache
docker builder prune -a -f

# Check disk usage
docker system df
```

### Aggressive Commands (Use with Caution)

```powershell
# Remove ALL unused images (not just dangling)
docker image prune -a -f

# Remove ALL unused data (images, containers, networks, cache)
docker system prune -a -f

# Remove ALL volumes (DANGEROUS - deletes data!)
docker volume prune -f

# Nuclear option (VERY DANGEROUS - removes everything!)
docker system prune -a --volumes -f
```

## Detailed Command Reference

### Image Management

#### List Images

```powershell
# List all images
docker images

# List images with size
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# List dangling images
docker images --filter "dangling=true"

# List images by size (largest first)
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | Sort-Object -Property Size -Descending
```

#### Remove Images

```powershell
# Remove specific image
docker rmi <image-id>

# Remove multiple images
docker rmi <image-id1> <image-id2> <image-id3>

# Remove dangling images
docker image prune -f

# Remove all unused images
docker image prune -a -f

# Remove images older than 24 hours
docker image prune -a --filter "until=24h" -f

# Force remove image (even if in use)
docker rmi -f <image-id>
```

### Container Management

#### List Containers

```powershell
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# List containers with size
docker ps -a --size

# List only container IDs
docker ps -aq

# List containers by status
docker ps -a --filter "status=exited"
```

#### Remove Containers

```powershell
# Remove specific container
docker rm <container-id>

# Remove multiple containers
docker rm <container-id1> <container-id2>

# Remove all stopped containers
docker container prune -f

# Remove all containers (including running)
docker rm -f $(docker ps -aq)  # DANGEROUS!

# Remove containers older than 24 hours
docker container prune --filter "until=24h" -f
```

### Volume Management

#### List Volumes

```powershell
# List all volumes
docker volume ls

# List volumes with size
docker volume ls --format "table {{.Name}}\t{{.Driver}}"

# List dangling volumes
docker volume ls --filter "dangling=true"

# Count volumes
docker volume ls | Measure-Object -Line
```

#### Remove Volumes

```powershell
# Remove specific volume
docker volume rm <volume-name>

# Remove multiple volumes
docker volume rm <volume1> <volume2>

# Remove all unused volumes (DANGEROUS - deletes data!)
docker volume prune -f

# Remove specific volume even if in use
docker volume rm -f <volume-name>
```

**WARNING**: Removing volumes deletes database data permanently!

### Network Management

#### List Networks

```powershell
# List all networks
docker network ls

# List networks with details
docker network ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"

# Inspect network
docker network inspect <network-name>
```

#### Remove Networks

```powershell
# Remove specific network
docker network rm <network-name>

# Remove all unused networks
docker network prune -f

# Remove networks older than 24 hours
docker network prune --filter "until=24h" -f
```

### Build Cache Management

#### Inspect Build Cache

```powershell
# Show build cache usage
docker system df

# Show detailed build cache
docker buildx du

# Show build cache with details
docker builder prune --dry-run
```

#### Remove Build Cache

```powershell
# Remove old build cache (7+ days)
docker builder prune --filter "until=168h" -f

# Remove all unused build cache
docker builder prune -a -f

# Remove build cache older than 24 hours
docker builder prune --filter "until=24h" -f

# Remove specific build cache
docker buildx prune -f
```

### System-Wide Commands

#### System Information

```powershell
# Show disk usage
docker system df

# Show detailed disk usage
docker system df -v

# Show Docker info
docker info

# Show Docker version
docker version
```

#### System Cleanup

```powershell
# Remove all unused data (safe)
docker system prune -f

# Remove all unused data including images
docker system prune -a -f

# Remove all unused data including volumes (DANGEROUS!)
docker system prune -a --volumes -f

# Dry run (show what would be removed)
docker system prune --dry-run
```

## Filtering Options

### Time-Based Filters

```powershell
# Remove items older than 24 hours
--filter "until=24h"

# Remove items older than 7 days
--filter "until=168h"

# Remove items older than 30 days
--filter "until=720h"
```

### Label-Based Filters

```powershell
# Remove items with specific label
--filter "label=com.example.version=1.0"

# Remove items without label
--filter "label!=com.example.version"
```

### Status-Based Filters

```powershell
# Remove exited containers
--filter "status=exited"

# Remove created but not started containers
--filter "status=created"

# Remove dangling images
--filter "dangling=true"
```

## Disk Usage Analysis

### Check Disk Usage

```powershell
# Basic disk usage
docker system df

# Detailed disk usage
docker system df -v

# VHDX file size
Get-Item "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx" | Select-Object Length

# Format VHDX size in GB
$vhdxSize = (Get-Item "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx").Length / 1GB
Write-Host "VHDX size: $([math]::Round($vhdxSize, 2)) GB"
```

### Identify Large Items

```powershell
# Find largest images
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | Sort-Object -Property Size -Descending | Select-Object -First 10

# Find largest containers
docker ps -a --size --format "table {{.Names}}\t{{.Size}}" | Sort-Object -Property Size -Descending | Select-Object -First 10

# Find largest volumes
docker volume ls --format "{{.Name}}" | ForEach-Object { 
    $size = docker volume inspect $_ --format "{{.Mountpoint}}" | Get-ChildItem -Recurse | Measure-Object -Property Length -Sum
    [PSCustomObject]@{
        Name = $_
        Size = [math]::Round($size.Sum / 1GB, 2)
    }
} | Sort-Object -Property Size -Descending | Select-Object -First 10
```

## Safety Guidelines

### Before Removing Anything

1. **Check what will be removed**:
   ```powershell
   docker system prune --dry-run
   ```

2. **List items to be removed**:
   ```powershell
   docker images --filter "dangling=true"
   docker ps -a --filter "status=exited"
   ```

3. **Backup important data**:
   ```powershell
   docker volume ls  # Verify volumes are safe
   ```

### Safe Removal Order

1. **Dangling images** (safest)
2. **Stopped containers**
3. **Unused networks**
4. **Old build cache** (7+ days)
5. **All build cache**
6. **Unused images** (careful)
7. **Volumes** (NEVER unless you know what you're doing)

### What NOT to Remove

❌ **Running containers**: Will stop your services
❌ **Active images**: Used by containers
❌ **Volumes**: Contain database data
❌ **Networks in use**: Will break container communication

## Common Cleanup Scenarios

### Scenario 1: Daily Cleanup

```powershell
# Remove stopped containers
docker container prune -f

# Remove dangling images
docker image prune -f
```

### Scenario 2: Weekly Cleanup

```powershell
# Remove stopped containers
docker container prune -f

# Remove dangling images
docker image prune -f

# Remove old build cache (7+ days)
docker builder prune --filter "until=168h" -f

# Remove unused networks
docker network prune -f
```

### Scenario 3: Monthly Cleanup

```powershell
# Remove all unused build cache
docker builder prune -a -f

# Remove all unused images
docker image prune -a -f

# Remove stopped containers
docker container prune -f

# Remove unused networks
docker network prune -f

# Compact VHDX
.\compact-docker-vhdx.ps1
```

### Scenario 4: Emergency Cleanup (Disk Full)

```powershell
# Nuclear option (removes everything unused)
docker system prune -a -f

# Compact VHDX immediately
.\compact-docker-vhdx.ps1

# Rebuild if necessary
docker-compose build
docker-compose up -d
```

## Troubleshooting

### Issue: "Cannot remove image, it's in use"

```powershell
# Find which container is using it
docker ps -a --filter ancestor=<image-name>

# Stop the container
docker stop <container-id>

# Remove the container
docker rm <container-id>

# Try again
docker rmi <image-id>
```

### Issue: "Cannot remove container, it's running"

```powershell
# Stop the container
docker stop <container-id>

# Remove the container
docker rm <container-id>
```

### Issue: "Cannot remove volume, it's in use"

```powershell
# Find which container is using it
docker ps -a --filter volume=<volume-name>

# Stop and remove the container
docker stop <container-id>
docker rm <container-id>

# Remove the volume
docker volume rm <volume-name>
```

## Best Practices

### 1. Use Filters

```powershell
# Good: Remove old items only
docker image prune --filter "until=168h" -f

# Bad: Remove everything
docker image prune -a -f
```

### 2. Check Before Removing

```powershell
# Always use --dry-run first
docker system prune --dry-run

# Then remove
docker system prune -f
```

### 3. Automate Regular Cleanup

```powershell
# Create scheduled task for weekly cleanup
$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument '-Command "docker image prune -f; docker container prune -f; docker builder prune --filter \"until=168h\" -f"'
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 2am
Register-ScheduledTask -TaskName "Docker Weekly Cleanup" -Action $action -Trigger $trigger
```

### 4. Monitor Disk Usage

```powershell
# Check weekly
docker system df

# Alert if build cache > 10 GB
$buildCache = (docker system df --format "{{.BuildCache}}")
if ($buildCache -match "(\d+\.?\d*)GB" -and [double]$matches[1] -gt 10) {
    Write-Host "WARNING: Build cache exceeds 10 GB!" -ForegroundColor Yellow
}
```

## Quick Cleanup Script

Save this as `quick-cleanup.ps1`:

```powershell
# Quick Docker Cleanup Script
Write-Host "Starting Docker cleanup..." -ForegroundColor Cyan

# Remove dangling images
Write-Host "Removing dangling images..." -ForegroundColor Yellow
docker image prune -f

# Remove stopped containers
Write-Host "Removing stopped containers..." -ForegroundColor Yellow
docker container prune -f

# Remove unused networks
Write-Host "Removing unused networks..." -ForegroundColor Yellow
docker network prune -f

# Remove old build cache
Write-Host "Removing old build cache..." -ForegroundColor Yellow
docker builder prune --filter "until=168h" -f

# Show results
Write-Host ""
Write-Host "Cleanup complete! Current disk usage:" -ForegroundColor Green
docker system df
```

## Conclusion

Use these commands to:

✓ **Monitor** disk usage regularly
✓ **Clean up** unused data safely
✓ **Prevent** VHDX bloat
✓ **Maintain** a healthy Docker environment

---

**Remember**: Always check what will be removed before running cleanup commands!
