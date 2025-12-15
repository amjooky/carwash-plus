import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../models/booking.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../utils/currency_formatter.dart';
import '../theme/app_theme.dart';
import '../widgets/water_drop_loader.dart';
import '../widgets/themed_widgets.dart';
import 'onboarding/auth_choice_screen.dart';

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({super.key});

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  late TabController _tabController;
  List<Booking> _bookings = [];
  bool _isLoading = true;
  String? _errorMessage;
  Timer? _pollingTimer;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadBookings();
    
    // Auto-fetch every 15 seconds without disturbing UI
    _pollingTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      _loadBookings(silent: true);
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadBookings({bool silent = false}) async {
    if (!silent) {
      if (mounted) {
        setState(() {
          _isLoading = true;
          _errorMessage = null;
        });
      }
    }

    try {
      final bookings = await _apiService.getUserBookings('1'); // Use actual logic for ID if needed, or '1' if backend handles it from token
      if (mounted) {
        setState(() {
          _bookings = bookings;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        if (!silent) {
          setState(() {
            _isLoading = false;
            _errorMessage = e.toString();
          });
        }
        
        // If authentication error, logout to guest mode
        if (e.toString().contains('Authentication failed')) {
          _pollingTimer?.cancel();
          context.read<AuthProvider>().logout();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Session expired. Switching to guest mode.')),
          );
        }
      }
    }
  }

  Future<void> _handleRefresh() async {
    await _loadBookings(silent: true);
  }

  List<Booking> get _upcomingBookings {
    final now = DateTime.now();
    return _bookings
        .where((b) {
          final isCompletedOrCancelled = b.status == BookingStatus.completed || 
                                       b.status == BookingStatus.cancelled;
          if (isCompletedOrCancelled) return false;
          
          final isFuture = b.scheduledTime.isAfter(now) || 
                          b.scheduledTime.isAtSameMomentAs(now);
          return isFuture;
        })
        .toList()
      ..sort((a, b) => a.scheduledTime.compareTo(b.scheduledTime));
  }

  List<Booking> get _pastBookings {
    return _bookings
        .where((b) =>
            b.status == BookingStatus.completed ||
            b.status == BookingStatus.cancelled ||
            b.scheduledTime.isBefore(DateTime.now()))
        .toList()
      ..sort((a, b) => b.scheduledTime.compareTo(a.scheduledTime));
  }

  String _getStatusText(BookingStatus status) {
    switch (status) {
      case BookingStatus.pending: return 'Pending';
      case BookingStatus.confirmed: return 'Confirmed';
      case BookingStatus.inProgress: return 'In Progress';
      case BookingStatus.completed: return 'Completed';
      case BookingStatus.cancelled: return 'Cancelled';
    }
  }

  Color _getStatusColor(BookingStatus status) {
    switch (status) {
      case BookingStatus.pending: return AppTheme.warningDirty;
      case BookingStatus.confirmed: return AppTheme.successClean;
      case BookingStatus.inProgress: return AppTheme.infoProgress;
      case BookingStatus.completed: return AppTheme.mediumText;
      case BookingStatus.cancelled: return AppTheme.errorDanger;
    }
  }

  Future<void> _cancelBooking(Booking booking) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Booking'),
        content: const Text('Are you sure you want to cancel this booking?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Yes'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final success = await _apiService.cancelBooking(booking.id);
      if (success) {
        if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Booking cancelled successfully')),
            );
            _loadBookings();
        }
      } else {
        if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Failed to cancel booking'),
                backgroundColor: Colors.red,
            ),
            );
        }
      }
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
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('My Bookings', style: AppTheme.heading1),
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
            const SizedBox(height: 16),
            
            // Custom Tab Bar
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: AppTheme.defaultCardShadow,
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: AppTheme.primaryBlue,
                  boxShadow: [
                      BoxShadow(
                          color: AppTheme.primaryBlue.withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                      )
                  ]
                ),
                labelColor: Colors.white,
                unselectedLabelColor: AppTheme.textSecondary,
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                padding: const EdgeInsets.all(4),
                labelStyle: const TextStyle(fontWeight: FontWeight.bold),
                tabs: const [
                  Tab(text: 'Upcoming'),
                  Tab(text: 'History'),
                ],
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Content
            Expanded(
              child: _isLoading && _bookings.isEmpty
                  ? const Center(child: WaterDropLoader())
                  : _errorMessage != null
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.error_outline, size: 48, color: Colors.red),
                              const SizedBox(height: 16),
                              Text('Error loading bookings', style: AppTheme.heading3),
                              TextButton(onPressed: _loadBookings, child: const Text('Retry'))
                            ],
                          )
                        ) 
                      : TabBarView(
                          controller: _tabController,
                          children: [
                            _buildBookingsList(_upcomingBookings, isUpcoming: true),
                            _buildBookingsList(_pastBookings, isUpcoming: false),
                          ],
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingsList(List<Booking> bookings, {required bool isUpcoming}) {
    if (bookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isUpcoming ? Icons.calendar_today_rounded : Icons.history_rounded,
              size: 64,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              isUpcoming ? 'No upcoming bookings' : 'No booking history',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey.shade500,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _handleRefresh,
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: bookings.length,
        itemBuilder: (context, index) {
          final booking = bookings[index];
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
                onTap: () => _showBookingDetails(booking),
                borderRadius: BorderRadius.circular(16),
                child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                        Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                            Expanded(
                            child: Text(
                                booking.carWashName,
                                style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                ),
                            ),
                            ),
                            Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                    color: _getStatusColor(booking.status).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                    _getStatusText(booking.status),
                                    style: TextStyle(
                                        color: _getStatusColor(booking.status),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                    ),
                                ),
                            ),
                        ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                        children: [
                            Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                    color: Colors.blue.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.cleaning_services, size: 16, color: Colors.blue),
                            ),
                            const SizedBox(width: 12),
                            Text(booking.serviceType, style: const TextStyle(fontWeight: FontWeight.w500)),
                        ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                        children: [
                            Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                    color: Colors.orange.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.calendar_today, size: 16, color: Colors.orange),
                            ),
                            const SizedBox(width: 12),
                            Text(
                            DateFormat('MMM d, h:mm a').format(booking.scheduledTime),
                            style: const TextStyle(fontWeight: FontWeight.w500),
                            ),
                        ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                            Text(
                                CurrencyFormatter.format(booking.price),
                                style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryBlue,
                                ),
                            ),
                            if (isUpcoming && booking.status != BookingStatus.cancelled)
                            TextButton(
                                onPressed: () => _cancelBooking(booking),
                                style: TextButton.styleFrom(
                                foregroundColor: Colors.red,
                                padding: EdgeInsets.zero,
                                minimumSize: const Size(60, 30),
                                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                child: const Text('Cancel'),
                            ),
                        ],
                        ),
                    ],
                    ),
                ),
                ),
            ),
          );
        },
      ),
    );
  }

  void _showBookingDetails(Booking booking) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.75,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        builder: (context, scrollController) => Container(
            decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: SingleChildScrollView(
            controller: scrollController,
            padding: const EdgeInsets.all(24),
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                Center(
                    child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                    ),
                    ),
                ),
                const SizedBox(height: 24),
                Text(
                    booking.carWashName,
                    style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    ),
                ),
                const SizedBox(height: 24),
                Center(
                    child: Column(
                    children: [
                        Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: AppTheme.defaultCardShadow,
                            border: Border.all(color: Colors.grey.shade100),
                        ),
                        child: QrImageView(
                            data: booking.id,
                            version: QrVersions.auto,
                            size: 180.0,
                        ),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                        'Show this QR code at the center',
                        style: TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                        ),
                        ),
                    ],
                    ),
                ),
                const SizedBox(height: 32),
                _buildDetailRow('Booking ID', booking.id),
                _buildDetailRow('Service', booking.serviceType),
                _buildDetailRow(
                    'Date & Time',
                    DateFormat('EEEE, MMMM d, y \'at\' h:mm a')
                        .format(booking.scheduledTime),
                ),
                _buildDetailRow('Vehicle', booking.vehicleType),
                if (booking.vehiclePlate != null)
                    _buildDetailRow('License Plate', booking.vehiclePlate!),
                _buildDetailRow(
                    'Price',
                    CurrencyFormatter.format(booking.price),
                    isPrice: true,
                ),
                _buildDetailRow('Status', _getStatusText(booking.status)),
                if (booking.notes != null && booking.notes!.isNotEmpty)
                    _buildDetailRow('Notes', booking.notes!),
                const SizedBox(height: 32),
                if (booking.status != BookingStatus.cancelled &&
                    booking.status != BookingStatus.completed)
                    SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                        onPressed: () {
                        Navigator.pop(context);
                        _cancelBooking(booking);
                        },
                        style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                        ),
                        ),
                        child: const Text('Cancel Booking'),
                    ),
                    ),
                ],
            ),
            ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isPrice = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 14,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 15,
                color: isPrice ? AppTheme.primaryBlue : Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
