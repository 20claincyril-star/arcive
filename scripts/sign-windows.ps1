param(
  [Parameter(Mandatory = $true)]
  [string]$TargetPath,
  [string]$TimestampUrl = "http://timestamp.digicert.com"
)

if (-not (Test-Path $TargetPath)) {
  Write-Error "Fichier introuvable: $TargetPath"
  exit 1
}

if (-not $env:ARCIVE_CERT_PFX_BASE64) {
  Write-Error "Variable ARCIVE_CERT_PFX_BASE64 absente."
  exit 1
}

if (-not $env:ARCIVE_CERT_PASSWORD) {
  Write-Error "Variable ARCIVE_CERT_PASSWORD absente."
  exit 1
}

$certPath = Join-Path $env:TEMP "arcive-signing-cert.pfx"
[IO.File]::WriteAllBytes($certPath, [Convert]::FromBase64String($env:ARCIVE_CERT_PFX_BASE64))

$signtool = (Get-Command signtool.exe -ErrorAction SilentlyContinue)?.Source
if (-not $signtool) {
  Write-Error "signtool.exe introuvable. Installe Windows SDK."
  Remove-Item $certPath -Force -ErrorAction SilentlyContinue
  exit 1
}

& $signtool sign /f $certPath /p $env:ARCIVE_CERT_PASSWORD /fd SHA256 /tr $TimestampUrl /td SHA256 $TargetPath
if ($LASTEXITCODE -ne 0) {
  Write-Error "Echec de signature pour $TargetPath"
  Remove-Item $certPath -Force -ErrorAction SilentlyContinue
  exit $LASTEXITCODE
}

Write-Output "Signature OK: $TargetPath"
Remove-Item $certPath -Force -ErrorAction SilentlyContinue
