$ErrorActionPreference = "Stop"
$env:Path += ";$env:USERPROFILE\.cargo\bin"

Write-Host "=== 0. Stopping Running Instances & Forcibly Removing Locks ===" -ForegroundColor Cyan
Get-Process -Name "app", "ryan-gateway-x86_64-pc-windows-msvc" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Aggressive Windows file deletion to break lock handles
$TargetExe = "src-tauri\target\release\app.exe"
if (Test-Path $TargetExe) {
    cmd /c "del /f /q ""$TargetExe"" 2>nul"
    Start-Sleep -Seconds 1
}

Write-Host "=== 1. Building Vite Frontend ===" -ForegroundColor Cyan
npm run build

Write-Host "=== 2. Compiling Tauri Release Binary & Native Bundles ===" -ForegroundColor Cyan
npm run tauri build

Write-Host "=== 3. Ensuring Sidecar Binary Exists ===" -ForegroundColor Cyan
$SidecarSource = "src-tauri\binaries\ryan-gateway-x86_64-pc-windows-msvc.exe"
if (-not (Test-Path $SidecarSource)) {
    Write-Warning "Sidecar binary not found at $SidecarSource. Ensure your Fastify gateway is compiled and placed correctly."
} else {
    Write-Host "Sidecar binary found at $SidecarSource." -ForegroundColor Green
}

Write-Host "=== 4. Build Complete Successfully! ===" -ForegroundColor Green
Write-Host "Installers are located at: src-tauri/target/release/bundle/" -ForegroundColor Yellow
