import 'package:flutter/material.dart';
import '../models/booking_status.dart';

class StatusTimeline extends StatelessWidget {
  final BookingStatus status;

  const StatusTimeline({
    Key? key,
    required this.status,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final steps = _getTimelineSteps();
    final currentIndex = _getCurrentStepIndex();

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Progress',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            ...steps.asMap().entries.map((entry) {
              final index = entry.key;
              final step = entry.value;
              final isCompleted = index < currentIndex;
              final isCurrent = index == currentIndex;
              final isLast = index == steps.length - 1;

              return _TimelineItem(
                step: step,
                isCompleted: isCompleted,
                isCurrent: isCurrent,
                isLast: isLast,
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  List<_TimelineStep> _getTimelineSteps() {
    return [
      _TimelineStep('Booking Confirmed', Icons.check_circle),
      _TimelineStep('Bay Assigned', Icons.local_parking),
      _TimelineStep('Waiting for Arrival', Icons.schedule),
      _TimelineStep('Wash in Progress', Icons.water_drop),
      _TimelineStep('Completed', Icons.done_all),
    ];
  }

  int _getCurrentStepIndex() {
    switch (status.status) {
      case BookingStatusType.PENDING:
      case BookingStatusType.CONFIRMED:
        return 0;
      case BookingStatusType.BAY_ASSIGNED:
        return 1;
      case BookingStatusType.WAITING_ARRIVAL:
        return 2;
      case BookingStatusType.IN_PROGRESS:
        return 3;
      case BookingStatusType.COMPLETED:
        return 4;
      case BookingStatusType.CANCELLED:
        return 0;
    }
  }
}

class _TimelineStep {
  final String title;
  final IconData icon;

  _TimelineStep(this.title, this.icon);
}

class _TimelineItem extends StatelessWidget {
  final _TimelineStep step;
  final bool isCompleted;
  final bool isCurrent;
  final bool isLast;

  const _TimelineItem({
    Key? key,
    required this.step,
    required this.isCompleted,
    required this.isCurrent,
    required this.isLast,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final color = isCompleted
        ? Colors.green
        : isCurrent
            ? Color(0xFF0EA5E9)
            : Colors.grey;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color,
                shape: BoxShape.circle,
              ),
              child: Icon(
                step.icon,
                color: Colors.white,
                size: 20,
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 40,
                color: isCompleted ? Colors.green : Colors.grey[300],
              ),
          ],
        ),
        SizedBox(width: 16),
        Expanded(
          child: Padding(
            padding: EdgeInsets.only(top: 8),
            child: Text(
              step.title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                color: isCurrent ? Colors.black : Colors.grey[600],
              ),
            ),
          ),
        ),
        if (isCompleted)
          Icon(Icons.check, color: Colors.green, size: 20),
      ],
    );
  }
}
