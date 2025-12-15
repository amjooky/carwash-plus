enum VehicleType {
  SEDAN,
  SUV,
  TRUCK,
  VAN,
  COUPE,
  HATCHBACK,
  WAGON,
  MOTORCYCLE,
}

class Vehicle {
  final String id;
  final String customerId;
  final String make;
  final String model;
  final int year;
  final String? trim;
  final String color;
  final String licensePlate;
  final VehicleType type;
  final String? imageUrl;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  Vehicle({
    required this.id,
    required this.customerId,
    required this.make,
    required this.model,
    required this.year,
    this.trim,
    required this.color,
    required this.licensePlate,
    required this.type,
    this.imageUrl,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'],
      customerId: json['customerId'],
      make: json['make'],
      model: json['model'],
      year: json['year'],
      trim: json['trim'],
      color: json['color'],
      licensePlate: json['licensePlate'],
      type: VehicleType.values.firstWhere(
        (e) => e.toString().split('.').last == json['type'],
        orElse: () => VehicleType.SEDAN,
      ),
      imageUrl: json['imageUrl'],
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      'make': make,
      'model': model,
      'year': year,
      'trim': trim,
      'color': color,
      'licensePlate': licensePlate,
      'type': type.toString().split('.').last,
      'imageUrl': imageUrl,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  String get displayName => '$year $make $model';
  String get fullName => trim != null ? '$displayName $trim' : displayName;
}
