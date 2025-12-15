# Add Windows Firewall rule to allow incoming connections on port 3000
# This script must be run as Administrator

Write-Host "Adding Windows Firewall rule for CarWash+ Backend API..." -ForegroundColor Cyan

try {
    # Check if rule already exists
    $existingRule = Get-NetFirewallRule -DisplayName "CarWash+ Backend API" -ErrorAction SilentlyContinue
    
    if ($existingRule) {
        Write-Host "Firewall rule already exists. Removing old rule..." -ForegroundColor Yellow
        Remove-NetFirewallRule -DisplayName "CarWash+ Backend API"
    }
    
    # Create new firewall rule
    New-NetFirewallRule -DisplayName "CarWash+ Backend API" `
                        -Direction Inbound `
                        -LocalPort 3000 `
                        -Protocol TCP `
                        -Action Allow `
                        -Profile Any `
                        -Description "Allow incoming connections to CarWash+ backend API on port 3000"
    
    Write-Host "✅ Firewall rule added successfully!" -ForegroundColor Green
    Write-Host "Mobile app should now be able to connect to http://192.168.1.17:3000" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "This script requires Administrator privileges." -ForegroundColor Yellow
    Write-Host "Please right-click PowerShell and select 'Run as Administrator', then run this script again." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
