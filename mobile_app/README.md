# CarWash+ Mobile App

A Flutter-based mobile application for finding and booking car wash services in your area.

## Features

### 🗺️ Map View
- Real-time location tracking
- Interactive map showing nearby car washes
- Custom markers for user location and car wash locations
- Tap on markers to view car wash details

### 🚗 Car Wash Details
- Detailed information about each car wash
- Available services with pricing
- Ratings and reviews
- Contact information
- Direct booking from details page

### 📅 Booking System
- Select service type
- Choose date and time
- Specify vehicle details
- Add special instructions
- Real-time booking confirmation

### 📋 Booking Management
- View upcoming bookings
- Check booking history
- Cancel bookings
- Detailed booking information

### 👤 User Profile
- User information management
- Vehicle management
- Payment methods
- Settings and preferences

## Tech Stack

- **Framework**: Flutter 3.9+
- **Maps**: Google Maps Flutter
- **Location**: Geolocator & Permission Handler
- **HTTP Client**: http package
- **Date Formatting**: intl package

## Setup Instructions

### 1. Install Dependencies

```bash
flutter pub get
```

### 2. Configure Google Maps API

#### For Android:
1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Open `android/app/src/main/AndroidManifest.xml`
3. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key

#### For iOS:
Follow the [official Google Maps Flutter documentation](https://pub.dev/packages/google_maps_flutter)

### 3. Configure Backend URL

Open `lib/services/api_service.dart` and update:

```dart
static const String baseUrl = 'YOUR_BACKEND_URL';
```

### 4. Run the App

```bash
flutter run
```

## Project Structure

```
lib/
├── main.dart
├── models/
│   ├── booking.dart
│   ├── car_wash.dart
│   ├── service.dart
│   └── user.dart
├── screens/
│   ├── home_screen.dart
│   ├── map_screen.dart
│   ├── car_wash_details_screen.dart
│   ├── booking_screen.dart
│   ├── booking_confirmation_screen.dart
│   ├── bookings_screen.dart
│   └── profile_screen.dart
└── services/
    ├── api_service.dart
    └── location_service.dart
```

## Required Permissions

- **Android**: Location, Internet
- **iOS**: Location When In Use

## Next Steps

- [ ] Add Google Maps API key
- [ ] Configure backend URL
- [ ] Implement authentication
- [ ] Add payment integration
- [ ] Implement push notifications
- [ ] Add reviews and ratings
