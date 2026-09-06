$ErrorActionPreference = 'Stop'
$siteBuilder = Join-Path $PSScriptRoot 'build-site.mjs'
& node $siteBuilder
if ($LASTEXITCODE -ne 0) { throw 'No se ha podido generar la web de Data2Gain.' }
