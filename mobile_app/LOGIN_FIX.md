# Quick Fix for Login/Register Issues

## Issue
Cannot login or create account - connection timeout

## Root Cause
**Windows Firewall is blocking port 3000** from Android emulator

## ✅ Solution

### Option 1: Add Firewall Rule (Recommended)

**Open PowerShell as Administrator** and run:

```powershell
netsh advfirewall firewall add rule name="CarWash Backend Port 3000" dir=in action=allow protocol=TCP localport=3000
```

### Option 2: Temporarily Disable Firewall

1. Open **Windows Security**
2. Go to **Firewall & network protection**
3. Click on **Private network**
4. Turn off **Windows Defender Firewall**
5. Test the app
6. **Turn it back on after testing!**

### Option 3: Use Your Computer's IP (For Real Device)

If using a real Android device (not emulator):

1. Find your IP:
   ```bash
   ipconfig
   ```
   Look for IPv4 Address (e.g., `192.168.1.48`)

2. Update `app_config.dart`:
   ```dart
   static String get baseUrl {
     // For real device, use your computer's IP
     return 'http://192.168.1.48:3000/api/v1';
   }
   ```

---

## Test After Fix

1. **Hot reload** the app (press `r`)
2. **Try registration** with:
   - Email: `test@example.com`
   - Password: `Test1234!` (must have uppercase, lowercase, number/special char)
   - Username: `testuser`
   - Phone: `1234567890`

3. **Check logs** in Flutter console for detailed error messages

---

## Verify Backend is Running

```bash
# Test from your computer
curl http://localhost:3000/api/v1/auth/login

# Should return: {"message":"Cannot POST /api/v1/auth/login","error":"Not Found","statusCode":404}
# This is OK - it means backend is running
```

---

## Common Errors

### "Connection timeout"
→ Firewall is blocking. Add firewall rule above.

### "Network error"
→ Backend not running. Start with `npm run start:dev`

### "Invalid credentials"
→ Wrong email/password. Check password requirements.

### "Email already exists"
→ User already registered. Try login instead.

---

**After adding the firewall rule, the app should work!** 🚀
