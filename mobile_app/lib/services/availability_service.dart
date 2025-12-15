import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/bay_availability.dart';
import '../config/app_config.dart';

class AvailabilityService {
  String get baseUrl => AppConfig.baseUrl;

  Future<List<BayAvailability>> getAvailability(
    String centerId,
    DateTime date,
  ) async {
    final dateStr = date.toIso8601String().split('T')[0];
    final url = '$baseUrl/centers/$centerId/availability?date=$dateStr';

    try {
      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final slots = data['slots'] as List;
        return slots.map((slot) => BayAvailability.fromJson(slot)).toList();
      } else {
        throw Exception('Failed to load availability');
      }
    } catch (e) {
      print('Error fetching availability: $e');
      rethrow;
    }
  }

  Future<List<int>> getAvailableBays(
    String centerId,
    DateTime date,
    String time,
  ) async {
    final dateStr = date.toIso8601String().split('T')[0];
    final url = '$baseUrl/centers/$centerId/availability/bays?date=$dateStr&time=$time';

    try {
      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final List<dynamic> bays = json.decode(response.body);
        return bays.cast<int>();
      } else {
        throw Exception('Failed to load available bays');
      }
    } catch (e) {
      print('Error fetching available bays: $e');
      rethrow;
    }
  }
}
