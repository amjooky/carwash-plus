import 'dart:async';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'auth_service.dart';
import 'api_service.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/app_config.dart';

// Top-level function for background message handling
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print('📱 Background message received: ${message.notification?.title}');
}

class FirebaseMessagingService {
  static final FirebaseMessagingService _instance = FirebaseMessagingService._internal();
  factory FirebaseMessagingService() => _instance;
  FirebaseMessagingService._internal();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  String? _fcmToken;
  
  // Callback for when new notifications arrive
  Function(int count)? onNewNotification;

  String? get fcmToken => _fcmToken;

  // Initialize Firebase Messaging
  Future<void> initialize() async {
    try {
      // Request permission for iOS
      NotificationSettings settings = await _firebaseMessaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        print('✅ User granted notification permission');
      } else {
        print('⚠️ User declined notification permission');
      }

      // Get FCM token
      _fcmToken = await _firebaseMessaging.getToken();
      print('🔑 FCM Token: $_fcmToken');

      // Send token to backend
      if (_fcmToken != null) {
        await _sendTokenToBackend(_fcmToken!);
      }

      // Listen for token refresh
      _firebaseMessaging.onTokenRefresh.listen((newToken) {
        _fcmToken = newToken;
        _sendTokenToBackend(newToken);
      });

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        print('📬 Foreground message received');
        print('Title: ${message.notification?.title}');
        print('Body: ${message.notification?.body}');
        
        // Notify listeners
        if (onNewNotification != null) {
          onNewNotification!(1);
        }
      });

      // Handle background messages
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // Handle notification tap when app is in background
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        print('📱 Notification tapped (background)');
        _handleNotificationTap(message);
      });

      // Check if app was opened from a terminated state via notification
      RemoteMessage? initialMessage = await _firebaseMessaging.getInitialMessage();
      if (initialMessage != null) {
        print('📱 App opened from notification (terminated)');
        _handleNotificationTap(initialMessage);
      }

      print('✅ Firebase Messaging initialized');
    } catch (e) {
      print('❌ Error initializing Firebase Messaging: $e');
    }
  }

  // Send FCM token to backend (call this after login)
  Future<void> registerToken() async {
    if (_fcmToken == null) {
      _fcmToken = await _firebaseMessaging.getToken();
    }
    
    if (_fcmToken != null) {
      await _sendTokenToBackend(_fcmToken!);
    }
  }

  Future<void> _sendTokenToBackend(String token) async {
    try {
      final authToken = await AuthService().getToken();
      if (authToken == null) {
        print('⚠️ No auth token, skipping FCM token upload');
        return;
      }

      print('🔄 Sending FCM token to backend...');
      final response = await http.patch(
        Uri.parse('${AppConfig.baseUrl}/users/fcm-token'), // Use static baseUrl from AppConfig
        headers: {
          'Authorization': 'Bearer $authToken',
          'Content-Type': 'application/json',
        },
        body: json.encode({'fcmToken': token}),
      );

      if (response.statusCode == 200) {
        print('✅ FCM token sent to backend');
      } else {
        print('⚠️ Failed to send FCM token: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      print('❌ Error sending FCM token: $e');
    }
  }

  // Handle notification tap
  void _handleNotificationTap(RemoteMessage message) {
    print('User tapped notification: ${message.notification?.title}');
    // TODO: Navigate to appropriate screen based on message data
  }
}
