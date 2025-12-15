import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  final ApiService _apiService = ApiService();
  User? _user;
  bool _isLoading = true;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;
  String? get error => _error;

  Future<void> checkLoginStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      final isLoggedIn = await _authService.isLoggedIn();
      if (isLoggedIn) {
        _user = await _authService.getUser();
      } else {
        _user = null;
      }
    } catch (e) {
      _user = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.login(email, password);
      // Backend now returns 'access_token' (flat structure)
      if (response != null && response['access_token'] != null) {
         // Save session
         await _authService.saveToken(response['access_token']);
         if (response['user'] != null) {
             await _authService.saveUser(response['user']);
         }
         await checkLoginStatus(); 
         return true;
      } else {
        _error = 'Login failed: No token received';
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String firstName, String lastName, String email, String password, String phone) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final userData = {
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': password,
        'phone': phone,
      };
      
      final response = await _apiService.register(userData);
      if (response != null && response['access_token'] != null) {
         await _authService.saveToken(response['access_token']);
         if (response['user'] != null) {
             await _authService.saveUser(response['user']);
         }
         await checkLoginStatus();
         return true;
      } else {
        _error = 'Registration failed';
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    notifyListeners();
  }
}
