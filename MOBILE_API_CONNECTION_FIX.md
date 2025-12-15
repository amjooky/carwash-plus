# Mobile App API Connection Fix

## Problem Summary
The mobile app cannot connect to the backend API at `http://192.168.0.126:3000` with the error:
```
SocketException: Connection timed out (OS Error: Connection timed out, errno = 110)
```

## Root Causes Identified
1. ✅ **Android Cleartext Traffic** - Android blocks HTTP by default (FIXED)
2. ✅ **CORS Configuration** - Backend wasn't allowing mobile app origin (FIXED)
3. ⚠️ **Windows Firewall** - Blocking incoming connections on port 3000 (NEEDS ADMIN)

## Fixes Applied

### 1. Android Network Security Configuration ✅
**File Created:** `mobile_app/android/app/src/main/res/xml/network_security_config.xml`
- Allows cleartext HTTP traffic to local development servers
- Permits connections to: 192.168.0.126, localhost, 10.0.2.2, 127.0.0.1

### 2. Android Manifest Updated ✅
**File Modified:** `mobile_app/android/app/src/main/AndroidManifest.xml`
- Added `android:usesCleartextTraffic="true"`
- Added `android:networkSecurityConfig="@xml/network_security_config"`

### 3. Backend CORS Configuration ✅
**File Modified:** `backend/src/main.ts`
- Changed CORS to allow all origins during development
- Added explicit methods and headers for mobile app compatibility

## Required Action: Windows Firewall Rule

### Option 1: Using PowerShell (Administrator)
Open PowerShell **as Administrator** and run:
```powershell
New-NetFirewallRule -DisplayName "CarWash+ Backend API" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Any
```

### Option 2: Using Windows Defender Firewall GUI
1. Open **Windows Defender Firewall with Advanced Security**
2. Click **Inbound Rules** → **New Rule**
3. Select **Port** → Click **Next**
4. Select **TCP** and enter **3000** → Click **Next**
5. Select **Allow the connection** → Click **Next**
6. Check all profiles (Domain, Private, Public) → Click **Next**
7. Name it **"CarWash+ Backend API"** → Click **Finish**

### Option 3: Quick Test (Temporary)
Temporarily disable Windows Firewall to test:
1. Open **Windows Security** → **Firewall & network protection**
2. Turn off firewall for your active network
3. Test the mobile app connection
4. **Remember to turn it back on!**

## Testing the Connection

### 1. Verify Backend is Running
```powershell
netstat -ano | findstr :3000
```
You should see: `TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING`

### 2. Test Connection from Another Device
From your mobile device or another computer on the same network:
```bash
curl http://192.168.0.126:3000/api/v1/public/centers
```

### 3. Restart Backend Server
After making the firewall changes:
```bash
cd backend
npm run start:dev
```

### 4. Rebuild Mobile App
After Android manifest changes:
```bash
cd mobile_app
flutter clean
flutter pub get
flutter run
```

## Current Network Configuration

- **Computer IP:** 192.168.0.126
- **Backend Port:** 3000
- **API Base URL:** http://192.168.0.126:3000/api/v1
- **Backend Status:** ✅ Running (PID: 12060)
- **Listening on:** 0.0.0.0:3000 (all interfaces)

## Verification Checklist

- [x] Network security config created
- [x] Android manifest updated
- [x] Backend CORS configured
- [x] Backend is running
- [ ] **Windows Firewall rule added** ← YOU ARE HERE
- [ ] Mobile app rebuilt
- [ ] Connection tested

## Next Steps

1. **Add the Windows Firewall rule** using one of the options above
2. **Restart the backend server** to apply CORS changes
3. **Rebuild the mobile app** to apply Android manifest changes
4. **Test the connection** from the mobile app

## Troubleshooting

### If still not connecting:
1. Verify your computer's IP hasn't changed:
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" under your active network adapter

2. Update `mobile_app/lib/config/app_config.dart` if IP changed:
   ```dart
   static const String computerIP = 'YOUR_NEW_IP';
   ```

3. Ensure both devices are on the same WiFi network

4. Check if antivirus software is blocking the connection

### If getting CORS errors:
- Make sure backend server was restarted after the CORS changes
- Check backend console for CORS-related logs

### If getting 404 errors:
- Verify the API endpoints exist in the backend
- Check the backend is running on the correct port (3000)
