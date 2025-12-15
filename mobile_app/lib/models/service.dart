class Service {
  final String id;
  final String name;
  final String description;
  final double price;
  final int durationMinutes;
  final String? icon;
  final List<Map<String, dynamic>>? pricing; // Store all pricing options

  Service({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.durationMinutes,
    this.icon,
    this.pricing,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    // Handle pricing from backend - it comes as an array of pricing objects
    double calculatedPrice = 0.0;
    List<Map<String, dynamic>>? pricingList;
    
    if (json['pricing'] != null && json['pricing'] is List && (json['pricing'] as List).isNotEmpty) {
      pricingList = List<Map<String, dynamic>>.from(json['pricing']);
      // Use the first pricing option's basePrice as default
      calculatedPrice = (pricingList.first['basePrice'] ?? 0.0).toDouble();
    } else if (json['price'] != null) {
      // Fallback to direct price field if it exists
      calculatedPrice = (json['price']).toDouble();
    }
    
    return Service(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: calculatedPrice,
      durationMinutes: json['baseDuration'] ?? json['duration_minutes'] ?? json['durationMinutes'] ?? 30,
      icon: json['icon'],
      pricing: pricingList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'duration_minutes': durationMinutes,
      'icon': icon,
      'pricing': pricing,
    };
  }
  
  // Helper method to get price for a specific vehicle type
  double getPriceForVehicleType(String vehicleType) {
    if (pricing == null || pricing!.isEmpty) {
      return price;
    }
    
    try {
      final matchingPricing = pricing!.firstWhere(
        (p) => p['vehicleType']?.toString().toUpperCase() == vehicleType.toUpperCase(),
        orElse: () => pricing!.first,
      );
      return (matchingPricing['basePrice'] ?? price).toDouble();
    } catch (e) {
      return price;
    }
  }
}
