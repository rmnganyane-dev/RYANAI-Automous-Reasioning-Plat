$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Push-Location $root
$env:Path += ";$env:USERPROFILE\.cargo\bin"

try {
    Write-Host "=== 1. Preparing build dependencies ===" -ForegroundColor Cyan
    pnpm install --frozen-lockfile
    if ($LASTEXITCODE -ne 0) { throw "pnpm install failed with exit code $LASTEXITCODE" }

    cargo fetch --manifest-path src-tauri/Cargo.toml
    if ($LASTEXITCODE -ne 0) { throw "cargo fetch failed with exit code $LASTEXITCODE" }

    Write-Host "=== 2. Validating & building frontend ===" -ForegroundColor Cyan
    
    # Strict TypeScript check
    pnpm run typecheck
    if ($LASTEXITCODE -ne 0) { throw "TypeScript validation failed with exit code $LASTEXITCODE" }

    # Non-blocking ESLint check
    Write-Host "Running ESLint advisory check..." -ForegroundColor Yellow
    $ErrorActionPreference = "Continue"
    pnpm run lint -- --fix
    $ErrorActionPreference = "Stop"

    # Production web build
    pnpm run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed with exit code $LASTEXITCODE" }

    Write-Host "=== 3. Building Tauri installers ===" -ForegroundColor Cyan
    pnpm run tauri build
    if ($LASTEXITCODE -ne 0) { throw "Tauri installer build failed with exit code $LASTEXITCODE" }

    Write-Host "=== Build complete ===" -ForegroundColor Green
    Write-Host "Installers generated at: $root\src-tauri\target\release\bundle\" -ForegroundColor Yellow
}
finally {
    Pop-Location
}