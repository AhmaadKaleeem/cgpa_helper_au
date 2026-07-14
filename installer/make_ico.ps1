Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("Assets\logo.png")
$bmp = [System.Drawing.Bitmap]$img
$hicon = $bmp.GetHicon()
$ico = [System.Drawing.Icon]::FromHandle($hicon)
$fs = New-Object System.IO.FileStream("Assets\logo.ico", [System.IO.FileMode]::Create)
$ico.Save($fs)
$fs.Close()
$ico.Dispose()
$bmp.Dispose()
$img.Dispose()
