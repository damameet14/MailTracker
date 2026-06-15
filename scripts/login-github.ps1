$ErrorActionPreference = 'Stop'

$ghCandidates = @(
  (Join-Path $env:ProgramFiles 'GitHub CLI\gh.exe'),
  (Join-Path $env:LOCALAPPDATA 'Programs\GitHub CLI\gh.exe')
)
$gh = $ghCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $gh) {
  throw 'GitHub CLI is not installed.'
}

& $gh auth login --web --git-protocol https
& $gh auth status
