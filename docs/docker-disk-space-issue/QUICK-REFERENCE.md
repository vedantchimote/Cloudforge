# Docker Disk Space - Quick Reference Card

## Emergency: VHDX Too Large

```powershell
# 1. Run compaction script (as Administrator)
cd docs/docker-disk-space-issue
.\compact-docker-vhdx.ps1

# 2. If that doesn't help, cleanup first
docker system prune -a -f
.\compact-docker-vhdx.ps1
```

## Daily Commands

```powershell
# Check disk usage
docker system df

# Check VHDX size
Get-Item "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx" | Select-Object Length
```

## Weekly Cleanup

```powershell
# Remove dangling images
docker image prune -f

# Remove stopped containers
docker container prune -f

# Remove old build cache (7+ days)
docker builder prune --filter "until=168h" -f
```

## Monthly Maintenance

```powershell
# Full cleanup
docker builder prune -a -f

# Compact VHDX
cd docs/docker-disk-space-issue
.\compact-docker-vhdx.ps1
```

## Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| VHDX Size | 80 GB | 100 GB |
| Build Cache | 5 GB | 10 GB |
| Stopped Containers | 10 | 20 |

## Best Practices

✓ **Avoid `--no-cache`** unless necessary
✓ **Use `.dockerignore`** to exclude unnecessary files
✓ **Optimize Dockerfiles** for layer caching
✓ **Monitor weekly** with `docker system df`
✓ **Cleanup monthly** with compaction script

## Common Issues

### Issue: VHDX growing fast
**Solution**: Check for `--no-cache` builds, run weekly cleanup

### Issue: Build cache > 10 GB
**Solution**: `docker builder prune -a -f`

### Issue: Docker slow
**Solution**: Run compaction script to defragment VHDX

## Documentation

- **Overview**: [README.md](README.md)
- **Problem**: [01-PROBLEM-ANALYSIS.md](01-PROBLEM-ANALYSIS.md)
- **Solution**: [03-SOLUTION-OVERVIEW.md](03-SOLUTION-OVERVIEW.md)
- **Prevention**: [07-PREVENTION-GUIDE.md](07-PREVENTION-GUIDE.md)
- **Maintenance**: [08-MONTHLY-MAINTENANCE.md](08-MONTHLY-MAINTENANCE.md)
- **Commands**: [docker-cleanup-commands.md](docker-cleanup-commands.md)

## Quick Checks

```powershell
# Is VHDX too large?
$vhdxSize = (Get-Item "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx").Length / 1GB
if ($vhdxSize -gt 100) { Write-Host "⚠ VHDX too large: $([math]::Round($vhdxSize, 2)) GB" -ForegroundColor Red }

# Is build cache too large?
docker system df --format "{{.BuildCache}}"

# How many stopped containers?
docker ps -a --filter "status=exited" | Measure-Object -Line
```

## Contact

For issues or questions, refer to the comprehensive documentation in this folder.

---

**Last Updated**: February 17, 2026
**Version**: 1.0
