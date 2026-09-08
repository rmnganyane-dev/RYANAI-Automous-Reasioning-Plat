# build-installer.ps1
$ErrorActionPreference = "Stop"

Write-Host "=== 1. Building Vite Frontend ===" -ForegroundColor Cyan
npm run build

Write-Host "=== 2. Compiling Tauri Release Binary ===" -ForegroundColor Cyan
cargo tauri build --no-bundle

Write-Host "=== 3. Ensuring Sidecar Binary Exists ===" -ForegroundColor Cyan
$SidecarSource = "src-tauri\binaries\ryan-gateway-x86_64-pc-windows-msvc.exe"
if (-not (Test-Path $SidecarSource)) {
    Write-Warning "Sidecar binary not found at $SidecarSource. Ensure your Fastify gateway is compiled and placed correctly."
}

Write-Host "=== 4. Compiling Inno Setup Installer ===" -ForegroundColor Cyan
$InnoCompiler = "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe"
if (-not (Test-Path $InnoCompiler)) {
    $InnoCompiler = "$env:ProgramFiles\Inno Setup 6\ISCC.exe"
}

if (Test-Path $InnoCompiler) {
    & $InnoCompiler "installer.iss"
    Write-Host "=== Build & Packaging Complete! ===" -ForegroundColor Green
} else {
    Write-Error "Inno Setup Compiler (ISCC.exe) not found. Please install Inno Setup 6."
}