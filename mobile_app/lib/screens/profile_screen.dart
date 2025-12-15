import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/notification_polling_service.dart';
import '../providers/auth_provider.dart';
import 'onboarding/auth_choice_screen.dart';
import 'my_cars_screen.dart';
import 'edit_profile_screen.dart';
import 'payment_methods_screen.dart';
import 'notifications_screen.dart';
import '../theme/app_theme.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final AuthService _authService = AuthService();
  final NotificationPollingService _notificationService = NotificationPollingService();
  bool _isLoggedIn = false;
  String _userName = 'Guest';
  String _userEmail = 'Not logged in';
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final isLoggedIn = await _authService.isLoggedIn();
    final user = await _authService.getUser();

    if (mounted) {
      setState(() {
        _isLoggedIn = isLoggedIn;
        if (user != null) {
          _userName = user.name;
          _userEmail = user.email;
        }
        _unreadCount = _notificationService.unreadCount.value;
      });
    }
    
    // Set up callback for notification updates
    _notificationService.onNewNotifications = (count) {
      if (mounted) {
        setState(() {
          _unreadCount = _notificationService.unreadCount.value;
        });
      }
    };
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Logout', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      if (mounted) {
        await context.read<AuthProvider>().logout();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_isLoggedIn) {
      return const Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: SafeArea(
        child: Column(
          children: [
            // Custom Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('My Profile', style: AppTheme.heading1),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: AppTheme.defaultCardShadow,
                    ),
                    padding: const EdgeInsets.all(8),
                    child: Image.asset('assets/images/logo.png', height: 32, width: 32),
                  ),
                ],
              ),
            ),
            
            Expanded(
              child: RefreshIndicator(
                onRefresh: _loadUserData,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    children: [
                      // User Card
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: AppTheme.gradientContainer(borderRadius: 20),
                        child: Row(
                          children: [
                             Container(
                              padding: const EdgeInsets.all(3),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.3),
                                shape: BoxShape.circle,
                              ),
                              child: CircleAvatar(
                                radius: 32,
                                backgroundColor: Colors.white,
                                child: Text(
                                  (_userName.isNotEmpty) ? _userName[0].toUpperCase() : 'U',
                                  style: const TextStyle(fontSize: 24, color: AppTheme.primaryBlue, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _userName,
                                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _userEmail,
                                    style: TextStyle(fontSize: 14, color: Colors.white.withOpacity(0.9)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      
                      // Menu Options
                      _buildMenuCard(
                         icon: Icons.person_outline_rounded,
                         title: 'Edit Profile',
                         subtitle: 'Update your personal info',
                         onTap: () async {
                            final result = await Navigator.push(context, MaterialPageRoute(builder: (_) => const EditProfileScreen()));
                            if (result == true) _loadUserData();
                         }
                      ),
                      _buildMenuCard(
                         icon: Icons.directions_car_filled_rounded,
                         title: 'My Vehicles',
                         subtitle: 'Manage your saved cars',
                         onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MyCarsScreen())),
                      ),
                      _buildMenuCard(
                         icon: Icons.payment_rounded,
                         title: 'Payment Methods',
                         subtitle: 'Manage cards and payments',
                         onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PaymentMethodsScreen())),
                      ),
                      
                      // Notifications
                      Stack(
                        children: [
                          _buildMenuCard(
                            icon: Icons.notifications_rounded,
                            title: 'Notifications',
                            subtitle: 'View recent updates',
                            onTap: () async {
                                await Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()));
                                _loadUserData();
                            },
                          ),
                          if (_unreadCount > 0)
                            Positioned(
                              right: 20,
                              top: 20,
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: const BoxDecoration(color: AppTheme.accentRed, shape: BoxShape.circle),
                                child: Text('$_unreadCount', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                              ),
                            ),
                        ],
                      ),

                      const SizedBox(height: 12),
                      // Logout
                      _buildMenuCard(
                        icon: Icons.logout_rounded,
                        title: 'Logout',
                        subtitle: 'Sign out of your account',
                        color: AppTheme.accentRed,
                        onTap: _logout,
                        showArrow: false,
                        textColor: AppTheme.accentRed,
                      ),
                      
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuCard({
    required IconData icon, 
    required String title, 
    required String subtitle, 
    required VoidCallback onTap,
    Color color = AppTheme.primaryBlue,
    bool showArrow = true,
    Color textColor = AppTheme.textPrimary,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppTheme.defaultCardShadow,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: color),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: AppTheme.heading3.copyWith(fontSize: 16, color: textColor)),
                      const SizedBox(height: 2),
                      Text(subtitle, style: AppTheme.bodySmall),
                    ],
                  ),
                ),
                if (showArrow)
                  Icon(Icons.chevron_right_rounded, color: Colors.grey[400]),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
