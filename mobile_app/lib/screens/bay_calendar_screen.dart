import 'package:flutter/material.dart';
import '../models/bay_availability.dart';
import '../services/availability_service.dart';
import '../widgets/time_slot_card.dart';

class BayCalendarScreen extends StatefulWidget {
  final String centerId;
  final String centerName;

  const BayCalendarScreen({
    Key? key,
    required this.centerId,
    required this.centerName,
  }) : super(key: key);

  @override
  _BayCalendarScreenState createState() => _BayCalendarScreenState();
}

class _BayCalendarScreenState extends State<BayCalendarScreen> {
  final AvailabilityService _availabilityService = AvailabilityService();
  List<BayAvailability> _slots = [];
  DateTime _selectedDate = DateTime.now();
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadAvailability();
  }

  Future<void> _loadAvailability() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final slots = await _availabilityService.getAvailability(
        widget.centerId,
        _selectedDate,
      );
      setState(() {
        _slots = slots;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load availability: $e';
        _isLoading = false;
      });
    }
  }

  void _changeDate(int days) {
    setState(() {
      _selectedDate = _selectedDate.add(Duration(days: days));
    });
    _loadAvailability();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.centerName),
        backgroundColor: Color(0xFF0EA5E9),
      ),
      body: Column(
        children: [
          _buildDateSelector(),
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildDateSelector() {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: Icon(Icons.chevron_left),
            onPressed: () => _changeDate(-1),
          ),
          Column(
            children: [
              Text(
                _formatDate(_selectedDate),
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                _formatWeekday(_selectedDate),
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
          IconButton(
            icon: Icon(Icons.chevron_right),
            onPressed: () => _changeDate(1),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (_isLoading) {
      return Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0EA5E9)),
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red),
            SizedBox(height: 16),
            Text(_error!, textAlign: TextAlign.center),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadAvailability,
              child: Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_slots.isEmpty) {
      return Center(
        child: Text('No time slots available for this date'),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadAvailability,
      child: ListView.builder(
        padding: EdgeInsets.all(16),
        itemCount: _slots.length,
        itemBuilder: (context, index) {
          return TimeSlotCard(
            slot: _slots[index],
            onBayTap: (bay) => _showBayDetails(bay, _slots[index].time),
          );
        },
      ),
    );
  }

  void _showBayDetails(Bay bay, String time) {
    showModalBottomSheet(
      context: context,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _buildBayDetailSheet(bay, time),
    );
  }

  Widget _buildBayDetailSheet(Bay bay, String time) {
    return Container(
      padding: EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bay ${bay.bayNumber} - $time',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 16),
          if (bay.isAvailable) ...[
            Icon(Icons.check_circle, color: Colors.green, size: 48),
            SizedBox(height: 8),
            Text('Available', style: TextStyle(fontSize: 18)),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _navigateToBooking(bay.bayNumber, time);
              },
              child: Text('Book Bay ${bay.bayNumber}'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFF0EA5E9),
                minimumSize: Size(double.infinity, 48),
              ),
            ),
          ] else ...[
            Icon(Icons.directions_car, color: Colors.blue, size: 48),
            SizedBox(height: 8),
            Text('Occupied', style: TextStyle(fontSize: 18)),
            SizedBox(height: 16),
            _buildInfoRow(Icons.person, bay.booking!.customerName),
            _buildInfoRow(Icons.directions_car, bay.booking!.vehicle),
            _buildInfoRow(
              Icons.confirmation_number,
              bay.booking!.licensePlate,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey[600]),
          SizedBox(width: 8),
          Text(text),
        ],
      ),
    );
  }

  void _navigateToBooking(int bayNumber, String time) {
    // Navigate to booking screen with pre-selected bay and time
    // Navigator.push(context, MaterialPageRoute(builder: (context) => BookingScreen(...)));
  }

  String _formatDate(DateTime date) {
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  String _formatWeekday(DateTime date) {
    final weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return weekdays[date.weekday - 1];
  }
}
