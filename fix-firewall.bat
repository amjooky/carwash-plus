@echo off
echo ========================================
echo CarWash+ Firewall Fix
echo ========================================
echo.
echo Adding firewall rule for port 3000...
echo.

netsh advfirewall firewall add rule name="CarWash Backend Port 3000" dir=in action=allow protocol=TCP localport=3000

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Firewall rule added.
    echo ========================================
    echo.
    echo Now:
    echo 1. Hot reload your Flutter app (press 'r')
    echo 2. Try login/register again
    echo.
    echo The mobile app should now connect!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo FAILED! Please run as Administrator
    echo ========================================
    echo.
    echo Right-click this file and select:
    echo "Run as administrator"
    echo ========================================
)

echo.
pause
