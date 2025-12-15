import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../models/booking_status.dart';
import '../config/app_config.dart';

class WebSocketService {
  WebSocketChannel? _channel;
  Stream<dynamic>? _stream;
  String get baseUrl => AppConfig.wsBaseUrl;

  void connect(String bookingId) {
    try {
      _channel = WebSocketChannel.connect(
        Uri.parse('$baseUrl/bookings/$bookingId/updates'),
      );
      _stream = _channel!.stream.asBroadcastStream();
      print('WebSocket connected for booking: $bookingId');
    } catch (e) {
      print('WebSocket connection error: $e');
    }
  }

  Stream<BookingStatus> getBookingUpdates() {
    if (_stream == null) {
      throw Exception('WebSocket not connected');
    }

    return _stream!.map((data) {
      try {
        final json = jsonDecode(data);
        return BookingStatus.fromJson(json);
      } catch (e) {
        print('Error parsing booking update: $e');
        rethrow;
      }
    });
  }

  void disconnect() {
    _channel?.sink.close();
    print('WebSocket disconnected');
  }

  bool get isConnected => _channel != null;
}
