class BayAvailability {
  final String time;
  final int capacity;
  final List<Bay> bays;
  final int availableCount;
  final bool isAvailable;

  BayAvailability({
    required this.time,
    required this.capacity,
    required this.bays,
    required this.availableCount,
    required this.isAvailable,
  });

  factory BayAvailability.fromJson(Map<String, dynamic> json) {
    // Handle totalCapacity from backend (or legacy capacity)
    final int cap = json['totalCapacity'] ?? json['capacity'] ?? 0;
    
    // Handle bays list which is now List<int> from backend
    // We reconstruct the full list of bays (1..N) for the UI
    List<Bay> allBays = [];
    final List<dynamic> rawBays = json['bays'] ?? [];
    
    // If backend sends List<int> (available bay numbers)
    if (rawBays.isNotEmpty && rawBays.first is int) {
      final availableBayNumbers = rawBays.cast<int>().toSet();
      for (int i = 1; i <= cap; i++) {
        allBays.add(Bay(
          bayNumber: i,
          isAvailable: availableBayNumbers.contains(i),
          booking: null,
        ));
      }
    } else {
      // Fallback for legacy object list if ever reverted
      allBays = rawBays.map((b) => Bay.fromJson(b)).toList();
    }

    return BayAvailability(
      time: json['time'],
      capacity: cap,
      bays: allBays,
      availableCount: json['availableCount'] ?? 0,
       // Backend sends 'status' string, or we derive from count
      isAvailable: json['isAvailable'] ?? (json['status'] == 'AVAILABLE' || json['status'] == 'LIMITED' || (json['availableCount'] ?? 0) > 0),
    );
  }
}

class Bay {
  final int bayNumber;
  final bool isAvailable;
  final BayBooking? booking;

  Bay({
    required this.bayNumber,
    required this.isAvailable,
    this.booking,
  });

  factory Bay.fromJson(Map<String, dynamic> json) {
    return Bay(
      bayNumber: json['bayNumber'],
      isAvailable: json['isAvailable'],
      booking: json['booking'] != null 
        ? BayBooking.fromJson(json['booking']) 
        : null,
    );
  }
}

class BayBooking {
  final String id;
  final String customerName;
  final String vehicle;
  final String licensePlate;
  final String status;

  BayBooking({
    required this.id,
    required this.customerName,
    required this.vehicle,
    required this.licensePlate,
    required this.status,
  });

  factory BayBooking.fromJson(Map<String, dynamic> json) {
    return BayBooking(
      id: json['id'],
      customerName: json['customerName'],
      vehicle: json['vehicle'],
      licensePlate: json['licensePlate'],
      status: json['status'],
    );
  }
}
