# CarWash+ Mobile App - Setup Guide

## Quick Start

### 1. Prerequisites
- Flutter SDK 3.9+ installed
- Android Studio or VS Code with Flutter extensions
- Android emulator or iOS simulator
- Google Maps API key

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API (if needed)
4. Create credentials → API Key
5. Restrict the API key (recommended for production)

### 3. Configure the App

#### Step 1: Add Google Maps API Key (Android)

Open `android/app/src/main/AndroidManifest.xml` and find this line:

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY" />
```

Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key.

#### Step 2: Configure Backend URL

Open `lib/services/api_service.dart` and update:

```dart
static const String baseUrl = 'http://YOUR_BACKEND_URL/api';
```

Replace with your actual backend URL. Examples:
- Local development: `http://10.0.2.2:8000/api` (Android emulator)
- Local development: `http://localhost:8000/api` (iOS simulator)
- Production: `https://api.yourapp.com/api`

#### Step 3: Enable Developer Mode (Windows)

For symlink support on Windows:
1. Press Win + I to open Settings
2. Go to Update & Security → For developers
3. Enable "Developer Mode"

### 4. Install Dependencies

```bash
cd mobile_app
flutter pub get
```

### 5. Run the App

#### On Android Emulator:
```bash
flutter run
```

#### On iOS Simulator:
```bash
flutter run
```

#### On Physical Device:
```bash
flutter devices  # List connected devices
flutter run -d DEVICE_ID
```

## Testing Without Backend

The app will work without a backend, but with limited functionality:
- Map view will show your location
- Car wash markers won't appear (API call will fail gracefully)
- Bookings won't be saved

To test with sample data, you can:
1. Create a mock API service
2. Return hardcoded data for testing
3. Connect to your actual backend when ready

## Common Issues

### Issue: "Developer Mode required"
**Solution**: Enable Developer Mode in Windows settings (see Step 3 above)

### Issue: Map not showing
**Solutions**:
- Verify Google Maps API key is correct
- Check API key restrictions (should allow your app's package name)
- Ensure location permissions are granted
- Check internet connection

### Issue: Location permission denied
**Solutions**:
- Grant location permission when prompted
- Check device location services are enabled
- For Android: Settings → Apps → CarWash+ → Permissions → Location
- For iOS: Settings → Privacy → Location Services

### Issue: "Failed to load car washes"
**Solutions**:
- Verify backend URL is correct
- Ensure backend server is running
- Check network connectivity
- For emulator: Use correct IP address (10.0.2.2 for Android, localhost for iOS)

## Development Tips

### Hot Reload
Press `r` in the terminal to hot reload changes while the app is running.

### Debug Mode
The app runs in debug mode by default. To build release:
```bash
flutter build apk --release  # Android
flutter build ios --release  # iOS
```

### Viewing Logs
```bash
flutter logs
```

### Code Analysis
```bash
flutter analyze
```

## Next Steps After Setup

1. ✅ Verify app launches and shows map
2. ✅ Test location permissions
3. ✅ Verify map displays your location
4. 🔲 Connect to backend and test car wash loading
5. 🔲 Test booking flow
6. 🔲 Implement authentication
7. 🔲 Add payment integration

## API Endpoints Summary

Make sure your backend implements these endpoints:

```
GET  /api/carwashes/nearby?lat={lat}&lng={lng}&radius={radius}
GET  /api/carwashes/{id}
GET  /api/carwashes/{id}/services
POST /api/bookings
GET  /api/users/{userId}/bookings
PUT  /api/bookings/{id}/cancel
POST /api/auth/login
POST /api/auth/register
```

## Support

If you encounter issues:
1. Check the console output for errors
2. Verify all setup steps were completed
3. Check Flutter doctor: `flutter doctor`
4. Ensure all dependencies are installed: `flutter pub get`

For Flutter-specific issues, refer to:
- [Flutter Documentation](https://docs.flutter.dev/)
- [Google Maps Flutter Plugin](https://pub.dev/packages/google_maps_flutter)
