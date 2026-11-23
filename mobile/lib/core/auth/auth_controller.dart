import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/user_model.dart';
import '../api/api_error.dart';
import '../api/dio_client.dart';
import 'session_store.dart';

class AuthState {
  final bool isReady;
  final AppUser? user;
  final Locale locale;

  const AuthState({
    this.isReady = false,
    this.user,
    this.locale = const Locale('hi'),
  });

  AuthState copyWith({
    bool? isReady,
    AppUser? user,
    bool clearUser = false,
    Locale? locale,
  }) {
    return AuthState(
      isReady: isReady ?? this.isReady,
      user: clearUser ? null : (user ?? this.user),
      locale: locale ?? this.locale,
    );
  }

  String get homeRoute {
    switch (user?.role) {
      case 'patient':
        return '/home';
      case 'lab_staff':
        return '/lab';
      case 'doctor':
        return '/doctor';
      case 'agent':
        return '/agent';
      case 'super_admin':
        return '/admin-web';
      default:
        return '/';
    }
  }
}

class AuthController extends Notifier<AuthState> {
  static const _langKey = 'nidaansetu_lang';
  late final DioClient _client;

  Dio get dio => _client.dio;

  @override
  AuthState build() {
    final store = ref.read(sessionStoreProvider);
    _client = DioClient(
      sessionStore: store,
      onRefreshToken: refreshSession,
      onForceLogout: _clearLocalSession,
    );
    _bootstrap();
    return const AuthState();
  }

  Future<void> _bootstrap() async {
    final prefs = await SharedPreferences.getInstance();
    final savedLang = prefs.getString(_langKey) ?? 'hi';
    state = state.copyWith(locale: Locale(savedLang));

    final store = ref.read(sessionStoreProvider);
    final refreshToken = await store.getRefreshToken();
    if (refreshToken != null && refreshToken.isNotEmpty) {
      await refreshSession();
    }
    state = state.copyWith(isReady: true);
  }

  Future<void> setLocale(String langCode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_langKey, langCode);
    state = state.copyWith(locale: Locale(langCode));
  }

  Future<bool> refreshSession() async {
    final store = ref.read(sessionStoreProvider);
    final refreshToken = await store.getRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) return false;

    try {
      final res = await _client.dio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );
      final data = res.data as Map<String, dynamic>;
      await store.saveSession(
        accessToken: data['accessToken'] as String,
        refreshToken: (data['refreshToken'] ?? refreshToken) as String,
      );
      final user = AppUser.fromJson(data['user'] as Map<String, dynamic>);
      state = state.copyWith(user: user, isReady: true);
      return true;
    } catch (_) {
      await _clearLocalSession();
      return false;
    }
  }

  Future<void> login({
    required String identifier,
    required String password,
    required String portal, // 'patient' or 'staff'
  }) async {
    try {
      final res = await _client.dio.post(
        '/auth/login',
        data: {'identifier': identifier.trim(), 'password': password},
      );
      final data = res.data as Map<String, dynamic>;
      final user = AppUser.fromJson(data['user'] as Map<String, dynamic>);

      if (portal == 'patient' && user.role != 'patient') {
        throw const ApiError(
          code: 'WRONG_PORTAL',
          message: 'Yeh account staff ka hai. Staff login chunein.',
        );
      }
      if (portal == 'staff' && user.role == 'patient') {
        throw const ApiError(
          code: 'WRONG_PORTAL',
          message: 'Yeh account mareez ka hai. Mareez login chunein.',
        );
      }

      final store = ref.read(sessionStoreProvider);
      await store.saveSession(
        accessToken: data['accessToken'] as String,
        refreshToken: data['refreshToken'] as String,
      );
      state = state.copyWith(user: user, isReady: true);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<void> signup({
    required String name,
    required String phone,
    String? email,
    required String password,
  }) async {
    try {
      final res = await _client.dio.post(
        '/auth/signup',
        data: {
          'name': name.trim(),
          'phone': phone.trim(),
          if (email != null && email.trim().isNotEmpty) 'email': email.trim(),
          'password': password,
        },
      );
      final data = res.data as Map<String, dynamic>;
      final store = ref.read(sessionStoreProvider);
      await store.saveSession(
        accessToken: data['accessToken'] as String,
        refreshToken: data['refreshToken'] as String,
      );
      final user = AppUser.fromJson(data['user'] as Map<String, dynamic>);
      state = state.copyWith(user: user, isReady: true);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final res = await _client.dio.post(
        '/auth/change-password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
      final data = res.data as Map<String, dynamic>;
      final store = ref.read(sessionStoreProvider);
      await store.saveSession(
        accessToken: data['accessToken'] as String,
        refreshToken: data['refreshToken'] as String,
      );
      final user = AppUser.fromJson(data['user'] as Map<String, dynamic>);
      state = state.copyWith(user: user);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<void> logout() async {
    final store = ref.read(sessionStoreProvider);
    final refreshToken = await store.getRefreshToken();
    try {
      if (refreshToken != null) {
        await _client.dio.post('/auth/logout', data: {'refreshToken': refreshToken});
      }
    } catch (_) {}
    await _clearLocalSession();
  }

  Future<void> _clearLocalSession() async {
    await ref.read(sessionStoreProvider).clear();
    state = state.copyWith(clearUser: true, isReady: true);
  }
}

final authProvider = NotifierProvider<AuthController, AuthState>(AuthController.new);
final dioProvider = Provider<Dio>((ref) => ref.read(authProvider.notifier).dio);