# Push Notifications Troubleshooting Guide

## 🔍 Current Setup Analysis

### Backend Configuration ✅
- **Firebase Admin SDK**: Initialized with service-account.json
- **FCM Token Endpoint**: `/api/v1/users/fcm-token` (PATCH)
- **Notification Service**: Properly configured to send push notifications
- **Token Storage**: FCM tokens stored in User table

### Mobile App Configuration ✅
- **Firebase Messaging**: Initialized in `firebase_messaging_service.dart`
- **FCM Token**: Generated and logged in console
- **Token Upload**: Attempts to send to backend after login
- **Permissions**: Requested on app start

## 🐛 Common Issues & Solutions

### Issue 1: FCM Token Not Reaching Backend

**Symptoms:**
```
⚠️ No auth token, skipping FCM token upload
```

**Root Cause:** The mobile app tries to send the FCM token before the user logs in.

**Solution:** The FCM token is sent automatically after login via `registerToken()` method.

**Verify:**
1. Check backend logs for: `✅ FCM token updated successfully`
2. Check database: `SELECT id, email, fcmToken FROM User WHERE fcmToken IS NOT NULL;`

### Issue 2: Firebase Admin SDK Not Initialized

**Symptoms:**
```
⚠️ Firebase not initialized, skipping push notification
```

**Root Cause:** Missing or invalid `service-account.json` file.

**Solution:**
1. Verify `service-account.json` exists in backend root directory
2. Check backend startup logs for: `✅ Firebase Admin SDK initialized`
3. If error, download new service account key from Firebase Console

### Issue 3: Invalid FCM Token

**Symptoms:**
- Notifications sent from backend but not received on mobile
- Backend logs show: `messaging/registration-token-not-registered`

**Solutions:**
1. **Regenerate Token:** Uninstall and reinstall the app
2. **Check Token Format:** Should start with something like `c8MJ3tAxTjOBCQF...`
3. **Verify Firebase Project:** Ensure mobile app and backend use the same Firebase project

### Issue 4: Network/Firewall Blocking FCM

**Symptoms:**
- Token uploaded successfully
- Backend sends notification without errors
- Mobile app doesn't receive anything

**Solutions:**
1. Ensure mobile device has internet connection
2. Check if corporate/school network blocks FCM (ports 5228, 5229, 5230)
3. Try on different network (mobile data vs WiFi)

## 🧪 Testing Push Notifications

### Test 1: Verify FCM Token Upload

**Mobile App Logs (after login):**
```
🔑 FCM Token: c8MJ3tAxTjOBCQF7al-llT:APA91b...
🔄 Sending FCM token to backend...
✅ FCM token sent to backend
```

**Backend Logs:**
```
FCM token updated successfully
```

**Database Check:**
```sql
SELECT id, email, fcmToken FROM "User" WHERE email = 'your@email.com';
```

### Test 2: Send Test Notification from Backend

**Option A: Via API (Postman/curl)**
```bash
curl -X POST http://192.168.1.17:3000/api/v1/notifications/broadcast \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "message": "This is a test push notification"
  }'
```

**Option B: Trigger via Booking Status Change**
When a booking status changes, the system automatically sends a notification.

### Test 3: Check Firebase Console

1. Go to Firebase Console → Cloud Messaging
2. Send a test notification to your FCM token
3. If this works but app notifications don't, the issue is in the backend

## 📱 Mobile App Notification Flow

```
1. App Starts
   ↓
2. Firebase Messaging Initialized
   ↓
3. Request Notification Permission
   ↓
4. Get FCM Token
   ↓
5. User Logs In
   ↓
6. Send FCM Token to Backend (/users/fcm-token)
   ↓
7. Backend Stores Token in Database
   ↓
8. Backend Sends Notification (when event occurs)
   ↓
9. FCM Delivers to Device
   ↓
10. App Receives & Displays Notification
```

## 🔧 Debugging Steps

### Step 1: Verify Token Upload
```dart
// In mobile app, after login, check logs for:
print('🔄 Sending FCM token to backend...');
print('✅ FCM token sent to backend');
```

### Step 2: Check Backend Receives Token
```typescript
// In backend users.service.ts, add logging:
async updateFcmToken(userId: string, fcmToken: string) {
  console.log(`📱 Updating FCM token for user ${userId}: ${fcmToken.substring(0, 20)}...`);
  // ... rest of code
}
```

### Step 3: Verify Notification Sending
```typescript
// In notifications.service.ts, check logs:
console.log(`📤 Sending notification to token: ${fcmToken.substring(0, 20)}...`);
```

### Step 4: Check Firebase Admin Response
```typescript
// In firebase.service.ts:
console.log('✅ Push notification sent:', response);
// or
console.error('❌ Failed to send push notification:', error.message);
```

## 🚀 Quick Fix Checklist

- [ ] Mobile app has notification permission granted
- [ ] FCM token is generated (check logs: `🔑 FCM Token:`)
- [ ] User is logged in before token upload
- [ ] Backend receives and stores FCM token
- [ ] `service-account.json` exists and is valid
- [ ] Firebase Admin SDK initialized successfully
- [ ] Both mobile and backend use same Firebase project
- [ ] Mobile device has internet connection
- [ ] No firewall/network blocking FCM

## 🔍 Current Status Check

Run these commands to verify current setup:

### Backend:
```bash
# Check if service account exists
ls backend/service-account.json

# Check backend logs for Firebase initialization
# Look for: "✅ Firebase Admin SDK initialized"

# Query database for FCM tokens
# In your database client:
SELECT COUNT(*) as users_with_tokens FROM "User" WHERE "fcmToken" IS NOT NULL;
```

### Mobile App:
```bash
# Check logs for:
# - "✅ User granted notification permission"
# - "🔑 FCM Token: ..."
# - "✅ FCM token sent to backend"
```

## 📞 Next Steps

1. **Verify Token Upload**: Check if FCM token is in database
2. **Test Notification**: Send a test notification from backend
3. **Check Logs**: Look for errors in both backend and mobile logs
4. **Firebase Console**: Verify project configuration

## 🆘 Still Not Working?

If notifications still don't work after following this guide:

1. **Check Firebase Project ID**: Ensure `google-services.json` (Android) matches backend `service-account.json`
2. **Regenerate Service Account**: Download new key from Firebase Console
3. **Test with Firebase Console**: Send notification directly from Firebase Console to verify device can receive
4. **Check App State**: Notifications behave differently when app is:
   - Foreground (onMessage)
   - Background (onBackgroundMessage)
   - Terminated (getInitialMessage)
