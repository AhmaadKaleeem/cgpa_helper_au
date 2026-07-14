$ErrorActionPreference = "Stop"

# ANSI TrueColor Definitions
$e = [char]27
$cBrand   = "$e[38;2;37;99;235m"   # Blue-600
$cAccent  = "$e[38;2;96;165;250m"  # Blue-400
$cSuccess = "$e[38;2;16;185;129m"  # Emerald-500
$cWarn    = "$e[38;2;245;158;11m"  # Amber-500
$cFail    = "$e[38;2;239;68;68m"   # Red-500
$cText    = "$e[38;2;241;245;249m" # Slate-100
$cMuted   = "$e[38;2;148;163;184m" # Slate-400
$cReset   = "$e[0m"

function Write-Header {
    Clear-Host
    Write-Host ""
    Write-Host "   $cBrand  ____               _      ____  _ _       _   $cReset"
    Write-Host "   $cBrand / ___| _ __ __ _ __| | ___|  _ \(_) | ___ | |_ $cReset"
    Write-Host "   $cBrand| |  _ | '__/ _` / _` |/ _ \ |_) | | |/ _ \| __|$cReset"
    Write-Host "   $cAccent| |_| | | | (_| | (_| |  __/  __/| | | (_) | |_ $cReset"
    Write-Host "   $cAccent \____|_|  \__,_|\__,_|\___|_|   |_|_|\___/ \__|$cReset"
    Write-Host ""
    Write-Host "  $cMuted        A modern extension for Air University$cReset"
    Write-Host "  $cText              Crafted by Ahmad Kaleem$cReset"
    Write-Host ""
    Write-Host " $cMuted---------------------------------------------------$cReset"
    Write-Host " $cText        WINGET INSTALLATION ASSISTANT$cReset"
    Write-Host " $cMuted---------------------------------------------------$cReset"
    Write-Host ""
}

function Write-Info ([string]$Text) {
    Write-Host " $cMuted[$cReset$cAccentINFO$cMuted]$cReset $cText$Text$cReset"
}

function Write-Success ([string]$Text) {
    Write-Host " $cMuted[$cReset$cSuccess OK $cMuted]$cReset $cSuccess$Text$cReset"
}

function Write-ErrorMsg ([string]$Text) {
    Write-Host " $cMuted[$cReset$cFailFAIL$cMuted]$cReset $cFail$Text$cReset"
}

Write-Header

Write-Info "Checking for Windows Package Manager (winget)..."
$wingetCheck = Get-Command "winget" -ErrorAction SilentlyContinue

if (-not $wingetCheck) {
    Write-ErrorMsg "Winget is not installed on this system."
    Write-Host ""
    Write-Host " Please install the 'App Installer' from the Microsoft Store." -ForegroundColor Yellow
    Write-Host " Or run this command via PowerShell as Administrator:" -ForegroundColor Yellow
    Write-Host " Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe" -ForegroundColor Gray
    Exit
}

Write-Success "Winget located."

Write-Info "Initiating GradePilot installation via Winget..."

# Assuming GradePilot is registered or using local manifest
Write-Host ""
Write-Host " Running: " -NoNewline -ForegroundColor DarkGray
Write-Host "winget install AirUniversity.GradePilot" -ForegroundColor Cyan
Write-Host ""

try {
    # If the user has it in winget repository
    winget install AirUniversity.GradePilot
} catch {
    Write-ErrorMsg "Installation failed or was aborted."
    Exit
}

Write-Host ""
Write-Host " $cMuted---------------------------------------------------$cReset"
Write-Host " $cSuccess   * INSTALLATION COMPLETE * $cReset"
Write-Host " $cText   GradePilot has been successfully installed.$cReset"
Write-Host " $cMuted---------------------------------------------------$cReset"
Write-Host ""
