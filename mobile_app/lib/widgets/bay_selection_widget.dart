import 'package:flutter/material.dart';
import '../models/bay_availability.dart';
import '../services/availability_service.dart';
import '../widgets/bay_grid.dart';

class BaySelectionWidget extends StatefulWidget {
  final String centerId;
  final DateTime selectedDate;
  final String selectedTime;
  final Function(int) onBaySelected;
  final int? selectedBay;

  const BaySelectionWidget({
    Key? key,
    required this.centerId,
    required this.selectedDate,
    required this.selectedTime,
    required this.onBaySelected,
    this.selectedBay,
  }) : super(key: key);

  @override
  _BaySelectionWidgetState createState() => _BaySelectionWidgetState();
}

class _BaySelectionWidgetState extends State<BaySelectionWidget> {
  final AvailabilityService _availabilityService = AvailabilityService();
  List<Bay> _bays = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadBays();
  }

  @override
  void didUpdateWidget(BaySelectionWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedDate != widget.selectedDate ||
        oldWidget.selectedTime != widget.selectedTime) {
      _loadBays();
    }
  }

  Future<void> _loadBays() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final slots = await _availabilityService.getAvailability(
        widget.centerId,
        widget.selectedDate,
      );

      // Find the slot matching the selected time
      final matchingSlot = slots.firstWhere(
        (slot) => slot.time == widget.selectedTime,
        orElse: () => BayAvailability(
          time: widget.selectedTime,
          capacity: 0,
          bays: [],
          availableCount: 0,
          isAvailable: false,
        ),
      );

      setState(() {
        _bays = matchingSlot.bays;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load bay availability: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
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
              children: [
                Icon(Icons.local_parking, color: Color(0xFF0EA5E9)),
                SizedBox(width: 8),
                Text(
                  'Select Your Bay',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            SizedBox(height: 4),
            Text(
              'Choose an available bay for ${widget.selectedTime}',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 14,
              ),
            ),
            SizedBox(height: 16),
            if (_isLoading)
              Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0EA5E9)),
                  ),
                ),
              )
            else if (_error != null)
              Center(
                child: Column(
                  children: [
                    Icon(Icons.error_outline, size: 48, color: Colors.red),
                    SizedBox(height: 8),
                    Text(_error!, textAlign: TextAlign.center),
                    SizedBox(height: 8),
                    TextButton(
                      onPressed: _loadBays,
                      child: Text('Retry'),
                    ),
                  ],
                ),
              )
            else if (_bays.isEmpty)
              Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: Column(
                    children: [
                      Icon(Icons.event_busy, size: 48, color: Colors.grey),
                      SizedBox(height: 8),
                      Text('No bays available for this time'),
                    ],
                  ),
                ),
              )
            else
              Column(
                children: [
                  BayGrid(
                    bays: _bays,
                    selectedBay: widget.selectedBay,
                    onBayTap: (bay) {
                      if (bay.isAvailable) {
                        widget.onBaySelected(bay.bayNumber);
                      } else {
                        _showOccupiedBayDialog(bay);
                      }
                    },
                  ),
                  SizedBox(height: 16),
                  _buildLegend(),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildLegend() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildLegendItem(Colors.green, 'Available'),
        SizedBox(width: 16),
        _buildLegendItem(Colors.blue, 'Occupied'),
        SizedBox(width: 16),
        _buildLegendItem(Color(0xFF0EA5E9), 'Selected'),
      ],
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color.withOpacity(0.2),
            border: Border.all(color: color, width: 2),
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
        ),
      ],
    );
  }

  void _showOccupiedBayDialog(Bay bay) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Bay ${bay.bayNumber} Occupied'),
        content: const Text('This bay is currently reserved.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey[600]),
          SizedBox(width: 8),
          Text(text),
        ],
      ),
    );
  }
}
