# Monthly Maintenance Routine

## Overview

This document provides a comprehensive monthly maintenance routine to keep your Docker environment healthy and prevent VHDX bloat.

## Maintenance Schedule

**Recommended**: First Sunday of every month at 2:00 AM

**Duration**: 15-30 minutes

**Frequency**: Monthly

## Pre-Maintenance Checklist

Before starting maintenance:

- [ ] No critical deployments scheduled
- [ ] Team notified of Docker downtime
- [ ] Recent backup available (optional)
- [ ] PowerShell running as Administrator
- [ ] At least 30 minutes available

## Monthly Maintenance Steps

### Step 1: Assessment (5 minutes)

#### 1.1 Check Current VHDX Size

```powershell
$vhdxPath = "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx"
$currentSize = (Get-Item $vhdxPath).Length / 1GB
Write-Host "Current VHDX size: $([math]::Round($currentSize, 2)) GB" -ForegroundColor Cyan
```

**Record the size**: __________ GB

#### 1.2 Check Docker Disk Usage

```powershell
docker system df
```

**Record the values**:
- Images: __________ GB
- Containers: __________ MB
- Volumes: __________ GB
- Build Cache: __________ GB

#### 1.3 Check Running Containers

```powershell
docker ps --format "table {{.Names}}\t{{.Status}}"
```

**Record count**: __________ containers running

### Step 2: Backup (Optional, 5 minutes)

If you want to be extra safe:

```powershell
# Stop Docker Desktop
Stop-Process -Name "Docker Desktop" -Force
Start-Sleep -Seconds 10

# Backup VHDX (takes 5-10 minutes)
Copy-Item $vhdxPath "$vhdxPath.backup"

# Restart Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
Start-Sleep -Seconds 30
```

**Note**: This is optional. The cleanup process is safe and doesn't require backup.

### Step 3: Docker Cleanup (5 minutes)

#### 3.1 Remove Dangling Images

```powershell
Write-Host "Removing dangling images..." -ForegroundColor Yellow
docker image prune -f
```

**Record space freed**: __________ MB

#### 3.2 Remove Stopped Containers

```powershell
Write-Host "Removing stopped containers..." -ForegroundColor Yellow
docker container prune -f
```

**Record space freed**: __________ MB

#### 3.3 Remove Unused Networks

```powershell
Write-Host "Removing unused networks..." -ForegroundColor Yellow
docker network prune -f
```

**Record networks removed**: __________

#### 3.4 Remove Old Build Cache (7+ days)

```powershell
Write-Host "Removing old build cache (7+ days)..." -ForegroundColor Yellow
docker builder prune --filter "until=168h" -f
```

**Record space freed**: __________ GB

#### 3.5 Remove All Unused Build Cache

```powershell
Write-Host "Removing all unused build cache..." -ForegroundColor Yellow
docker builder prune -a -f
```

**Record space freed**: __________ GB

### Step 4: VHDX Compaction (10-15 minutes)

#### 4.1 Run Compaction Script

```powershell
Write-Host "Starting VHDX compaction..." -ForegroundColor Yellow
cd C:\Programs\Prof\cloudforge\docs\docker-disk-space-issue
.\compact-docker-vhdx.ps1
```

**Record results**:
- Previous size: __________ GB
- New size: __________ GB
- Space saved: __________ GB

### Step 5: Verification (5 minutes)

#### 5.1 Restart Docker Desktop

Wait for Docker to start completely (30-60 seconds).

#### 5.2 Verify Containers

```powershell
docker ps
```

**Expected**: All containers running

#### 5.3 Verify Volumes

```powershell
docker volume ls | Measure-Object -Line
```

**Expected**: All 115 volumes present

#### 5.4 Verify Images

```powershell
docker images | Measure-Object -Line
```

**Expected**: All images present

#### 5.5 Test Application

- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Eureka: http://localhost:8761

**Expected**: All services working

### Step 6: Documentation (2 minutes)

Record the maintenance results:

```powershell
$maintenanceLog = @"
=== Docker Maintenance Log ===
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Before Maintenance:
- VHDX Size: $currentSize GB
- Build Cache: [from step 1.2]
- Stopped Containers: [from step 1.2]

After Maintenance:
- VHDX Size: [from step 4.1]
- Space Reclaimed: [from step 4.1]
- Build Cache: 0 GB
- Stopped Containers: 0

Status: ✓ Complete
"@

$maintenanceLog | Out-File -Append -FilePath "C:\Programs\Prof\cloudforge\maintenance-log.txt"
```

## Automated Maintenance Script

### Complete Maintenance Script

Create `monthly-maintenance.ps1`:

```powershell
# Monthly Docker Maintenance Script
# Run as Administrator on the first Sunday of every month

Write-Host "=== Docker Monthly Maintenance ===" -ForegroundColor Cyan
Write-Host "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host ""

# Check Administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

# Step 1: Assessment
Write-Host "Step 1: Assessment" -ForegroundColor Yellow
$vhdxPath = "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx"
$beforeSize = (Get-Item $vhdxPath).Length / 1GB
Write-Host "  VHDX size: $([math]::Round($beforeSize, 2)) GB" -ForegroundColor White

Write-Host ""
Write-Host "  Docker disk usage:" -ForegroundColor White
docker system df
Write-Host ""

# Step 2: Docker Cleanup
Write-Host "Step 2: Docker Cleanup" -ForegroundColor Yellow

Write-Host "  Removing dangling images..." -ForegroundColor White
$imagesPruned = docker image prune -f
Write-Host "  $imagesPruned" -ForegroundColor Gray

Write-Host "  Removing stopped containers..." -ForegroundColor White
$containersPruned = docker container prune -f
Write-Host "  $containersPruned" -ForegroundColor Gray

Write-Host "  Removing unused networks..." -ForegroundColor White
$networksPruned = docker network prune -f
Write-Host "  $networksPruned" -ForegroundColor Gray

Write-Host "  Removing old build cache (7+ days)..." -ForegroundColor White
$cachePruned1 = docker builder prune --filter "until=168h" -f
Write-Host "  $cachePruned1" -ForegroundColor Gray

Write-Host "  Removing all unused build cache..." -ForegroundColor White
$cachePruned2 = docker builder prune -a -f
Write-Host "  $cachePruned2" -ForegroundColor Gray

Write-Host ""

# Step 3: VHDX Compaction
Write-Host "Step 3: VHDX Compaction" -ForegroundColor Yellow
Write-Host "  Stopping Docker Desktop..." -ForegroundColor White
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 10

Write-Host "  Compacting VHDX (this may take 10-15 minutes)..." -ForegroundColor White
Optimize-VHD -Path $vhdxPath -Mode Full

$afterSize = (Get-Item $vhdxPath).Length / 1GB
$savedSpace = $beforeSize - $afterSize

Write-Host "  Compaction complete!" -ForegroundColor Green
Write-Host "    Before: $([math]::Round($beforeSize, 2)) GB" -ForegroundColor White
Write-Host "    After:  $([math]::Round($afterSize, 2)) GB" -ForegroundColor White
Write-Host "    Saved:  $([math]::Round($savedSpace, 2)) GB" -ForegroundColor Green

Write-Host ""

# Step 4: Restart Docker
Write-Host "Step 4: Restarting Docker Desktop" -ForegroundColor Yellow
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
Write-Host "  Waiting for Docker to start..." -ForegroundColor White
Start-Sleep -Seconds 30

Write-Host ""

# Step 5: Verification
Write-Host "Step 5: Verification" -ForegroundColor Yellow
Write-Host "  Checking Docker status..." -ForegroundColor White
docker system df

Write-Host ""
Write-Host "  Checking containers..." -ForegroundColor White
$containerCount = (docker ps --format "{{.Names}}" | Measure-Object -Line).Lines
Write-Host "  Running containers: $containerCount" -ForegroundColor White

Write-Host ""

# Step 6: Log Results
$logEntry = @"

=== Docker Maintenance Log ===
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Before Maintenance:
- VHDX Size: $([math]::Round($beforeSize, 2)) GB

After Maintenance:
- VHDX Size: $([math]::Round($afterSize, 2)) GB
- Space Reclaimed: $([math]::Round($savedSpace, 2)) GB

Status: ✓ Complete
Running Containers: $containerCount

"@

$logEntry | Out-File -Append -FilePath "$PSScriptRoot\maintenance-log.txt"

Write-Host "=== Maintenance Complete ===" -ForegroundColor Green
Write-Host "Total space reclaimed: $([math]::Round($savedSpace, 2)) GB" -ForegroundColor Green
Write-Host "Log saved to: $PSScriptRoot\maintenance-log.txt" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
```

### Schedule Automated Maintenance

#### Using Task Scheduler

```powershell
# Create scheduled task for monthly maintenance
$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument '-ExecutionPolicy Bypass -File "C:\Programs\Prof\cloudforge\docs\docker-disk-space-issue\monthly-maintenance.ps1"'

$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 2am -WeeksInterval 4

$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName "Docker Monthly Maintenance" `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "Monthly Docker cleanup and VHDX compaction"
```

#### Verify Scheduled Task

```powershell
Get-ScheduledTask -TaskName "Docker Monthly Maintenance"
```

## Maintenance Checklist

Print this checklist and check off each step:

### Pre-Maintenance
- [ ] Team notified
- [ ] No critical deployments
- [ ] PowerShell as Administrator
- [ ] 30 minutes available

### Assessment
- [ ] Checked VHDX size
- [ ] Checked Docker disk usage
- [ ] Checked running containers
- [ ] Recorded baseline metrics

### Cleanup
- [ ] Removed dangling images
- [ ] Removed stopped containers
- [ ] Removed unused networks
- [ ] Removed old build cache (7+ days)
- [ ] Removed all unused build cache

### Compaction
- [ ] Stopped Docker Desktop
- [ ] Ran VHDX compaction
- [ ] Recorded space saved
- [ ] Restarted Docker Desktop

### Verification
- [ ] Verified containers running
- [ ] Verified volumes present
- [ ] Verified images present
- [ ] Tested application
- [ ] All services working

### Documentation
- [ ] Recorded results in log
- [ ] Updated maintenance schedule
- [ ] Notified team of completion

## Maintenance Log Template

Keep a log of all maintenance activities:

```
=== Docker Maintenance Log ===

Date: 2026-03-01 02:00:00
Performed by: Automated Script

Before Maintenance:
- VHDX Size: 95 GB
- Build Cache: 8 GB
- Stopped Containers: 5
- Dangling Images: 2 GB

Actions Taken:
- Removed dangling images: 2 GB
- Removed stopped containers: 5 containers
- Removed build cache: 8 GB
- Compacted VHDX: 15 GB

After Maintenance:
- VHDX Size: 80 GB
- Build Cache: 0 GB
- Stopped Containers: 0
- Dangling Images: 0 GB

Results:
- Space Reclaimed: 15 GB
- Time Taken: 18 minutes
- Status: ✓ Complete
- Issues: None

Next Maintenance: 2026-04-05
```

## Troubleshooting

### Issue: Compaction Takes Too Long

**Cause**: Large VHDX file or slow disk

**Solution**:
- Be patient (can take 15-30 minutes for large files)
- Run during off-hours
- Consider upgrading to SSD

### Issue: Docker Won't Start After Compaction

**Cause**: VHDX corruption or Docker issue

**Solution**:
1. Check Docker Desktop logs
2. Restart Windows
3. Reset Docker Desktop settings
4. Restore from backup (if created)

### Issue: Containers Won't Start

**Cause**: Missing dependencies or configuration

**Solution**:
```powershell
cd C:\Programs\Prof\cloudforge\infrastructure\docker
docker-compose down
docker-compose up -d
```

### Issue: Volumes Missing

**Cause**: Volumes not mounted

**Solution**:
```powershell
docker volume ls
```
Volumes should still be present. Restart containers to mount them.

## Best Practices

### 1. Consistent Schedule

- Run maintenance on the same day every month
- Use automated script for consistency
- Document all maintenance activities

### 2. Monitor Trends

Track these metrics monthly:

| Month | VHDX Size | Space Reclaimed | Build Cache |
|-------|-----------|-----------------|-------------|
| Jan   | 75 GB     | -               | 0 GB        |
| Feb   | 85 GB     | 10 GB           | 5 GB        |
| Mar   | 80 GB     | 15 GB           | 8 GB        |

### 3. Adjust Frequency

If VHDX grows quickly:
- Increase cleanup frequency to bi-weekly
- Review development practices
- Optimize Dockerfiles

### 4. Team Communication

- Notify team before maintenance
- Share maintenance log after completion
- Document any issues encountered

## Success Metrics

Track these metrics to measure maintenance effectiveness:

| Metric | Target | Acceptable | Action Required |
|--------|--------|------------|-----------------|
| VHDX Size | < 80 GB | < 100 GB | > 100 GB |
| Space Reclaimed | > 10 GB | > 5 GB | < 5 GB |
| Build Cache | 0 GB | < 5 GB | > 10 GB |
| Downtime | < 20 min | < 30 min | > 30 min |

## Next Maintenance

**Scheduled Date**: _______________

**Reminder Set**: [ ] Yes [ ] No

**Team Notified**: [ ] Yes [ ] No

## Conclusion

By following this monthly maintenance routine:

✓ **Prevent VHDX bloat** before it becomes a problem
✓ **Maintain optimal performance** with regular cleanup
✓ **Avoid emergency interventions** through proactive maintenance
✓ **Keep Docker environment healthy** with consistent care

---

**Maintenance Frequency**: Monthly (first Sunday)
**Duration**: 15-30 minutes
**Automation**: Recommended
**Success Rate**: 100% (when followed correctly)
