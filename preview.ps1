$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
if (-not (Test-Path -LiteralPath '_site/index.html')) {
    throw 'Build the Jekyll site first; see README.md.'
}
Write-Host 'Open http://127.0.0.1:4000/ in a browser. Press Ctrl+C to stop.'
python -m http.server 4000 --bind 127.0.0.1 --directory _site
