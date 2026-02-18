# Docker VHDX Disk Space Issue - Complete Documentation

## Overview

This folder contains comprehensive documentation about the Docker VHDX disk space issue that occurred on February 17, 2026, where the `docker_data.vhdx` file grew from 60 GB to 175 GB, and how we successfully resolved it by reclaiming 100.18 GB of disk space.

## Quick Summary

- **Issue**: Docker VHDX file grew from 60 GB to 175 GB (+115 GB)
- **Root Cause**: Repeated `--no-cache` Docker builds creating duplicate layers
- **Solution**: Docker cleanup + VHDX compaction
- **Result**: Reduced VHDX from 175 GB to 75 GB (100.18 GB reclaimed)
- **Time to Resolve**: ~15 minutes
- **Data Loss**: 0% (all volumes, images, and containers preserved)

## Documents in This Folder

### 1. Quick Start
- **`QUICK-REFERENCE.md`** - Quick reference card for common tasks and commands

### 2. Problem Analysis
- **`01-PROBLEM-ANALYSIS.md`** - Detailed analysis of what caused the disk space bloat
- **`02-ROOT-CAUSE.md`** - Technical explanation of why VHDX files grow but don't shrink

### 3. Solution Documentation
- **`03-SOLUTION-OVERVIEW.md`** - High-level overview of the solution approach
- **`04-CLEANUP-PROCESS.md`** - Step-by-step cleanup process executed
- **`05-COMPACTION-PROCESS.md`** - VHDX compaction procedure and results

### 4. Scripts and Tools
- **`compact-docker-vhdx.ps1`** - PowerShell script for automated VHDX compaction
- **`docker-cleanup-commands.md`** - Manual cleanup commands reference

### 5. Results and Prevention
- **`06-RESULTS.md`** - Final results and verification steps
- **`07-PREVENTION-GUIDE.md`** - Best practices to prevent future occurrences
- **`08-MONTHLY-MAINTENANCE.md`** - Recommended monthly maintenance routine

## Quick Start

If you're experiencing a similar issue:

1. **Read**: `01-PROBLEM-ANALYSIS.md` to understand the issue
2. **Execute**: Run `compact-docker-vhdx.ps1` (requires Administrator)
3. **Verify**: Follow steps in `06-RESULTS.md`
4. **Prevent**: Implement practices from `07-PREVENTION-GUIDE.md`

## Issue Timeline

| Date | Event | VHDX Size |
|------|-------|-----------|
| Feb 10, 2026 | Initial state | 60 GB |
| Feb 10-16, 2026 | Multiple `--no-cache` builds | Growing |
| Feb 17, 2026 | Issue discovered | 175 GB |
| Feb 17, 2026 | Docker cleanup executed | 175 GB |
| Feb 17, 2026 | VHDX compaction completed | 75 GB |

## Key Metrics

### Before Cleanup
- VHDX Size: 175.14 GB
- Docker Images: 20.08 GB
- Build Cache: 25.66 GB
- Volumes: 6.29 GB
- Wasted Space: ~143 GB

### After Cleanup & Compaction
- VHDX Size: 74.96 GB
- Docker Images: 20.08 GB (preserved)
- Build Cache: 0 GB (cleaned)
- Volumes: 6.29 GB (preserved)
- Space Reclaimed: 100.18 GB

## What Was Protected

✓ All Docker images (82 images)
✓ All volumes (115 volumes)
✓ All database data (postgres, mongodb, redis, kafka, ldap)
✓ All running containers (17 containers)
✓ All configurations

## Technical Details

### Root Causes
1. Repeated `--no-cache` builds (8 services × 3-5 rebuilds each)
2. Multi-stage builds leaving large artifacts (Node.js ~1.2GB, Maven ~500-800MB)
3. VHDX sparse file behavior (grows automatically, never shrinks)
4. Build cache accumulation (25.66 GB of unused cache)

### Solution Components
1. **Docker Cleanup**: Removed 26.2 GB of unused data
   - Dangling images: 180.2 MB
   - Stopped containers: 501.8 MB
   - Build cache: 25.7 GB

2. **VHDX Compaction**: Reclaimed 100.18 GB
   - Used `Optimize-VHD` PowerShell cmdlet
   - Full compaction mode
   - Duration: ~10 minutes

## Files Reference

```
docs/docker-disk-space-issue/
├── README.md (this file)
├── 01-PROBLEM-ANALYSIS.md
├── 02-ROOT-CAUSE.md
├── 03-SOLUTION-OVERVIEW.md
├── 04-CLEANUP-PROCESS.md
├── 05-COMPACTION-PROCESS.md
├── 06-RESULTS.md
├── 07-PREVENTION-GUIDE.md
├── 08-MONTHLY-MAINTENANCE.md
├── compact-docker-vhdx.ps1
└── docker-cleanup-commands.md
```

## Usage Instructions

### For Immediate Issue Resolution

```powershell
# 1. Navigate to this folder
cd docs/docker-disk-space-issue

# 2. Run the compaction script (as Administrator)
.\compact-docker-vhdx.ps1

# 3. Restart Docker Desktop
# 4. Verify everything works
```

### For Understanding the Issue

Read the documents in order:
1. Problem Analysis (what happened)
2. Root Cause (why it happened)
3. Solution Overview (how we fixed it)
4. Results (what we achieved)
5. Prevention Guide (how to avoid it)

## Prevention Summary

To avoid this issue in the future:

1. **Avoid `--no-cache`** unless absolutely necessary
2. **Monthly cleanup**: Remove old build cache
3. **Monthly compaction**: Compact VHDX file
4. **Monitor disk usage**: Check `docker system df` weekly
5. **Enable auto-cleanup**: In Docker Desktop settings

## Support

If you encounter issues:

1. Check the troubleshooting section in `06-RESULTS.md`
2. Review Docker Desktop logs: Settings → Troubleshoot → View logs
3. Verify volumes exist: `docker volume ls`
4. Verify images exist: `docker images`

## Success Criteria

✓ VHDX size reduced by 57% (175 GB → 75 GB)
✓ 100.18 GB disk space reclaimed
✓ All data preserved (0% loss)
✓ All services working normally
✓ Cleanup completed in < 15 minutes

## Lessons Learned

1. **`--no-cache` is expensive**: Each rebuild creates entirely new layers
2. **VHDX doesn't auto-shrink**: Manual compaction is required
3. **Build cache accumulates quickly**: Multi-stage builds leave large artifacts
4. **Regular maintenance is essential**: Monthly cleanup prevents bloat
5. **Monitoring is important**: Check disk usage weekly

## Related Documentation

- Docker Desktop Documentation: https://docs.docker.com/desktop/
- Hyper-V VHDX Management: https://docs.microsoft.com/en-us/powershell/module/hyper-v/optimize-vhd
- Docker Build Cache: https://docs.docker.com/build/cache/

## Version History

- **v1.0** (Feb 17, 2026): Initial documentation after successful resolution
- Issue resolved: 100.18 GB reclaimed
- All data preserved: 100% success rate

---

**Last Updated**: February 17, 2026
**Status**: ✓ Resolved
**Space Reclaimed**: 100.18 GB
**Data Loss**: 0%
