# Complete Mobile App Connection Fix

## 🔴 CRITICAL ISSUE: Mobile App Cannot Connect to Backend

### Current Status:
- ✅ Backend running on: http://192.168.1.17:3000
- ✅ Firewall rule added for port 3000
- ✅ Config file updated with correct IP
- ❌ Mobile app still using OLD IP (172.20.128.1)

### Why This Happens:
The mobile app has the old IP **compiled into the APK**. Hot restart does NOT rebuild the app with new config values.

## 🚀 SOLUTION: Complete Rebuild Required

### Step 1: Stop All Running Apps
```bash
# Kill any running Flutter processes
flutter clean
```

### Step 2: Verify Config File
Check `mobile_app/lib/config/app_config.dart`:
```dart
static final String computerIP = '192.168.1.17';  // ✅ CORRECT
```

### Step 3: Full Rebuild and Install
```bash
cd mobile_app
flutter clean
flutter pub get
flutter run --release  # Or just flutter run
```

**IMPORTANT:** Do NOT use hot restart (r) or hot reload (R) after changing the IP. You MUST do a full rebuild.

### Step 4: Verify Connection
After app starts, check logs for:
```
🌐 Using API Base URL: http://192.168.1.17:3000/api/v1
```

If you still see `172.20.128.1`, the rebuild didn't work.

## 🔧 Alternative: Temporary Workaround

If you need to test quickly without rebuilding, you can temporarily change the backend to listen on the old IP:

### Option A: Use Both IPs (Backend)
The backend is already listening on `0.0.0.0:3000` which means ALL network interfaces. The issue is the firewall.

### Option B: Add Firewall Rule for Old IP
```powershell
New-NetFirewallRule -DisplayName "CarWash+ Backend API (Old IP)" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Any
```

## 📱 Mobile App Rebuild Checklist

- [ ] Stop all running Flutter apps
- [ ] Run `flutter clean`
- [ ] Verify IP in `app_config.dart` is `192.168.1.17`
- [ ] Run `flutter pub get`
- [ ] Run `flutter run` (full rebuild)
- [ ] Check logs show correct IP: `http://192.168.1.17:3000/api/v1`
- [ ] Test login/API calls

## 🐛 Debugging Connection Issues

### Test 1: Backend is Running
```bash
curl http://192.168.1.17:3000/api/v1/public/centers
```
Should return JSON data.

### Test 2: Firewall Allows Connections
```powershell
Test-NetConnection -ComputerName 192.168.1.17 -Port 3000
```
Should show `TcpTestSucceeded: True`

### Test 3: Mobile Device Can Reach Backend
From another device on same network:
```bash
curl http://192.168.1.17:3000/api/v1/public/centers
```

### Test 4: Check Mobile App Logs
Look for:
- `🌐 Using API Base URL: http://192.168.1.17:3000/api/v1` ✅
- `Login timeout - backend not reachable` ❌ (means wrong IP or firewall)
- `SocketException: Connection timed out` ❌ (means can't reach backend)

## 🎯 Quick Commands

### Rebuild Mobile App (REQUIRED)
```bash
cd C:\Users\Sam\Desktop\projects\CarWash+\mobile_app
flutter clean
flutter run
```

### Check Current IP
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*"} | Select IPAddress
```

### Verify Firewall Rule
```powershell
Get-NetFirewallRule -DisplayName "*CarWash*"
```

### Test Backend Connection
```bash
curl http://192.168.1.17:3000/api/v1/public/centers
```

## ⚠️ Common Mistakes

1. **Using Hot Restart Instead of Full Rebuild**
   - Hot restart does NOT update compiled constants
   - You MUST do `flutter clean` + `flutter run`

2. **Wrong Network**
   - Ensure mobile device and computer are on SAME WiFi network
   - Check mobile device isn't using mobile data

3. **IP Changed**
   - Computer IP can change when reconnecting to WiFi
   - Always verify with `ipconfig` before rebuilding

4. **Firewall Not Updated**
   - Even with correct IP, firewall must allow port 3000
   - Test with `Test-NetConnection`

## 📞 Next Steps

1. **REBUILD THE MOBILE APP** - This is mandatory, not optional
2. Verify logs show correct IP (192.168.1.17)
3. Test login functionality
4. If still failing, check firewall and network

## 🆘 Still Not Working?

If after a complete rebuild it still doesn't work:

1. **Verify both devices on same network:**
   ```
   Computer WiFi: [Check WiFi name]
   Mobile WiFi: [Check WiFi name]
   ```

2. **Try mobile hotspot:**
   - Connect computer to mobile hotspot
   - Get new IP with `ipconfig`
   - Update config and rebuild

3. **Check antivirus/VPN:**
   - Temporarily disable antivirus
   - Disconnect from VPN
   - Test again
