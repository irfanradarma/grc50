$ErrorActionPreference = 'Stop'
$appRoot = Split-Path -Parent $PSScriptRoot
$localRoot = Join-Path $appRoot '.local'
$dataPath = Join-Path $localRoot 'postgres-data'
$pgBin = 'C:\Program Files\PostgreSQL\16\bin'
New-Item -ItemType Directory -Path $localRoot -Force | Out-Null
if (-not (Test-Path (Join-Path $dataPath 'PG_VERSION'))) {
    & (Join-Path $pgBin 'initdb.exe') -D $dataPath -U hori_admin --encoding=UTF8 --auth=scram-sha-256 --pwfile (Join-Path $localRoot 'admin-password.txt')
    if ($LASTEXITCODE -ne 0) { throw 'Database initialization failed.' }
}
& (Join-Path $pgBin 'pg_ctl.exe') status -D $dataPath 2>$null
if ($LASTEXITCODE -ne 0) {
    & (Join-Path $pgBin 'pg_ctl.exe') start -D $dataPath -l (Join-Path $localRoot 'postgres.log') -o '-p 5433 -h 127.0.0.1' -w
    if ($LASTEXITCODE -ne 0) { throw 'Local PostgreSQL startup failed.' }
}
