import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../services/notification_polling_service.dart';
import '../theme/app_theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final AuthService _authService = AuthService();
  final ApiService _apiService = ApiService();
  
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = false;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    // Trigger immediate notification check
    NotificationPollingService().checkNow();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
      _hasError = false;
    });

    try {
      final token = await _authService.getToken();
      if (token == null) {
        throw Exception('Not authenticated');
      }

      final response = await http.get(
        Uri.parse('${_apiService.baseUrl}/notifications'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _notifications = List<Map<String, dynamic>>.from(data);
        });
      } else if (response.statusCode == 404) {
        // Notifications API not implemented yet - show empty state
        setState(() {
          _notifications = [];
        });
      } else {
        throw Exception('Failed to load notifications');
      }
    } catch (e) {
      if (mounted) {
         setState(() => _hasError = true);
         // Don't show snackbar on init load failure, just UI state
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _deleteNotification(String notificationId, int index) async {
    try {
      final token = await _authService.getToken();
      if (token == null) throw Exception('Not authenticated');

      final response = await http.delete(
        Uri.parse('${_apiService.baseUrl}/notifications/$notificationId'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200 || response.statusCode == 204) {
        setState(() {
          _notifications.removeAt(index);
        });
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Notification deleted'),
              backgroundColor: AppTheme.successClean,
            ),
          );
        }
      } else {
        throw Exception('Failed to delete notification');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: AppTheme.errorDanger,
          ),
        );
      }
    }
  }

  Future<void> _markAsRead(String notificationId, int index) async {
    try {
      final token = await _authService.getToken();
      if (token == null) throw Exception('Not authenticated');

      final response = await http.patch(
        Uri.parse('${_apiService.baseUrl}/notifications/$notificationId/read'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        setState(() {
          _notifications[index]['isRead'] = true;
        });
      }
    } catch (e) {
      print('Error marking as read: $e');
    }
  }

  String _getTimeAgo(String? dateString) {
    if (dateString == null) return 'Recently';
    try {
      final date = DateTime.parse(dateString);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inDays > 7) {
        return '${(difference.inDays / 7).floor()}w ago';
      } else if (difference.inDays > 0) {
        return '${difference.inDays}d ago';
      } else if (difference.inHours > 0) {
        return '${difference.inHours}h ago';
      } else if (difference.inMinutes > 0) {
        return '${difference.inMinutes}m ago';
      } else {
        return 'Just now';
      }
    } catch (e) {
      return 'Recently';
    }
  }

  IconData _getNotificationIcon(String? type) {
    switch (type) {
      case 'booking': return Icons.calendar_today_rounded;
      case 'payment': return Icons.payment_rounded;
      case 'promotion': return Icons.local_offer_rounded;
      case 'reminder': return Icons.alarm_rounded;
      default: return Icons.notifications_rounded;
    }
  }

  Color _getNotificationColor(String? type) {
    switch (type) {
      case 'booking': return AppTheme.primaryBlue;
      case 'payment': return AppTheme.successClean;
      case 'promotion': return AppTheme.warningDirty; // Orange
      case 'reminder': return Colors.purple;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: SafeArea(
        child: Column(
          children: [
             // Header
             Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              child: Row(
                children: [
                   Container(
                     decoration: BoxDecoration(
                       color: Colors.white,
                       shape: BoxShape.circle,
                       boxShadow: AppTheme.defaultCardShadow,
                     ),
                     child: IconButton(
                       icon: const Icon(Icons.arrow_back_ios_new, size: 20, color: AppTheme.textPrimary),
                       onPressed: () => Navigator.pop(context),
                     ),
                   ),
                   const SizedBox(width: 16),
                   const Text('Notifications', style: AppTheme.heading2),
                   const Spacer(),
                   if (_notifications.isNotEmpty)
                      TextButton(
                        onPressed: () {
                          // TODO: Mark all as read
                           ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Marked all as read')),
                           );
                        },
                        child: const Text('Mark all read', style: TextStyle(color: AppTheme.primaryBlue))
                      )
                ]
              )
            ),
            
            Expanded(
              child: RefreshIndicator(
                onRefresh: _loadNotifications,
                child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _hasError
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline, size: 64, color: AppTheme.errorDanger),
                            const SizedBox(height: 16),
                            const Text('Failed to load notifications', style: AppTheme.heading3),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _loadNotifications,
                              child: const Text('Retry'),
                            )
                          ],
                        )
                      )
                    : _notifications.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.notifications_none_rounded, size: 80, color: Colors.grey[300]),
                              const SizedBox(height: 16),
                              Text('No notifications', style: AppTheme.heading3.copyWith(color: AppTheme.textSecondary)),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(20),
                          itemCount: _notifications.length,
                          itemBuilder: (context, index) {
                            final notification = _notifications[index];
                            final isRead = notification['isRead'] ?? false;
                            
                            return Dismissible(
                              key: Key(notification['id'] ?? index.toString()),
                              background: Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                decoration: BoxDecoration(
                                  color: AppTheme.errorDanger,
                                  borderRadius: BorderRadius.circular(16)
                                ),
                                alignment: Alignment.centerRight,
                                padding: const EdgeInsets.only(right: 20),
                                child: const Icon(Icons.delete, color: Colors.white),
                              ),
                              direction: DismissDirection.endToStart,
                              onDismissed: (_) {
                                if (notification['id'] != null) {
                                  _deleteNotification(notification['id'], index);
                                }
                              },
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                decoration: BoxDecoration(
                                  color: isRead ? Colors.white.withOpacity(0.8) : Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: AppTheme.defaultCardShadow,
                                  border: isRead ? null : Border.all(color: AppTheme.primaryBlue.withOpacity(0.3), width: 1),
                                ),
                                child: ListTile(
                                  contentPadding: const EdgeInsets.all(16),
                                  leading: Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: _getNotificationColor(notification['type']).withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Icon(
                                      _getNotificationIcon(notification['type']), 
                                      color: _getNotificationColor(notification['type']),
                                    ),
                                  ),
                                  title: Text(
                                    notification['title'] ?? 'Notification',
                                    style: TextStyle(
                                      fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  subtitle: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const SizedBox(height: 4),
                                      Text(notification['message'] ?? '', style: AppTheme.bodySmall),
                                      const SizedBox(height: 8),
                                      Text(
                                        _getTimeAgo(notification['createdAt']),
                                        style: TextStyle(color: Colors.grey[400], fontSize: 12),
                                      ),
                                    ],
                                  ),
                                  onTap: () {
                                    if (!isRead && notification['id'] != null) {
                                      _markAsRead(notification['id'], index);
                                    }
                                  },
                                ),
                              ),
                            );
                          },
                        ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
