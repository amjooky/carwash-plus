import 'dart:convert';
import 'package:http/http.dart' as http;

class NhtsaService {
  static const String _baseUrl = 'https://vpic.nhtsa.dot.gov/api/vehicles';

  // Static list of common makes to avoid massive API calls for "All Makes"
  // This covers the vast majority of user cases.
  static const List<String> commonMakes = [
    'Acura', 'Alfa Romeo', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet',
    'Chrysler', 'Dodge', 'Fiat', 'Ford', 'GMC', 'Genesis', 'Honda', 'Hyundai',
    'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Lincoln',
    'Lucid', 'Maserati', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi',
    'Nissan', 'Polestar', 'Porsche', 'Ram', 'Rivian', 'Subaru', 'Tesla',
    'Toyota', 'Volkswagen', 'Volvo'
  ];

  /// Fetch models for a specific Make and Year
  /// API: /getmodelsformakeyear/make/{make}/modelyear/{year}?format=json
  Future<List<String>> getModels(String make, int year) async {
    if (make.isEmpty) return [];

    try {
      final uri = Uri.parse(
          '$_baseUrl/getmodelsformakeyear/make/$make/modelyear/$year?format=json');
      
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final results = data['Results'] as List<dynamic>;
        
        // Extract model names and dedup
        final models = results
            .map((item) => item['Model_Name'] as String)
            .toSet()
            .toList();
            
        models.sort();
        return models;
      } else {
        throw Exception('Failed to load models');
      }
    } catch (e) {
      print('Error fetching models: $e');
      return [];
    }
  }

  /// Helper to get years (e.g., last 30 years + next year)
  List<int> getYears() {
    final currentYear = DateTime.now().year;
    return List.generate(35, (index) => currentYear + 1 - index);
  }

  /// Fetch vehicle image from CarImagery API (XML)
  /// URL: http://www.carimagery.com/api.asmx/GetImageUrl?searchTerm={year} {make} {model}
  Future<String?> getVehicleImageUrl(String make, String model, int year) async {
    try {
      final searchTerm = '$year $make $model';
      final uri = Uri.parse(
          'http://www.carimagery.com/api.asmx/GetImageUrl?searchTerm=$searchTerm');
      
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        // Simple XML parsing since it's just one tag
        // Response format: <string xmlns="...">http://...</string>
        final xml = response.body;
        final startTag = 'm">'; // end of xmlns in <string xmlns="...">
        final endTag = '</string>';
        
        // Find the URL inside the XML
        final startIndex = xml.indexOf('>') + 1;
        final endIndex = xml.indexOf(endTag);
        
        if (startIndex > 0 && endIndex > startIndex) {
          final url = xml.substring(startIndex, endIndex);
          if (url.isNotEmpty && url.startsWith('http')) {
             return url;
          }
        }
      }
    } catch (e) {
      print('Error fetching vehicle image: $e');
    }
    return null;
  }
}
