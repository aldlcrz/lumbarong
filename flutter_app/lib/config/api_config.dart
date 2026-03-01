import 'dart:io';
import 'package:flutter/foundation.dart';

/// API base URL Configuration
///
/// Automatically detects environment and sets appropriate URL.
String get kApiBaseUrl {
  if (kIsWeb) {
    return 'http://localhost:5000/api/v1';
  }

  if (Platform.isAndroid) {
    // 10.0.2.2 is the special alias to your host loopback interface in Android emulator
    return 'http://10.0.2.2:5000/api/v1';
  }

  if (Platform.isWindows || Platform.isIOS || Platform.isMacOS) {
    return 'http://localhost:5000/api/v1';
  }

  // Fallback to local machine IP if needed for physical devices
  return 'http://192.168.100.5:5000/api/v1';
}
