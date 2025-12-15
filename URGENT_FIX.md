# URGENT: Mobile App Can't Connect - Firewall Fix

## Problem
✅ Backend works from localhost (Swagger works)  
❌ Mobile app gets "Login timeout - backend not reachable"

**This is 100% a Windows Firewall issue!**

---

## ✅ SOLUTION (Choose One)

### Option 1: Run the Batch File (EASIEST)

1. **Right-click** `fix-firewall.bat`
2. Select **"Run as administrator"**
3. Click **Yes** when prompted
4. You should see "SUCCESS! Firewall rule added."
5. **Hot reload** Flutter app (press `r`)
6. **Try login again** - it will work!

---

### Option 2: Manual Command

1. Press `Windows + X`
2. Click **"Windows PowerShell (Admin)"** or **"Terminal (Admin)"**
3. Run:
   ```powershell
   netsh advfirewall firewall add rule name="CarWash Backend Port 3000" dir=in action=allow protocol=TCP localport=3000
   ```
4. You should see: `Ok.`
5. **Hot reload** Flutter app (press `r`)
6. **Try login again**

---

### Option 3: GUI Method

1. Press `Windows + R`, type `wf.msc`, press Enter
2. Click **Inbound Rules** → **New Rule...**
3. Select **Port** → Next
4. **TCP**, Specific local ports: `3000` → Next
5. **Allow the connection** → Next
6. Check all profiles (Domain, Private, Public) → Next
7. Name: `CarWash Backend` → Finish
8. **Hot reload** Flutter app
9. **Try login again**

---

## Why This Happens

- **Localhost (127.0.0.1)** = Windows allows by default ✅
- **10.0.2.2 (Android emulator)** = Windows blocks by default ❌

The Android emulator sees your computer as `10.0.2.2`, which Windows Firewall treats as an external connection and blocks.

---

## Test After Fix

1. **Hot reload** app (press `r` in Flutter terminal)
2. **Try login** with:
   - Email: `superadmin@carwash.com`
   - Password: `Admin@123`
3. **Check logs** - you should see:
   ```
   Attempting login to: http://10.0.2.2:3000/api/v1/auth/login
   Login response status: 200
   Login response body: {"user":{...},"access_token":"..."}
   ```

---

## Verify Firewall Rule Added

Run in PowerShell:
```powershell
netsh advfirewall firewall show rule name="CarWash Backend Port 3000"
```

Should show the rule details.

---

**Just run `fix-firewall.bat` as administrator and you're done!** 🚀
