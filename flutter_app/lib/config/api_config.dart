import 'dart:io';
import 'package:flutter/foundation.dart';

/// API base URL Configuration
///
/// Automatically detects environment and sets appropriate URL.
String get kApiBaseUrl {
  if (kIsWeb) {
    return 'http://localhost:5000/api/v1';
  }

  // Use the local machine IP for all mobile platforms to support physical devices
  const String hostIp = '172.28.167.168';

  if (Platform.isAndroid) {
    // Note: If you have issues on emulator, you can use 10.0.2.2
    return 'http://$hostIp:5000/api/v1';
  }

  if (Platform.isWindows || Platform.isIOS || Platform.isMacOS) {
    return 'http://$hostIp:5000/api/v1';
  }

  return 'http://$hostIp:5000/api/v1';
}
