import 'package:flutter/material.dart';
import '../models/booking_status.dart';
import '../widgets/status_timeline.dart';

class BookingTrackerScreen extends StatefulWidget {
  final String bookingId;

  const BookingTrackerScreen({
    Key? key,
    required this.bookingId,
  }) : super(key: key);

  @override
  _BookingTrackerScreenState createState() => _BookingTrackerScreenState();
}

class _BookingTrackerScreenState extends State<BookingTrackerScreen> {
  BookingStatus? _currentStatus;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBookingStatus();
    // TODO: Initialize WebSocket connection
  }

  Future<void> _loadBookingStatus() async {
    // TODO: Fetch initial booking status from API
    // For now, using mock data
    await Future.delayed(Duration(seconds: 1));
    setState(() {
      _currentStatus = BookingStatus(
        bookingId: widget.bookingId,
        status: BookingStatusType.BAY_ASSIGNED,
        bayNumber: 3,
        staffName: 'Mike Johnson',
        message: 'Your bay is ready! Please proceed to Bay 3.',
      );
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Booking Tracker'),
        backgroundColor: Color(0xFF0EA5E9),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildBookingHeader(),
                  SizedBox(height: 24),
                  _buildStatusCard(),
                  SizedBox(height: 24),
                  StatusTimeline(status: _currentStatus!),
                  SizedBox(height: 24),
                  if (_currentStatus!.bayNumber != null) _buildBayInfoCard(),
                  SizedBox(height: 24),
                  _buildQuickActions(),
                ],
              ),
            ),
    );
  }

  Widget _buildBookingHeader() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Color(0xFF0EA5E9).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.confirmation_number,
                color: Color(0xFF0EA5E9),
                size: 32,
              ),
            ),
            SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Booking #${widget.bookingId.substring(0, 8)}',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    _currentStatus!.statusText,
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard() {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF0EA5E9), Color(0xFF06B6D4)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline, color: Colors.white, size: 32),
          SizedBox(width: 16),
          Expanded(
            child: Text(
              _currentStatus!.message,
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBayInfoCard() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your Bay',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Color(0xFF0EA5E9).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      '${_currentStatus!.bayNumber}',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0EA5E9),
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Bay ${_currentStatus!.bayNumber}',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (_currentStatus!.staffName != null) ...[
                        SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(Icons.person, size: 16, color: Colors.grey[600]),
                            SizedBox(width: 4),
                            Text(
                              _currentStatus!.staffName!,
                              style: TextStyle(color: Colors.grey[600]),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () {
              // TODO: Navigate to bay location
            },
            icon: Icon(Icons.navigation),
            label: Text('Navigate'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Color(0xFF0EA5E9),
              padding: EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),
        SizedBox(width: 12),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {
              // TODO: Call center
            },
            icon: Icon(Icons.phone),
            label: Text('Call'),
            style: OutlinedButton.styleFrom(
              foregroundColor: Color(0xFF0EA5E9),
              side: BorderSide(color: Color(0xFF0EA5E9)),
              padding: EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),
      ],
    );
  }
}
