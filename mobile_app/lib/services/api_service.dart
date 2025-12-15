import 'dart:convert';
import 'dart:async';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/car_wash.dart';
import '../models/booking.dart';
import '../models/user.dart';
import '../models/service.dart';
import 'auth_service.dart';
import '../config/app_config.dart';

class ApiService {
  final AuthService _authService = AuthService();
  
  String get baseUrl => AppConfig.baseUrl;
  
  /// Get headers with authentication token
  Future<Map<String, String>> _getAuthHeaders() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// Fetch all car washes
  Future<List<CarWash>> getCarWashes() async {
    try {
      final url = '$baseUrl/public/centers';
      print('🌐 Fetching car washes from: $url');
      
      final response = await http.get(
        Uri.parse(url),
      ).timeout(Duration(seconds: 10));

      print('📡 Response status: ${response.statusCode}');
      print('📦 Response body length: ${response.body.length}');

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        print('✅ Successfully fetched ${data.length} car washes');
        final carWashes = data.map((json) => CarWash.fromJson(json)).toList();
        print('✅ Successfully parsed ${carWashes.length} car washes');
        return carWashes;
      } else {
        print('❌ Failed with status: ${response.statusCode}');
        print('❌ Response body: ${response.body}');
        throw Exception('Failed to load car washes: ${response.statusCode}');
      }
    } on TimeoutException {
      print('⏱️ Timeout fetching car washes - backend not reachable');
      return [];
    } on SocketException catch (e) {
      print('🔌 Socket exception: $e');
      print('🔌 Make sure backend is running and IP is correct: $baseUrl');
      return [];
    } catch (e) {
      print('❌ Error fetching car washes: $e');
      return [];
    }
  }

  /// Fetch car washes near a specific location
  Future<List<CarWash>> getNearbyCarWashes({
    required double latitude,
    required double longitude,
    double radiusKm = 10.0,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/public/centers/nearby?lat=$latitude&lng=$longitude&radius=$radiusKm'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => CarWash.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load nearby car washes: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching nearby car washes: $e');
      return [];
    }
  }

  /// Get details of a specific car wash
  Future<CarWash?> getCarWashDetails(String id) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/public/centers/$id'),
      );

      if (response.statusCode == 200) {
        return CarWash.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to load car wash details: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching car wash details: $e');
      return null;
    }
  }

  /// Get services for a specific car wash
  Future<List<Service>> getCarWashServices(String carWashId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/public/centers/$carWashId/services'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Service.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load services: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching services: $e');
      return [];
    }
  }

  // ==================== Booking APIs ====================

  /// Create a new booking
  Future<Booking?> createBooking(Map<String, dynamic> bookingData) async {
    try {
      final headers = await _getAuthHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/public/bookings'),
        headers: headers,
        body: json.encode(bookingData),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return Booking.fromJson(json.decode(response.body));
      } else {
        print('Create Booking Failed. Status: ${response.statusCode}, Body: ${response.body}');
        String errorMessage = 'Request failed with status: ${response.statusCode}';
        try {
          final body = json.decode(response.body);
          if (body is Map) {
             if (body['message'] != null) {
               errorMessage = body['message'].toString();
             } else if (body['error'] != null) {
               errorMessage = body['error'].toString();
             }
          }
        } catch (e) {
          print('Error parsing error response: $e');
        }
        throw Exception(errorMessage);
      }
    } catch (e) {
      print('Error creating booking: $e');
      rethrow;
    }
  }

  /// Get user's bookings
  Future<List<Booking>> getUserBookings(String userId) async {
    try {
      final headers = await _getAuthHeaders();
      print('Fetching bookings with headers: ${headers.keys.toList()}');
      
      final response = await http.get(
        Uri.parse('$baseUrl/public/bookings/my'),
        headers: headers,
      );

      print('Bookings response status: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        print('Bookings Response Body: ${response.body}');
        final List<dynamic> data = json.decode(response.body);
        print('Raw bookings count: ${data.length}');
        final bookings = data.map((json) => Booking.fromJson(json)).toList();
        print('Parsed bookings count: ${bookings.length}');
        return bookings;
      } else if (response.statusCode == 401) {
        print('Authentication failed - token may be invalid or expired');
        throw Exception('Authentication failed. Please log in again.');
      } else {
        throw Exception('Failed to load bookings: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching bookings: $e');
      rethrow; // Rethrow to let the UI handle it
    }
  }

  /// Cancel a booking
  Future<bool> cancelBooking(String bookingId) async {
    try {
      final headers = await _getAuthHeaders();
      final response = await http.put(
        Uri.parse('$baseUrl/bookings/$bookingId/cancel'),
        headers: headers,
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error cancelling booking: $e');
      return false;
    }
  }

  // ==================== Auth APIs ====================

  /// Login user
  Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      print('Attempting login to: $baseUrl/auth/login');
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email, 'password': password}),
      ).timeout(Duration(seconds: 10));

      print('Login response status: ${response.statusCode}');
      print('Login response body: ${response.body}');

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Login failed: ${response.statusCode}');
      }
    } on TimeoutException {
      print('Login timeout - backend not reachable');
      throw Exception('Connection timeout. Please check if backend is running.');
    } on SocketException {
      print('Socket exception - network error');
      throw Exception('Network error. Cannot reach server.');
    } catch (e) {
      print('Error logging in: $e');
      rethrow;
    }
  }

  /// Register user
  Future<Map<String, dynamic>?> register(Map<String, dynamic> userData) async {
    try {
      print('Attempting registration to: $baseUrl/auth/register');
      print('Registration data: ${userData.keys.toList()}');
      
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(userData),
      ).timeout(Duration(seconds: 10));

      print('Register response status: ${response.statusCode}');
      print('Register response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Registration failed: ${response.statusCode}');
      }
    } on TimeoutException {
      print('Registration timeout - backend not reachable');
      throw Exception('Connection timeout. Please check if backend is running.');
    } on SocketException {
      print('Socket exception - network error');
      throw Exception('Network error. Cannot reach server.');
    } catch (e) {
      print('Error registering: $e');
      rethrow;
    }
  }

  /// Get user profile
  Future<User?> getUserProfile(String userId) async {
    try {
      final headers = await _getAuthHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/users/$userId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return User.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to load user profile: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching user profile: $e');
      return null;
    }
  }
}
