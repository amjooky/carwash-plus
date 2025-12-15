# Mobile App API Connection - Final Fix Guide

## ✅ PROBLEM IDENTIFIED

Your mobile app cannot connect to the backend because:
1. **Correct IP Address:** 192.168.1.17 (Wi-Fi)
2. **Windows Firewall is blocking** incoming connections on port 3000 from your mobile device

## 🚀 SOLUTION - Add Firewall Rule

### Option 1: Run the PowerShell Script (EASIEST)
1. Right-click on `add_firewall_rule.ps1`
2. Select **"Run with PowerShell"**
3. If prompted, click **"Yes"** to allow administrator access

### Option 2: Manual PowerShell Command
Open PowerShell **as Administrator** and run:
```powershell
New-NetFirewallRule -DisplayName "CarWash+ Backend API" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Any
```

### Option 3: Windows Firewall GUI
1. Press `Win + R`, type `wf.msc`, press Enter
2. Click **"Inbound Rules"** → **"New Rule"**
3. Select **"Port"** → Next
4. Select **"TCP"**, enter **"3000"** → Next
5. Select **"Allow the connection"** → Next
6. Check all profiles → Next
7. Name: **"CarWash+ Backend API"** → Finish

## 📱 After Adding Firewall Rule

### 1. Verify Backend is Running
```bash
cd C:\Users\Sam\Desktop\projects\CarWash+\backend
npm run start:dev
```

### 2. Test Connection from Computer
```bash
curl http://192.168.1.17:3000/api/v1/public/centers
```
You should see JSON data with car wash centers.

### 3. Hot Restart the Mobile App
In the Flutter terminal, press `R` (capital R) for hot restart, or just restart the app.

### 4. Watch the Logs
You should now see:
```
🌐 Using API Base URL: http://192.168.1.17:3000/api/v1
🌐 Fetching car washes from: http://192.168.1.17:3000/api/v1/public/centers
📡 Response status: 200
✅ Successfully fetched 1 car washes
```

## 🔍 All Changes Made

### 1. Android Configuration
- ✅ Created `network_security_config.xml` to allow HTTP traffic
- ✅ Updated `AndroidManifest.xml` with cleartext traffic permissions
- ✅ Added all possible IP addresses to network security config

### 2. Backend Configuration
- ✅ Updated CORS to allow all origins for development
- ✅ Backend listening on `0.0.0.0:3000` (all interfaces)

### 3. Mobile App Configuration
- ✅ Updated IP address to `192.168.1.17` in `app_config.dart`
- ✅ Changed from `const` to `final` for easier updates
- ✅ Added comprehensive logging to track API calls

### 4. API Service
- ✅ Added detailed logging with emojis for easy debugging
- ✅ Added timeout handling
- ✅ Added socket exception handling

### 5. CarWash Model
- ✅ Updated to parse `amenities` field from backend
- ✅ Added logging to track parsing

## 🌐 Current Network Configuration

- **Computer IP:** 192.168.1.17 (Wi-Fi)
- **Backend URL:** http://192.168.1.17:3000
- **API Base:** http://192.168.1.17:3000/api/v1
- **Backend Status:** ✅ Running and accessible from computer
- **Mobile App Config:** ✅ Updated to use correct IP

## ⚠️ IMPORTANT: If IP Changes

Your computer's IP address can change when you:
- Reconnect to WiFi
- Restart your computer
- Switch networks

To update the IP:
1. Run `ipconfig` in PowerShell
2. Find your Wi-Fi adapter's IPv4 Address
3. Update `mobile_app/lib/config/app_config.dart`:
   ```dart
   static final String computerIP = 'YOUR_NEW_IP';
   ```
4. Hot restart the app (press `R` in Flutter terminal)

## 🐛 Troubleshooting

### Still getting timeout?
- Make sure you added the firewall rule
- Verify both devices are on the same WiFi network
- Check if antivirus is blocking the connection
- Try temporarily disabling Windows Firewall to test

### Getting 404 errors?
- Backend might not be running
- Check the API endpoints in the backend

### Data not showing?
- Check Flutter console for parsing errors
- Verify the backend is returning data (use curl)
