import 'package:flutter/material.dart';
import '../models/service.dart';
import '../models/vehicle.dart';
import '../theme/app_theme.dart';
import '../utils/currency_formatter.dart';
import 'package:intl/intl.dart';

class BookingSummaryCard extends StatelessWidget {
  final Service service;
  final Vehicle? vehicle;
  final DateTime date;
  final TimeOfDay? time;
  final int? bayNumber;
  final double totalPrice;

  const BookingSummaryCard({
    super.key,
    required this.service,
    required this.vehicle,
    required this.date,
    required this.time,
    this.bayNumber,
    required this.totalPrice,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Booking Summary',
              style: AppTheme.heading3,
            ),
            const SizedBox(height: 16),
            
            _buildRow(Icons.cleaning_services, 'Service', service.name),
            const SizedBox(height: 12),
            
            _buildRow(
              Icons.calendar_today, 
              'Date', 
              DateFormat('MMM d, y').format(date)
            ),
            const SizedBox(height: 12),
            
            if (time != null) ...[
              _buildRow(
                Icons.access_time, 
                'Time', 
                time!.format(context)
              ),
              const SizedBox(height: 12),
            ],

            if (bayNumber != null) ...[
              _buildRow(
                Icons.garage, 
                'Bay', 
                'Bay $bayNumber'
              ),
              const SizedBox(height: 12),
            ],

            if (vehicle != null) ...[
              _buildRow(
                Icons.directions_car, 
                'Vehicle', 
                '${vehicle!.color} ${vehicle!.fullName} (${vehicle!.licensePlate})'
              ),
              const SizedBox(height: 12),
            ],

            const Divider(),
            const SizedBox(height: 12),
            
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total Price',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textSecondary,
                  ),
                ),
                Text(
                  CurrencyFormatter.format(totalPrice),
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryWater,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppTheme.primaryWater),
        const SizedBox(width: 12),
        SizedBox(
          width: 70,
          child: Text(
            label,
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 14,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: AppTheme.textPrimary,
            ),
            textAlign: TextAlign.right,
          ),
        ),
      ],
    );
  }
}
