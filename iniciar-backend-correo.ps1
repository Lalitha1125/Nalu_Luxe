# ==========================================
# NALU LUXE - INICIO CON CORREO REAL
# ==========================================

$ErrorActionPreference = "Stop"

$raiz = $PSScriptRoot
$backend = Join-Path $raiz "backend"
$archivoEnv = Join-Path $raiz ".env"

if (-not (Test-Path $backend)) {
    throw "No existe la carpeta backend."
}

if (-not (Test-Path $archivoEnv)) {
    throw "No existe el archivo .env."
}

# ==========================================
# 1. CONEXION MYSQL
# ==========================================

$linea = Get-Content $archivoEnv |
    Where-Object { $_ -match '^MYSQL_PASSWORD=' } |
    Select-Object -First 1

if (-not $linea) {
    throw "No se encontro MYSQL_PASSWORD."
}

$env:DB_USER = "nalu_app"

$env:DB_PASSWORD = $linea.Substring(
    "MYSQL_PASSWORD=".Length
).Trim().Trim('"')

# ==========================================
# 2. DATOS DEL CORREO
# ==========================================

Write-Host ""
Write-Host "NALU LUXE - ENVIO REAL DE CODIGOS OTP"
Write-Host ""

$correo = (
    Read-Host "Correo Gmail remitente"
).Trim().ToLowerInvariant()

if ($correo -notmatch '^[^@\s]+@[^@\s]+\.[^@\s]+$') {
    throw "El correo ingresado no es valido."
}

Write-Host ""
Write-Host "Introduce tu contrasena DE APLICACION de Google."
Write-Host "No debes utilizar tu contrasena normal de Gmail."
Write-Host ""

$segura = Read-Host `
    "Contrasena de aplicacion" `
    -AsSecureString

$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR(
    $segura
)

try {
    $clave = [Runtime.InteropServices.Marshal]::PtrToStringBSTR(
        $ptr
    )
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR(
        $ptr
    )
}

$clave = $clave.Replace(" ", "")

if ($clave.Length -ne 16) {
    throw "La contrasena de aplicacion debe tener 16 caracteres."
}

# ==========================================
# 3. CONFIGURACION SMTP
# ==========================================

$env:SPRING_MAIL_PASSWORD = $clave

$configuracion = @{
    "nalu" = @{
        "mail" = @{
            "enabled" = $true
            "dev-console" = $false
            "from" = $correo
        }
    }
    "spring" = @{
        "mail" = @{
            "host" = "smtp.gmail.com"
            "port" = 587
            "username" = $correo
            "properties" = @{
                "mail.smtp.auth" = "true"
                "mail.smtp.starttls.enable" = "true"
                "mail.smtp.starttls.required" = "true"
                "mail.smtp.connectiontimeout" = "10000"
                "mail.smtp.timeout" = "10000"
                "mail.smtp.writetimeout" = "10000"
            }
        }
    }
}

$env:SPRING_APPLICATION_JSON = (
    $configuracion | ConvertTo-Json -Depth 10 -Compress
)

$env:MAIL_ENABLED = "true"
$env:MAIL_DEV_CONSOLE = "false"

$clave = $null

# ==========================================
# 4. INICIAR SPRING BOOT
# ==========================================

Write-Host ""
Write-Host "========================================="
Write-Host "NALU LUXE - CORREO CONFIGURADO"
Write-Host "========================================="
Write-Host "SMTP: smtp.gmail.com"
Write-Host "Puerto: 587"
Write-Host "Remitente: $correo"
Write-Host "OTP en consola: DESACTIVADO"
Write-Host "OTP por correo: ACTIVADO"
Write-Host ""

Push-Location $backend

try {
    & .\mvnw.cmd spring-boot:run
}
finally {
    Pop-Location

    Remove-Item Env:SPRING_MAIL_PASSWORD `
        -ErrorAction SilentlyContinue

    Remove-Item Env:SPRING_APPLICATION_JSON `
        -ErrorAction SilentlyContinue

    Remove-Item Env:MAIL_ENABLED `
        -ErrorAction SilentlyContinue

    Remove-Item Env:MAIL_DEV_CONSOLE `
        -ErrorAction SilentlyContinue
}