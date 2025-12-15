import 'dart:io';

class AppConfig {
  // Your computer's IP address - update if it changes
  // Found by running: ipconfig (look for IPv4 Address)
  // Changed to 'final' instead of 'const' so hot restart picks up changes
  static final String computerIP = '192.168.1.17';
  
  // Automatically detect the correct base URL based on platform
  static String get baseUrl {
    String url;
    if (Platform.isAndroid) {
      // Use your computer's actual IP instead of 10.0.2.2
      // This works for both emulator and real device on same network
      url = 'http://$computerIP:3000/api/v1';
    } else if (Platform.isIOS) {
      // For iOS simulator, use localhost
      url = 'http://localhost:3000/api/v1';
    } else {
      // For web or other platforms
      url = 'http://localhost:3000/api/v1';
    }
    print('🌐 Using API Base URL: $url');
    return url;
  }

  static String get wsBaseUrl {
    if (Platform.isAndroid) {
      return 'ws://$computerIP:3000';
    } else if (Platform.isIOS) {
      return 'ws://localhost:3000';
    } else {
      return 'ws://localhost:3000';
    }
  }
}
