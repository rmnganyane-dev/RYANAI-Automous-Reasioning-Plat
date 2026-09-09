$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Push-Location $root
$env:Path += ";$env:USERPROFILE\.cargo\bin"

try {
    Write-Host "=== 1. Preparing build dependencies ===" -ForegroundColor Cyan
    npm ci --no-fund --no-audit
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed with exit code $LASTEXITCODE" }
    cargo fetch --manifest-path src-tauri/Cargo.toml
    if ($LASTEXITCODE -ne 0) { throw "cargo fetch failed with exit code $LASTEXITCODE" }

    Write-Host "=== 2. Validating frontend ===" -ForegroundColor Cyan
    npm run typecheck
    if ($LASTEXITCODE -ne 0) { throw "TypeScript validation failed with exit code $LASTEXITCODE" }
    npm run lint
    if ($LASTEXITCODE -ne 0) { throw "ESLint failed with exit code $LASTEXITCODE" }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed with exit code $LASTEXITCODE" }

    Write-Host "=== 3. Building Tauri installers ===" -ForegroundColor Cyan
    npm run tauri build
    if ($LASTEXITCODE -ne 0) { throw "Tauri installer build failed with exit code $LASTEXITCODE" }

    Write-Host "=== Build complete ===" -ForegroundColor Green
    Write-Host "Installers: $root\src-tauri\target\release\bundle\" -ForegroundColor Yellow
}
finally {
    Pop-Location
}
