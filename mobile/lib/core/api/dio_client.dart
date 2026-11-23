import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../env.dart';
import '../auth/session_store.dart';
import 'api_error.dart';

typedef RefreshCallback = Future<bool> Function();
typedef ForceLogoutCallback = Future<void> Function();

class DioClient {
  final Dio dio;
  final SessionStore sessionStore;
  final RefreshCallback onRefreshToken;
  final ForceLogoutCallback onForceLogout;

  Completer<bool>? _refreshCompleter;

  static const _noRefreshPaths = {
    '/auth/login',
    '/auth/signup',
    '/auth/refresh',
    '/auth/logout',
    '/auth/forgot-password',
    '/auth/reset-password',
  };

  DioClient({
    required this.sessionStore,
    required this.onRefreshToken,
    required this.onForceLogout,
  }) : dio = Dio(
          BaseOptions(
            baseUrl: Env.baseApiUrl,
            connectTimeout: const Duration(seconds: 30),
            receiveTimeout: const Duration(seconds: 30),
            headers: {
              'X-Client': 'mobile',
              'Accept': 'application/json',
            },
          ),
        ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token = sessionStore.accessToken;
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (err, handler) async {
          final status = err.response?.statusCode;
          final path = err.requestOptions.path;
          final alreadyRetried = err.requestOptions.extra['_retried'] == true;

          if (status == 401 && !alreadyRetried && !_noRefreshPaths.contains(path)) {
            final refreshed = await _singleFlightRefresh();
            if (refreshed) {
              final opts = err.requestOptions;
              opts.extra['_retried'] = true;
              opts.headers['Authorization'] = 'Bearer ${sessionStore.accessToken}';
              try {
                final response = await dio.fetch(opts);
                return handler.resolve(response);
              } on DioException catch (retryErr) {
                return handler.reject(retryErr);
              }
            } else {
              await onForceLogout();
            }
          }
          handler.next(err);
        },
      ),
    );
  }

  Future<bool> _singleFlightRefresh() async {
    if (_refreshCompleter != null) {
      return _refreshCompleter!.future;
    }
    _refreshCompleter = Completer<bool>();
    try {
      final success = await onRefreshToken();
      _refreshCompleter!.complete(success);
      return success;
    } catch (_) {
      _refreshCompleter!.complete(false);
      return false;
    } finally {
      _refreshCompleter = null;
    }
  }
}