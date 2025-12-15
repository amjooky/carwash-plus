# Push Notifications - Testing Guide

## ✅ Setup Complete

Your push notification system is now configured and ready to test!

### What's Been Fixed:
1. ✅ Mobile app connects to correct backend IP (192.168.1.17)
2. ✅ FCM token registration after login
3. ✅ Notification polling with proper timeout handling
4. ✅ Test endpoints created for manual notification testing
5. ✅ Firebase Admin SDK initialized

## 🧪 How to Test Push Notifications

### Step 1: Login to Mobile App
1. Open the mobile app
2. Login with your credentials
3. Check logs for:
   ```
   🔑 FCM Token: c8MJ3tAxTjOBCQF...
   🔄 Sending FCM token to backend...
   ✅ FCM token sent to backend
   ```

### Step 2: Get Your User ID
Open Prisma Studio (already running at http://localhost:5555):
1. Click on "User" table
2. Find your user by email
3. Copy the `id` field (UUID format)

### Step 3: Send Test Notification

**Option A: Using Postman/Thunder Client**
```http
POST http://192.168.1.17:3000/api/v1/test/send-notification
Content-Type: application/json

{
  "userId": "YOUR_USER_ID_HERE",
  "title": "Test Notification",
  "message": "This is a test push notification!"
}
```

**Option B: Using curl**
```bash
curl -X POST http://192.168.1.17:3000/api/v1/test/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID_HERE",
    "title": "Test Notification",
    "message": "This is a test push notification!"
  }'
```

**Option C: Using PowerShell**
```powershell
$body = @{
    userId = "YOUR_USER_ID_HERE"
    title = "Test Notification"
    message = "This is a test push notification!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://192.168.1.17:3000/api/v1/test/send-notification" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### Step 4: Check Results

**Mobile App:**
- You should see a notification appear instantly
- Check logs for: `📬 Foreground message received`

**Backend Logs:**
- Look for: `✅ Push notification sent: ...`

**If Notification Doesn't Appear:**
1. Check backend logs for errors
2. Verify FCM token was uploaded (check database)
3. Ensure Firebase service account is valid

## 📱 Notification Flow

### When App is in Foreground:
```
Backend sends notification
    ↓
Firebase Cloud Messaging
    ↓
Mobile app receives (onMessage)
    ↓
Shows in-app notification
```

### When App is in Background:
```
Backend sends notification
    ↓
Firebase Cloud Messaging
    ↓
Android system shows notification
    ↓
User taps → App opens
```

### When App is Terminated:
```
Backend sends notification
    ↓
Firebase Cloud Messaging
    ↓
Android system shows notification
    ↓
User taps → App launches
```

## 🔍 Debugging

### Check FCM Token in Database
```sql
SELECT id, email, fcmToken FROM "User" WHERE email = 'your@email.com';
```

### Test Notification Response
The test endpoint returns:
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "userEmail": "user@example.com",
  "fcmToken": "c8MJ3tAxTjOBCQF7al..."
}
```

### Common Issues:

**"User has no FCM token registered"**
- User hasn't logged in yet
- FCM token upload failed
- Check mobile app logs for upload errors

**"Failed to send notification"**
- Firebase service account issue
- Invalid FCM token
- Check backend logs for Firebase errors

**Notification sent but not received**
- App doesn't have notification permission
- Device has Do Not Disturb enabled
- Network issue on mobile device

## 🎯 Real-World Triggers

Notifications are automatically sent when:

### 1. Booking Status Changes
```typescript
// In bookings.service.ts
await this.notificationsService.createBookingStatusNotification(
  userId,
  bookingId,
  bookingNumber,
  'CONFIRMED' // or IN_PROGRESS, COMPLETED, CANCELLED
);
```

### 2. Broadcast Notifications
```http
POST http://192.168.1.17:3000/api/v1/notifications/broadcast
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "title": "Special Offer!",
  "message": "Get 20% off your next wash!"
}
```

## 📊 Monitoring

### Backend Logs to Watch:
```
✅ Firebase Admin SDK initialized
📱 Updating FCM token for user...
✅ Push notification sent: projects/...
```

### Mobile App Logs to Watch:
```
🔑 FCM Token: ...
✅ FCM token sent to backend
📬 Foreground message received
📱 Notification tapped
```

## 🚀 Next Steps

1. **Test Now**: Send a test notification using the steps above
2. **Verify Receipt**: Check that notification appears on mobile
3. **Test Different States**: Try with app in foreground, background, and terminated
4. **Test Booking Flow**: Create a booking and verify status change notifications

## 💡 Tips

- Notifications work best when app has been opened at least once
- FCM token can expire - app automatically refreshes it
- Test in different app states (foreground/background/terminated)
- Check notification permissions in Android settings

---

**Ready to test?** Follow Step 1-4 above and you should see notifications instantly! 🎉
