import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/booking.dart';
import '../utils/currency_formatter.dart';
import '../theme/app_theme.dart';

class BookingConfirmationScreen extends StatefulWidget {
  final Booking booking;

  const BookingConfirmationScreen({super.key, required this.booking});

  @override
  State<BookingConfirmationScreen> createState() => _BookingConfirmationScreenState();
}

class _BookingConfirmationScreenState extends State<BookingConfirmationScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _checkAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.5, curve: Curves.elasticOut),
      ),
    );

    _checkAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.5, 1.0, curve: Curves.easeOut),
      ),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              const SizedBox(height: 40),
              ScaleTransition(
                scale: _scaleAnimation,
                child: Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    color: AppTheme.successClean.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: FadeTransition(
                      opacity: _checkAnimation,
                      child: const Icon(Icons.check_circle_rounded, color: AppTheme.successClean, size: 90),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              FadeTransition(
                opacity: _checkAnimation,
                child: Column(
                  children: [
                    const Text('Booking Successful!', style: AppTheme.heading1),
                    const SizedBox(height: 8),
                    Text('Booking ID: ${widget.booking.id}', style: AppTheme.bodySmall),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              
              // Ticket Card
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: AppTheme.defaultCardShadow,
                ),
                child: Column(
                  children: [
                    // Top Section (Details)
                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          _buildInfoRow('Car Wash', widget.booking.carWashName, Icons.store_rounded),
                          const SizedBox(height: 20),
                          _buildInfoRow('Service', widget.booking.serviceType, Icons.cleaning_services_rounded),
                          const SizedBox(height: 20),
                          _buildInfoRow('Date & Time', DateFormat('EEE, MMM d • h:mm a').format(widget.booking.scheduledTime), Icons.event_rounded),
                          const SizedBox(height: 20),
                          _buildInfoRow('Vehicle', '${widget.booking.vehicleType} • ${widget.booking.vehiclePlate}', Icons.directions_car_filled_rounded),
                           const SizedBox(height: 20),
                          _buildInfoRow('Total Price', CurrencyFormatter.format(widget.booking.price), Icons.monetization_on_rounded, isPrice: true),
                        ],
                      ),
                    ),
                    
                    // Dashed Line
                     Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Row(
                          children: List.generate(30, (index) => Expanded(
                            child: Container(
                              color: index % 2 == 0 ? Colors.transparent : Colors.grey[300],
                              height: 1,
                            ),
                          )),
                        ),
                     ),

                    // Bottom Section (Status & Notes)
                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                             Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(color: _getStatusColor(widget.booking.status).withOpacity(0.1), shape: BoxShape.circle),
                                        child: Icon(Icons.info_outline_rounded, color: _getStatusColor(widget.booking.status), size: 16),
                                    ),
                                    const SizedBox(width: 8),
                                    Text('Status', style: AppTheme.bodySmall),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: _getStatusColor(widget.booking.status).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    _getStatusText(widget.booking.status),
                                    style: TextStyle(
                                      color: _getStatusColor(widget.booking.status),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            if (widget.booking.notes != null && widget.booking.notes!.isNotEmpty) ...[
                              const SizedBox(height: 16),
                               Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                    const Icon(Icons.note_rounded, size: 16, color: Colors.grey),
                                    const SizedBox(width: 8),
                                    Expanded(child: Text('Note: ${widget.booking.notes!}', style: AppTheme.bodySmall)),
                                ],
                               )
                            ]
                        ],
                      ),
                    )
                  ],
                ),
              ),

              const SizedBox(height: 40),
              
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    // Go to home, clear stack
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 4,
                  ),
                  child: const Text('Back to Home', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () {
                     // In a real app you might find the Tabs route and switch index, 
                     // but popUntil first is safest.
                     Navigator.of(context).popUntil((route) => route.isFirst);
                     // Ideally we would navigate to Bookings tab here, 
                     // but that requires access to HomeScreen state or a route argument.
                     // The user can navigate there from Home.
                  },
                  child: const Text('View My Bookings', style: TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon, {bool isPrice = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(icon, color: Colors.grey[400], size: 20),
            const SizedBox(width: 12),
            Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 14)),
          ],
        ),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 150),
          child: Text(
            value, 
            textAlign: TextAlign.right,
            style: TextStyle(
              fontWeight: FontWeight.bold, 
              fontSize: 16, 
              color: isPrice ? AppTheme.primaryBlue : AppTheme.textPrimary
            ), 
            overflow: TextOverflow.ellipsis
          ),
        ),
      ],
    );
  }
}
