

import 'package:flutter/material.dart';
import '../models/car_wash.dart';
import '../models/service.dart';
import '../services/api_service.dart';

class CenterProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<CarWash> _centers = [];
  bool _isLoading = false;
  String? _error;

  List<CarWash> get centers => _centers;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Cache for services: Map<centerId, List<Service>>
  final Map<String, List<Service>> _servicesCache = {};
  
  List<Service> getServicesForCenter(String centerId) {
    return _servicesCache[centerId] ?? [];
  }

  Future<void> loadCenters({bool forceRefresh = false}) async {
    if (_centers.isNotEmpty && !forceRefresh) return; // Cache hit

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _centers = await _apiService.getCarWashes();
    } catch (e) {
      _error = 'Failed to load centers';
      print(e);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadServices(String centerId, {bool forceRefresh = false}) async {
    // Return early if cached and not forcing refresh
    if (_servicesCache.containsKey(centerId) && !forceRefresh) return;
    
    // Note: We don't set global _isLoading here to avoid blocking other UI. 
    // The UI consuming this should handle its own loading state based on data availability
    // or we could add a granular loading Map<String, bool> if needed.
    
    try {
      final services = await _apiService.getCarWashServices(centerId);
      _servicesCache[centerId] = services;
      notifyListeners();
    } catch (e) {
      print('Failed to load services for $centerId: $e');
    }
  }
}

