class User {
  final String id;
  final String name;
  final String email;
  final String? username;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final String? profileImage;
  final List<String>? vehicleIds;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.username,
    this.firstName,
    this.lastName,
    this.phone,
    this.profileImage,
    this.vehicleIds,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    // Handle different name formats from backend
    String displayName = '';
    if (json['name'] != null && json['name'].toString().isNotEmpty) {
      displayName = json['name'];
    } else if (json['firstName'] != null || json['lastName'] != null) {
      final first = json['firstName']?.toString() ?? '';
      final last = json['lastName']?.toString() ?? '';
      displayName = '$first $last'.trim();
    } else if (json['username'] != null) {
      displayName = json['username'];
    }
    
    return User(
      id: json['id']?.toString() ?? '',
      name: displayName.isEmpty ? 'User' : displayName,
      email: json['email']?.toString() ?? '',
      username: json['username']?.toString(),
      firstName: json['firstName']?.toString(),
      lastName: json['lastName']?.toString(),
      phone: json['phone']?.toString(),
      profileImage: json['profile_image'] ?? json['profileImage'] ?? json['avatar'],
      vehicleIds: json['vehicle_ids'] != null
          ? List<String>.from(json['vehicle_ids'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'username': username,
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'profile_image': profileImage,
      'vehicle_ids': vehicleIds,
    };
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? username,
    String? firstName,
    String? lastName,
    String? phone,
    String? profileImage,
    List<String>? vehicleIds,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      username: username ?? this.username,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      phone: phone ?? this.phone,
      profileImage: profileImage ?? this.profileImage,
      vehicleIds: vehicleIds ?? this.vehicleIds,
    );
  }
}
