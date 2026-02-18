# VHDX Compaction Instructions

## Quick Start

I've cleaned up 26.2 GB of unused Docker data. Now you need to compact the VHDX file to actually reclaim the disk space.

## Step-by-Step Instructions

### Step 1: Run the Compaction Script

1. **Right-click on PowerShell** in the Start menu
2. Select **"Run as Administrator"**
3. Navigate to your project directory:
   ```powershell
   cd C:\Programs\Prof\cloudforge
   ```
4. Run the compaction script:
   ```powershell
   .\compact-docker-vhdx.ps1
   ```

### Step 2: Follow the Script Prompts

The script will:
- Check if Docker Desktop is running
- Offer to stop Docker Desktop for you (choose option 1)
- Compact the VHDX file (this takes 5-15 minutes)
- Show you how much space was reclaimed

### Step 3: Restart Docker Desktop

After compaction completes:
1. Open Docker Desktop from the Start menu
2. Wait for it to start (30-60 seconds)
3. Verify your containers are running:
   ```powershell
   docker ps
   ```

## Expected Results

### Before Cleanup
- VHDX size: **175 GB**
- Docker data: ~47 GB (images + volumes + build cache)
- Wasted space: ~128 GB

### After Cleanup (Current)
- Docker data: ~26 GB (images + volumes only)
- Build cache removed: 26.2 GB
- VHDX size: Still 175 GB (needs compaction)

### After Compaction (Expected)
- VHDX size: **60-80 GB**
- Space reclaimed: **95-115 GB**
- Docker data: ~26 GB (same as before)

## What's Protected

✓ All your Docker images (CloudForge services, base images)
✓ All your volumes (postgres_data, mongodb_data, redis_data, etc.)
✓ All your running containers
✓ All your database data (users, products, orders, etc.)

## Troubleshooting

### "Script cannot be loaded because running scripts is disabled"

Run this command in PowerShell (as Administrator):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run the compaction script again.

### "Docker Desktop is still running"

Manually stop Docker Desktop:
1. Right-click Docker Desktop icon in system tray
2. Select "Quit Docker Desktop"
3. Wait 30 seconds
4. Run the script again

### "Access denied" or "File in use"

Make sure:
1. Docker Desktop is completely stopped
2. No WSL processes are running: `wsl --shutdown`
3. Run PowerShell as Administrator

### Compaction is taking too long

This is normal. Compaction can take 5-30 minutes depending on:
- VHDX size (175 GB in your case)
- Disk speed (SSD vs HDD)
- System load

Be patient and let it complete.

## Verification

After compaction, verify everything works:

```powershell
# Check VHDX size
Get-Item "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx" | Select-Object Length

# Check Docker is running
docker ps

# Check volumes exist
docker volume ls

# Check disk usage
docker system df
```

Expected output:
- VHDX: 60-80 GB (down from 175 GB)
- 17 containers running
- 115 volumes present
- Images: ~20 GB

## Alternative: Manual Compaction

If the script doesn't work, you can compact manually:

1. **Stop Docker Desktop completely**
   - Right-click system tray icon → Quit Docker Desktop
   - Wait 30 seconds

2. **Open PowerShell as Administrator**

3. **Run this command**:
   ```powershell
   Optimize-VHD -Path "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx" -Mode Full
   ```

4. **Wait for completion** (5-30 minutes)

5. **Restart Docker Desktop**

## Safety Notes

- ✓ This is a safe, standard Docker maintenance procedure
- ✓ No data will be lost
- ✓ Your containers will work normally after restart
- ✓ If anything goes wrong, just restart Docker Desktop
- ✓ The VHDX file is backed by WSL2, which is very stable

## After Compaction

Once compaction is complete:

1. **Verify space reclaimed**:
   ```powershell
   Get-Item "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx" | Select-Object Length
   ```

2. **Start your containers**:
   ```powershell
   cd C:\Programs\Prof\cloudforge\infrastructure\docker
   docker-compose up -d
   ```

3. **Verify everything works**:
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8080
   - All services should be healthy

## Prevention

To avoid this in the future:

1. **Monthly compaction**: Run the script once a month
2. **Avoid `--no-cache`**: Only use when absolutely necessary
3. **Enable auto-cleanup**: Docker Desktop → Settings → Resources
4. **Monitor disk usage**: Run `docker system df` weekly

## Questions?

If you have any issues or questions:
1. Check `DOCKER_CLEANUP_SUMMARY.md` for details
2. Check `DOCKER_DISK_SPACE_ANALYSIS.md` for technical explanation
3. Check Docker Desktop logs: Settings → Troubleshoot → View logs

## Ready to Compact?

Run this command now:
```powershell
.\compact-docker-vhdx.ps1
```

The script will guide you through the process!
