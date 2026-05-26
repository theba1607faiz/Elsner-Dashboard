<#
Start-all PowerShell script
- Opens three new PowerShell windows and runs each service's dev script.
#>

$Root = Split-Path -Parent $MyInvocation.MyCommand.Definition

$services = @(
    @{ Name = 'API';       Dir = Join-Path $Root 'api';       Cmd = "npm install; npm run dev" },
    @{ Name = 'Dashboard'; Dir = Join-Path $Root 'dashboard'; Cmd = "npm install; npm run dev" },
    @{ Name = 'Automation';Dir = Join-Path $Root 'automation';Cmd = "npm install; npm run dev" }
)

foreach ($s in $services) {
    Write-Host "Starting $($s.Name) in $($s.Dir)..."
    $command = "Set-Location -LiteralPath '$($s.Dir)'; $($s.Cmd)"
    Start-Process -FilePath powershell -ArgumentList '-NoExit', '-Command', $command -WorkingDirectory $s.Dir
}

Write-Host "All start commands issued. Check the new windows for logs." -ForegroundColor Green
