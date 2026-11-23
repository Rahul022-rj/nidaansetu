import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SessionStore {
  static const _refreshKey = 'ns_refresh_token';

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  // Access token kept strictly in memory
  String? _accessToken;
  String? get accessToken => _accessToken;

  void setAccessToken(String? token) {
    _accessToken = token;
  }

  Future<String?> getRefreshToken() => _storage.read(key: _refreshKey);

  Future<void> saveSession({
    required String accessToken,
    required String refreshToken,
  }) async {
    _accessToken = accessToken;
    await _storage.write(key: _refreshKey, value: refreshToken);
  }

  Future<void> clear() async {
    _accessToken = null;
    await _storage.delete(key: _refreshKey);
  }
}

final sessionStoreProvider = Provider<SessionStore>((ref) => SessionStore());