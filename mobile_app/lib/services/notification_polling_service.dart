import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import 'api_service.dart';

class NotificationPollingService {
  static final NotificationPollingService _instance = NotificationPollingService._internal();
  factory NotificationPollingService() => _instance;
  NotificationPollingService._internal();

  Timer? _pollingTimer;
  Set<String> _seenNotificationIds = {};
  ValueNotifier<int> unreadCount = ValueNotifier<int>(0);
  
  // Callback for when new notifications arrive
  Function(int count)? onNewNotifications;

  // Start polling for new notifications
  void startPolling() {
    if (_pollingTimer != null && _pollingTimer!.isActive) {
      print('⚠️ Polling already active');
      return;
    }

    print('🔄 Starting notification polling (every 30 seconds)');
    
    // Check immediately
    _checkForNewNotifications();
    
    // Then check every 30 seconds
    _pollingTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      _checkForNewNotifications();
    });
  }

  // Stop polling
  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
    print('⏸️ Notification polling stopped');
  }

  // Check for new notifications
  Future<void> _checkForNewNotifications() async {
    try {
      final token = await AuthService().getToken();
      if (token == null) {
        print('⚠️ No auth token, skipping notification check');
        return;
      }

      final response = await http.get(
        Uri.parse('${ApiService().baseUrl}/notifications'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          print('⏱️ Notification check timed out');
          throw TimeoutException('Request timed out');
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> notifications = json.decode(response.body);
        
        // Filter unread notifications
        final unreadNotifications = notifications
            .where((n) => n['isRead'] == false)
            .toList();

        unreadCount.value = unreadNotifications.length;
        
        // Count new notifications (ones we haven't seen before)
        int newCount = 0;
        for (var notification in unreadNotifications) {
          final id = notification['id'];
          if (!_seenNotificationIds.contains(id)) {
            _seenNotificationIds.add(id);
            newCount++;
            
            // Show notification in notification bar
            _showNotification(
              id: id.hashCode,
              title: notification['title'] ?? 'New Notification',
              body: notification['message'] ?? '',
            );
          }
        }

        // Notify listeners if there are new notifications
        if (newCount > 0 && onNewNotifications != null) {
          onNewNotifications!(newCount);
        }

        print('✅ Checked notifications: ${unreadCount.value} unread, $newCount new');
      } else if (response.statusCode == 401) {
        print('⚠️ Authentication failed - token may be invalid');
      } else if (response.statusCode == 404) {
        print('⚠️ Notifications API not available (404)');
      } else {
        print('⚠️ Unexpected response: ${response.statusCode}');
      }
    } on TimeoutException {
      print('⏱️ Notification check timed out - backend may be slow');
    } catch (e) {
      print('❌ Error checking notifications: $e');
    }
  }

  // Show notification in system notification bar
  void _showNotification({
    required int id,
    required String title,
    required String body,
  }) {
    // Use Firebase Messaging to show notification
    // This will appear in the Android notification bar
    print('🔔 Showing notification: $title');
    // Note: Notifications are automatically shown by Firebase when received
    // For polling-detected notifications, we just log them
    // The user will see them when they open the notifications screen
  }

  // Clear seen notifications (call when user opens notifications screen)
  void clearSeenNotifications() {
    _seenNotificationIds.clear();
  }

  // Manually trigger a notification check
  Future<void> checkNow() async {
    await _checkForNewNotifications();
  }
}
