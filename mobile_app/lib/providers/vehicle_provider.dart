import 'package:flutter/material.dart';
import '../models/vehicle.dart';
import '../services/vehicle_service.dart';

class VehicleProvider with ChangeNotifier {
  final VehicleService _vehicleService = VehicleService();
  List<Vehicle> _vehicles = [];
  bool _isLoading = false;
  String? _error;

  List<Vehicle> get vehicles => _vehicles;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Optimistic UI updates possible here

  Future<void> loadVehicles() async {
    // frequent reloading protection could be added here
    _isLoading = true;
    _error = null;
    // notifyListeners(); // Avoid unnecessary rebuilds if silently updating

    try {
      _vehicles = await _vehicleService.getMyVehicles();
    } catch (e) {
      _error = 'Failed to load vehicles';
      print(e);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addVehicle(Map<String, dynamic> vehicleData) async {
    _isLoading = true;
    notifyListeners();

    try {
      final newVehicle = await _vehicleService.addVehicle(vehicleData);
      if (newVehicle != null) {
        _vehicles.add(newVehicle);
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> deleteVehicle(String id) async {
    // Optimistic update
    final index = _vehicles.indexWhere((v) => v.id == id);
    if (index == -1) return false;

    final deletedVehicle = _vehicles[index];
    _vehicles.removeAt(index);
    notifyListeners();

    try {
      await _vehicleService.deleteVehicle(id);
      return true;
    } catch (e) {
       // Revert
       _vehicles.insert(index, deletedVehicle);
       notifyListeners();
       return false;
    }
  }
}
