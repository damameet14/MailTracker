$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$env:XDG_CONFIG_HOME = Join-Path $repoRoot '.firebase-cli'
$env:XDG_DATA_HOME = Join-Path $repoRoot '.vercel-cli'
$env:CLOUDSDK_CONFIG = Join-Path $repoRoot '.gcloud'

Write-Host 'Signing in to Firebase...'
firebase login --reauth

Write-Host 'Signing in to Google Cloud...'
$gcloudCandidates = @(
  (Join-Path $env:LOCALAPPDATA 'Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd'),
  (Join-Path $env:ProgramFiles 'Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd')
)
$gcloud = $gcloudCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $gcloud) {
  throw 'Google Cloud CLI is installed but gcloud.cmd was not found. Open a new terminal and retry.'
}
& $gcloud auth login

Write-Host 'Signing in to Vercel...'
vercel login

Write-Host 'Cloud CLI authentication complete.'
