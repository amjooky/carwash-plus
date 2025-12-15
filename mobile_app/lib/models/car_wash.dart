class CarWash {
  final String id;
  final String name;
  final String address;
  final double latitude;
  final double longitude;
  final String? phone;
  final String? description;
  final double? rating;
  final List<String>? services;
  final Map<String, dynamic>? openingHours;
  final List<String>? images;

  final String openTime;
  final String closeTime;
  final int capacity;

  CarWash({
    required this.id,
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
    this.phone,
    this.description,
    this.rating,
    this.services,
    this.openingHours,
    this.images,
    required this.openTime,
    required this.closeTime,
    required this.capacity,
  });

  // Convert from JSON
  factory CarWash.fromJson(Map<String, dynamic> json) {
    print('🔍 Parsing CarWash: ${json['name']}');
    return CarWash(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      phone: json['phone'],
      description: json['description'],
      rating: json['rating']?.toDouble(),
      services: json['amenities'] != null 
          ? List<String>.from(json['amenities']) 
          : null,
      openingHours: json['opening_hours'] ?? json['openingHours'],
      images: json['images'] != null
          ? List<String>.from(json['images'])
          : null,
      openTime: json['openTime'] ?? '08:00',
      closeTime: json['closeTime'] ?? '20:00',
      capacity: json['capacity'] ?? 5,
    );
  }

  // Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
      'phone': phone,
      'description': description,
      'rating': rating,
      'services': services,
      'opening_hours': openingHours,
      'images': images,
      'openTime': openTime,
      'closeTime': closeTime,
      'capacity': capacity,
    };
  }


  // Create a copy with updated fields
  CarWash copyWith({
    String? id,
    String? name,
    String? address,
    double? latitude,
    double? longitude,
    String? phone,
    String? description,
    double? rating,
    List<String>? services,
    Map<String, dynamic>? openingHours,
    List<String>? images,
    String? openTime,
    String? closeTime,
    int? capacity,
  }) {
    return CarWash(
      id: id ?? this.id,
      name: name ?? this.name,
      address: address ?? this.address,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      phone: phone ?? this.phone,
      description: description ?? this.description,
      rating: rating ?? this.rating,
      services: services ?? this.services,
      openingHours: openingHours ?? this.openingHours,
      images: images ?? this.images,
      openTime: openTime ?? this.openTime,
      closeTime: closeTime ?? this.closeTime,
      capacity: capacity ?? this.capacity,
    );
  }
}
