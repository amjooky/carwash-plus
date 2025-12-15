import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/vehicle.dart';
import 'auth_service.dart';
import '../config/app_config.dart';

class VehicleService {
  final _authService = AuthService();
  String get baseUrl => AppConfig.baseUrl;

  Future<List<Vehicle>> getMyVehicles() async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        throw Exception('Not authenticated');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/users/me/vehicles'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Vehicle.fromJson(json)).toList();
      } else if (response.statusCode == 401) {
        throw Exception('Session expired. Please log in again.');
      } else {
        throw Exception('Failed to load vehicles: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching vehicles: $e');
      rethrow;
    }
  }

  Future<Vehicle> addVehicle(Map<String, dynamic> vehicleData) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        throw Exception('Not authenticated');
      }

      final response = await http.post(
        Uri.parse('$baseUrl/users/me/vehicles'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(vehicleData),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return Vehicle.fromJson(json.decode(response.body));
      } else {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Failed to add vehicle');
      }
    } catch (e) {
      print('Error adding vehicle: $e');
      rethrow;
    }
  }

  Future<Vehicle> updateVehicle(
      String vehicleId, Map<String, dynamic> vehicleData) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        throw Exception('Not authenticated');
      }

      final response = await http.patch(
        Uri.parse('$baseUrl/users/me/vehicles/$vehicleId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(vehicleData),
      );

      if (response.statusCode == 200) {
        return Vehicle.fromJson(json.decode(response.body));
      } else {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Failed to update vehicle');
      }
    } catch (e) {
      print('Error updating vehicle: $e');
      rethrow;
    }
  }

  Future<void> deleteVehicle(String vehicleId) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        throw Exception('Not authenticated');
      }

      final response = await http.delete(
        Uri.parse('$baseUrl/users/me/vehicles/$vehicleId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode != 200) {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Failed to delete vehicle');
      }
    } catch (e) {
      print('Error deleting vehicle: $e');
      rethrow;
    }
  }
}
