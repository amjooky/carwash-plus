$remoteport = 3000
$found_ip = (wsl hostname -I).Trim().Split(" ")[0]

if (-not $found_ip) {
    Write-Host "Could not find IP address of WSL instance." -ForegroundColor Red
    Exit
}

Write-Host "WSL IP Address is: $found_ip" -ForegroundColor Green

# Remove existing proxy if any
Invoke-Expression "netsh interface portproxy delete v4tov4 listenport=$remoteport listenaddress=0.0.0.0"

# Add new proxy
$connectaddress = $found_ip
$command = "netsh interface portproxy add v4tov4 listenport=$remoteport listenaddress=0.0.0.0 connectport=$remoteport connectaddress=$connectaddress"

Write-Host "Executing: $command" -ForegroundColor Cyan
Invoke-Expression $command

Write-Host -ForegroundColor Green "Port forwarding setup complete! Traffic on Windows port $remoteport is now forwarded to WSL ($connectaddress:$remoteport)"
Write-Host "Make sure your mobile app uses your WINDOWS IP (192.168.1.17)"
