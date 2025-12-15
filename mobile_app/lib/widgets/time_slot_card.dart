import 'package:flutter/material.dart';
import '../models/bay_availability.dart';
import 'bay_grid.dart';

class TimeSlotCard extends StatelessWidget {
  final BayAvailability slot;
  final Function(Bay) onBayTap;

  const TimeSlotCard({
    Key? key,
    required this.slot,
    required this.onBayTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.access_time,
                      color: Color(0xFF0EA5E9),
                      size: 24,
                    ),
                    SizedBox(width: 8),
                    Text(
                      slot.time,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                _buildAvailabilityChip(),
              ],
            ),
            SizedBox(height: 16),
            BayGrid(
              bays: slot.bays,
              onBayTap: onBayTap,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvailabilityChip() {
    final isAvailable = slot.isAvailable;
    final color = isAvailable ? Colors.green : Colors.red;
    final bgColor = isAvailable ? Colors.green[50] : Colors.red[50];

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color!, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isAvailable ? Icons.check_circle : Icons.cancel,
            color: color,
            size: 16,
          ),
          SizedBox(width: 4),
          Text(
            '${slot.availableCount}/${slot.capacity} available',
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
