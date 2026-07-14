$ErrorActionPreference = "Stop"

# ANSI TrueColor (24-bit RGB) Definitions
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
    Write-Host "  $cMuted          For Air University Students$cReset"
    Write-Host "  $cText              Developed by Ahmad Kaleem$cReset"
    Write-Host ""
    Write-Host " $cMuted---------------------------------------------------$cReset"
    Write-Host " $cText        AUTOMATED RELEASE PIPELINE v1.0$cReset"
    Write-Host " $cMuted---------------------------------------------------$cReset"
    Write-Host ""
}

function Write-Step ([string]$Text) {
    Write-Host " $cMuted[$cReset$cAccent...$cMuted]$cReset $cText$Text$cReset"
}

function Write-Success ([string]$Text) {
    Write-Host " $cMuted[$cReset$cSuccess OK$cMuted ]$cReset $cSuccess$Text$cReset"
}

function Write-WarningMsg ([string]$Text) {
    Write-Host " $cMuted[$cReset$cWarnWARN$cMuted]$cReset $cWarn$Text$cReset"
}

Write-Header

# Paths
$baseDir = Get-Location
$extensionDir = Join-Path $baseDir "..\extension"
$assetsDir = Join-Path $baseDir "Assets"
$releaseDir = Join-Path $baseDir "Release"
$zipPath = Join-Path $assetsDir "extension.zip"
$manifestPath = Join-Path $baseDir "installer-manifest.json"
$csprojPath = Join-Path $baseDir "GradePilotInstaller.csproj"
$setupFile = Join-Path $releaseDir "GradePilotSetup.exe"
$sha256File = Join-Path $releaseDir "SHA256.txt"

# 1. Read Manifest
Write-Step "Reading installer-manifest.json..."
if (-not (Test-Path $manifestPath)) { throw "installer-manifest.json not found." }
$manifestJson = Get-Content $manifestPath | ConvertFrom-Json
$installerVersion = $manifestJson.installerVersion
Write-Success "Manifest loaded: v$installerVersion"

# 2. Package Extension
Write-Step "Packaging Chrome extension..."
if (-not (Test-Path $assetsDir)) { New-Item -ItemType Directory -Path $assetsDir | Out-Null }
if (Test-Path $zipPath) { Remove-Item $zipPath }
Compress-Archive -Path "$extensionDir\*" -DestinationPath $zipPath -Force
Write-Success "Extension compressed to Assets/extension.zip"

# 3. Validate manifest.json inside zip
Write-Step "Validating bundled extension integrity..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$hasManifest = $false
foreach ($entry in $zip.Entries) {
    if ($entry.Name -eq "manifest.json") { $hasManifest = $true; break }
}
$zip.Dispose()
if (-not $hasManifest) { throw "manifest.json is missing from extension.zip" }
Write-Success "Archive integrity verified"

# 4. Inject Version into CSPROJ
Write-Step "Injecting version into WPF project..."
$csprojContent = Get-Content $csprojPath
if ($csprojContent -match "<Version>.*</Version>") {
    $csprojContent = $csprojContent -replace "<Version>.*</Version>", "<Version>$installerVersion</Version>"
} else {
    $csprojContent = $csprojContent -replace "</PropertyGroup>", "  <Version>$installerVersion</Version>`n  </PropertyGroup>"
}
Set-Content -Path $csprojPath -Value $csprojContent
Write-Success "Injected v$installerVersion into CSPROJ"

# 5. Build WPF Installer
Write-Step "Publishing WPF Installer (Self-Contained win-x64)..."
$dotnetOutput = dotnet publish -c Release -r win-x64 --self-contained true 2>&1
if ($LASTEXITCODE -ne 0) { throw "Build failed: $dotnetOutput" }
Write-Success "WPF Compilation Successful"

# 6. Run Inno Setup Bootstrapper
Write-Step "Running Inno Setup Bootstrapper..."
if (Test-Path $releaseDir) { Remove-Item -Recurse -Force $releaseDir }
New-Item -ItemType Directory -Path $releaseDir | Out-Null

$isccPath = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if (-not (Test-Path $isccPath)) {
    Write-WarningMsg "Inno Setup 6 not found. Skipping GradePilotSetup.exe generation."
} else {
    $isccOutput = & $isccPath "bootstrapper.iss" 2>&1
    if ($LASTEXITCODE -ne 0) { throw "ISCC failed: $isccOutput" }
    Write-Success "GradePilotSetup.exe compiled"

    # 7. Generate SHA256
    Write-Step "Generating SHA256 cryptographic checksum..."
    if (Test-Path $setupFile) {
        $hash = Get-FileHash $setupFile -Algorithm SHA256
        "$($hash.Hash)  $($hash.Path | Split-Path -Leaf)" | Out-File -FilePath $sha256File -Encoding ascii
        Write-Success "Checksum generated"
    }
}

# 8. Copy Artifacts to Release Folder
Write-Step "Finalizing release artifacts..."
Copy-Item $manifestPath -Destination $releaseDir
Write-Success "Artifacts copied"

Write-Host ""
Write-Host " $cMuted---------------------------------------------------$cReset"
Write-Host " $cSuccess   * PIPELINE COMPLETE * $cReset"
Write-Host " $cText   Artifacts are successfully generated in Release/$cReset"
Write-Host " $cMuted---------------------------------------------------$cReset"
Write-Host ""
