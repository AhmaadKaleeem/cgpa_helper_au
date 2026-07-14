param (
    [string]$FilePath
)

Write-Host "Digital signing is currently disabled."
Write-Host "To enable signing, modify this script to call signtool.exe on '$FilePath'."

# Example future implementation:
# signtool sign /tr http://timestamp.digicert.com /td sha256 /fd sha256 /a $FilePath
