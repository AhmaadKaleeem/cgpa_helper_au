$ErrorActionPreference = "Stop"

Write-Host "--- GradePilot Automated Release Pipeline ---" -ForegroundColor Cyan

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
Write-Host "1. Reading installer-manifest.json..."
if (-not (Test-Path $manifestPath)) { throw "installer-manifest.json not found." }
$manifestJson = Get-Content $manifestPath | ConvertFrom-Json
$installerVersion = $manifestJson.installerVersion

# 2. Package Extension
Write-Host "2. Packaging extension..."
if (-not (Test-Path $assetsDir)) { New-Item -ItemType Directory -Path $assetsDir | Out-Null }
if (Test-Path $zipPath) { Remove-Item $zipPath }
Compress-Archive -Path "$extensionDir\*" -DestinationPath $zipPath -Force

# 3. Validate manifest.json inside zip
Write-Host "3. Validating bundled extension..."
# Simple check for manifest.json by using System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$hasManifest = $false
foreach ($entry in $zip.Entries) {
    if ($entry.Name -eq "manifest.json") { $hasManifest = $true; break }
}
$zip.Dispose()
if (-not $hasManifest) { throw "manifest.json is missing from extension.zip" }

# 4. Inject Version into CSPROJ
Write-Host "4. Injecting version into WPF project..."
$csprojContent = Get-Content $csprojPath
# Replace or insert <Version> tag
if ($csprojContent -match "<Version>.*</Version>") {
    $csprojContent = $csprojContent -replace "<Version>.*</Version>", "<Version>$installerVersion</Version>"
} else {
    $csprojContent = $csprojContent -replace "</PropertyGroup>", "  <Version>$installerVersion</Version>`n  </PropertyGroup>"
}
Set-Content -Path $csprojPath -Value $csprojContent

# 5. Build WPF Installer
Write-Host "5. Publishing WPF Installer (Self-Contained)..."
dotnet publish -c Release -r win-x64 --self-contained true

# 6. Run Inno Setup Bootstrapper
Write-Host "6. Running Inno Setup compiler..."
if (Test-Path $releaseDir) { Remove-Item -Recurse -Force $releaseDir }
New-Item -ItemType Directory -Path $releaseDir | Out-Null

$isccPath = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if (-not (Test-Path $isccPath)) {
    Write-Host "WARNING: Inno Setup 6 not found at $isccPath. Skipping bootstrapper generation." -ForegroundColor Yellow
} else {
    & $isccPath "bootstrapper.iss"

    # 7. Generate SHA256
    Write-Host "7. Generating SHA256 checksum..."
    if (Test-Path $setupFile) {
        $hash = Get-FileHash $setupFile -Algorithm SHA256
        "$($hash.Hash)  $($hash.Path | Split-Path -Leaf)" | Out-File -FilePath $sha256File -Encoding ascii
    }
}

# 8. Copy Artifacts to Release Folder
Write-Host "8. Copying final artifacts..."
Copy-Item $manifestPath -Destination $releaseDir

Write-Host "--- Pipeline Complete! ---" -ForegroundColor Green
Write-Host "Artifacts are ready in the Release/ folder."
