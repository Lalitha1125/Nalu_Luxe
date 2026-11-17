
# ============================================
# NALU LUXE - VERIFICACION GENERAL
# Java + React
# ============================================

$ErrorActionPreference = "Continue"

$raiz = $PSScriptRoot

$backend = Join-Path $raiz "backend"
$frontend = Join-Path $raiz "frontend"
$reportes = Join-Path $raiz "reportes"

if (-not (Test-Path $backend)) {
    Write-Host "ERROR: No existe backend." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontend)) {
    Write-Host "ERROR: No existe frontend." -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory `
    -Force `
    -Path $reportes | Out-Null

$fecha = Get-Date -Format "yyyyMMdd_HHmmss"

$reporteJava = Join-Path $reportes "java_$fecha.txt"
$reporteReact = Join-Path $reportes "react_$fecha.txt"

Write-Host ""
Write-Host "========================================"
Write-Host "NALU LUXE - VERIFICACION GENERAL"
Write-Host "========================================"
Write-Host ""

# ============================================
# 1. COMPILAR BACKEND
# ============================================

Write-Host "1. Compilando Spring Boot..." `
    -ForegroundColor Cyan

Push-Location $backend

try {
    # CMD maneja la salida de Maven.
    # Las advertencias no detienen PowerShell.
    cmd.exe /d /c 'call mvnw.cmd clean compile > "%TEMP%\nalu_java_build.txt" 2>&1'

    $codigoJava = $LASTEXITCODE

    $archivoTemporalJava = Join-Path `
        $env:TEMP "nalu_java_build.txt"

    if (Test-Path $archivoTemporalJava) {
        Copy-Item $archivoTemporalJava $reporteJava -Force
    }
}
finally {
    Pop-Location
}

if ($codigoJava -eq 0) {
    Write-Host "JAVA: BUILD SUCCESS" `
        -ForegroundColor Green
} else {
    Write-Host "JAVA: BUILD FAILURE" `
        -ForegroundColor Red
}

Write-Host ""

# ============================================
# 2. COMPILAR FRONTEND
# ============================================

Write-Host "2. Compilando React..." `
    -ForegroundColor Cyan

Push-Location $frontend

try {
    cmd.exe /d /c 'call npm.cmd run build > "%TEMP%\nalu_react_build.txt" 2>&1'

    $codigoReact = $LASTEXITCODE

    $archivoTemporalReact = Join-Path `
        $env:TEMP "nalu_react_build.txt"

    if (Test-Path $archivoTemporalReact) {
        Copy-Item $archivoTemporalReact $reporteReact -Force
    }
}
finally {
    Pop-Location
}

if ($codigoReact -eq 0) {
    Write-Host "REACT: BUILD SUCCESS" `
        -ForegroundColor Green
} else {
    Write-Host "REACT: BUILD FAILURE" `
        -ForegroundColor Red
}

# ============================================
# 3. RESULTADOS GENERALES
# ============================================

Write-Host ""
Write-Host "========================================"
Write-Host "RESULTADOS NALU LUXE"
Write-Host "========================================"

Write-Host "Java:  $codigoJava"
Write-Host "React: $codigoReact"
Write-Host ""

if ($codigoJava -ne 0) {
    Write-Host "ERRORES JAVA:" `
        -ForegroundColor Yellow

    if (Test-Path $reporteJava) {
        Get-Content $reporteJava -Tail 80
    }
}

if ($codigoReact -ne 0) {
    Write-Host ""
    Write-Host "ERRORES REACT:" `
        -ForegroundColor Yellow

    if (Test-Path $reporteReact) {
        Get-Content $reporteReact -Tail 80
    }
}

Write-Host ""
Write-Host "========================================"

if ($codigoJava -eq 0 -and $codigoReact -eq 0) {
    Write-Host ""
    Write-Host "NALU LUXE COMPILO CORRECTAMENTE" `
        -ForegroundColor Green
    Write-Host ""
    Write-Host "Siguiente etapa: pruebas de integracion."
} else {
    Write-Host ""
    Write-Host "SE DETECTARON ERRORES POR CORREGIR" `
        -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Reportes disponibles en:"
Write-Host $reportes
Write-Host ""

if ($codigoJava -ne 0 -or $codigoReact -ne 0) {
    exit 1
}

exit 0
