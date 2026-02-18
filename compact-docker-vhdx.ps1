# Docker VHDX Compaction Script
# This script safely compacts the Docker Desktop VHDX file to reclaim disk space

Write-Host "Docker VHDX Compaction Script" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Define VHDX path
$vhdxPath = "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx"

Write-Host "Checking VHDX file..." -ForegroundColor Yellow

# Check if VHDX exists
if (-not (Test-Path $vhdxPath)) {
    Write-Host "ERROR: VHDX file not found at: $vhdxPath" -ForegroundColor Red
    Write-Host "Please verify Docker Desktop is installed and the path is correct." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Get current size
$currentSize = (Get-Item $vhdxPath).Length / 1GB
Write-Host "Current VHDX size: $([math]::Round($currentSize, 2)) GB" -ForegroundColor White

# Check if Docker is running
Write-Host ""
Write-Host "Checking if Docker Desktop is running..." -ForegroundColor Yellow
$dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue

if ($dockerProcess) {
    Write-Host "Docker Desktop is currently running." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "IMPORTANT: Docker Desktop must be stopped before compacting the VHDX." -ForegroundColor Red
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "  1. Stop Docker Desktop automatically (recommended)" -ForegroundColor White
    Write-Host "  2. I'll stop it manually and run this script again" -ForegroundColor White
    Write-Host "  3. Cancel" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1, 2, or 3)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "Stopping Docker Desktop..." -ForegroundColor Yellow
            
            # Stop Docker Desktop gracefully
            Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
            
            # Wait for Docker to fully stop
            Write-Host "Waiting for Docker to stop completely..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
            
            # Verify it's stopped
            $dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
            if ($dockerProcess) {
                Write-Host "ERROR: Docker Desktop is still running. Please stop it manually." -ForegroundColor Red
                Write-Host ""
                Write-Host "Press any key to exit..."
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
                exit 1
            }
            
            Write-Host "Docker Desktop stopped successfully." -ForegroundColor Green
        }
        "2" {
            Write-Host ""
            Write-Host "Please stop Docker Desktop manually and run this script again." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Press any key to exit..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            exit 0
        }
        default {
            Write-Host ""
            Write-Host "Operation cancelled." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Press any key to exit..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            exit 0
        }
    }
}

Write-Host ""
Write-Host "Starting VHDX compaction..." -ForegroundColor Yellow
Write-Host "This may take several minutes depending on the VHDX size." -ForegroundColor White
Write-Host ""

try {
    # Compact the VHDX
    Optimize-VHD -Path $vhdxPath -Mode Full
    
    Write-Host ""
    Write-Host "VHDX compaction completed successfully!" -ForegroundColor Green
    
    # Get new size
    $newSize = (Get-Item $vhdxPath).Length / 1GB
    $savedSpace = $currentSize - $newSize
    
    Write-Host ""
    Write-Host "Results:" -ForegroundColor Cyan
    Write-Host "  Previous size: $([math]::Round($currentSize, 2)) GB" -ForegroundColor White
    Write-Host "  New size:      $([math]::Round($newSize, 2)) GB" -ForegroundColor White
    Write-Host "  Space saved:   $([math]::Round($savedSpace, 2)) GB" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "You can now restart Docker Desktop." -ForegroundColor Yellow
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to compact VHDX" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
