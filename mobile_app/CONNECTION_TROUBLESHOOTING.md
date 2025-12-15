# Mobile App Connection Troubleshooting

## Issue: Connection Timeout to Backend

### Quick Fixes

#### Option 1: Check Backend is Running ✅
```bash
cd backend
npm run start:dev
```

Verify it's accessible:
```bash
curl http://localhost:3000/api/v1/health
```

#### Option 2: Disable Windows Firewall (Temporarily)
1. Open Windows Defender Firewall
2. Click "Turn Windows Defender Firewall on or off"
3. Turn off for Private networks (temporarily)
4. Test the app
5. **Remember to turn it back on!**

#### Option 3: Add Firewall Rule
```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="Node.js Backend" dir=in action=allow protocol=TCP localport=3000
```

#### Option 4: Use Your Computer's IP (For Real Devices)

**Find your IP:**
```bash
ipconfig
```

Look for "IPv4 Address" (e.g., `192.168.1.48`)

**Update `app_config.dart`:**
```dart
// For real Android device
static const String realDeviceBaseUrl = 'http://192.168.1.48:3000/api/v1';

static String get baseUrl {
  // Use real device IP instead of 10.0.2.2
  return realDeviceBaseUrl;
}
```

---

## Testing Connection

### 1. Test from Computer
```bash
curl http://localhost:3000/api/v1/health
```

### 2. Test from Emulator
```bash
# In Android Studio Terminal
adb shell
curl http://10.0.2.2:3000/api/v1/health
```

### 3. Check Backend Logs
Look for incoming requests in backend terminal

---

## Common Issues

### Issue: "Connection timed out"
**Cause:** Firewall blocking port 3000  
**Fix:** Add firewall rule or temporarily disable firewall

### Issue: "Connection refused"
**Cause:** Backend not running  
**Fix:** Start backend with `npm run start:dev`

### Issue: "Network unreachable"
**Cause:** Wrong IP address  
**Fix:** Use `10.0.2.2` for emulator, your IP for real device

---

## Current Configuration

**Backend:** Listening on `0.0.0.0:3000` ✅  
**Mobile App:** Using `10.0.2.2:3000` for Android emulator

**Network Mapping:**
- `10.0.2.2` = Your computer's localhost (from emulator's perspective)
- `localhost` = Emulator itself (NOT your computer)

---

## Next Steps

1. **Add firewall rule** (recommended)
2. **Or temporarily disable firewall** to test
3. **Hot reload app** (press 'r' in Flutter terminal)
4. **Try registration/login again**

If still not working, try using your actual IP address instead of `10.0.2.2`.
