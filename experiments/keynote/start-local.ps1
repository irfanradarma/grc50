$ErrorActionPreference = 'Stop'
$signalRepoPath = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
if (-not (Get-NetTCPConnection -LocalPort 8090 -State Listen -ErrorAction SilentlyContinue)) {
    Start-Process python -ArgumentList 'experiments/keynote/serve.py' -WorkingDirectory $signalRepoPath -WindowStyle Hidden
}
if (-not (Get-NetTCPConnection -LocalPort 8091 -State Listen -ErrorAction SilentlyContinue)) {
    Start-Process node -ArgumentList 'node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '8091', '--base', '/_app/' -WorkingDirectory (Join-Path $signalRepoPath 'app') -WindowStyle Hidden
}
Write-Host 'Keynote study: http://127.0.0.1:8090/experiments/keynote/'
Write-Host 'Primary deck: http://127.0.0.1:8090/website/deck/?present=1'
Write-Host 'Read-only guides: http://127.0.0.1:8090/_app/audience/walkthrough/capture/'

Write-Host 'Archived deck: http://127.0.0.1:8090/website/deck-archive/'
