import 'package:flutter/material.dart';
import '../models/bay_availability.dart';
import '../services/availability_service.dart';
import 'package:intl/intl.dart';

class TimeSlotGrid extends StatefulWidget {
  final String centerId;
  final DateTime selectedDate;
  final String? selectedTime;
  final Function(String) onTimeSelected;

  const TimeSlotGrid({
    Key? key,
    required this.centerId,
    required this.selectedDate,
    required this.selectedTime,
    required this.onTimeSelected,
  }) : super(key: key);

  @override
  State<TimeSlotGrid> createState() => _TimeSlotGridState();
}

class _TimeSlotGridState extends State<TimeSlotGrid> {
  final AvailabilityService _availabilityService = AvailabilityService();
  List<BayAvailability> _slots = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadAvailability();
  }

  @override
  void didUpdateWidget(TimeSlotGrid oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!_isSameDay(oldWidget.selectedDate, widget.selectedDate)) {
      _loadAvailability();
    }
  }

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  Future<void> _loadAvailability() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final slots = await _availabilityService.getAvailability(
        widget.centerId,
        widget.selectedDate,
      );

      // Filter passed time if today
      final now = DateTime.now();
      List<BayAvailability> filteredSlots = slots;

      if (_isSameDay(now, widget.selectedDate)) {
        filteredSlots = slots.where((slot) {
          final parts = slot.time.split(':');
          final h = int.parse(parts[0]);
          final m = int.parse(parts[1]);
          final slotDate = DateTime(now.year, now.month, now.day, h, m);
          return slotDate.isAfter(now);
        }).toList();
      }

      setState(() {
        _slots = filteredSlots;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load slots';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    
    if (_error != null) {
      return Center(
        child: TextButton(
          onPressed: _loadAvailability,
          child: const Text('Retry loading slots'),
        ),
      );
    }

    if (_slots.isEmpty) {
      return const Center(child: Text('No slots available for this date'));
    }

    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 2.2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
      ),
      itemCount: _slots.length,
      itemBuilder: (context, index) {
        final slot = _slots[index];
        final isSelected = widget.selectedTime == slot.time;
        final isAvailable = slot.isAvailable;
        
        // Parse time to display AM/PM format
        final timeParts = slot.time.split(':');
        final timeOfDay = TimeOfDay(hour: int.parse(timeParts[0]), minute: int.parse(timeParts[1]));
        final formattedTime = timeOfDay.format(context);

        return Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: isAvailable ? () => widget.onTimeSelected(slot.time) : null,
            borderRadius: BorderRadius.circular(8),
            child: Container(
              decoration: BoxDecoration(
                color: isSelected 
                    ? const Color(0xFF0EA5E9) 
                    : (isAvailable ? Colors.white : Colors.grey.shade100),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isSelected 
                      ? const Color(0xFF0EA5E9) 
                      : (isAvailable ? Colors.grey.shade300 : Colors.grey.shade200),
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    formattedTime,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isSelected 
                          ? Colors.white 
                          : (isAvailable ? Colors.black87 : Colors.grey),
                    ),
                  ),
                  if (slot.availableCount > 0)
                    Text(
                      '${slot.availableCount} free',
                      style: TextStyle(
                        fontSize: 10,
                        color: isSelected 
                            ? Colors.white.withOpacity(0.9) 
                            : Colors.green,
                      ),
                    )
                  else
                    Text(
                      'Full',
                      style: TextStyle(
                        fontSize: 10,
                        color: isSelected 
                            ? Colors.white.withOpacity(0.9) 
                            : Colors.red,
                      ),
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
