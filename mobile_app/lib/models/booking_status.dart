enum BookingStatusType {
  PENDING,
  CONFIRMED,
  BAY_ASSIGNED,
  WAITING_ARRIVAL,
  IN_PROGRESS,
  COMPLETED,
  CANCELLED
}

class BookingStatus {
  final String bookingId;
  final BookingStatusType status;
  final int? bayNumber;
  final String? staffName;
  final DateTime? estimatedCompletion;
  final String message;

  BookingStatus({
    required this.bookingId,
    required this.status,
    this.bayNumber,
    this.staffName,
    this.estimatedCompletion,
    required this.message,
  });

  factory BookingStatus.fromJson(Map<String, dynamic> json) {
    return BookingStatus(
      bookingId: json['bookingId'],
      status: _parseStatus(json['status']),
      bayNumber: json['bayNumber'],
      staffName: json['staffName'],
      estimatedCompletion: json['estimatedCompletion'] != null
          ? DateTime.parse(json['estimatedCompletion'])
          : null,
      message: json['message'] ?? '',
    );
  }

  static BookingStatusType _parseStatus(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return BookingStatusType.PENDING;
      case 'CONFIRMED':
        return BookingStatusType.CONFIRMED;
      case 'BAY_ASSIGNED':
        return BookingStatusType.BAY_ASSIGNED;
      case 'WAITING_ARRIVAL':
        return BookingStatusType.WAITING_ARRIVAL;
      case 'IN_PROGRESS':
        return BookingStatusType.IN_PROGRESS;
      case 'COMPLETED':
        return BookingStatusType.COMPLETED;
      case 'CANCELLED':
        return BookingStatusType.CANCELLED;
      default:
        return BookingStatusType.PENDING;
    }
  }

  String get statusText {
    switch (status) {
      case BookingStatusType.PENDING:
        return 'Pending Confirmation';
      case BookingStatusType.CONFIRMED:
        return 'Confirmed';
      case BookingStatusType.BAY_ASSIGNED:
        return 'Bay Assigned';
      case BookingStatusType.WAITING_ARRIVAL:
        return 'Waiting for You';
      case BookingStatusType.IN_PROGRESS:
        return 'Wash in Progress';
      case BookingStatusType.COMPLETED:
        return 'Completed';
      case BookingStatusType.CANCELLED:
        return 'Cancelled';
    }
  }
}
