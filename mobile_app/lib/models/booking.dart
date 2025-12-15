class Booking {
  final String id;
  final String userId;
  final String carWashId;
  final String carWashName;
  final String serviceType;
  final DateTime scheduledTime;
  final String vehicleType;
  final String? vehiclePlate;
  final double price;
  final BookingStatus status;
  final DateTime createdAt;
  final String? notes;
  final String? bookingNumber;

  Booking({
    required this.id,
    required this.userId,
    required this.carWashId,
    required this.carWashName,
    required this.serviceType,
    required this.scheduledTime,
    required this.vehicleType,
    this.vehiclePlate,
    required this.price,
    required this.status,
    required this.createdAt,
    this.notes,
    this.bookingNumber,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    // Backend returns scheduledDate and scheduledTime separately
    DateTime parsedScheduledTime;
    if (json['scheduledDate'] != null && json['scheduledTime'] != null) {
      // Combine date and time from backend format
      final date = DateTime.parse(json['scheduledDate']);
      final timeParts = (json['scheduledTime'] as String).split(':');
      parsedScheduledTime = DateTime(
        date.year,
        date.month,
        date.day,
        int.parse(timeParts[0]),
        int.parse(timeParts[1]),
      );
    } else if (json['scheduled_time'] != null || json['scheduledTime'] != null) {
      // Fallback to old format
      parsedScheduledTime = DateTime.parse(json['scheduled_time'] ?? json['scheduledTime']);
    } else {
      parsedScheduledTime = DateTime.now();
    }
    
    // Extract vehicle info from backend structure
    final vehicle = json['vehicle'];
    final center = json['center'];
    
    return Booking(
      id: json['id']?.toString() ?? '',
      userId: json['customerId']?.toString() ?? json['user_id']?.toString() ?? '',
      carWashId: center?['id']?.toString() ?? json['centerId']?.toString() ?? json['car_wash_id']?.toString() ?? '',
      carWashName: center?['name'] ?? json['car_wash_name'] ?? json['carWashName'] ?? '',
      serviceType: json['services']?.isNotEmpty == true 
          ? json['services'][0]['service']['name'] 
          : (json['service_type'] ?? json['serviceType'] ?? ''),
      scheduledTime: parsedScheduledTime,
      vehicleType: vehicle?['type'] ?? json['vehicle_type'] ?? json['vehicleType'] ?? '',
      vehiclePlate: vehicle?['licensePlate'] ?? json['vehicle_plate'] ?? json['vehiclePlate'],
      price: (json['finalAmount'] ?? json['totalAmount'] ?? json['price'] ?? 0.0).toDouble(),
      status: _statusFromString(json['status'] ?? 'PENDING'),
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.parse(json['createdAt'] ?? json['created_at'])
          : DateTime.now(),
      notes: json['notes'],
      bookingNumber: json['bookingNumber'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'car_wash_id': carWashId,
      'car_wash_name': carWashName,
      'service_type': serviceType,
      'scheduled_time': scheduledTime.toIso8601String(),
      'vehicle_type': vehicleType,
      'vehicle_plate': vehiclePlate,
      'price': price,
      'status': status.toString().split('.').last,
      'created_at': createdAt.toIso8601String(),
      'notes': notes,
    };
  }

  static BookingStatus _statusFromString(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return BookingStatus.pending;
      case 'CONFIRMED':
        return BookingStatus.confirmed;
      case 'IN_PROGRESS':
      case 'INPROGRESS':
        return BookingStatus.inProgress;
      case 'COMPLETED':
        return BookingStatus.completed;
      case 'CANCELLED':
      case 'CANCELED':
        return BookingStatus.cancelled;
      default:
        return BookingStatus.pending;
    }
  }

  Booking copyWith({
    String? id,
    String? userId,
    String? carWashId,
    String? carWashName,
    String? serviceType,
    DateTime? scheduledTime,
    String? vehicleType,
    String? vehiclePlate,
    double? price,
    BookingStatus? status,
    DateTime? createdAt,
    String? notes,
  }) {
    return Booking(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      carWashId: carWashId ?? this.carWashId,
      carWashName: carWashName ?? this.carWashName,
      serviceType: serviceType ?? this.serviceType,
      scheduledTime: scheduledTime ?? this.scheduledTime,
      vehicleType: vehicleType ?? this.vehicleType,
      vehiclePlate: vehiclePlate ?? this.vehiclePlate,
      price: price ?? this.price,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      notes: notes ?? this.notes,
    );
  }
}

enum BookingStatus {
  pending,
  confirmed,
  inProgress,
  completed,
  cancelled,
}
